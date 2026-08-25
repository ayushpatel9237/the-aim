// ═══════════════════════════════════════════════════════════════
//  THE AIM — create-order  (Supabase Edge Function)
//  The browser NEVER sends the price. This function looks up the
//  real prices from the database, computes the true total, and asks
//  Razorpay to create an order. Returns the razorpay_order_id.
//
//  Deploy:  supabase functions deploy create-order --no-verify-jwt
//  Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
//           SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (set in dashboard)
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { items, customer, payment, ref_code, shipping = 0 } = await req.json();
    if (!Array.isArray(items) || !items.length) throw new Error("No items");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── look up REAL prices from the DB (ignore whatever the browser claims) ──
    const ids = items.map((i: any) => i.id);
    const { data: products, error } = await sb
      .from("products").select("id, name, price, stock, active").in("id", ids);
    if (error) throw error;

    let subtotal = 0;
    const lineItems = items.map((i: any) => {
      const p = products?.find((x: any) => x.id === i.id);
      if (!p || !p.active) throw new Error("Product unavailable: " + i.id);
      const qty = Math.max(1, Math.min(10, parseInt(i.qty) || 1));
      if (p.stock < qty) throw new Error("Out of stock: " + p.name);
      subtotal += p.price * qty;
      return { id: p.id, name: p.name, qty, price: p.price, line: p.price * qty };
    });

    const total = subtotal + (Number(shipping) || 0);
    // Order ids must not be guessable. The old form was
    // "AIM" + the last 8 digits of the clock, so two orders placed
    // minutes apart differed by a predictable amount — anyone with
    // one id could guess their neighbours'. Now: date + random.
    // Alphabet excludes I, O, 0 and 1 so a customer can read the id
    // aloud on the phone without ambiguity.
    const AB = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    let rnd = ""; for (let i = 0; i < 6; i++) rnd += AB[bytes[i] % AB.length];
    const d = new Date();
    const orderId = "AIM" + String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0") + rnd;

    // ── COD: no Razorpay, save the order as confirmed ──
    if (payment === "cod") {
      const ins = await sb.from("orders").insert({
        id: orderId, customer, items: lineItems, subtotal, shipping, total,
        payment: "cod", status: "confirmed", ref_code: ref_code || null,
      });
      if (ins.error) throw new Error("Could not save order: " + ins.error.message);

      /* Stock. A COD order never reaches verify-payment, so if we do not
         decrement here it never happens at all — and the shop keeps
         selling items that are already spoken for. Each item is isolated
         so one failure cannot lose the whole order. */
      for (const it of lineItems) {
        try {
          const { error: se } = await sb.rpc("decrement_stock", { pid: it.id, qty: it.qty });
          if (se) console.error("stock decrement failed", orderId, it.id, se.message);
        } catch (e) { console.error("stock decrement threw", orderId, it.id, String(e)); }
      }

      /* Credit the curator, same as a paid order would. */
      try {
        if (ref_code) {
          const { data: cur } = await sb.from("curators")
            .select("id, commission_pct").eq("ref_code", ref_code)
            .eq("status", "active").maybeSingle();
          if (cur) {
            await sb.from("curator_sales").insert({
              curator_id: cur.id, order_id: orderId, order_total: total,
              commission: Math.round(total * (cur.commission_pct / 100)),
              status: "confirmed",
            });
          }
        }
      } catch (e) { console.error("curator credit failed", orderId, String(e)); }

      /* A COD customer paid nothing yet, but they still ordered — they
         deserve the same confirmation email a paying customer gets.
         Never awaited: a slow mail service must not drop the response. */
      try {
        // @ts-ignore EdgeRuntime is provided by Supabase
        if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
          // @ts-ignore
          EdgeRuntime.waitUntil(sendOrderEmail({ id: orderId, customer, items: lineItems, total, payment: "cod" }));
        } else {
          sendOrderEmail({ id: orderId, customer, items: lineItems, total, payment: "cod" });
        }
      } catch (_e) { /* never block the response */ }

      return json({ ok: true, cod: true, order: { id: orderId, total } });
    }

    // ── ONLINE: create a Razorpay order server-side ──
    const key = Deno.env.get("RAZORPAY_KEY_ID")!;
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const auth = "Basic " + btoa(`${key}:${secret}`);
    const rzRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({
        amount: Math.round(total * 100), // paise
        currency: "INR",
        receipt: orderId,
        notes: { orderId },
      }),
    });
    const rz = await rzRes.json();
    if (!rzRes.ok) throw new Error(rz.error?.description || "Razorpay error");

    // save a pending order (marked paid only after signature verification)
    await sb.from("orders").insert({
      id: orderId, customer, items: lineItems, subtotal, shipping, total,
      payment: "upi", status: "pending_payment",
      razorpay_order_id: rz.id, ref_code: ref_code || null,
    });

    return json({
      ok: true, cod: false,
      order: { id: orderId, total },
      razorpay_order_id: rz.id,
      razorpay_key: key,     // public key id (safe to send to browser)
    });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 400);
  }
});


/* ── confirmation email, shared by the COD path ──
   Mirrors what verify-payment sends after a paid order. If
   RESEND_API_KEY is not set this does nothing at all, silently —
   a missing email must never break an order that succeeded. */
async function sendOrderEmail(order: any) {
  try {
    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM   = Deno.env.get("ORDER_FROM_EMAIL") || "orders@theaim.store";
    const ADMIN  = Deno.env.get("ADMIN_EMAIL");
    const email  = order.customer?.email;
    if (!RESEND || !email) return;

    const rows = (order.items || []).map((i: any) =>
      `<tr><td style="padding:8px 0">${i.qty}\u00d7 ${i.name}</td>
           <td style="padding:8px 0;text-align:right">\u20b9${i.line}</td></tr>`).join("");

    const html = `
      <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#0A0F26">
        <h1 style="font-size:20px;margin:0 0 4px">Thanks \u2014 your order is confirmed.</h1>
        <p style="color:#5B6478;margin:0 0 20px">Order <b>${order.id}</b></p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
          <tr><td style="padding:12px 0;border-top:1px solid #E3E6EC"><b>Total</b></td>
              <td style="padding:12px 0;border-top:1px solid #E3E6EC;text-align:right"><b>\u20b9${order.total}</b></td></tr>
        </table>
        <p style="font-size:14px;color:#5B6478;margin-top:20px">
          This is a Cash on Delivery order \u2014 please keep \u20b9${order.total} ready when it arrives.
          We dispatch within 2 working days and will send you tracking.</p>
        <p style="font-size:12px;color:#8A93A6;margin-top:28px">THE AIM</p>
      </div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `THE AIM <${FROM}>`, to: [email],
                             subject: `Order confirmed \u2014 ${order.id}`, html }),
    });

    if (ADMIN) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `THE AIM <${FROM}>`, to: [ADMIN],
          subject: `New COD order ${order.id} \u2014 \u20b9${order.total}`,
          html: `<p><b>${order.customer?.name}</b> (${order.customer?.phone})</p>${html}` }),
      });
    }
  } catch (_e) { /* email must never break an order */ }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

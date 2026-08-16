// ═══════════════════════════════════════════════════════════════
//  THE AIM — verify-payment  (Supabase Edge Function)
//  After the customer pays, Razorpay returns a signature. This
//  function verifies that signature cryptographically. Only if it's
//  genuine does the order become "paid", stock drop, and the curator
//  get credited. This is what stops fake/forged payments.
//
//  Deploy:  supabase functions deploy verify-payment --no-verify-jwt
//  Secrets: RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      throw new Error("Missing payment fields");

    // ── verify signature: HMAC-SHA256(order_id|payment_id, secret) ──
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const expected = createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) throw new Error("Signature mismatch");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // find the pending order
    const { data: order, error } = await sb
      .from("orders").select("*").eq("razorpay_order_id", razorpay_order_id).maybeSingle();
    if (error || !order) throw new Error("Order not found");
    if (order.status === "paid") return json({ ok: true, order }); // idempotent

    // mark paid — this one DOES matter, so surface a real failure
    const { error: updErr } = await sb.from("orders").update({
      status: "paid", razorpay_payment_id,
    }).eq("id", order.id);
    if (updErr) throw new Error("Could not record payment: " + updErr.message);

    /* ── everything below this line is BOOKKEEPING ──
       The payment is verified and the order is already marked paid.
       Nothing here may throw, because a failure would tell a paying
       customer their payment failed when it plainly didn't. Each step
       is isolated and logged so a problem is visible to us without
       ever being visible to them. */

    // decrement stock — one item failing must not stop the others
    for (const it of order.items ?? []) {
      try {
        const { error: stockErr } = await sb.rpc("decrement_stock", { pid: it.id, qty: it.qty });
        if (stockErr) console.error("stock decrement failed", order.id, it.id, stockErr.message);
      } catch (e) {
        console.error("stock decrement threw", order.id, it.id, String(e));
      }
    }

    // credit curator if this order came through a ref code
    try {
      if (order.ref_code) {
        const { data: cur } = await sb.from("curators")
          .select("id, commission_pct").eq("ref_code", order.ref_code)
          .eq("status", "active").maybeSingle();
        if (cur) {
          await sb.from("curator_sales").insert({
            curator_id: cur.id, order_id: order.id,
            order_total: order.total,
            commission: Math.round(order.total * (cur.commission_pct / 100)),
            status: "confirmed",
          });
        }
      }
    } catch (e) {
      console.error("curator credit failed", order.id, String(e));
    }


    /* ── send the customer a confirmation email ──
       Uses Resend (resend.com) — free tier covers a new store.
       Set RESEND_API_KEY in Supabase secrets to switch this on.
       If the key is missing we skip silently.

       IMPORTANT: this must never delay the response. Resend is an
       external service; if it is slow the edge worker is dropped
       mid-request (EarlyDrop) and the customer is told their payment
       failed when it plainly succeeded. So it runs after we respond. */
    const sendEmails = async () => {
    try{
      const RESEND = Deno.env.get("RESEND_API_KEY");
      const FROM   = Deno.env.get("ORDER_FROM_EMAIL") || "orders@theaim.store";
      const ADMIN  = Deno.env.get("ADMIN_EMAIL");
      const email  = order.customer?.email;
      if(RESEND && email){
        const rows = (order.items||[]).map((i:any)=>
          `<tr><td style="padding:8px 0">${i.qty}× ${i.name}</td>
               <td style="padding:8px 0;text-align:right">₹${i.line}</td></tr>`).join("");
        const html = `
          <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;color:#0A0F26">
            <h1 style="font-size:20px;margin:0 0 4px">Thanks — your order is confirmed.</h1>
            <p style="color:#5B6478;margin:0 0 20px">Order <b>${order.id}</b></p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
              <tr><td style="padding:12px 0;border-top:1px solid #E3E6EC"><b>Total</b></td>
                  <td style="padding:12px 0;border-top:1px solid #E3E6EC;text-align:right"><b>₹${order.total}</b></td></tr>
            </table>
            <p style="font-size:14px;color:#5B6478;margin-top:20px">
              We'll let you know as soon as it ships. You can track it any time with your
              order number and phone number.</p>
            <p style="font-size:12px;color:#8A93A6;margin-top:28px">THE AIM</p>
          </div>`;
        await fetch("https://api.resend.com/emails", {
          method:"POST",
          headers:{ "Authorization":`Bearer ${RESEND}`, "Content-Type":"application/json" },
          body: JSON.stringify({ from:`THE AIM <${FROM}>`, to:[email],
                                 subject:`Order confirmed — ${order.id}`, html })
        });
        // and tell the shop owner a sale came in
        if(ADMIN){
          await fetch("https://api.resend.com/emails", {
            method:"POST",
            headers:{ "Authorization":`Bearer ${RESEND}`, "Content-Type":"application/json" },
            body: JSON.stringify({ from:`THE AIM <${FROM}>`, to:[ADMIN],
              subject:`New order ${order.id} — ₹${order.total}`,
              html:`<p><b>${order.customer?.name}</b> (${order.customer?.phone})</p>${html}` })
          });
        }
      }
    }catch(_e){ /* email must never block a paid order */ }
    };

    /* fire and forget: the runtime keeps it alive after we respond */
    try {
      // @ts-ignore EdgeRuntime is provided by Supabase
      if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(sendEmails());
      } else {
        sendEmails();               // no waitUntil available — still don't await
      }
    } catch (_e) { /* never block the response */ }

    /* respond the moment the payment is recorded */
    return json({ ok: true, order: { id: order.id, total: order.total } });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 400);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
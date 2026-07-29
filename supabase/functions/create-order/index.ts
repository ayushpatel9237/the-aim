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
    const orderId = "AIM" + Date.now().toString().slice(-8);

    // ── COD: no Razorpay, just save the order as confirmed ──
    if (payment === "cod") {
      await sb.from("orders").insert({
        id: orderId, customer, items: lineItems, subtotal, shipping, total,
        payment: "cod", status: "confirmed", ref_code: ref_code || null,
      });
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

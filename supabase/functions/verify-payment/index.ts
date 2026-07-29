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

    // mark paid
    await sb.from("orders").update({
      status: "paid", razorpay_payment_id,
    }).eq("id", order.id);

    // decrement stock
    for (const it of order.items) {
      await sb.rpc("decrement_stock", { pid: it.id, qty: it.qty });
    }

    // credit curator if this order came through a ref code
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

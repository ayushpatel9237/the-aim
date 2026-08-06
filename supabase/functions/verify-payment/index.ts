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


    /* ── send the customer a confirmation email ──
       Uses Resend (resend.com) — free tier covers a new store.
       Set RESEND_API_KEY in Supabase secrets to switch this on.
       If the key is missing we skip silently: a missing email must
       never break a successful payment. */
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

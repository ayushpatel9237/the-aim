# THE AIM — Launch Checklist

Everything the site needs, and who does what. Work top to bottom.

---

## 🔴 BLOCKING — you cannot take money until these are done

**1. Fill the [FILL IN] fields** (5 policy pages)
`contact.html` · `shipping.html` · `returns.html` · `privacy.html` · `terms.html`
Business name, address, phone, email, GST number, grievance officer, jurisdiction city.
**Razorpay will reject your application without these.**

**2. Real prices**
Admin → Products → edit each. The current prices are placeholders.

**3. Razorpay account**
razorpay.com → sign up → KYC (PAN, bank account, GST). 1–2 days.
Then Dashboard → API Keys → copy Key ID + Key Secret.

**4. Deploy the payment functions**
```bash
npm i -g supabase
supabase login
supabase link --project-ref homwhfarhwulhtcobwfc
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
supabase secrets set RAZORPAY_KEY_SECRET=xxx
supabase functions deploy create-order  --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt
```

**5. Run the SQL you haven't yet**
- `order-tracking.sql` → lets customers track orders (NEW)
- `site-content.sql` → homepage feed + poll (if not done)
- `security-hardening.sql` → closes the security holes (if not done)

---

## 🟡 STRONGLY RECOMMENDED — trust and operations

**6. Order confirmation emails** (code is ready, needs a key)
Sign up free at **resend.com**, verify your domain, then:
```bash
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set ORDER_FROM_EMAIL=orders@yourdomain.com
supabase secrets set ADMIN_EMAIL=your@email.com
```
Customer gets a receipt; you get a "new order" alert. Until this is set,
payment still works — the email is simply skipped.

**7. A real domain**
`itsaim.netlify.app` works, but `theaim.store` (or similar) is worth the
₹800/year for trust. Netlify → Domain management → add domain.

**8. Test a real ₹1 order**
Set one product to ₹1, buy it yourself with real UPI, confirm:
order appears as **paid** in admin · stock dropped · email arrived ·
tracking page finds it. Then set the price back.

---

## 🟢 WHAT BIG STORES HAVE THAT YOU DON'T (yet)

Ranked by what actually matters for a new store:

| Missing | Why it matters | Effort |
|---|---|---|
| **Product reviews & ratings** | The #1 trust signal. New stores live or die on this. | Medium |
| **Coupon / discount codes** | Launch offers, curator codes, festival sales | Small |
| **Customer accounts + order history** | Repeat buyers expect "my orders" | Medium |
| **Shipping integration** (Shiprocket/Delhivery) | Auto labels + real tracking numbers | Medium |
| **Related / "customers also bought"** | Raises order value | Small |
| **Size & variant selection** | Only if you add clothing | Medium |
| **Abandoned cart reminder** | Recovers ~10% of lost checkouts | Medium |
| **GST invoice PDF** | Legally expected in India | Small |
| **Live chat / WhatsApp button** | Indian shoppers expect WhatsApp | Small |
| **Search suggestions** | Nice once you pass ~50 products | Small |

**My honest advice on order:** reviews first (trust), then coupons
(marketing), then WhatsApp support (Indian buyers really do expect it),
then shipping integration once you have steady orders.

Don't build them all now. Launch, get 10 real orders, then decide what's
actually slowing you down.

---

## ✅ ALREADY DONE

- Storefront, cart, checkout, order confirmation
- **Customer order tracking** (`track.html` + secure lookup)
- Full admin control centre (products, images, orders, curators, payouts, homepage)
- Curator portal with commission tracking + Google login
- Secure server-side payments (real prices, verified signatures)
- Multi-layer security (RLS, admin gating, CSP, headers)
- Responsive on all devices
- Order confirmation email (code ready, needs the Resend key)

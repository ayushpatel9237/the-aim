# THE AIM — Go-Live Guide (with online payments)

Your store is built and **passed a full 10-point technical test** — syntax, links,
images, checkout flow, and payment security all clean. What's left is connecting
the real-world accounts. Follow in order. Nothing here needs coding.

---

## The order of operations

```
①  Fill your real details        (you)
②  Fix prices & descriptions      (you)
③  Legal basics (PAN/bank/GST)    (you)
④  Deploy to GitHub + Netlify     (you, 20 min)
⑤  Supabase database              (you paste, 15 min)
⑥  Razorpay account + KYC         (you, ~1–2 days approval)
⑦  Deploy the 2 payment functions (you run 4 commands)
⑧  Test one real ₹1 payment       (you)
→  LIVE
```

---

## ① Fill real details
Every policy page (`contact`, `shipping`, `returns`, `privacy`, `terms`) has orange
**[FILL IN]** markers. Replace them all. **Razorpay approval requires these.**

## ② Fix product data
`js/products-data.js` → real **prices**, **descriptions**, **categories**.
⚠️ These prices must match what you'll seed into the database in step ⑤.

## ③ Legal basics
For payments in India: a **bank account**, **PAN**, and **GST** (many gateways ask
for it). A sole-proprietorship registration helps but isn't always required to start.

## ④ Deploy (one account, forever)
GitHub repo → connect to **one** Netlify account (use `patelayush9237`, write it down).
Your files are already there — just keep using this one account. Never account-hop again.

## ⑤ Supabase database
1. supabase.com → New project (region: Mumbai/Singapore)
2. SQL Editor → paste **`curator-schema.sql`** → Run  (creates curators, orders, products, stock)
3. SQL Editor → paste **`seed-products.sql`** → Run  (loads your real prices server-side)
4. Project Settings → API → copy **URL** + **anon key** → paste into **`js/config.js`**
5. Sign up on `admin.html`, then run the admin SQL from `CURATOR-SETUP.md`

Re-run `seed-products.sql` any time you change prices in `products-data.js`.

## ⑥ Razorpay account
1. razorpay.com → sign up → complete **KYC** (needs ①②③). Approval: 1–2 days.
2. Dashboard → API Keys → generate → copy **Key ID** (`rzp_live_…`) and **Key Secret**

## ⑦ Deploy the payment functions
Your store's payments run on **two secure server functions** (already written, in
`supabase/functions/`). They ensure the browser can never fake a price or a payment.

Install the Supabase CLI once (`npm i -g supabase`), then in your project folder:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# set the secrets (never put these in the website files)
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
supabase secrets set RAZORPAY_KEY_SECRET=your_secret
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically

supabase functions deploy create-order --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt
```

That's it. The moment these are deployed and `js/config.js` has your keys, the
checkout switches to **real, verified online payments**.

## ⑧ Test with ₹1
Put one product at ₹1 (in `products-data.js` + re-seed), buy it yourself with a real
UPI, confirm: order appears in Supabase `orders` table as **paid**, stock dropped,
and (if you used a curator link) the curator got credited. Then set the price back.

---

## How your money + security work

**Every payment is verified on the server.** Here's the flow:
1. Customer clicks Place Order → your **create-order** function looks up the REAL
   price from the database (ignores anything the browser claims), creates a Razorpay
   order, saves it as *pending*.
2. Customer pays in the Razorpay sheet.
3. Razorpay returns a signature → your **verify-payment** function checks it
   cryptographically. Only if genuine does the order become **paid**, stock drop, and
   the curator get credited.

This is the correct, safe way — a customer cannot pay ₹1 for a ₹1000 item, and a
fake "payment success" can't create a real paid order.

**Curator commission** flows automatically: a sale through a curator's link credits
them their % — visible on their dashboard and your admin.

---

## What's already done & tested ✓
- 13 pages, all syntax-clean
- No dead links, all images present
- Cart → checkout → server → confirmation chain wired
- Server-side price lookup + signature verification (the security that matters)
- Curator portal + admin + referral tracking
- THE AIM branding throughout, storage keys stable (no data loss on update)

## What only you can do
- Your real details, prices, and the accounts (Netlify, Supabase, Razorpay) — because
  they're tied to your identity and bank. No code can create these.

When you've done ⑤ and ⑥, tell me and I'll help with anything that errors during ⑦,
and add the "commission minus already-paid" math to the curator payouts.

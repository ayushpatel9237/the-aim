# THE AIM — Security & Completion Guide

Your site has been hardened end to end. This explains what protects you,
what was fixed, and the 2 steps you must run to switch it all on.

---

## ⚠️ DO THESE TWO THINGS (required)

**1. Run `security-hardening.sql` in Supabase**
SQL Editor → New query → paste the whole file → Run.
This closes real holes (see below). Without it, the protections aren't active.

**2. Push the updated site** (GitHub Desktop → commit → push)
Changed files: `js/ascentra-db.js`, `js/referral.js`, `js/live-products.js` (new),
`netlify.toml`, `admin.html`, `index.html`, `shop.html`, `product.html`.

---

## Holes that were found and closed

**🔴 A curator could approve themselves.**
The old rule let a curator edit their own row — including `status`. So anyone
who signed up could set themselves to `active` and start earning.
**Fixed:** curators can no longer change their own status, commission %,
referral code, or totals. New signups are forced to start as `pending`.

**🔴 Anyone could inject fake sales and pay themselves.**
`referral.js` wrote to `curator_sales` from the browser. A person could open
the console and insert sales for any amount.
**Fixed:** the browser can no longer write sales at all. The referral code
simply rides along with the order, and the **server** credits the curator only
after a cryptographically verified payment.

**🔴 Orders could be forged from the browser.**
**Fixed:** insert/update/delete on `orders` revoked for all browser users.
Only the payment Edge Function (service role) can create orders.

**🔴 Payouts could be forged.**
Someone could request a payout for any amount, for any curator, or mark
their own as paid.
**Fixed:** a payout can only be requested by an **active** curator, for
themselves, amount must be > 0, and status must start as `requested`.
Only you (admin) can mark one paid.

**🔴 Products could be edited by non-admins.**
**Fixed:** write access revoked; only admin may add/edit/delete.

---

## Layers of protection now in place

**Layer 1 — Database rules (the real security).**
Every table has Row Level Security. Curators see only their own data. Only
an admin JWT can touch products, orders, curator status, or payouts. Even if
someone bypasses your website entirely and calls the database directly, these
rules still hold.

**Layer 2 — Client-side guards (defence in depth).**
Every admin function now checks `isAdmin()` before running, and validates its
input (valid status values, price > 0, image type, 5MB limit). This catches
mistakes early and makes tampering obvious.

**Layer 3 — Browser security headers.**
- **Content-Security-Policy** — the page may only load scripts/data from
  trusted sources (your site, Supabase, Razorpay, YouTube). Blocks injected
  scripts, a common attack.
- **X-Frame-Options** — nobody can embed your site in theirs (clickjacking).
- **X-Content-Type-Options** — blocks MIME-sniffing attacks.
- **Strict-Transport-Security** — forces HTTPS.
- **Permissions-Policy** — camera/mic/location denied.

**Layer 4 — Nothing secret in the browser.**
The anon key is public *by design* and safe. Your Razorpay secret and service
role key live only on the server (Edge Functions). Audited: no secrets in
client code.

**Layer 5 — Source files hidden.**
`.sql`, `.md`, and the `supabase/` folder now return 404 on the live site, so
nobody can read your schema or setup notes.

---

## New: admin edits now show on the shop

`js/live-products.js` connects your storefront to the database. When you change
a price, description, image, or stock in the **admin control centre**, the shop
picks it up. The static file remains as a fallback, so the shop never breaks
even if the database is slow.

Products added *only* in the admin also appear on the shop automatically.

---

## Your admin control centre (full seller power)

- **Dashboard** — orders, revenue, curators, pending approvals
- **Products** — add/edit/delete, **image upload**, short + full description,
  price, MRP, stock, category, video link, and Active/Draft/Paused status
- **Orders** — every order, customer details, and status control
  (pending → paid → confirmed → shipped → delivered)
- **Curators** — approve / reject / suspend
- **Payouts** — see requests, mark paid

## Your curator portal (full parity with the parent site)

- Google or email login
- Application → pending → approved flow
- Tier, total sales, total earned, available to withdraw, commission %
- Their referral **link + coupon code** with one-click copy
- Sales history
- Request payout

---

## What's still on you (nothing can replace these)

1. **Never share** your Supabase **service_role** key or database password.
   The anon key is fine to be public; those two are not.
2. **Keep admin to your account only.** Anyone you make admin can do everything.
3. **Razorpay** — when you add it, the secret goes in Supabase secrets (server),
   never in a website file.
4. **Real prices and policy details** — the last non-technical gap.

---

## How to verify the lockdown worked

In Supabase SQL Editor:
```sql
select tablename, policyname, cmd from pg_policies where schemaname = 'public';
```
You should see policies on `curators`, `curator_sales`, `curator_payouts`,
`products`, and `orders`.

A good real-world test: sign up a second curator account, and confirm it
**cannot** see the admin page, cannot see other curators' sales, and stays
`pending` until you approve it.

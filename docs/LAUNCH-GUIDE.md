# The AIM — The Complete Launch Guide

Your store now has the **full selling cycle built in**. This guide takes you from
"works on my laptop" to "a stranger in another city can pay me and get their parcel."

Follow the phases in order. Nothing here needs coding — it's copy, paste, and click.

---

## ✅ What already works (test it right now)

Open `index.html` and try the whole flow:

1. Browse products, tap a **video** on a product page
2. Vote in **"Dropping next"**, heart something to your **watchlist**
3. Add items to your **Bag**
4. Open the bag → **Checkout**
5. Fill the address form → **Place order**
6. See the **Order confirmed** page with your order number

That entire flow works offline today. Every order you place is saved on the
device under "ascentra_orders". The only things that need the steps below are
**real online payments** and **orders reaching you automatically**.

---

## PHASE 1 — Put it online (Netlify) · ~20 min · free

Payments and forms can't run from a `file://` page. They need a real web address.

1. Go to **netlify.com** → sign up (free)
2. Click **"Add new site" → "Deploy manually"**
3. Drag your whole `site` folder onto the page
4. Done — you get a URL like `ascentra-xyz.netlify.app`
5. (Optional) Buy a domain like **ascentra.in** and connect it in Netlify → Domain settings

**To update later:** just drag the folder again, or connect GitHub for auto-updates.
Redeploys are free and take ~30 seconds.

After deploying, open `sitemap.xml` and `robots.txt` and replace
`https://ascentra.netlify.app` with your real URL. Same in the `<meta property="og:...">`
tags at the top of `index.html`, `shop.html`, `product.html`.

---

## PHASE 2 — Fill in your real details · ~30 min

These are the only "fake" things left. All customer-facing.

**A. Prices & descriptions** — open `js/products-data.js`
Every product's `price`, `desc`, and `category` is my best guess. Fix them.
Add a real `mrp` only if you have the printed MRP (then the strike-through returns).

**B. Product videos** — open `js/products-data.js`
For any product, set its `video` to your Instagram / YouTube link or an uploaded file.
Leave `""` for photos-only.

**C. The Feed** — open `js/feed.js`
Paste your real reel links. This is your "See it move" section.

**D. Upcoming poll items** — open `js/upcoming-data.js`
Change these to the products you're actually thinking of stocking next.

**E. Policy pages** — open `contact.html`, `shipping.html`, `returns.html`,
`privacy.html`, `terms.html`
Replace every orange **[FILL IN]** with your real info: business name, address,
GST (if any), phone, email, dispatch days, return window, Grievance Officer.
**Razorpay will not approve you without these filled in.**

**F. Shipping charge** — open `js/cart.js` AND `js/checkout.js` (top of each)
```
var SHIP_FEE = 0;            // your delivery charge in ₹
var FREE_SHIP_ABOVE = null;  // free above this amount, or null
```
Set both files the same.

---

## PHASE 3 — Take real payments (Razorpay) · ~1 hour

1. Sign up at **razorpay.com** → complete KYC (PAN, bank account, the policy pages
   from Phase 2). Approval usually takes 1–2 days.
2. Get your **Key ID** (starts with `rzp_live_...`)
3. In every checkout page — actually just add this ONE line to `checkout.html`,
   right before `<script src="js/checkout.js">`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>window.RAZORPAY_KEY = "rzp_live_XXXXXXXXXXXX";</script>
```

That's it. The checkout code already knows what to do — the moment `RAZORPAY_KEY`
exists, the "Place order" button opens the real UPI/card/netbanking sheet. Until
then it runs in test mode (COD-style) so you can demo it.

> **Important:** for production, payment *verification* should happen on a small
> server function (Netlify Function) so payments can't be faked. When you reach this
> point, come back and I'll write that function for you — it's ~20 lines.

---

## PHASE 4 — Orders reach you automatically · ~30 min

Right now orders save on the customer's device. You want them to land in YOUR
inbox/sheet the instant they're placed. Easiest path, no server:

**Option A — Google Sheet (simplest)**
1. Create a Google Sheet
2. Extensions → Apps Script → paste a tiny "doPost" script (I'll give you this)
3. Deploy as Web App → copy the URL
4. Add one line in `checkout.js`'s `finishOrder` to POST the order there
5. Every order now appears as a row in your sheet + you can get email alerts

**Option B — WhatsApp / email alert**
A free tool (Zapier / Make) watches the sheet and pings your WhatsApp on each order.

When you're ready for this, tell me and I'll write the exact script + the one line
to add. It's the last piece of the "order reaches me" loop.

---

## PHASE 5 — The back office (later, when you grow)

You already built the **creator dashboard** (`creator.html`) for the future. When
you're ready, the whole back-office runs on one free database (**Supabase**):

- Orders saved to a real database (not just the device)
- Live stock counts ("3 left" that actually decrease, "Sold out")
- The poll showing **everyone's** combined votes, not just each visitor's
- The creator dashboard fully working (logins, sales, payouts)
- An **admin page** where you see all orders and mark them shipped

This is one setup that unlocks all of it. It's the natural "grow up" step after
you're taking orders. When you want it, I'll write the complete database setup
(the exact SQL to paste in once) plus the admin page.

---

## The complete cycle — where each piece lives

| Step | What happens | File |
|------|-------------|------|
| Discover | Customer finds you | your Instagram + `index.html` |
| Browse | Sees products & videos | `shop.html`, `product.html` |
| Add to bag | Picks items | `js/cart.js` |
| Checkout | Enters address | `checkout.html` + `js/checkout.js` |
| Pay | UPI / card / COD | Razorpay (Phase 3) |
| Confirmed | Thank-you + order no. | `order-confirmed.html` |
| You get it | Order in your sheet | Phase 4 |
| Ship | You pack & send | your courier + Phase 4 |
| Grow | Stock, creators, admin | Supabase (Phase 5) |

---

## Recommended order to actually do this

1. **Phase 2** (fill real details) — do this first, it's all you
2. **Phase 1** (deploy to Netlify) — get it online
3. **Phase 4** (orders reach you) — so you never miss an order
4. **Phase 3** (Razorpay) — start taking money
5. **Phase 5** (backend) — when orders grow

You can be live and taking COD orders after steps 1–2–4 alone. Payments (3) and
the back office (5) can follow.

Any phase you want me to build or write the exact code for — just say which number.

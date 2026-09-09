# THE AIM — project state & handoff

A live Indian e-commerce shop. This note captures what is built, what works,
and what is next, so a fresh session can pick up without re-deriving it all.

## What it is
- Storefront: `itsaim.netlify.app`. Repo: `github.com/ayushpatel9237/the-aim`.
- Owner/admin/curator/developer: one person, Ayush Ramani, Surendranagar.
- Stack: static HTML/CSS/vanilla JS on Netlify · Supabase (Postgres + Edge
  Functions) · Razorpay payments · Resend for order email.
- Repo folder on disk has a **trailing space**: `~/Downloads/the aim `.
  Deploy edge functions from there.

## Supabase
- Project ref: `homwhfarhwulhtcobwfc`
- URL: `https://homwhfarhwulhtcobwfc.supabase.co`
- Anon key lives in `js/config.js` (safe, public). Service role key: never in
  client, never in chat.
- Edge functions: `create-order` and `verify-payment`, both deployed
  `--no-verify-jwt` (guest checkout, no auth token).
- Buckets: `product-images` (public), `product-videos` (public, auto-created by
  the admin uploader on first use).

## Data model (key tables)
- `products` — id (text), name, price (numeric), mrp, stock (int), active
  (bool — the real on/off switch; a `status` text column also exists but is
  unused, ignore it), short_desc, description, category, images (jsonb), video.
- `orders` — id, customer (jsonb), items (jsonb), subtotal, shipping, total,
  payment, status (pending_payment|paid|confirmed|shipped|delivered|cancelled|
  refunded), razorpay_order_id, delivered_at, ref_code.
- `videos` — id (uuid), product_id, curator_id, video_url, poster_url, caption,
  status (draft|live|hidden), show_story, sort_order, views.
- `video_comments` — reviews, tied to an order_id, status pending|verified|
  hidden. Only insertable via the `post_review` function, which re-checks the
  purchase server-side. Public reads see verified only.
- `video_likes`, `curators`, `curator_sales`, `curator_payouts`,
  `customer_profiles`, `customer_watchlist`, `feed_items`, `upcoming_items`.
- Views: `video_feed`, `product_ratings` (both security_invoker).
- RLS on every table. Anon can read only active products, live videos, verified
  reviews. All writes are admin-only or go through checked functions.

## Money path (works, tested end to end)
- Browser NEVER sends price. `create-order` looks up real prices from the DB,
  computes the total, creates the Razorpay order or saves a COD order.
- COD path decrements stock, credits the curator, and emails — all fixed.
- `verify-payment` checks the Razorpay signature, marks paid, decrements stock,
  credits curator, emails. Bookkeeping is wrapped so it can never report a
  successful payment as failed. Email + stock run via EdgeRuntime.waitUntil so a
  slow mail service can't drop the response.
- Order ids: `AIM` + YYMMDD + 6 random chars from an unambiguous alphabet
  (no I/O/0/1). Unguessable, collision-checked.
- Secrets set: RAZORPAY_KEY_ID/SECRET (test), RESEND_API_KEY,
  ADMIN_EMAIL=theaim.9237@gmail.com, ORDER_FROM_EMAIL=onboarding@resend.dev.

## Stories / video (works)
- `js/stories.js` — homepage story rail + full-screen viewer, rendered inside a
  **shadow root** so page CSS can't leak in. Vertical video, tap zones, swipe
  L/R/down, hold-to-pause, one centred play button (SVG), stock ring that
  depletes with inventory, "N left" badge, Shop-this opens the quick-view sheet.
  URL-encodes media paths (spaces in filenames were breaking src).
- Admin (`js/admin-ops.js`, Operations tab) — add/edit/publish/hide/delete
  videos, upload video + poster (buckets auto-create), edit caption/product/
  order/poster, review moderation queue, health checks, bulk stock, integrity
  scan, order cleanup, backups (JSON + orders CSV), self-checking launch
  readiness panel.

## Security (closed)
- RLS all tables. Customer data unreadable by anon. Curator PII leak closed via
  `check_ref_code`. Source files (.sql/.md) blocked in netlify.toml with
  force=true redirects. Security headers + CSP live. Admin gated on
  app_metadata.role === 'admin' (user can't edit it).

## Legal (done, real details in place)
- terms / privacy / shipping / returns / contact — all carry the real entity
  (Ramani Ayush Kamleshbhai, sole proprietor t/a THE AIM), Surendranagar
  address, theaim.9237@gmail.com, +91 91731 44344, grievance officer, GST
  "registration in progress". Returns: 7-day, damaged/defective/wrong only.
  Free delivery all-India. Dispatch 2 working days.
- GST application in progress. Court jurisdiction: Vadodara.

## Known recurring gotcha
- Two sources of truth for the catalogue: static `js/products-data.js` +
  live DB (merged by `js/live-products.js`, filtering on `active`). If they
  drift, checkout can reject on price mismatch. Keep DB authoritative.
- Every file handed over in this build has had at least one real bug. Audit,
  don't trust on sight.

## The launch selection: 22 items
Five held back (Handbag Phone Case, Diamond Gemstone Phone Case, Bluetooth
Finger Robot, Magnetic Neck Fan, Wireless Remote Light Switch) — set inactive.
`launch-catalogue.sql` writes real descriptions for the 22 and sets active
flags. Descriptions are plain, concrete, one benefit each.

## THE REDESIGN — where it stands
- New identity chosen: **swan #F6F6EC + deep navy #00072D**, frosted-glass
  panels, Manrope + JetBrains Mono. Bright, premium, trust-through-precision.
  No owner story, no gold, no dark theme.
- Homepage brief written (`the-aim-build-prompt.md`): opening pulls the eye down
  with "Things you didn't know you needed — until now"; films shown as a gallery
  (NOT Instagram circles); product grid reused from live shop; trust shown as
  the review *rule* (every review tied to a delivered order) rather than fake
  testimonials.
- Product-page design returned from Claude Design (glass hero + detail panels +
  recessed product wall). It is a **mockup in Claude Design's template language**
  (`<x-dc>`, `<sc-if>`, `{{ }}`) — NOT runnable code. Its look is what we want.
- `aim-design-tokens.css` distils that look into real CSS variables + classes
  (.glass, .glass-hero, .glass-card, .media-well, .wall, .price-bar, .hdr-glass).

## NEXT JOB (the graft)
Rebuild the real `product.html` inside the new glass design, keeping every wire
live: gallery swap, quantity stepper, Buy Now → checkout.js, +Bag → cart.js
(exports `window.AscentraCart`, methods items/count/total/add/remove/clear/open/
close — there is no `read()`), quick-view via sheet.js, reviews via post_review.
Use `aim-design-tokens.css` for appearance. Bring to that session: this file,
the tokens css, the Claude Design zip, the current live `product.html`, and
`sheet.js`. Reskin around the machinery; never replace it. Real prices only —
no invented MRP/discount. Then apply the same treatment to `index.html`.

# The AIM — Curator System Setup

Your black seller site now has a **full curator cycle**: curators sign up →
you approve them → they share their link/code → sales credit them automatically
→ they request payouts → you mark them paid. Everything shows on the curator
dashboard AND your admin page.

It needs one thing to switch on: a free **Supabase** database. ~15 minutes, once.

---

## Step 1 — Create the database (5 min)

1. Go to **supabase.com** → sign up (free) → **New project**
2. Name it `ascentra`, set a strong database password, pick the closest region
   (Mumbai / Singapore), click **Create**. Wait ~2 min for it to build.

## Step 2 — Build the tables (2 min)

1. In your project, open **SQL Editor** (left sidebar)
2. Open the file **`curator-schema.sql`** from this package, copy ALL of it
3. Paste into the SQL editor → click **Run**
4. You should see "Success". Your tables (`curators`, `curator_sales`,
   `curator_payouts`) now exist, with security rules.

## Step 3 — Get your keys (1 min)

1. Left sidebar → **Project Settings** → **API**
2. Copy two things:
   - **Project URL** (like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string)

## Step 4 — Connect the site (1 min)

1. Open **`js/config.js`**
2. Paste your URL and anon key in place of the `PASTE_...` placeholders
3. Save

That's it — `curator.html` and `admin.html` now work.

## Step 5 — Make yourself the admin (2 min)

1. Deploy the site (or open it locally after Step 4)
2. Go to **admin.html** → sign up with YOUR email + a password
3. Back in Supabase → **SQL Editor** → run this (use your email):
   ```
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
   where email = 'YOUR@email.com';
   ```
4. Reload admin.html — you now see the admin dashboard.

---

## How the whole cycle works

**A curator joins**
- They go to `curator.html` → sign up → fill "Apply to curate"
- They land in a "Application received" pending screen

**You approve them**
- Go to `admin.html` → Curators → click **Approve**
- They now get their dashboard with a **link** and **coupon code**

**They promote**
- They share their link: `yoursite.com/index.html?ref=THEIRCODE`
- Anyone who arrives through it is remembered for 30 days

**A sale happens**
- Customer buys → at checkout the order is credited to that curator
- Commission (default 10%) is recorded automatically
- It appears on the curator's "Your sales" AND your admin view

**Payout**
- Curator clicks **Request payout**, enters their UPI/bank
- You see it in admin → send the money → click **Mark paid**

---

## Settings you can change

- **Commission %** — per curator, in the `curators` table (`commission_pct`).
  Default is 10%. Change it in Supabase → Table editor, or I can add a control to
  the admin page.
- **Referral window** — currently 30 days (in `js/referral.js`).

---

## Important notes

- The **anon key is safe to be public** — it's designed for the browser. Your data
  is protected by the security rules in the schema (each curator sees only their
  own data; only admins see everything).
- Right now, "available to withdraw" shows total earned. Once you're running real
  payouts, tell me and I'll make it subtract amounts already paid — a small change.
- The customer storefront works with OR without this connected. If `config.js`
  isn't filled in, the shop still runs fine; only the curator/admin pages wait.

When it's connected and you want the commission-minus-paid math, or a
commission control on the admin page, just ask.

-- ═══════════════════════════════════════════════════════════════
--  ASCENTRA — CURATOR SYSTEM  ·  Database schema
--  Paste this whole file into Supabase → SQL Editor → Run.
--  It creates everything the curator page + admin need.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. CURATORS ──────────────────────────────────────────────
-- One row per creator/affiliate who promotes your products.
create table if not exists curators (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade unique,
  name          text not null,
  email         text not null,
  instagram     text,
  ref_code      text unique not null,           -- e.g. "AYUSH10" (their coupon + link tag)
  commission_pct numeric not null default 10,    -- % they earn per sale
  status        text not null default 'pending', -- pending | active | suspended | rejected
  total_sales   int  not null default 0,         -- running counters (kept fresh by triggers)
  total_earned  numeric not null default 0,
  created_at    timestamptz not null default now()
);

-- ── 2. CURATOR SALES ─────────────────────────────────────────
-- One row per order that came through a curator's link/code.
create table if not exists curator_sales (
  id           uuid primary key default gen_random_uuid(),
  curator_id   uuid references curators(id) on delete cascade,
  order_id     text not null,                  -- your ASCxxxxx order number
  order_total  numeric not null,
  commission   numeric not null,               -- what the curator earned on this sale
  status       text not null default 'confirmed', -- confirmed | cancelled
  created_at   timestamptz not null default now()
);

-- ── 3. CURATOR PAYOUTS ───────────────────────────────────────
-- When a curator requests a withdrawal, and when you pay it.
create table if not exists curator_payouts (
  id          uuid primary key default gen_random_uuid(),
  curator_id  uuid references curators(id) on delete cascade,
  amount      numeric not null,
  method      text,                            -- UPI id / bank details they gave
  status      text not null default 'requested', -- requested | paid | rejected
  requested_at timestamptz not null default now(),
  paid_at      timestamptz
);

-- ── keep curator counters fresh automatically ────────────────
create or replace function bump_curator_totals() returns trigger as $$
begin
  update curators c set
    total_sales  = (select count(*)          from curator_sales s where s.curator_id = c.id and s.status='confirmed'),
    total_earned = (select coalesce(sum(commission),0) from curator_sales s where s.curator_id = c.id and s.status='confirmed')
  where c.id = coalesce(new.curator_id, old.curator_id);
  return null;
end; $$ language plpgsql security definer;

drop trigger if exists trg_sales on curator_sales;
create trigger trg_sales after insert or update or delete on curator_sales
  for each row execute function bump_curator_totals();

-- ═══════════════════════════════════════════════════════════════
--  SECURITY (Row Level Security)
--  Each curator sees ONLY their own data. You (admin) see all.
-- ═══════════════════════════════════════════════════════════════
alter table curators        enable row level security;
alter table curator_sales   enable row level security;
alter table curator_payouts enable row level security;

-- a curator can read + update their own profile
drop policy if exists "curator reads self" on curators;
create policy "curator reads self" on curators
  for select using (auth.uid() = user_id);
drop policy if exists "curator inserts self" on curators;
create policy "curator inserts self" on curators
  for insert with check (auth.uid() = user_id);
drop policy if exists "curator updates self" on curators;
create policy "curator updates self" on curators
  for update using (auth.uid() = user_id);

-- a curator sees only their own sales
drop policy if exists "curator reads own sales" on curator_sales;
create policy "curator reads own sales" on curator_sales
  for select using (
    curator_id in (select id from curators where user_id = auth.uid())
  );

-- a curator sees + creates their own payout requests
drop policy if exists "curator reads own payouts" on curator_payouts;
create policy "curator reads own payouts" on curator_payouts
  for select using (
    curator_id in (select id from curators where user_id = auth.uid())
  );
drop policy if exists "curator requests payout" on curator_payouts;
create policy "curator requests payout" on curator_payouts
  for insert with check (
    curator_id in (select id from curators where user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════
--  ADMIN ACCESS
--  Mark yourself admin once, then you can see + manage everything.
--  After running this file:
--   1) sign up on the site with your email
--   2) run:  update auth.users set raw_app_meta_data =
--            raw_app_meta_data || '{"role":"admin"}' where email='YOU@email.com';
-- ═══════════════════════════════════════════════════════════════
drop policy if exists "admin all curators" on curators;
create policy "admin all curators" on curators
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "admin all sales" on curator_sales;
create policy "admin all sales" on curator_sales
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "admin all payouts" on curator_payouts;
create policy "admin all payouts" on curator_payouts
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- allow public read of ACTIVE curators by ref_code (so checkout can validate a code)
drop policy if exists "public reads active by code" on curators;
create policy "public reads active by code" on curators
  for select using (status = 'active');


-- ═══════════════════════════════════════════════════════════════
--  ORDERS  (added for production — real order records + stock)
-- ═══════════════════════════════════════════════════════════════

-- product prices live server-side so the browser can never fake a price
create table if not exists products (
  id          text primary key,          -- matches product id in products-data.js
  name        text not null,
  price       numeric not null,           -- ₹, the real price
  stock       int not null default 100,   -- decremented on each order
  active      boolean not null default true
);

create table if not exists orders (
  id           text primary key,          -- AIMxxxxxxxx
  created_at   timestamptz not null default now(),
  customer     jsonb not null,            -- name, phone, email, address...
  items        jsonb not null,            -- [{id, name, qty, price, line}]
  subtotal     numeric not null,
  shipping     numeric not null default 0,
  total        numeric not null,
  payment      text not null,             -- upi | cod
  status       text not null default 'pending', -- pending | paid | confirmed | shipped | delivered | cancelled | refunded
  razorpay_order_id   text,
  razorpay_payment_id text,
  ref_code     text                       -- curator code if any
);

alter table products enable row level security;
alter table orders   enable row level security;

-- anyone can read active products (prices) ; only admin can change them
drop policy if exists "public reads products" on products;
create policy "public reads products" on products for select using (active = true);
drop policy if exists "admin writes products" on products;
create policy "admin writes products" on products
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- customers cannot read others' orders; only admin sees all.
-- orders are created by the secure server function (service role), not the browser.
drop policy if exists "admin all orders" on orders;
create policy "admin all orders" on orders
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- helper the payment function calls to reduce stock safely
create or replace function decrement_stock(pid text, qty int)
returns void as $$
  update products set stock = greatest(0, stock - qty) where id = pid;
$$ language sql security definer;


-- ═══════════════════════════════════════════════════════════════
--  PRODUCT IMAGES — storage bucket + richer product columns
--  (added so the admin can upload/manage images like the parent seller)
-- ═══════════════════════════════════════════════════════════════

-- richer product columns
alter table products add column if not exists short_desc text;
alter table products add column if not exists description text;
alter table products add column if not exists category   text;
alter table products add column if not exists mrp        numeric;
alter table products add column if not exists images     jsonb default '[]'::jsonb;  -- array of image URLs
alter table products add column if not exists video      text;
alter table products add column if not exists status     text default 'active';       -- active | draft | paused

-- create a public storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- storage policies: anyone can view; only admin can upload/delete
drop policy if exists "public view product images" on storage;
create policy "public view product images" on storage.objects
  for select using ( bucket_id = 'product-images' );
drop policy if exists "admin upload product images" on storage;
create policy "admin upload product images" on storage.objects
  for insert with check ( bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );
drop policy if exists "admin update product images" on storage;
create policy "admin update product images" on storage.objects
  for update using ( bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );
drop policy if exists "admin delete product images" on storage;
create policy "admin delete product images" on storage.objects
  for delete using ( bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );


-- ═══════════════════════════════════════════════════════════════
--  SITE CONTENT — homepage feed reels + "Dropping Next" poll items
--  Lets the admin manage the homepage without touching code.
-- ═══════════════════════════════════════════════════════════════
create table if not exists feed_items (
  id         uuid primary key default gen_random_uuid(),
  video      text,                    -- Instagram / YouTube / mp4 link
  poster     text,                    -- still image URL
  name       text not null,
  shop_id    text,                    -- product id to link "Shop this"
  sort_order int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists upcoming_items (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text,
  img        text,
  teaser     text,
  est_price  text,
  votes      int not null default 0,
  sort_order int not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- one vote row per visitor per item (prevents infinite self-voting)
create table if not exists upcoming_votes (
  id        uuid primary key default gen_random_uuid(),
  item_id   uuid references upcoming_items(id) on delete cascade,
  voter_key text not null,            -- anonymous browser key
  created_at timestamptz not null default now(),
  unique(item_id, voter_key)
);

alter table feed_items     enable row level security;
alter table upcoming_items enable row level security;
alter table upcoming_votes enable row level security;

-- public may read active content
create policy "public reads feed"     on feed_items     for select using (active = true);
drop policy if exists "public reads upcoming" on upcoming_items;
create policy "public reads upcoming" on upcoming_items for select using (active = true);
-- only admin may change it
create policy "admin writes feed"     on feed_items     for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "admin writes upcoming" on upcoming_items;
create policy "admin writes upcoming" on upcoming_items for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- anyone may cast ONE vote per item; nobody may edit or delete votes
create policy "public reads votes"  on upcoming_votes for select using (true);
create policy "public casts vote"   on upcoming_votes for insert with check (true);
revoke update, delete on upcoming_votes from anon, authenticated;

-- live vote tally, safe to read publicly
create or replace view upcoming_tally as
  select i.id, i.name, i.category, i.img, i.teaser, i.est_price, i.sort_order,
         (select count(*) from upcoming_votes v where v.item_id = i.id) as vote_count
  from upcoming_items i where i.active = true;

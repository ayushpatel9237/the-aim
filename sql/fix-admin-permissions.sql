-- ═══════════════════════════════════════════════════════════════
--  THE AIM — FIX ADMIN PERMISSIONS
--  Run this in Supabase -> SQL Editor -> Run
--  This immediately resolves: "permission denied for table products"
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Grant table privileges to authenticated users ───────────
-- (RLS policies below will ensure ONLY admins can actually write)
grant select, insert, update, delete on table products to authenticated;
grant select, update on table orders to authenticated;
grant select, update on table curator_payouts to authenticated;
grant select, update on table curators to authenticated;
grant select, insert, update, delete on table feed_items to authenticated;
grant select, insert, update, delete on table upcoming_items to authenticated;

-- Anon needs to read public catalog and site content
grant select on table products to anon;
grant select on table feed_items to anon;
grant select on table upcoming_items to anon;

-- ── 2. Enable Row Level Security (RLS) on all tables ────────────
alter table products       enable row level security;
alter table orders         enable row level security;
alter table curator_payouts enable row level security;
alter table curators       enable row level security;
alter table feed_items     enable row level security;
alter table upcoming_items enable row level security;

-- ── 3. Products RLS: Public reads, Admin writes ─────────────────
drop policy if exists "public reads products" on products;
create policy "public reads products" on products
  for select using (true);

drop policy if exists "admin writes products" on products;
create policy "admin writes products" on products
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── 4. Orders RLS: Admin reads & updates shipping/status ────────
drop policy if exists "admin reads orders" on orders;
create policy "admin reads orders" on orders
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin updates orders" on orders;
create policy "admin updates orders" on orders
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── 5. Curator Payouts RLS: Admin reads & marks paid ────────────
drop policy if exists "admin reads payouts" on curator_payouts;
create policy "admin reads payouts" on curator_payouts
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin updates payouts" on curator_payouts;
create policy "admin updates payouts" on curator_payouts
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── 6. Curators RLS: Admin reads & updates status ───────────────
drop policy if exists "admin reads curators" on curators;
create policy "admin reads curators" on curators
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin updates curators" on curators;
create policy "admin updates curators" on curators
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── 7. Site Content RLS: Admin writes reels and upcoming items ──
drop policy if exists "public reads feed" on feed_items;
create policy "public reads feed" on feed_items for select using (true);

drop policy if exists "admin writes feed" on feed_items;
create policy "admin writes feed" on feed_items
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "public reads upcoming" on upcoming_items;
create policy "public reads upcoming" on upcoming_items for select using (true);

drop policy if exists "admin writes upcoming" on upcoming_items;
create policy "admin writes upcoming" on upcoming_items
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

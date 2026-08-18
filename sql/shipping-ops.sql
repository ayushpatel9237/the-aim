-- ═══════════════════════════════════════════════════════════════
--  THE AIM — SHIPPING OPERATIONS + CUSTOMER PROFILE
--  Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

-- ── orders: the fields you need to actually ship ──
alter table orders add column if not exists tracking_no  text;
alter table orders add column if not exists courier      text;
alter table orders add column if not exists admin_note   text;
alter table orders add column if not exists shipped_at   timestamptz;
alter table orders add column if not exists delivered_at timestamptz;

-- ── a saved profile for signed-in customers ──
create table if not exists customer_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  address    text,
  city       text,
  state      text,
  pincode    text,
  updated_at timestamptz not null default now()
);

alter table customer_profiles enable row level security;

drop policy if exists "own profile read"   on customer_profiles;
drop policy if exists "own profile write"  on customer_profiles;
drop policy if exists "own profile update" on customer_profiles;

-- a customer may only ever see or change their OWN profile
create policy "own profile read"   on customer_profiles
  for select using (auth.uid() = user_id);
create policy "own profile write"  on customer_profiles
  for insert with check (auth.uid() = user_id);
create policy "own profile update" on customer_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── expose the tracking number on the customer lookup ──
-- Postgres will not let a function change its return columns, so the
-- old version is dropped first. Dropping a function does not touch
-- any data — it only removes the lookup helper, which is recreated
-- immediately below.
drop function if exists lookup_order(text, text);

create function lookup_order(p_id text, p_phone text)
returns table (
  id text, status text, total numeric, items jsonb,
  city text, state text, pincode text,
  tracking_no text, courier text,
  created_at timestamptz
)
language sql security definer set search_path = public as $$
  select o.id, o.status, o.total, o.items,
         o.customer ->> 'city'    as city,
         o.customer ->> 'state'   as state,
         o.customer ->> 'pincode' as pincode,
         o.tracking_no, o.courier,
         o.created_at
  from orders o
  where upper(o.id) = upper(p_id)
    and right(regexp_replace(o.customer ->> 'phone', '\D', '', 'g'), 10)
      = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  limit 1;
$$;
grant execute on function lookup_order(text, text) to anon, authenticated;

-- ── low stock view for the admin dashboard ──
create or replace view low_stock as
  select id, name, stock, price
  from products
  where active = true and stock <= 5
  order by stock asc;

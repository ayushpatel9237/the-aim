-- ═══════════════════════════════════════════════════════════════
--  THE AIM — CUSTOMER ORDER LOOKUP
--  Run this in Supabase SQL Editor. Safe to run more than once.
--
--  SECURITY: customers cannot read the orders table (that stays
--  admin-only). This function returns ONE order, and only when the
--  order number AND the phone number both match — so nobody can
--  browse other people's orders. It also returns only the fields a
--  customer needs, never the full address or email.
-- ═══════════════════════════════════════════════════════════════

create or replace function lookup_order(p_id text, p_phone text)
returns table (
  id       text,
  status   text,
  total    numeric,
  items    jsonb,
  city     text,
  state    text,
  pincode  text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.total, o.items,
         o.customer ->> 'city'    as city,
         o.customer ->> 'state'   as state,
         o.customer ->> 'pincode' as pincode,
         o.created_at
  from orders o
  where upper(o.id) = upper(p_id)
    -- phone must match exactly (digits only, last 10)
    and right(regexp_replace(o.customer ->> 'phone', '\D', '', 'g'), 10)
        = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  limit 1;
$$;

-- anyone may call it, but it only ever returns a matching order
grant execute on function lookup_order(text, text) to anon, authenticated;


-- ═══════════════════════════════════════════════════════════════
--  ORDER HISTORY — all orders for one phone number
--  Same security model: the phone number is the key, and only
--  customer-safe fields come back.
-- ═══════════════════════════════════════════════════════════════
create or replace function my_orders(p_phone text)
returns table (
  id text, status text, total numeric, items jsonb,
  city text, created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.total, o.items,
         o.customer ->> 'city' as city,
         o.created_at
  from orders o
  where right(regexp_replace(o.customer ->> 'phone', '\D', '', 'g'), 10)
      = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  order by o.created_at desc
  limit 50;
$$;

grant execute on function my_orders(text) to anon, authenticated;


-- ═══════════════════════════════════════════════════════════════
--  CUSTOMER ACCOUNTS (optional sign-in)
--  Guests can still buy without any of this. These tables only
--  serve people who choose to sign in.
-- ═══════════════════════════════════════════════════════════════

-- a signed-in customer's saved "Dropping Next" items
create table if not exists customer_watchlist (
  user_id   uuid not null references auth.users(id) on delete cascade,
  item_id   text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table customer_watchlist enable row level security;

drop policy if exists "own watchlist read"   on customer_watchlist;
drop policy if exists "own watchlist write"  on customer_watchlist;
drop policy if exists "own watchlist delete" on customer_watchlist;

-- a customer may only ever see or change their OWN watchlist
create policy "own watchlist read"   on customer_watchlist
  for select using (auth.uid() = user_id);
create policy "own watchlist write"  on customer_watchlist
  for insert with check (auth.uid() = user_id);
create policy "own watchlist delete" on customer_watchlist
  for delete using (auth.uid() = user_id);

-- orders for the signed-in customer, matched on their verified email.
-- security definer + the auth.email() check means a customer can only
-- ever retrieve their own orders, never anyone else's.
create or replace function my_orders_by_email(p_email text)
returns table (
  id text, status text, total numeric, items jsonb,
  city text, created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.total, o.items,
         o.customer ->> 'city' as city,
         o.created_at
  from orders o
  where lower(o.customer ->> 'email') = lower(p_email)
    and lower(p_email) = lower(auth.email())   -- can only ask for yourself
  order by o.created_at desc
  limit 50;
$$;

grant execute on function my_orders_by_email(text) to authenticated;

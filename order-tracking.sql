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

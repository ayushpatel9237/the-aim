-- ═══════════════════════════════════════════════════════════════
--  THE AIM — SECURITY HARDENING
--  Run this in Supabase SQL Editor AFTER curator-schema.sql.
--  Closes the holes that would let someone cheat the system.
-- ═══════════════════════════════════════════════════════════════

-- ── HOLE 1: a curator could self-approve or raise their own commission ──
-- Replace the loose "update self" policy with one that blocks the
-- sensitive columns. Curators may edit only their own contact details.
drop policy if exists "curator updates self" on curators;

create policy "curator updates own profile only" on curators
  for update
  using  ( auth.uid() = user_id )
  with check (
    auth.uid() = user_id
    -- they cannot change these; values must stay as they are
    and status         = (select c.status         from curators c where c.user_id = auth.uid())
    and commission_pct = (select c.commission_pct from curators c where c.user_id = auth.uid())
    and ref_code       = (select c.ref_code       from curators c where c.user_id = auth.uid())
    and total_sales    = (select c.total_sales    from curators c where c.user_id = auth.uid())
    and total_earned   = (select c.total_earned   from curators c where c.user_id = auth.uid())
  );

-- new curators must always start as 'pending' (can't sign up pre-approved)
drop policy if exists "curator inserts self" on curators;
create policy "curator inserts self as pending" on curators
  for insert with check ( auth.uid() = user_id and status = 'pending' );

-- ── HOLE 2: browser could insert fake sales / fake commission ──
-- No browser-side inserts at all. Only the server (service role, used by
-- the payment Edge Function) may write sales. Curators can only READ theirs.
revoke insert, update, delete on curator_sales from anon, authenticated;

-- ── HOLE 3: payout requests could be forged for any amount ──
-- A curator may only request a payout for themselves, amount must be > 0,
-- and status must start as 'requested' (they can't mark themselves paid).
drop policy if exists "curator requests payout" on curator_payouts;
create policy "curator requests own payout" on curator_payouts
  for insert with check (
    curator_id in (select id from curators where user_id = auth.uid() and status = 'active')
    and amount > 0
    and status = 'requested'
  );
-- curators can never update/delete payouts (only admin marks paid)
revoke update, delete on curator_payouts from anon, authenticated;

-- ── HOLE 4: orders must not be insertable from the browser ──
-- Orders are created only by the secure Edge Function (service role).
-- Admins can update orders (for fulfillment tracking and status).
revoke insert, delete on orders from anon, authenticated;
grant select, update on orders to authenticated;

-- ── HOLE 5: products must not be editable by non-admins ──
-- RLS ensures only users with app_metadata role='admin' can write.
-- Table privileges must remain granted to authenticated so RLS can run.
grant select, insert, update, delete on products to authenticated;
grant select on products to anon;

-- ── Make the vote/poll data safe if you add it later ──
-- (placeholder note: any future public-write table needs its own checks)

-- ═══════════════════════════════════════════════════════════════
--  VERIFY: run these to confirm the lockdown
--   select tablename, policyname, cmd from pg_policies where schemaname='public';
--   select * from pg_tables where schemaname='public';
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
--  THE AIM — SITE CONTENT tables (feed reels + Dropping Next poll)
--  RUN THIS ONE. It is safe to run more than once.
--  (Everything uses "if not exists" / "drop ... if exists" so it
--   will never throw the "already exists" error.)
-- ═══════════════════════════════════════════════════════════════

create table if not exists feed_items (
  id         uuid primary key default gen_random_uuid(),
  video      text,
  poster     text,
  name       text not null,
  shop_id    text,
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

create table if not exists upcoming_votes (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid references upcoming_items(id) on delete cascade,
  voter_key  text not null,
  created_at timestamptz not null default now(),
  unique(item_id, voter_key)
);

alter table feed_items     enable row level security;
alter table upcoming_items enable row level security;
alter table upcoming_votes enable row level security;

-- drop first so this file can be re-run safely
drop policy if exists "public reads feed"     on feed_items;
drop policy if exists "admin writes feed"     on feed_items;
drop policy if exists "public reads upcoming" on upcoming_items;
drop policy if exists "admin writes upcoming" on upcoming_items;
drop policy if exists "public reads votes"    on upcoming_votes;
drop policy if exists "public casts vote"     on upcoming_votes;

create policy "public reads feed"     on feed_items     for select using (active = true);
create policy "admin writes feed"     on feed_items     for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public reads upcoming" on upcoming_items for select using (active = true);
create policy "admin writes upcoming" on upcoming_items for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "public reads votes" on upcoming_votes for select using (true);
create policy "public casts vote"  on upcoming_votes for insert with check (true);
revoke update, delete on upcoming_votes from anon, authenticated;

create or replace view upcoming_tally as
  select i.id, i.name, i.category, i.img, i.teaser, i.est_price, i.sort_order,
         (select count(*) from upcoming_votes v where v.item_id = i.id) as vote_count
  from upcoming_items i where i.active = true;

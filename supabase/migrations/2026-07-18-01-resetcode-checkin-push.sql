-- File: supabase/migrations/2026-07-18-01-resetcode-checkin-push.sql
--
-- Dagelijkse check-in (dagboek) + push per klant-link (akkoord Raoul
-- 18 juli, spec 2026-07-18-resetcode-checkin-groeipad-design.md).
--
-- 1. resetcode_checkin: één rij per klant-link per dag. Stemming +
--    optioneel gewicht en maten + vrij zinnetje. De Mentor houdt dit
--    bij als dagboek en gebruikt het voor voortgang en het Groeipad.
-- 2. resetcode_klant_subscriptions: web-push-abonnementen per link
--    (zelfde patroon als mini_eleva_prospect_subscriptions; klant
--    heeft geen account, dus geen user_id maar link_id).

create table if not exists public.resetcode_checkin (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.resetcode_klant_links(id) on delete cascade,
  datum date not null,
  stemming text check (stemming in ('top', 'gaatwel', 'zwaar')),
  gewicht numeric(5,1),
  taille numeric(5,1),
  heup numeric(5,1),
  borst numeric(5,1),
  notitie text,
  created_at timestamptz not null default now(),
  unique (link_id, datum)
);

create index if not exists resetcode_checkin_link_datum_idx
  on public.resetcode_checkin(link_id, datum);

alter table public.resetcode_checkin enable row level security;

drop policy if exists "member leest checkins van eigen klant-links" on public.resetcode_checkin;
create policy "member leest checkins van eigen klant-links" on public.resetcode_checkin
  for select using (
    exists (
      select 1 from public.resetcode_klant_links l
      where l.id = link_id and l.member_id = auth.uid()
    )
  );

create table if not exists public.resetcode_klant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.resetcode_klant_links(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (link_id, endpoint)
);

create index if not exists resetcode_klant_subs_link_idx
  on public.resetcode_klant_subscriptions(link_id) where is_active;

alter table public.resetcode_klant_subscriptions enable row level security;
-- Geen member-policy nodig: alleen de admin-client (server) leest/schrijft.

comment on table public.resetcode_checkin is
  'Dagelijkse check-in / dagboek per klant-link: stemming, gewicht, maten, notitie. Motor voor voortgang en Groeipad.';
comment on table public.resetcode_klant_subscriptions is
  'Web-push-abonnementen per Resetcode-klant-link (klant heeft geen account).';

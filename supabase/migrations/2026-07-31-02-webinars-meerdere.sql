-- ============================================================
-- Van één masterclass naar een BIBLIOTHEEK van webinars.
--
-- Raoul wil er meerdere kunnen plaatsen (mogelijk twintig), elk met
-- een eigen video en eigen teksten, via een plus-knop. Zodra de
-- founder er één op actief zet, verschijnt die bij iedereen in het
-- account met een eigen deel-link per teamlid.
--
-- Nieuw:
--   webinars              de bibliotheek (was: webinar_config, één rij)
--   webinar_member_links  per teamlid per webinar een eigen deel-token
--   webinar_bestellinks   per teamlid per webinar zijn eigen bestellinks
--
-- Bestaande inschrijvingen krijgen een webinar_id en blijven werken.
-- De oude tokens uit freebie_bot_member_tokens (bot_slug 'webinar')
-- worden overgezet, zodat links die al gedeeld zijn blijven werken.
-- ============================================================

create table if not exists webinars (
  id uuid primary key default gen_random_uuid(),
  titel text not null default 'Nieuw webinar',
  ondertitel text not null default 'Een opgenomen webinar. Jij kiest zelf wanneer je kijkt.',
  video_url text,
  duur_minuten integer not null default 45,
  intro_tekst text,
  actie_label text not null default 'Ik wil hier meer over weten',
  actie_uitleg text,
  -- Uitleg boven de bestellinks op de kijkpagina, per webinar.
  bestellink_uitleg text,
  actief boolean not null default false,
  volgorde integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists webinar_member_links (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references webinars(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  unique (webinar_id, member_id)
);

create index if not exists webinar_member_links_token_idx
  on webinar_member_links (token);

create table if not exists webinar_bestellinks (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references webinars(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  url text not null,
  volgorde integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists webinar_bestellinks_member_idx
  on webinar_bestellinks (member_id, webinar_id, volgorde);

alter table webinar_inschrijvingen
  add column if not exists webinar_id uuid references webinars(id) on delete cascade;

-- De bestaande masterclass (skincare) overzetten naar de bibliotheek.
insert into webinars (
  id, titel, ondertitel, video_url, duur_minuten, intro_tekst,
  actie_label, actie_uitleg, actief, volgorde
)
select
  '00000000-0000-4000-8000-000000000001'::uuid,
  c.titel, c.ondertitel, c.video_url, c.duur_minuten, c.intro_tekst,
  c.actie_label, c.actie_uitleg, coalesce(c.actief, true), 0
from webinar_config c
where c.id = 'standaard'
on conflict (id) do nothing;

-- Inschrijvingen van vóór deze migratie hangen aan dat eerste webinar.
update webinar_inschrijvingen
   set webinar_id = '00000000-0000-4000-8000-000000000001'::uuid
 where webinar_id is null;

-- Al gedeelde links blijven werken: de oude member-tokens overzetten.
insert into webinar_member_links (webinar_id, member_id, token)
select
  '00000000-0000-4000-8000-000000000001'::uuid,
  t.member_id,
  t.token
from freebie_bot_member_tokens t
where t.bot_slug = 'webinar'
  and exists (select 1 from webinars w where w.id = '00000000-0000-4000-8000-000000000001'::uuid)
on conflict do nothing;

alter table webinars enable row level security;
alter table webinar_member_links enable row level security;
alter table webinar_bestellinks enable row level security;

-- Webinars zijn publieke content (de aanmeldpagina staat open voor
-- bezoekers zonder account, standing rule RLS publieke content).
drop policy if exists "webinars lezen" on webinars;
create policy "webinars lezen"
  on webinars for select
  to anon, authenticated
  using (true);

-- Eigen deel-links en eigen bestellinks: alleen van jezelf.
drop policy if exists "eigen webinar-links lezen" on webinar_member_links;
create policy "eigen webinar-links lezen"
  on webinar_member_links for select
  to authenticated
  using (auth.uid() = member_id);

drop policy if exists "eigen webinar-bestellinks lezen" on webinar_bestellinks;
create policy "eigen webinar-bestellinks lezen"
  on webinar_bestellinks for select
  to authenticated
  using (auth.uid() = member_id);

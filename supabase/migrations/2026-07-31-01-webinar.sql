-- ============================================================
-- Webinar-systeem: evergreen masterclass per member.
--
-- Eerlijke variant (afspraak Raoul): het is een OPGENOMEN
-- masterclass en dat zeggen we ook. De bezoeker kiest zelf een
-- moment dat hem uitkomt; wij doen niet alsof er live iemand zit.
--
-- Twee tabellen:
--   webinar_config        één rij, door de founder beheerd (video,
--                         teksten, duur, actie-knop)
--   webinar_inschrijvingen  elke aanmelding, gekoppeld aan de member
--                         via wiens link iemand binnenkwam, plus de
--                         prospect-kaart die eruit voortkomt
-- ============================================================

create table if not exists webinar_config (
  id text primary key default 'standaard',
  titel text not null default 'Masterclass: meer tijd en vrijheid',
  ondertitel text not null default 'Een opgenomen masterclass van ongeveer 45 minuten. Jij kiest wanneer je kijkt.',
  video_url text,
  duur_minuten integer not null default 45,
  intro_tekst text,
  actie_label text not null default 'Ik wil hier meer over weten',
  actie_uitleg text,
  actief boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into webinar_config (id) values ('standaard')
  on conflict (id) do nothing;

create table if not exists webinar_inschrijvingen (
  id uuid primary key default gen_random_uuid(),
  -- Via wiens link kwam deze persoon binnen?
  member_id uuid not null references profiles(id) on delete cascade,
  -- De prospect-kaart in de namenlijst van die member.
  prospect_id uuid references prospects(id) on delete set null,
  token text not null unique,
  naam text not null,
  email text not null,
  telefoon text,
  -- Het zelfgekozen kijkmoment.
  slot_start timestamptz not null,
  -- ingeschreven → gekeken (opende de kijkpagina) → actie (klikte de
  -- actie-knop). no_show wordt niet apart opgeslagen: dat is gewoon
  -- "ingeschreven" terwijl het slot voorbij is.
  status text not null default 'ingeschreven'
    check (status in ('ingeschreven', 'gekeken', 'actie')),
  gekeken_op timestamptz,
  actie_op timestamptz,
  -- Welke mails zijn al de deur uit (voorkomt dubbel sturen).
  mail_bevestiging_op timestamptz,
  mail_herinnering_op timestamptz,
  mail_kijklink_op timestamptz,
  mail_terugkijk_op timestamptz,
  mail_actie_op timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists webinar_inschrijvingen_member_idx
  on webinar_inschrijvingen (member_id, created_at desc);
create index if not exists webinar_inschrijvingen_slot_idx
  on webinar_inschrijvingen (slot_start);
create index if not exists webinar_inschrijvingen_token_idx
  on webinar_inschrijvingen (token);

alter table webinar_config enable row level security;
alter table webinar_inschrijvingen enable row level security;

-- Config is publieke content: de inschrijfpagina staat open voor
-- bezoekers zonder account (zelfde principe als de freebie-pagina's,
-- standing rule "RLS publieke content").
drop policy if exists "webinar-config lezen" on webinar_config;
create policy "webinar-config lezen"
  on webinar_config for select
  to anon, authenticated
  using (true);

-- Een member ziet zijn eigen inschrijvingen. Schrijven gebeurt
-- uitsluitend server-side via de service-role.
drop policy if exists "eigen webinar-inschrijvingen lezen" on webinar_inschrijvingen;
create policy "eigen webinar-inschrijvingen lezen"
  on webinar_inschrijvingen for select
  to authenticated
  using (auth.uid() = member_id);

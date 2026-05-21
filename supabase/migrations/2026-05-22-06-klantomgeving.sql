-- File: supabase/migrations/2026-05-22-06-klantomgeving.sql
--
-- Klantomgeving als parallel pad. Klanten krijgen eigen ELEVA-omgeving,
-- gekoppeld aan member. Vijf pulsmomenten worden door ELEVA aangejaagd.

create table if not exists public.klantomgeving_klanten (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  klant_naam text not null,
  klant_email text not null,
  bestel_datum date,
  start_datum date,
  bron text not null default 'handmatig' check (bron in ('automatisch', 'handmatig', 'uitnodig-mail', 'freebie-opt-in')),
  freebie_opt_in_id uuid references public.freebie_opt_ins(id) on delete set null,
  status text not null default 'actief' check (status in ('actief', 'stil', 'klant', 'webshophouder', 'gesloten')),
  laatste_activiteit timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists klantomgeving_klanten_member_idx
  on public.klantomgeving_klanten(member_id, status);

alter table public.klantomgeving_klanten enable row level security;

create policy "member sees own klanten" on public.klantomgeving_klanten
  for select using (auth.uid() = member_id);

create policy "member writes own klanten" on public.klantomgeving_klanten
  for all using (auth.uid() = member_id);

create table if not exists public.klantomgeving_pulses (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klantomgeving_klanten(id) on delete cascade,
  pulse_nummer integer not null check (pulse_nummer between 1 and 5),
  gepland_op date not null,
  uitgevoerd_op timestamptz,
  member_seintje_gestuurd_op timestamptz,
  member_actie_op timestamptz,
  inhoud_samenvatting text,
  created_at timestamptz not null default now()
);

create index if not exists klantomgeving_pulses_klant_idx
  on public.klantomgeving_pulses(klant_id, pulse_nummer);

create index if not exists klantomgeving_pulses_gepland_idx
  on public.klantomgeving_pulses(gepland_op) where uitgevoerd_op is null;

alter table public.klantomgeving_pulses enable row level security;

create policy "member sees pulses for own klanten" on public.klantomgeving_pulses
  for select using (
    exists (
      select 1 from public.klantomgeving_klanten k
      where k.id = klant_id and k.member_id = auth.uid()
    )
  );

create policy "member updates pulses for own klanten" on public.klantomgeving_pulses
  for update using (
    exists (
      select 1 from public.klantomgeving_klanten k
      where k.id = klant_id and k.member_id = auth.uid()
    )
  );

comment on table public.klantomgeving_klanten is 'Klanten in eigen klantomgeving, gekoppeld aan member. AVG Keuze A geaggregeerde signalen.';
comment on table public.klantomgeving_pulses is 'Vijf tijdlijn-pulsmomenten per klant, door ELEVA aangejaagd. K4-anti-overwhelm.';

-- File: supabase/migrations/2026-07-13-01-resetcode-kcal-log.sql
--
-- Calorie-logboek voor de laaddagen (akkoord Raoul 13 juli, route 1):
-- de Mentor telt mee in plaats van de FatSecret-app. Elke gemelde
-- maaltijd/snack wordt een rij; het dagtotaal drijft de teller in de
-- klantomgeving. Alleen relevant op de laaddagen (3500-5000 kcal).

create table if not exists public.resetcode_kcal_log (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.resetcode_klant_links(id) on delete cascade,
  datum date not null,
  omschrijving text not null,
  kcal integer not null,
  created_at timestamptz not null default now()
);

create index if not exists resetcode_kcal_log_link_datum_idx
  on public.resetcode_kcal_log(link_id, datum);

alter table public.resetcode_kcal_log enable row level security;

drop policy if exists "member leest kcal van eigen klant-links" on public.resetcode_kcal_log;
create policy "member leest kcal van eigen klant-links" on public.resetcode_kcal_log
  for select using (
    exists (
      select 1 from public.resetcode_klant_links l
      where l.id = link_id and l.member_id = auth.uid()
    )
  );

comment on table public.resetcode_kcal_log is
  'Laaddagen-calorieteller: door de Mentor geschatte kcal per gemelde maaltijd, per klant-link per dag.';

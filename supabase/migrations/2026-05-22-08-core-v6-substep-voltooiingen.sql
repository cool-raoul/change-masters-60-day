-- File: supabase/migrations/2026-05-22-08-core-v6-substep-voltooiingen.sql
--
-- Tabel die per user per ankerstap bijhoudt welke substappen (taken)
-- zijn afgevinkt. Equivalent van Sprint's dag_voltooiingen maar dan
-- voor Core V6.
--
-- Een rij = één voltooide substep door één user.
-- Primary key: (user_id, ankerstap_nummer, taak_id).

create table if not exists public.core_v6_substep_voltooiingen (
  user_id uuid not null references auth.users(id) on delete cascade,
  ankerstap_nummer integer not null check (ankerstap_nummer between 1 and 21),
  taak_id text not null,
  voltooid_op timestamptz not null default now(),
  primary key (user_id, ankerstap_nummer, taak_id)
);

create index if not exists core_v6_substep_voltooiingen_user_ankerstap_idx
  on public.core_v6_substep_voltooiingen(user_id, ankerstap_nummer);

alter table public.core_v6_substep_voltooiingen enable row level security;

create policy "user sees own substep voltooiingen" on public.core_v6_substep_voltooiingen
  for select using (auth.uid() = user_id);

create policy "user writes own substep voltooiingen" on public.core_v6_substep_voltooiingen
  for insert with check (auth.uid() = user_id);

create policy "user deletes own substep voltooiingen" on public.core_v6_substep_voltooiingen
  for delete using (auth.uid() = user_id);

comment on table public.core_v6_substep_voltooiingen is
  'Voortgang per substep per ankerstap voor Core V6. Equivalent van dag_voltooiingen voor Sprint.';

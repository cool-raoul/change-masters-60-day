-- File: supabase/migrations/2026-05-22-03-standaardvragen.sql
--
-- Founder-onderhouden vragen-bibliotheek voor Laag 1 van de drie-laags
-- Mentor-architectuur. Geen AI, vooraf-geredigeerde antwoorden in
-- Raoul-en-Gaby-stem. Drukt token-kosten dramatisch + waarborgt stem.

create table if not exists public.standaardvragen (
  id uuid primary key default gen_random_uuid(),
  vraag_patroon text not null,
  trefwoorden text[] not null default '{}',
  antwoord text not null,
  categorie text not null check (categorie in ('bezwaar', 'product', 'business', 'praktisch', 'persoonlijk')),
  modus text[] not null default array['sprint','core','pro'],
  actief boolean not null default true,
  gemaakt_door uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists standaardvragen_trefwoorden_idx
  on public.standaardvragen using gin(trefwoorden);

create index if not exists standaardvragen_actief_idx
  on public.standaardvragen(actief) where actief = true;

alter table public.standaardvragen enable row level security;

-- Iedereen kan lezen (members consumeren de antwoorden).
create policy "anyone reads active standaardvragen" on public.standaardvragen
  for select using (actief = true);

-- Alleen founders schrijven (rolcheck via profiles.role).
create policy "founders write standaardvragen" on public.standaardvragen
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'founder')
  );

comment on table public.standaardvragen is
  'Laag 1 van drie-laags Mentor-architectuur. Founder-onderhouden vragen-antwoorden in ELEVA-stem.';

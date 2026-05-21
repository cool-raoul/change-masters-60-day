-- File: supabase/migrations/2026-05-22-02-mentor-profielen.sql
--
-- Rijke Mentor-profielrecord per Core-volger. Eén JSON-blob in `data`
-- met getypeerde keys (snelle leesperformance, lage migratie-kost).
-- Lezen via lib/mentor-profiel/helpers.ts.

create table if not exists public.mentor_profielen (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentor_profielen_updated_at_idx
  on public.mentor_profielen(updated_at desc);

alter table public.mentor_profielen enable row level security;

create policy "user sees own mentor_profiel" on public.mentor_profielen
  for select using (auth.uid() = user_id);

create policy "user writes own mentor_profiel" on public.mentor_profielen
  for insert with check (auth.uid() = user_id);

create policy "user updates own mentor_profiel" on public.mentor_profielen
  for update using (auth.uid() = user_id);

comment on table public.mentor_profielen is
  'Rijke Mentor-profielrecord per Core-volger. WHY, situatie, FORM, drie verhalen, niche, ideale klant, talent, doel.';

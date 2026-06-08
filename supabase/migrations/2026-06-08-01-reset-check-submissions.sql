-- File: supabase/migrations/2026-06-08-01-reset-check-submissions.sql
--
-- Holistic Reset persoonlijke check, inzendingen vanuit de publieke
-- /reset-check pagina. Bewaard kort (max 30 dagen) zodat Raoul/Gaby
-- de gesprekken kunnen voorbereiden. Heat-score wordt server-side
-- berekend en opgeslagen, zodat we leads kunnen sorteren op prio.

create table if not exists public.reset_check_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Identificatie van de lead
  voornaam text not null,
  achternaam text,
  email text not null,
  telefoon text,
  instagram text,
  facebook text,

  -- De volledige antwoorden + profiel + medisch + vrij-veld
  antwoorden jsonb not null,

  -- Server-side berekend voor sortering
  heat_score numeric(3,1),
  heat_categorie text check (heat_categorie in ('heet', 'lauw', 'koel', 'koud')),

  -- Opvolg-status (voor Raoul/Gaby)
  status text not null default 'nieuw',
  notitie text,
  contact_opgenomen_at timestamptz,

  -- Auto-delete na 30 dagen tenzij contact_opgenomen_at gevuld
  delete_after timestamptz not null default (now() + interval '30 days')
);

create index if not exists reset_check_submissions_heat_idx
  on public.reset_check_submissions(heat_score desc, created_at desc);

create index if not exists reset_check_submissions_status_idx
  on public.reset_check_submissions(status, created_at desc);

create index if not exists reset_check_submissions_delete_idx
  on public.reset_check_submissions(delete_after);

alter table public.reset_check_submissions enable row level security;

-- Alleen founders lezen de inzendingen
create policy "founders read submissions" on public.reset_check_submissions
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'founder'
    )
  );

-- Alleen founders updaten status/notitie/contact-opgenomen
create policy "founders update submissions" on public.reset_check_submissions
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'founder'
    )
  );

-- Publiek mag inserten via de API route (route gebruikt anon key + RLS bypass).
-- Met expliciete insert-policy zonder restrictie voor anon-rol kunnen submits.
create policy "public can submit" on public.reset_check_submissions
  for insert with check (true);

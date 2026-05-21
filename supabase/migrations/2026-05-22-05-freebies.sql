-- File: supabase/migrations/2026-05-22-05-freebies.sql
--
-- Founder-toolkit voor freebies + opt-in-leads.
-- Tabel freebies: kant-en-klare templates (pdf, mailreeks, film, test).
-- Tabel freebie_opt_ins: leads die zich via een member's freebie aanmeldden.

create table if not exists public.freebies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titel text not null,
  ondertitel text,
  vorm text not null check (vorm in ('pdf', 'mailreeks', 'film', 'test', 'gids')),
  onderwerp text not null,
  beschrijving text not null,
  inhoud_template text,
  duur_minuten integer,
  gemaakt_door uuid references auth.users(id),
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists freebies_actief_idx on public.freebies(actief) where actief = true;

alter table public.freebies enable row level security;

create policy "anyone reads active freebies" on public.freebies
  for select using (actief = true);

create policy "founders write freebies" on public.freebies
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'founder')
  );

create table if not exists public.freebie_opt_ins (
  id uuid primary key default gen_random_uuid(),
  freebie_id uuid not null references public.freebies(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  lead_naam text,
  lead_email text not null,
  bron_kanaal text,
  status text not null default 'nieuw' check (status in ('nieuw', 'mini-eleva', 'klant', 'gesloten')),
  created_at timestamptz not null default now(),
  laatste_activiteit timestamptz not null default now()
);

create index if not exists freebie_opt_ins_member_idx
  on public.freebie_opt_ins(member_id, status);

create index if not exists freebie_opt_ins_freebie_idx
  on public.freebie_opt_ins(freebie_id);

alter table public.freebie_opt_ins enable row level security;

create policy "member sees own opt-ins" on public.freebie_opt_ins
  for select using (auth.uid() = member_id);

create policy "member writes own opt-ins" on public.freebie_opt_ins
  for insert with check (auth.uid() = member_id);

create policy "member updates own opt-ins" on public.freebie_opt_ins
  for update using (auth.uid() = member_id);

comment on table public.freebies is 'Founder-toolkit van freebies. Members kiezen er een, hij wordt gepersonaliseerd.';
comment on table public.freebie_opt_ins is 'Leads die zich via een member-freebie aanmeldden. Bron-tag in bron_kanaal.';

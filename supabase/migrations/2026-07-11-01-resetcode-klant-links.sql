-- File: supabase/migrations/2026-07-11-01-resetcode-klant-links.sql
--
-- Koppel-ronde Resetcode-klantomgeving (akkoord Raoul 11 juli 2026,
-- spec docs/superpowers/specs/2026-07-10-resetcode-klantomgeving-design.md).
--
-- 1. resetcode_klant_links: persoonlijke token-links voor klanten
--    (patroon prospect_invitations / mini-ELEVA). Klant heeft GEEN
--    account; auth = token in URL, server-side gevalideerd via de
--    admin-client. Houdt programma + huidige stap bij zodat de
--    Mentor verdergaat waar de klant was.
-- 2. resetcode_chats: het gesprek met de Mentor per link, zodat het
--    geheugen meereist over apparaten heen. Kaart-berichten worden
--    als soort+kaart opgeslagen (inhoud komt uit code, niet uit DB).
--
-- Bewaartermijn: klantbegeleiding loopt maanden; chats worden NIET
-- automatisch na 30 dagen gewist (anders dan mini-ELEVA-prospects).
-- Bij het sluiten van een link (status 'gesloten') ruimt de app de
-- chats op.

create table if not exists public.resetcode_klant_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  member_id uuid not null references auth.users(id) on delete cascade,
  klant_id uuid references public.klantomgeving_klanten(id) on delete set null,
  prospect_id uuid references public.prospects(id) on delete set null,
  klant_naam text not null,
  programma text not null default 'producten'
    check (programma in ('darm', 'reset', 'producten')),
  station_slug text,
  status text not null default 'actief'
    check (status in ('actief', 'gepauzeerd', 'gesloten')),
  laatste_activiteit timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists resetcode_klant_links_member_idx
  on public.resetcode_klant_links(member_id, status);
create index if not exists resetcode_klant_links_token_idx
  on public.resetcode_klant_links(token);

alter table public.resetcode_klant_links enable row level security;

drop policy if exists "member beheert eigen klant-links" on public.resetcode_klant_links;
create policy "member beheert eigen klant-links" on public.resetcode_klant_links
  for all using (auth.uid() = member_id);

create table if not exists public.resetcode_chats (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.resetcode_klant_links(id) on delete cascade,
  van text not null check (van in ('klant', 'mentor')),
  soort text not null default 'tekst'
    check (soort in ('tekst', 'kaart', 'foto')),
  kaart text,
  station_slug text,
  tekst text,
  created_at timestamptz not null default now()
);

create index if not exists resetcode_chats_link_idx
  on public.resetcode_chats(link_id, created_at);

alter table public.resetcode_chats enable row level security;

drop policy if exists "member leest chats van eigen klant-links" on public.resetcode_chats;
create policy "member leest chats van eigen klant-links" on public.resetcode_chats
  for select using (
    exists (
      select 1 from public.resetcode_klant_links l
      where l.id = link_id and l.member_id = auth.uid()
    )
  );

comment on table public.resetcode_klant_links is
  'Persoonlijke token-links voor Resetcode-klanten (darm/reset/producten). Token-auth, geen account.';
comment on table public.resetcode_chats is
  'Mentor-gesprek per klant-link; geheugen reist mee over apparaten. Foto-inhoud wordt niet opgeslagen, alleen een tekst-spoor.';

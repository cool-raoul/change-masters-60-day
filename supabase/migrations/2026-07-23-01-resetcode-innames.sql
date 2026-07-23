-- File: supabase/migrations/2026-07-23-01-resetcode-innames.sql
--
-- Afvink-vinkjes voor het dagelijkse innameschema (Darmen in Balans).
-- Puur voor de klant zelf (digitale versie van het geprinte formulier);
-- geen sponsor-zicht, geen inhoud, alleen link + datum + moment.
-- Toegang uitsluitend via de token-API (service-role), zelfde
-- privacy-schild als de check-ins.

create table if not exists resetcode_innames (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references resetcode_klant_links(id) on delete cascade,
  datum date not null,
  moment text not null check (moment in ('nuchter','ochtend','lunch','avond','slapen')),
  created_at timestamptz not null default now(),
  unique (link_id, datum, moment)
);

alter table resetcode_innames enable row level security;

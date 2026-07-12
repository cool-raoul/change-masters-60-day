-- File: supabase/migrations/2026-07-12-01-resetcode-touchpoints.sql
--
-- Business-touchpoints met geheugen (Raoul 12 juli):
-- 1. touchpoints: welke business-verhalen deze klant al kreeg, zodat
--    iemand die meerdere programma's doet (darm → reset → basis) niet
--    twee keer hetzelfde verhaal krijgt. Wordt over alle links van
--    dezelfde prospect samengevoegd bij het laden.
-- 2. is_bouwer: deze persoon bouwt al mee aan de business (member of
--    ongeschreven bouwer); dan blijven ALLE webshop-verhalen uit en is
--    de Mentor puur programma-coach.
-- 3. station_sinds: wanneer de klant aan de huidige stap begon; nodig
--    voor tijd-gebonden momenten zoals het kern-verhaal rond dag 7.

alter table public.resetcode_klant_links
  add column if not exists touchpoints jsonb not null default '[]'::jsonb;
alter table public.resetcode_klant_links
  add column if not exists is_bouwer boolean not null default false;
alter table public.resetcode_klant_links
  add column if not exists station_sinds timestamptz;

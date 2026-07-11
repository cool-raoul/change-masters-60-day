-- File: supabase/migrations/2026-07-11-02-freebie-optin-prospect-koppeling.sql
--
-- Fix (Raoul 11 juli): het Freebie-uitslag-blok op de klantenkaart matchte
-- op e-mailadres, waardoor oude invullingen van verwijderde kaarten met
-- hetzelfde (test)adres meeliftten en de datum van een hergebruikte rij
-- misleidend oud was.
--
-- 1. prospect_id: harde koppeling opt-in ↔ kaart. Bij verwijderen van de
--    kaart wordt de koppeling geleegd (set null), zodat de uitslag nooit
--    op een andere kaart opduikt.
-- 2. bijgewerkt_op: wanneer de vragenlijst voor het laatst is ingevuld
--    (her-invullingen hergebruiken de rij, created_at bleef dan oud).

alter table public.freebie_opt_ins
  add column if not exists prospect_id uuid references public.prospects(id) on delete set null;
alter table public.freebie_opt_ins
  add column if not exists bijgewerkt_op timestamptz not null default now();

create index if not exists freebie_opt_ins_prospect_idx
  on public.freebie_opt_ins(prospect_id);

-- Backfill: koppel bestaande opt-ins aan de kaart van dezelfde member met
-- hetzelfde e-mailadres. Opt-ins van inmiddels verwijderde kaarten blijven
-- bewust NULL (en verschijnen dus nergens meer).
update public.freebie_opt_ins f
set prospect_id = p.id
from public.prospects p
where f.prospect_id is null
  and p.user_id = f.member_id
  and lower(p.email) = lower(f.lead_email)
  and p.gearchiveerd = false;

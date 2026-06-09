-- File: supabase/migrations/2026-06-09-01-drop-reset-check-submissions.sql
--
-- De eigen reset_check_submissions tabel was een verkeerde architectuur-
-- keuze. De Holistic Reset-check hoort in de bestaande pijplijn via
-- freebie_opt_ins + freebie_bot_member_tokens, zoals de andere score-bots.
-- Leads komen nu automatisch in de namenlijst van de member die de link
-- gedeeld heeft, met heat-score in het spiegel_tekst-veld zichtbaar.

drop table if exists public.reset_check_submissions cascade;

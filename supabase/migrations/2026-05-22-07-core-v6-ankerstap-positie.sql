-- File: supabase/migrations/2026-05-22-07-core-v6-ankerstap-positie.sql
--
-- Kolom voor Core V6 ankerstap-progressie per user. Default 1 (= net begonnen).
-- Loopt op naar 21 (laatste ankerstap). Wordt verhoogd via POST naar
-- /api/core-v6/voltooi-ankerstap.

alter table public.profiles
  add column if not exists core_v6_ankerstap integer not null default 1;

comment on column public.profiles.core_v6_ankerstap is
  'Huidige Core V6 ankerstap (1..21). Default 1. Wordt verhoogd via voltooi-ankerstap-endpoint.';

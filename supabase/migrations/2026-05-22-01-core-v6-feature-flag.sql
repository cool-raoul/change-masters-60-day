-- File: supabase/migrations/2026-05-22-01-core-v6-feature-flag.sql
--
-- Voegt feature-flag toe waarmee per-user Core V6 kan worden geactiveerd.
-- Default false zodat bestaande gebruikers de huidige Core-flow blijven zien.
--
-- Hoe te draaien: open Supabase SQL Editor, plak dit script, run.

alter table public.profiles
  add column if not exists core_v6_actief boolean not null default false;

comment on column public.profiles.core_v6_actief is
  'Wanneer true, gebruiker ziet Core V6 routes (21 ankerstappen + klantomgeving + freebies). Default false.';

-- RLS: bestaande policies dekken deze kolom al (profiles is per-user accessible).
-- Geen extra policy nodig.

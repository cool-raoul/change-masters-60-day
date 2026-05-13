-- ============================================================
-- pipeline_in_gesprek_fase.sql
--
-- Voegt een nieuwe pipeline-fase 'in_gesprek' toe aan de
-- prospects-tabel, tussen 'prospect' en 'uitgenodigd'.
--
-- Concept (afspraak met Raoul, 2026-05-13):
--   prospect      = contact op je lijst, nog geen contact gehad
--   in_gesprek    = NIEUW. Je bent in gesprek (WhatsApp/DM/bel) met
--                   het contact, maar nog niet uitgenodigd voor een
--                   presentatie of one-pager. Belangrijke tussenstap
--                   want het 'in gesprek vervolgen' is iets anders
--                   dan 'opvolgen na presentatie'.
--   uitgenodigd   = uitgenodigd voor presentatie of one-pager
--   ...
--
-- Wat deze migratie doet:
--   1. Drop de bestaande CHECK constraint op prospects.pipeline_fase
--   2. Maak een nieuwe CHECK constraint die OOK 'in_gesprek' accepteert
--   3. Doe hetzelfde voor contact_logs.fase_voor en .fase_na
--      (die accepteren PipelineFase-waardes voor logging van
--      transities)
--
-- Geen data-migratie nodig: bestaande prospects houden hun huidige
-- fase, members kunnen vrijwillig switchen naar 'in_gesprek' als ze
-- met iemand in gesprek raken die nog niet uitgenodigd is.
-- ============================================================

-- Let op: in Postgres heet de CHECK constraint vaak iets als
-- 'prospects_pipeline_fase_check'. We droppen 'm met IF EXISTS en
-- definieren 'm opnieuw. Dezelfde voor contact_logs.

-- ---------- 1. prospects.pipeline_fase ----------
ALTER TABLE prospects
  DROP CONSTRAINT IF EXISTS prospects_pipeline_fase_check;

ALTER TABLE prospects
  ADD CONSTRAINT prospects_pipeline_fase_check
  CHECK (pipeline_fase IN (
    'prospect',
    'in_gesprek',
    'uitgenodigd',
    'one_pager',
    'presentatie',
    'followup',
    'not_yet',
    'shopper',
    'member'
  ));

-- ---------- 2. contact_logs.fase_voor + .fase_na ----------
-- contact_logs.fase_voor en .fase_na zijn nullable (oude logs hebben
-- geen fase). De CHECK accepteert alle PipelineFase-waardes + NULL.

ALTER TABLE contact_logs
  DROP CONSTRAINT IF EXISTS contact_logs_fase_voor_check;

ALTER TABLE contact_logs
  ADD CONSTRAINT contact_logs_fase_voor_check
  CHECK (fase_voor IS NULL OR fase_voor IN (
    'prospect',
    'in_gesprek',
    'uitgenodigd',
    'one_pager',
    'presentatie',
    'followup',
    'not_yet',
    'shopper',
    'member'
  ));

ALTER TABLE contact_logs
  DROP CONSTRAINT IF EXISTS contact_logs_fase_na_check;

ALTER TABLE contact_logs
  ADD CONSTRAINT contact_logs_fase_na_check
  CHECK (fase_na IS NULL OR fase_na IN (
    'prospect',
    'in_gesprek',
    'uitgenodigd',
    'one_pager',
    'presentatie',
    'followup',
    'not_yet',
    'shopper',
    'member'
  ));

-- ---------- 3. scripts.pipeline_fase ----------
-- scripts-tabel heeft ook een pipeline_fase (welke fase past dit
-- script bij). Kan ook 'in_gesprek' worden in de toekomst.

ALTER TABLE scripts
  DROP CONSTRAINT IF EXISTS scripts_pipeline_fase_check;

ALTER TABLE scripts
  ADD CONSTRAINT scripts_pipeline_fase_check
  CHECK (pipeline_fase IS NULL OR pipeline_fase IN (
    'prospect',
    'in_gesprek',
    'uitgenodigd',
    'one_pager',
    'presentatie',
    'followup',
    'not_yet',
    'shopper',
    'member'
  ));

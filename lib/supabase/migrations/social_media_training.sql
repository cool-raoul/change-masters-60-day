-- ============================================================
-- ELEVA Academy, multi-training infrastructure
--
-- Concept (afspraak met Raoul, 2026-05-13):
--   ELEVA Academy = overkoepelende in-app leeromgeving.
--   Eerste training daarbinnen = 'Social Media Strategie'
--   (op basis van Frazer Brookes-principes, 14 modules / 42 lessen).
--   Later komen meer trainingen in (leiderschap, mindset, productkennis,
--   sales-vaardigheden, etc.).
--
-- DB-design-keuze:
--   - GEEN module/les-tabellen in DB. Content staat in code
--     (lib/academy/<training-slug>-content.ts) zodat we 'm via Git
--     versioneren EN de Mentor er bij kan.
--   - Alleen VOORTGANG per user staat in DB.
--   - 'training_slug' identificeert de specifieke training binnen
--     de Academy ("social-media", "leiderschap", etc.).
--   - 'les_sleutel' identificeert een les binnen die training,
--     format "<module>.<les>" als string voor robuustheid
--     (bv. "1.2", "4.3", "13.1").
-- ============================================================

-- ---------- training_voortgang ----------
CREATE TABLE IF NOT EXISTS training_voortgang (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Welke training binnen de Academy. Stabiele slug uit de code.
  -- Eerste training: 'social-media'. Latere trainingen krijgen
  -- hun eigen slug ('leiderschap', 'mindset', etc.).
  training_slug text NOT NULL,
  -- Les-sleutel binnen die training, bv. "1.2", "4.3", "13.1".
  -- Format: "<module>.<les>" als string. Geen integer-pair
  -- omdat re-nummering later geen DB-migratie moet veroorzaken.
  les_sleutel   text NOT NULL,
  voltooid_op   timestamptz NOT NULL DEFAULT now(),
  -- Optionele user-notitie ('mijn take-away van deze les').
  -- Mogelijk in v2 een veld onder elke les in de UI.
  notitie       text,
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Eén voltooiing per user per training per les. Bij re-trigger
  -- doen we UPSERT vanuit de app, niet duplicate inserts.
  UNIQUE (user_id, training_slug, les_sleutel)
);

CREATE INDEX IF NOT EXISTS training_voortgang_user_idx
  ON training_voortgang (user_id);

CREATE INDEX IF NOT EXISTS training_voortgang_user_training_idx
  ON training_voortgang (user_id, training_slug);

-- ---------- RLS ----------
ALTER TABLE training_voortgang ENABLE ROW LEVEL SECURITY;

-- Een user leest + schrijft alleen z'n eigen voortgang. Sponsor-zicht
-- (later) komt via een aparte view-policy, niet hier.

DROP POLICY IF EXISTS training_voortgang_select_own ON training_voortgang;
CREATE POLICY training_voortgang_select_own
  ON training_voortgang
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS training_voortgang_insert_own ON training_voortgang;
CREATE POLICY training_voortgang_insert_own
  ON training_voortgang
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS training_voortgang_update_own ON training_voortgang;
CREATE POLICY training_voortgang_update_own
  ON training_voortgang
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS training_voortgang_delete_own ON training_voortgang;
CREATE POLICY training_voortgang_delete_own
  ON training_voortgang
  FOR DELETE
  USING (auth.uid() = user_id);

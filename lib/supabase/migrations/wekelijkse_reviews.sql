-- ============================================================
-- wekelijkse_reviews, member-reflecties op week 1, 2, 3 (en optioneel
-- elke zondag in het weekritme dag 22-60).
--
-- Drie vragen: wat ging goed, wat liep niet soepel, waar focus ik
-- volgende week op? Plus expliciete keuze of de review met de sponsor
-- gedeeld mag worden.
--
-- RLS:
-- - Member ziet alleen eigen reviews
-- - Sponsor ziet reviews van team-leden alleen als gedeeld_met_sponsor=true
-- ============================================================

CREATE TABLE IF NOT EXISTS wekelijkse_reviews (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  /** Week-nummer in de run (1, 2, 3 voor Sprint dag 7/14/21).
      Voor weekritme dag 22-60: doorgaande nummering 4, 5, 6, ... */
  week_nummer              INTEGER NOT NULL CHECK (week_nummer >= 1),
  /** Datum waarop de review is ingevuld. */
  ingevuld_op              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  /** Antwoord op vraag 1: wat ging goed deze week. */
  ging_goed                TEXT,
  /** Antwoord op vraag 2: wat liep niet soepel. */
  niet_soepel              TEXT,
  /** Antwoord op vraag 3: waar focus ik volgende week op. */
  focus_volgende_week      TEXT,
  /** Expliciete keuze van de member: mag sponsor deze review zien? */
  gedeeld_met_sponsor      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wekelijkse_reviews_user_id_idx
  ON wekelijkse_reviews(user_id);

CREATE INDEX IF NOT EXISTS wekelijkse_reviews_week_idx
  ON wekelijkse_reviews(user_id, week_nummer);

ALTER TABLE wekelijkse_reviews ENABLE ROW LEVEL SECURITY;

-- Member mag eigen reviews lezen
DROP POLICY IF EXISTS "wekelijkse_reviews_select_eigen" ON wekelijkse_reviews;
CREATE POLICY "wekelijkse_reviews_select_eigen" ON wekelijkse_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Member mag eigen reviews invullen
DROP POLICY IF EXISTS "wekelijkse_reviews_insert_eigen" ON wekelijkse_reviews;
CREATE POLICY "wekelijkse_reviews_insert_eigen" ON wekelijkse_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Member mag eigen reviews bijwerken (bv. share-keuze veranderen)
DROP POLICY IF EXISTS "wekelijkse_reviews_update_eigen" ON wekelijkse_reviews;
CREATE POLICY "wekelijkse_reviews_update_eigen" ON wekelijkse_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sponsor mag reviews lezen van zijn team-leden alleen als gedeeld
DROP POLICY IF EXISTS "wekelijkse_reviews_select_sponsor" ON wekelijkse_reviews;
CREATE POLICY "wekelijkse_reviews_select_sponsor" ON wekelijkse_reviews
  FOR SELECT
  USING (
    gedeeld_met_sponsor = TRUE
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = wekelijkse_reviews.user_id
      AND p.sponsor_id = auth.uid()
    )
  );

COMMENT ON TABLE wekelijkse_reviews IS
  'Wekelijkse reflectie van member op vorige week. Drie vragen plus expliciete sponsor-deel-keuze. RLS: member ziet eigen, sponsor ziet alleen gedeelde van team.';

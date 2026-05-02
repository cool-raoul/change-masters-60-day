-- ============================================================
-- coach_voorbeelden, train-de-Mentor on-the-job.
--
-- Founders kunnen hun eigen vraag-antwoord-voorbeelden toevoegen.
-- De ELEVA Mentor pakt bij elke vraag de top relevante voorbeelden
-- uit deze tabel en plakt ze als few-shot context in de system-prompt.
-- Resultaat: Mentor leert de toon en aanpak van de founders zonder
-- dat we het model hoeven te fine-tunen.
--
-- Geen retraining nodig: voorbeelden werken direct na opslaan.
-- ============================================================

CREATE TABLE IF NOT EXISTS coach_voorbeelden (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  /** Wie heeft 't toegevoegd. Beperkt tot founders via RLS. */
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  /** Voor wie is dit voorbeeld bedoeld?
      'beide'    = werkt voor zowel Mentor als programma-coach (default,
                   bv. productvragen, Lifeplus-uitleg, mindset, gezondheid)
      'member'   = alleen ELEVA Mentor (bv. uitnodigingsteksten,
                   sponsor-scripts, recruitment-stuff)
      'prospect' = alleen programma-coach (bv. programma-uitleg,
                   'welkom in het darmprogramma')
      Filter-strategie in code: doelgroep IN ('beide', gewenste). */
  doelgroep text NOT NULL DEFAULT 'beide',
  /** Categorie maps op coach VraagType: dm | bezwaar | followup | closing
      | drieweg | productadvies | motivatie | accountability | algemeen. */
  categorie text NOT NULL,
  /** De vraag/situatie zoals een member 'm zou typen of inspreken. */
  vraag text NOT NULL,
  /** Hoe de founder zelf zou antwoorden (de 'goede' versie). */
  goed_antwoord text NOT NULL,
  /** Vrije tags voor verfijnde matching. Bijv. {'mid-warm','ondernemer','tijd-bezwaar'}. */
  tags text[] NOT NULL DEFAULT '{}',
  /** Tijdelijk verbergen zonder verwijderen. */
  actief boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index voor snelle categorie + doelgroep lookup, en GIN op tags.
CREATE INDEX IF NOT EXISTS idx_coach_voorbeelden_doel_cat
  ON coach_voorbeelden(doelgroep, categorie, actief);
CREATE INDEX IF NOT EXISTS idx_coach_voorbeelden_tags_gin
  ON coach_voorbeelden USING GIN(tags);

ALTER TABLE coach_voorbeelden ENABLE ROW LEVEL SECURITY;

-- Iedereen mag voorbeelden LEZEN, want de Mentor (server-side, via
-- service-role of als ingelogde member) gebruikt ze als kennisbasis
-- voor élke member, niet alleen voor de founder die 'm aanmaakte.
DROP POLICY IF EXISTS "Coach-voorbeelden lezen door ingelogd" ON coach_voorbeelden;
CREATE POLICY "Coach-voorbeelden lezen door ingelogd" ON coach_voorbeelden
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND actief = true);

-- Alleen founders mogen voorbeelden TOEVOEGEN/WIJZIGEN/VERWIJDEREN.
-- Check: profile.role = 'founder'.
DROP POLICY IF EXISTS "Founders mogen coach-voorbeelden toevoegen" ON coach_voorbeelden;
CREATE POLICY "Founders mogen coach-voorbeelden toevoegen" ON coach_voorbeelden
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'founder'
    )
  );

DROP POLICY IF EXISTS "Founders mogen coach-voorbeelden wijzigen" ON coach_voorbeelden;
CREATE POLICY "Founders mogen coach-voorbeelden wijzigen" ON coach_voorbeelden
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'founder'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'founder'
    )
  );

DROP POLICY IF EXISTS "Founders mogen coach-voorbeelden verwijderen" ON coach_voorbeelden;
CREATE POLICY "Founders mogen coach-voorbeelden verwijderen" ON coach_voorbeelden
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'founder'
    )
  );

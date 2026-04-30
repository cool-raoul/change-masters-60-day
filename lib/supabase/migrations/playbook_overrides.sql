-- ============================================================
-- playbook_overrides — founders kunnen 21-daagse teksten zelf
-- aanpassen zonder dat er een code-deploy nodig is.
--
-- Per dag (1-21) één rij. Velden die gevuld zijn overschrijven de
-- standaard tekst uit lib/playbook/dagen.ts. Velden die NULL zijn
-- vallen terug op de hardcoded versie. Zo kunnen founders incrementeel
-- aanpassen zonder alles te hoeven kopieren.
--
-- RLS:
-- - Iedereen die ingelogd is mag SELECT (members zien de overrides)
-- - Alleen role='founder' mag INSERT/UPDATE/DELETE
-- ============================================================

CREATE TABLE IF NOT EXISTS playbook_overrides (
  dag_nummer              INTEGER     PRIMARY KEY
                          CHECK (dag_nummer >= 1 AND dag_nummer <= 21),
  titel                   TEXT,
  wat_je_leert            TEXT,
  fase_doel               TEXT,
  waarom_werkt_dit_tekst  TEXT,
  waarom_werkt_dit_bron   TEXT,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID        REFERENCES auth.users(id)
);

CREATE OR REPLACE FUNCTION trg_playbook_overrides_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS playbook_overrides_updated_at ON playbook_overrides;
CREATE TRIGGER playbook_overrides_updated_at
  BEFORE UPDATE ON playbook_overrides FOR EACH ROW
  EXECUTE FUNCTION trg_playbook_overrides_set_updated_at();

ALTER TABLE playbook_overrides ENABLE ROW LEVEL SECURITY;

-- Iedereen die ingelogd is mag de overrides lezen — anders zien members
-- de nieuwe content niet.
DROP POLICY IF EXISTS "playbook_overrides_select_all" ON playbook_overrides;
CREATE POLICY "playbook_overrides_select_all" ON playbook_overrides
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Alleen founders mogen schrijven/wijzigen/verwijderen.
DROP POLICY IF EXISTS "playbook_overrides_modify_founder" ON playbook_overrides;
CREATE POLICY "playbook_overrides_modify_founder" ON playbook_overrides
  FOR ALL
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

-- ============================================================
-- Gaby Rietbergen tot Founder benoemen.
-- ============================================================
UPDATE profiles
SET role = 'founder'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'gaby5s@gmail.com'
);

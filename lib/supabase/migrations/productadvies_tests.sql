-- ============================================================
-- productadvies_tests
--
-- Slaat de productadvies-tests op die members naar prospects sturen.
-- Token in de URL = het toegangsbewijs voor de prospect.
--
-- Flow:
--   1. Member klikt "Stuur productadvies-test" op prospect-kaart
--   2. Server maakt rij aan met token + member_id + prospect_id, status='verstuurd'
--   3. Member deelt URL https://app.../test/[token] via WhatsApp / mail
--   4. Prospect opent link, vult test in
--   5. Server slaat antwoorden + berekent uitslag op, status='ingevuld'
--   6. Resultaatpagina toont advies aan prospect + bestelknop met member-link
--
-- Status-waarden:
--   'verstuurd'  - test aangemaakt, prospect heeft nog niet ingevuld
--   'ingevuld'   - prospect heeft test voltooid, uitslag aanwezig
--   'verlopen'   - test ouder dan X dagen, niet meer actief (toekomstig)
-- ============================================================

CREATE TABLE IF NOT EXISTS productadvies_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  /** "ja" / "nee" / "weet_niet" — antwoord op trigger-vraag 60 Day Run */
  trigger_60day TEXT,
  /** Aangevinkte uitspraken: { categorie_key: string[] } */
  antwoorden JSONB,
  /** Berekende uitslag: { categorie, niveau, pakket_key, samenstelling } */
  uitslag JSONB,
  /** AVG-vinkje moet aangevinkt zijn voordat submit doorgaat */
  avg_akkoord BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'verstuurd',
  ingevuld_op TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_productadvies_tests_token
  ON productadvies_tests (token);

CREATE INDEX IF NOT EXISTS idx_productadvies_tests_member
  ON productadvies_tests (member_id);

CREATE INDEX IF NOT EXISTS idx_productadvies_tests_prospect
  ON productadvies_tests (prospect_id);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_productadvies_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_productadvies_tests_updated_at ON productadvies_tests;
CREATE TRIGGER trg_productadvies_tests_updated_at
BEFORE UPDATE ON productadvies_tests
FOR EACH ROW
EXECUTE FUNCTION update_productadvies_tests_updated_at();

-- ============================================================
-- Row Level Security
-- Members zien alleen hun eigen tests. Prospect-invullen via API met
-- service-role-key (server-side), niet via deze policies.
-- ============================================================

ALTER TABLE productadvies_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_own_tests" ON productadvies_tests;
CREATE POLICY "members_select_own_tests"
  ON productadvies_tests FOR SELECT
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "members_insert_own_tests" ON productadvies_tests;
CREATE POLICY "members_insert_own_tests"
  ON productadvies_tests FOR INSERT
  WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "members_update_own_tests" ON productadvies_tests;
CREATE POLICY "members_update_own_tests"
  ON productadvies_tests FOR UPDATE
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "members_delete_own_tests" ON productadvies_tests;
CREATE POLICY "members_delete_own_tests"
  ON productadvies_tests FOR DELETE
  USING (auth.uid() = member_id);

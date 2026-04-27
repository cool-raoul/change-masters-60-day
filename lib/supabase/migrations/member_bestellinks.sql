-- ============================================================
-- member_bestellinks
--
-- Per member kan hier per pakket-key een Lifeplus webshop-link
-- worden opgeslagen die naar een gevuld winkelwagentje verwijst.
-- De resultaatpagina van de productadvies-test gebruikt deze tabel
-- om de "Bestel via [member]"-knop met de juiste URL te tonen.
--
-- Pre-defined keys (zie pakketten.ts):
--   - {categorie}-{niveau}, bijv. "energie-focus-essential"
--   - reset-darmen-basis, reset-darmen-plus, reset-60day-opstart,
--     reset-holistic-m12, reset-holistic-m3
--
-- Members kunnen daarnaast onbeperkt eigen `is_custom = true` keys
-- aanmaken voor maatwerk-adviezen die de Mentor of Product Adviser
-- heeft samengesteld.
-- ============================================================

CREATE TABLE IF NOT EXISTS member_bestellinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pakket_key TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pakket_key)
);

CREATE INDEX IF NOT EXISTS idx_member_bestellinks_user
  ON member_bestellinks (user_id);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_member_bestellinks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_bestellinks_updated_at ON member_bestellinks;
CREATE TRIGGER trg_member_bestellinks_updated_at
BEFORE UPDATE ON member_bestellinks
FOR EACH ROW
EXECUTE FUNCTION update_member_bestellinks_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE member_bestellinks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_bestellinks" ON member_bestellinks;
CREATE POLICY "users_select_own_bestellinks"
  ON member_bestellinks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_bestellinks" ON member_bestellinks;
CREATE POLICY "users_insert_own_bestellinks"
  ON member_bestellinks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_bestellinks" ON member_bestellinks;
CREATE POLICY "users_update_own_bestellinks"
  ON member_bestellinks FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_bestellinks" ON member_bestellinks;
CREATE POLICY "users_delete_own_bestellinks"
  ON member_bestellinks FOR DELETE
  USING (auth.uid() = user_id);

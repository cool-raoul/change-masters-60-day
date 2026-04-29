-- ============================================================
-- eigen_zinnen — opslag voor inline-acties uit het 21-daagse playbook
--
-- Members schrijven op verschillende dagen "eigen zinnen" (bv.
-- edification-zin, 30-sec-pitch, why-introductie). Eén regel per
-- (user, slug). Niet per dag — slug is stabiel zodat dezelfde dag
-- opnieuw bezoeken = bestaande waarde geladen, en /mijn-zinnen alle
-- opgeslagen items op één plek kan tonen.
--
-- RLS: alleen eigen rijen.
-- ============================================================

CREATE TABLE IF NOT EXISTS eigen_zinnen (
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug        TEXT         NOT NULL,
  label       TEXT         NOT NULL,
  waarde      TEXT         NOT NULL,
  -- Welke playbook-dag/taak heeft dit ingevuld? Voor terugverwijzen
  -- vanuit /mijn-zinnen ("dit hoort bij dag 18"). Optioneel.
  bron_dag    INTEGER,
  bron_taak   TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slug)
);

-- updated_at automatisch bijwerken bij elke wijziging
CREATE OR REPLACE FUNCTION trg_eigen_zinnen_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS eigen_zinnen_updated_at ON eigen_zinnen;
CREATE TRIGGER eigen_zinnen_updated_at
  BEFORE UPDATE ON eigen_zinnen
  FOR EACH ROW EXECUTE FUNCTION trg_eigen_zinnen_set_updated_at();

ALTER TABLE eigen_zinnen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_zinnen_select_own" ON eigen_zinnen;
CREATE POLICY "eigen_zinnen_select_own" ON eigen_zinnen
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_zinnen_insert_own" ON eigen_zinnen;
CREATE POLICY "eigen_zinnen_insert_own" ON eigen_zinnen
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_zinnen_update_own" ON eigen_zinnen;
CREATE POLICY "eigen_zinnen_update_own" ON eigen_zinnen
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_zinnen_delete_own" ON eigen_zinnen;
CREATE POLICY "eigen_zinnen_delete_own" ON eigen_zinnen
  FOR DELETE
  USING (auth.uid() = user_id);

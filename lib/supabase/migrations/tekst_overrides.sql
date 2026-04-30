-- ============================================================
-- tekst_overrides — generieke tabel voor founder-bewerkbare teksten
-- in het ELEVA-systeem. Inzetbaar voor onboarding, welkom-teksten,
-- mentor-prompts, alle plekken waar founders content moeten kunnen
-- bijsturen zonder code-deploy.
--
-- Naast deze generieke tabel houden we domain-specifieke overrides
-- (playbook_overrides, script_overrides) waar de structuur expliciet
-- meerwaarde heeft. tekst_overrides is voor losse tekst-snippets.
--
-- Sleutelconventie: namespace = feature ('onboarding', 'welkom-popup',
-- 'mentor-stijl'), sleutel = path binnen die feature ('stap1.titel',
-- 'stap1.intro', etc.). Beide zijn TEXT, dus toekomstvast.
-- ============================================================

CREATE TABLE IF NOT EXISTS tekst_overrides (
  namespace   TEXT         NOT NULL,
  sleutel     TEXT         NOT NULL,
  waarde      TEXT         NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by  UUID         REFERENCES auth.users(id),
  PRIMARY KEY (namespace, sleutel)
);

CREATE INDEX IF NOT EXISTS idx_tekst_overrides_namespace
  ON tekst_overrides(namespace);

CREATE OR REPLACE FUNCTION trg_tekst_overrides_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tekst_overrides_updated_at ON tekst_overrides;
CREATE TRIGGER tekst_overrides_updated_at
  BEFORE UPDATE ON tekst_overrides FOR EACH ROW
  EXECUTE FUNCTION trg_tekst_overrides_set_updated_at();

ALTER TABLE tekst_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tekst_overrides_select_all" ON tekst_overrides;
CREATE POLICY "tekst_overrides_select_all" ON tekst_overrides
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "tekst_overrides_modify_founder" ON tekst_overrides;
CREATE POLICY "tekst_overrides_modify_founder" ON tekst_overrides
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'founder')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'founder')
  );

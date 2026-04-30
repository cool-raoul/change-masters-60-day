-- ============================================================
-- script_overrides — founders kunnen scripts (uitnodigingen, edification,
-- bezwaren, follow-ups, sluitingen) zelf aanpassen zonder code-deploy.
--
-- Per script één rij. Velden die NULL zijn vallen terug op de
-- hardcoded versie uit lib/scripts-data.ts.
--
-- script_id = slug van de originele titel (zie maakScriptId in
-- lib/scripts/overrides.ts). Stable zolang originele titel niet
-- ingrijpend verandert in de code; als de founder alleen de TITEL
-- aanpast via de UI blijft script_id hetzelfde — geen risico op
-- weeskinderen in de DB.
-- ============================================================

CREATE TABLE IF NOT EXISTS script_overrides (
  script_id   TEXT         PRIMARY KEY,
  titel       TEXT,
  inhoud      TEXT,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by  UUID         REFERENCES auth.users(id)
);

CREATE OR REPLACE FUNCTION trg_script_overrides_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS script_overrides_updated_at ON script_overrides;
CREATE TRIGGER script_overrides_updated_at
  BEFORE UPDATE ON script_overrides FOR EACH ROW
  EXECUTE FUNCTION trg_script_overrides_set_updated_at();

ALTER TABLE script_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "script_overrides_select_all" ON script_overrides;
CREATE POLICY "script_overrides_select_all" ON script_overrides
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "script_overrides_modify_founder" ON script_overrides;
CREATE POLICY "script_overrides_modify_founder" ON script_overrides
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'founder')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'founder')
  );

-- ============================================================
-- radar_voltooiingen — per-dag-afvinkingen voor de Volgende-Beste-Actie-
-- radar in /vandaag. Eén rij per (user, prospect, datum). Wordt gebruikt
-- voor twee dingen:
--   1. UI: items die VANDAAG zijn afgevinkt grijzen uit in de balk.
--   2. Carry-over: items die GISTEREN wel in de radar zaten maar niet
--      zijn afgevinkt, krijgen +25 scoring-bump zodat ze vandaag
--      grote kans hebben bovenaan te staan met een 🔄-badge.
--
-- UNIQUE(user_id, prospect_id, datum) zorgt dat dubbele insert (race
-- conditions) stil falen — geen dubbele rijen.
-- ============================================================

CREATE TABLE IF NOT EXISTS radar_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  datum DATE NOT NULL DEFAULT CURRENT_DATE,
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, prospect_id, datum)
);

CREATE INDEX IF NOT EXISTS idx_radar_voltooiingen_user_datum
  ON radar_voltooiingen (user_id, datum DESC);

ALTER TABLE radar_voltooiingen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_radar_select" ON radar_voltooiingen;
CREATE POLICY "eigen_radar_select"
  ON radar_voltooiingen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_radar_insert" ON radar_voltooiingen;
CREATE POLICY "eigen_radar_insert"
  ON radar_voltooiingen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_radar_delete" ON radar_voltooiingen;
CREATE POLICY "eigen_radar_delete"
  ON radar_voltooiingen FOR DELETE
  USING (auth.uid() = user_id);

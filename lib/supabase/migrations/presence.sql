-- ============================================================
-- presence, 'vandaag-actief'-stip in teamview.
--
-- Twee kolommen op profiles:
--   - last_seen_at: timestamp van laatste heartbeat (elke 60s door
--     ELEVA-client gepingt). Anderen zien je als actief als deze
--     waarde < 2 minuten oud is.
--   - presence_zichtbaar: opt-out voor mensen die niet willen dat
--     teamleden hun online-status zien. Default TRUE (team-gevoel),
--     member kan 'm uitzetten via /instellingen.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS presence_zichtbaar boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen
  ON profiles(last_seen_at DESC)
  WHERE presence_zichtbaar = true;

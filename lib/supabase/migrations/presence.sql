-- ============================================================
-- presence, 'vandaag-actief'-stip in teamview.
--
-- Eén kolom op profiles:
--   - last_seen_at: timestamp van laatste heartbeat (elke 60s door
--     ELEVA-client gepingt). Anderen zien je als actief als deze
--     waarde < 5 minuten oud is.
--
-- Geen opt-in toggle: members in een sponsor-team-relatie hebben baat
-- bij verbinding (sponsor weet 'nu is een fijn moment om te bellen').
-- Status is alleen zichtbaar binnen de directe sponsor-lijn van je team
-- (op- en neerwaarts), niet voor de hele organisatie.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen
  ON profiles(last_seen_at DESC);

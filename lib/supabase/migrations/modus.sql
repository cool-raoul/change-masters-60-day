-- ============================================================
-- modus, ELEVA's drie wegen
--
-- Elke gebruiker volgt één van de drie wegen:
--   sprint = 60-day Run, intensieve werving-campagne
--   core   = Webshop-strategie, eigen tempo, social/content/freebies
--   pro    = Professional pad, voor coaches/diëtisten met cliënten
--   NULL   = nog niet gekozen, krijgt onboarding-keuzepagina
--
-- Bestaande gebruikers (founders + testers) blijven in 'sprint' zodat de
-- pilot doorloopt. Nieuwe instromers starten met NULL en kiezen tijdens
-- onboarding tussen 'core' en 'pro'.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS modus TEXT
  CHECK (modus IN ('sprint', 'core', 'pro') OR modus IS NULL);

-- Bestaande pilot-testers en founders in sprint-modus zetten zodat hun
-- huidige flow onveranderd blijft. Andere bestaande gebruikers krijgen
-- ook 'sprint' (= huidig gedrag), niet NULL, want dat zou hen onbedoeld
-- naar een keuzepagina sturen.
UPDATE profiles
SET modus = 'sprint'
WHERE modus IS NULL;

COMMENT ON COLUMN profiles.modus IS
  'ELEVA-weg: sprint (60-day Run) | core (webshop-strategie) | pro (professional). NULL = nieuwe gebruiker, kiest tijdens onboarding.';

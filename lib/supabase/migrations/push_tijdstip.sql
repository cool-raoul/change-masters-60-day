-- User-configurable tijdstip voor de dagelijkse GEBUNDELDE herinneringspush.
-- Drie kolommen:
--   dagelijkse_push_uur    : 0-23, default 7 (07:00 lokaal). Vol uur, geen minuten.
--   tijdzone               : IANA time-zone ID (bv. "Europe/Amsterdam"). De cron
--                            draait elk uur in UTC en rekent dit om naar lokale
--                            tijd per user om te bepalen of het NU hun uur is.
--   dagelijkse_push_aan    : true = ontvang de gebundelde ochtendpush; false = uit.
--                            Live-pushes (geen bundel, per event) gaan hier buiten
--                            om en blijven dus altijd werken.
-- Defaults kiezen zodat bestaande gebruikers niks kwijtraken: 07:00 Amsterdam aan.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dagelijkse_push_uur integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS tijdzone text NOT NULL DEFAULT 'Europe/Amsterdam',
  ADD COLUMN IF NOT EXISTS dagelijkse_push_aan boolean NOT NULL DEFAULT true;

-- Begrens uur op 0-23 zodat een fout UI-bug geen onzin-waarde kan opslaan.
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS dagelijkse_push_uur_range;
ALTER TABLE profiles
  ADD CONSTRAINT dagelijkse_push_uur_range
    CHECK (dagelijkse_push_uur BETWEEN 0 AND 23);

-- Index voor de cron: we scannen elke user per uur, dus één index op aan/uit
-- + uur voorkomt full-table scans als het user-volume groeit.
CREATE INDEX IF NOT EXISTS idx_profiles_push_schedule
  ON profiles(dagelijkse_push_aan, dagelijkse_push_uur)
  WHERE dagelijkse_push_aan = true;

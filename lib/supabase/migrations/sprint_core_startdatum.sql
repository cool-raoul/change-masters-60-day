-- ============================================================
-- Per-modus startdatum voor dag-teller na modus-switch.
--
-- Voor de redesign van 2026-05-18: iemand die switcht van Core
-- naar Sprint (of andersom) krijgt z'n eigen dag-teller per modus.
-- Bij switch terug naar een eerder gebruikte modus krijgt 'ie een
-- keuze (oppakken vs opnieuw) waarbij dit datum-veld als anker dient.
--
-- run_startdatum (legacy) blijft staan voor backwards-compat.
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sprint_startdatum DATE NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_startdatum DATE NULL;

-- Backfill: bestaande Sprint-leden krijgen hun huidige run_startdatum
-- gekopieerd naar sprint_startdatum, zodat hun dag-teller doorrolt.
UPDATE profiles
SET sprint_startdatum = run_startdatum
WHERE modus = 'sprint' AND sprint_startdatum IS NULL AND run_startdatum IS NOT NULL;

-- Backfill: bestaande Core-leden (er zijn er nu nog niet veel) krijgen
-- hun huidige run_startdatum gekopieerd naar core_startdatum.
UPDATE profiles
SET core_startdatum = run_startdatum
WHERE modus = 'core' AND core_startdatum IS NULL AND run_startdatum IS NOT NULL;

COMMENT ON COLUMN profiles.sprint_startdatum IS 'Sprint-modus startdatum, NULL als modus nooit actief is geweest. Gezet bij eerste activatie of bij keuze "opnieuw beginnen" na her-activatie.';
COMMENT ON COLUMN profiles.core_startdatum IS 'Core-modus startdatum, NULL als modus nooit actief is geweest. Idem als sprint_startdatum maar voor Core.';

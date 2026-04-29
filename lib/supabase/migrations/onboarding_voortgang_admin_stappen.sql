-- ============================================================
-- Onboarding voortgang — extra kolommen voor de admin-stappen 6/7/8/9.
--
-- Reden: stappen 6 (Lifeplus webshop), 7 (Teams-administratie),
-- 8 (Kredietformulier) en 9 (Bestellinks) hebben nu hun eigen tracking
-- zodat we op het dashboard kunnen tonen welke admin-stappen nog open
-- staan. "Doe ik later" zet de boolean op false (open). "Verder" zet 'm
-- op true (voltooid).
--
-- Stap 8 (kredietformulier) is verplicht — er is geen "doe ik later"
-- knop op die stap; de gebruiker moet 'm voltooien voordat hij door kan.
--
-- Idempotent — veilig opnieuw te runnen.
-- ============================================================

ALTER TABLE onboarding_voortgang
  ADD COLUMN IF NOT EXISTS stap_6_webshop BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stap_7_teams_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stap_8_krediet BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stap_9_bestellinks BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stap_10_eric_worre BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stap_11_doelen BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN onboarding_voortgang.stap_6_webshop IS
  'Lifeplus webshop aangemaakt. False = nog open / overgeslagen, true = voltooid.';
COMMENT ON COLUMN onboarding_voortgang.stap_7_teams_admin IS
  'Teams-administratie ingediend. False = open, true = voltooid.';
COMMENT ON COLUMN onboarding_voortgang.stap_8_krediet IS
  'Kredietformulier ingevuld — VERPLICHT, geen overslaan-optie in onboarding.';
COMMENT ON COLUMN onboarding_voortgang.stap_9_bestellinks IS
  'Bestellinks gekoppeld aan ELEVA. False = open, true = voltooid.';

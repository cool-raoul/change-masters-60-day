-- ============================================================
-- tester_modus — extra flag op profiles voor pilot-testers.
--
-- Testers (en founders) zien op het dashboard een 'Spring naar dag X'-
-- toolbar zodat ze sneller door de 21 dagen kunnen testen. Werkt door
-- profiles.run_startdatum te verzetten — berekenDag() pakt automatisch
-- de juiste dag op basis van die datum.
--
-- Members zonder is_tester=true zien deze toolbar nooit.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_tester BOOLEAN NOT NULL DEFAULT FALSE;

-- Initialiseer Raoul + Gaby alvast als tester (zelf-test).
UPDATE profiles SET is_tester = TRUE
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('raoulzeewijk@hotmail.com', 'gabyvijfs@gmail.com')
);

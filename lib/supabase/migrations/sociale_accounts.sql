-- ============================================================
-- sociale_accounts, kolommen op profiles voor de social-handles van de
-- member zelf. Wordt gebruikt in /vandaag flows waar Facebook /
-- Instagram / LinkedIn moet kunnen openen (bv. dag 3 stap 4).
--
-- Niet als handle (zonder URL) maar als VOLLEDIGE PROFIEL-URL, want
-- dan kunnen we 'm direct openen in het juiste platform zonder ratelen
-- met @-handles, sub-handles, regio-domeinen etc.
--
-- Optioneel veld, leeg = knop wordt niet getoond / disabled.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

COMMENT ON COLUMN profiles.facebook_url IS
  'Volledige URL naar het eigen Facebook-profiel. Leeg = social-knop niet zichtbaar.';
COMMENT ON COLUMN profiles.instagram_url IS
  'Volledige URL naar het eigen Instagram-profiel. Leeg = social-knop niet zichtbaar.';
COMMENT ON COLUMN profiles.linkedin_url IS
  'Volledige URL naar het eigen LinkedIn-profiel. Leeg = social-knop niet zichtbaar.';

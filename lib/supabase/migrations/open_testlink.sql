-- ============================================================
-- Open testlink template support
--
-- Member krijgt één hergebruikbare 'open testlink' (per-member-token)
-- die voor mass-aanpak gedeeld kan worden via social media, events,
-- coaches met meerdere clienten, etc.
--
-- Architectuur:
-- - is_open_template = true op een productadvies_tests rij markeert deze
--   als template. prospect_id is NULL.
-- - Wie de link invult: nieuwe prospect wordt aangemaakt + nieuwe
--   productadvies_tests rij gekoppeld aan die prospect. Het template
--   blijft bestaan voor volgende invullers.
-- ============================================================

ALTER TABLE productadvies_tests
  ADD COLUMN IF NOT EXISTS is_open_template BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN productadvies_tests.is_open_template IS
  'True voor de hergebruikbare member-open-link. Bij invullen wordt een nieuwe prospect aangemaakt en een nieuwe test-rij; deze template-rij blijft staan.';

CREATE INDEX IF NOT EXISTS idx_productadvies_tests_open_template
  ON productadvies_tests (member_id) WHERE is_open_template = true;

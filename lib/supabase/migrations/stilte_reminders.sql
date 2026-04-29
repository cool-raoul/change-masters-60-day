-- ============================================================
-- stilte-reminders: nudge-laag voor inactieve members + sponsors
--
-- Doel: zachte automatische reminder als member 1+ dag geen taak heeft
-- afgevinkt in het 21-daagse playbook. Bij 2+ dagen ook een push naar
-- sponsor zodat hij/zij het member kan oppakken.
--
-- Anti-spam:
-- - Member: max 1 nudge per 24u (via profiles.laatste_stilte_reminder_op)
-- - Sponsor: max 1 push per 72u per (sponsor, member) (sponsor_stilte_pushes)
-- ============================================================

-- 1) Profiel-kolommen voor toggles + tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stilte_reminder_aan BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sponsor_stilte_push_aan BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS laatste_stilte_reminder_op TIMESTAMPTZ;

-- 2) Tracking-tabel voor sponsor → member stilte-pushes
CREATE TABLE IF NOT EXISTS sponsor_stilte_pushes (
  sponsor_id  UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id   UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  laatst_op   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sponsor_id, member_id)
);

ALTER TABLE sponsor_stilte_pushes ENABLE ROW LEVEL SECURITY;

-- Sponsors mogen alleen hun eigen push-history zien (zelden nuttig
-- in app, maar voor transparantie). Inserts/updates gaan via service-role
-- vanuit de cron-endpoint, dus die hebben geen policy nodig.
DROP POLICY IF EXISTS "sponsor_stilte_pushes_select_own" ON sponsor_stilte_pushes;
CREATE POLICY "sponsor_stilte_pushes_select_own" ON sponsor_stilte_pushes
  FOR SELECT
  USING (auth.uid() = sponsor_id);

-- ============================================================
-- Mini-ELEVA Fase 6c: notificaties, lees-tracking, verleng
--
-- Drie aanpassingen:
--   1. Verleng-historie op prospect_invitations (verlengingen-array
--      + aantal-verlengd-veld voor snelle UI-checks)
--   2. mini_eleva_leeskenmerk, lees-staat per gebruiker per uitnodiging
--      voor in-app badges (cijfertjes op tegels)
--   3. Notificaties-tabel voor in-app meldingen (haal-erbij, eerste
--      bezoek prospect, etc.) waarmee badges getriggerd worden
-- ============================================================

-- ============================================================
-- 1. Verleng-velden op prospect_invitations
-- ============================================================

ALTER TABLE prospect_invitations
  ADD COLUMN IF NOT EXISTS aantal_verlengd INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS laatst_verlengd_op TIMESTAMPTZ;

-- ============================================================
-- 2. mini_eleva_leeskenmerk
--
-- Per (gebruiker, uitnodiging) een laatst_gelezen_op-timestamp.
-- Voor leden gebruiken we user_id (UUID), voor prospects (geen
-- account) NULL en het token als identifier-of: in plaats daarvan
-- houden we voor prospects een aparte kolom prospect_token bij.
-- ============================================================

CREATE TABLE IF NOT EXISTS mini_eleva_leeskenmerk (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id            UUID NOT NULL REFERENCES prospect_invitations(id) ON DELETE CASCADE,
  user_id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_token           TEXT,
  laatst_gelezen_op        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leeskenmerk_user_or_token CHECK (
    (user_id IS NOT NULL AND prospect_token IS NULL) OR
    (user_id IS NULL AND prospect_token IS NOT NULL)
  ),
  CONSTRAINT leeskenmerk_uniek_per_user UNIQUE NULLS NOT DISTINCT
    (invitation_id, user_id, prospect_token)
);

CREATE INDEX IF NOT EXISTS mini_eleva_leeskenmerk_user_idx
  ON mini_eleva_leeskenmerk(user_id, invitation_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS mini_eleva_leeskenmerk_token_idx
  ON mini_eleva_leeskenmerk(prospect_token)
  WHERE prospect_token IS NOT NULL;

ALTER TABLE mini_eleva_leeskenmerk ENABLE ROW LEVEL SECURITY;

-- Member en sponsor zien hun eigen leeskenmerken
DROP POLICY IF EXISTS "leeskenmerk_select_eigen" ON mini_eleva_leeskenmerk;
CREATE POLICY "leeskenmerk_select_eigen" ON mini_eleva_leeskenmerk
  FOR SELECT
  USING (auth.uid() = user_id);

-- Member en sponsor mogen eigen leeskenmerk schrijven/updaten
DROP POLICY IF EXISTS "leeskenmerk_insert_eigen" ON mini_eleva_leeskenmerk;
CREATE POLICY "leeskenmerk_insert_eigen" ON mini_eleva_leeskenmerk
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "leeskenmerk_update_eigen" ON mini_eleva_leeskenmerk;
CREATE POLICY "leeskenmerk_update_eigen" ON mini_eleva_leeskenmerk
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. mini_eleva_notificaties
--
-- Per gebeurtenis één rij. Wordt door prospect-acties (eerste
-- bezoek, haal-erbij, mentor-vraag-mijlpaal) of member-acties
-- aangemaakt. Member en sponsor zien hun eigen relevante
-- notificaties.
--
-- Dit is GEDRAGS-data, geen INHOUDS-data. Onder AVG-Keuze A
-- bevatten notificaties geen letterlijke chat-inhoud, alleen
-- type + verwijzing naar de uitnodiging.
-- ============================================================

CREATE TABLE IF NOT EXISTS mini_eleva_notificaties (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id            UUID NOT NULL REFERENCES prospect_invitations(id) ON DELETE CASCADE,
  -- Voor wie deze notificatie bedoeld is (member of sponsor)
  ontvanger_user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Type: 'eerste-bezoek' | 'haal-erbij' | 'mijlpaal-vragen' | 'mentor-bezoek'
  type                     TEXT NOT NULL,
  -- Korte tekst die in UI verschijnt (geen chat-inhoud)
  titel                    TEXT NOT NULL,
  -- Optionele extra context (bijv. modulesnaam, niet inhoud)
  detail                   TEXT,
  gelezen                  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mini_eleva_notificaties_ontvanger_idx
  ON mini_eleva_notificaties(ontvanger_user_id, gelezen, created_at DESC);

CREATE INDEX IF NOT EXISTS mini_eleva_notificaties_invitation_idx
  ON mini_eleva_notificaties(invitation_id);

ALTER TABLE mini_eleva_notificaties ENABLE ROW LEVEL SECURITY;

-- Ontvanger ziet eigen notificaties
DROP POLICY IF EXISTS "notificaties_select_ontvanger" ON mini_eleva_notificaties;
CREATE POLICY "notificaties_select_ontvanger" ON mini_eleva_notificaties
  FOR SELECT
  USING (auth.uid() = ontvanger_user_id);

-- Ontvanger mag z'n eigen notificaties als gelezen markeren
DROP POLICY IF EXISTS "notificaties_update_ontvanger" ON mini_eleva_notificaties;
CREATE POLICY "notificaties_update_ontvanger" ON mini_eleva_notificaties
  FOR UPDATE
  USING (auth.uid() = ontvanger_user_id)
  WITH CHECK (auth.uid() = ontvanger_user_id);

-- INSERTS gebeuren server-side via admin-client (vanuit prospect-acties
-- waar geen auth.uid() bestaat), dus geen INSERT-policy.

COMMENT ON TABLE mini_eleva_leeskenmerk IS
  'Lees-staat per gebruiker per uitnodiging voor in-app badges in mini-ELEVA.';
COMMENT ON TABLE mini_eleva_notificaties IS
  'Gedrags-notificaties voor mini-ELEVA. Bevat geen chat-inhoud (AVG-Keuze A).';

-- ============================================================
-- Mini-ELEVA, prospect-omgeving die het 3-weg-gesprek vervangt.
--
-- Drie tabellen:
--   1. prospect_invitations, magic-link tokens (72u geldig) waarmee
--      een prospect zonder account toegang krijgt tot zijn eigen
--      mini-ELEVA-omgeving.
--   2. mini_eleva_chats, drie-persoons-conversatie tussen member,
--      sponsor en prospect (plus AI-mentor-berichten).
--   3. mini_eleva_activiteit, log van wat prospect aanklikt/bekijkt
--      zodat member ziet of er momentum is.
--
-- Magic-auth: prospect heeft geen Supabase-account. Token in URL is de
-- enige authenticatie. RLS staat lezen/schrijven toe op basis van
-- token-match (server-side gecheckt door API-routes voor extra
-- veiligheid).
-- ============================================================

-- ============================================================
-- 1. prospect_invitations
-- ============================================================

CREATE TABLE IF NOT EXISTS prospect_invitations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id              UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  member_user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token                    TEXT UNIQUE NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at               TIMESTAMPTZ NOT NULL,
  laatste_activiteit_op    TIMESTAMPTZ,
  status                   TEXT NOT NULL DEFAULT 'actief'
                           CHECK (status IN ('actief', 'verlopen', 'ja_starter', 'nee_dichtgeklapt'))
);

CREATE INDEX IF NOT EXISTS prospect_invitations_token_idx
  ON prospect_invitations(token);
CREATE INDEX IF NOT EXISTS prospect_invitations_member_idx
  ON prospect_invitations(member_user_id);
CREATE INDEX IF NOT EXISTS prospect_invitations_prospect_idx
  ON prospect_invitations(prospect_id);

ALTER TABLE prospect_invitations ENABLE ROW LEVEL SECURITY;

-- Member ziet eigen uitnodigingen
DROP POLICY IF EXISTS "prospect_invitations_select_member" ON prospect_invitations;
CREATE POLICY "prospect_invitations_select_member" ON prospect_invitations
  FOR SELECT
  USING (auth.uid() = member_user_id OR auth.uid() = sponsor_user_id);

-- Member maakt eigen uitnodigingen
DROP POLICY IF EXISTS "prospect_invitations_insert_member" ON prospect_invitations;
CREATE POLICY "prospect_invitations_insert_member" ON prospect_invitations
  FOR INSERT
  WITH CHECK (auth.uid() = member_user_id);

-- Member kan status van eigen uitnodigingen bijwerken (verlengen,
-- markeren als ja_starter / nee_dichtgeklapt)
DROP POLICY IF EXISTS "prospect_invitations_update_member" ON prospect_invitations;
CREATE POLICY "prospect_invitations_update_member" ON prospect_invitations
  FOR UPDATE
  USING (auth.uid() = member_user_id)
  WITH CHECK (auth.uid() = member_user_id);

-- ============================================================
-- 2. mini_eleva_chats
-- ============================================================

CREATE TABLE IF NOT EXISTS mini_eleva_chats (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id            UUID NOT NULL REFERENCES prospect_invitations(id) ON DELETE CASCADE,
  rol                      TEXT NOT NULL
                           CHECK (rol IN ('member', 'sponsor', 'prospect', 'ai_mentor')),
  type                     TEXT NOT NULL DEFAULT 'tekst'
                           CHECK (type IN ('tekst', 'spraak')),
  content                  TEXT NOT NULL,
  duur_seconden            INTEGER,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mini_eleva_chats_invitation_idx
  ON mini_eleva_chats(invitation_id, created_at);

ALTER TABLE mini_eleva_chats ENABLE ROW LEVEL SECURITY;

-- Member en sponsor van een uitnodiging mogen lezen
DROP POLICY IF EXISTS "mini_eleva_chats_select_team" ON mini_eleva_chats;
CREATE POLICY "mini_eleva_chats_select_team" ON mini_eleva_chats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prospect_invitations pi
      WHERE pi.id = mini_eleva_chats.invitation_id
      AND (auth.uid() = pi.member_user_id OR auth.uid() = pi.sponsor_user_id)
    )
  );

-- Member en sponsor mogen schrijven
DROP POLICY IF EXISTS "mini_eleva_chats_insert_team" ON mini_eleva_chats;
CREATE POLICY "mini_eleva_chats_insert_team" ON mini_eleva_chats
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prospect_invitations pi
      WHERE pi.id = mini_eleva_chats.invitation_id
      AND (auth.uid() = pi.member_user_id OR auth.uid() = pi.sponsor_user_id)
    )
  );

-- ============================================================
-- 3. mini_eleva_activiteit
-- ============================================================

CREATE TABLE IF NOT EXISTS mini_eleva_activiteit (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id            UUID NOT NULL REFERENCES prospect_invitations(id) ON DELETE CASCADE,
  module                   TEXT NOT NULL,
  detail                   TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mini_eleva_activiteit_invitation_idx
  ON mini_eleva_activiteit(invitation_id, created_at);

ALTER TABLE mini_eleva_activiteit ENABLE ROW LEVEL SECURITY;

-- Member en sponsor mogen activiteit van eigen uitnodiging zien
DROP POLICY IF EXISTS "mini_eleva_activiteit_select_team" ON mini_eleva_activiteit;
CREATE POLICY "mini_eleva_activiteit_select_team" ON mini_eleva_activiteit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prospect_invitations pi
      WHERE pi.id = mini_eleva_activiteit.invitation_id
      AND (auth.uid() = pi.member_user_id OR auth.uid() = pi.sponsor_user_id)
    )
  );

-- INSERT-policies blijven voor server-side via service role; prospect
-- log't via API-route die de admin-client gebruikt.

COMMENT ON TABLE prospect_invitations IS
  'Mini-ELEVA magic-link tokens (72u geldig) voor prospect-toegang zonder Supabase-account.';
COMMENT ON TABLE mini_eleva_chats IS
  'Drie-persoons-conversatie member + sponsor + prospect + AI-mentor binnen mini-ELEVA.';
COMMENT ON TABLE mini_eleva_activiteit IS
  'Log van prospect-activiteit binnen mini-ELEVA. Member en sponsor zien of er momentum is.';

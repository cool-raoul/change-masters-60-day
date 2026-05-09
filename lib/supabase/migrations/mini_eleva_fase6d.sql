-- ============================================================
-- Mini-ELEVA Fase 6d: drie-persoonschat + voice
--
-- Drie aanpassingen:
--   1. mini_eleva_prospect_subscriptions, push-abonnementen voor
--      prospects (geen Supabase-account, dus per token gekoppeld)
--   2. mini_eleva_chats kolommen voor voice (audio_path, transcriptie)
--   3. Storage-bucket "mini-eleva-voice" voor audio-bestanden
-- ============================================================

-- ============================================================
-- 0. prospects.gekozen_aanpak
--
-- Per prospect kan de member kiezen welke aanpak past:
--   - 'drieweg'    klassiek 3-weg-gesprek (member + sponsor + prospect)
--   - 'mini_eleva' eigen mini-ELEVA-omgeving (14 dagen rondkijken)
--   - NULL         nog geen keuze
-- ============================================================

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS gekozen_aanpak TEXT
    CHECK (gekozen_aanpak IS NULL OR gekozen_aanpak IN ('drieweg', 'mini_eleva'));

-- ============================================================
-- 1. mini_eleva_prospect_subscriptions
--
-- Prospect heeft GEEN auth.users-record, dus push-subscriptions
-- kunnen we niet via user_id koppelen. We koppelen via invitation_id
-- (en daarmee impliciet via het token in de URL). Een prospect kan
-- meerdere endpoints hebben (bijv telefoon + tablet).
-- ============================================================

CREATE TABLE IF NOT EXISTS mini_eleva_prospect_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id            UUID NOT NULL REFERENCES prospect_invitations(id) ON DELETE CASCADE,
  endpoint                 TEXT NOT NULL,
  p256dh                   TEXT NOT NULL,
  auth                     TEXT NOT NULL,
  user_agent               TEXT,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at             TIMESTAMPTZ,
  CONSTRAINT prospect_sub_endpoint_uniek UNIQUE (invitation_id, endpoint)
);

CREATE INDEX IF NOT EXISTS prospect_subs_invitation_idx
  ON mini_eleva_prospect_subscriptions(invitation_id, is_active);

ALTER TABLE mini_eleva_prospect_subscriptions ENABLE ROW LEVEL SECURITY;

-- Geen auth-policies, alleen server-side via admin-client. Prospect
-- heeft geen account dus kan zelf niet RLS-checken via auth.uid().
-- Member en sponsor mogen wel zien voor diagnose.
DROP POLICY IF EXISTS "prospect_subs_select_team" ON mini_eleva_prospect_subscriptions;
CREATE POLICY "prospect_subs_select_team" ON mini_eleva_prospect_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prospect_invitations pi
      WHERE pi.id = mini_eleva_prospect_subscriptions.invitation_id
      AND (auth.uid() = pi.member_user_id OR auth.uid() = pi.sponsor_user_id)
    )
  );

-- ============================================================
-- 2. Voice-kolommen op mini_eleva_chats
--
-- Audio-bestanden worden in Supabase Storage opgeslagen, hier slaan
-- we het pad op. Transcriptie wordt server-side gemaakt via Whisper
-- en als tekst-content opgeslagen voor zoeken/zien.
-- ============================================================

ALTER TABLE mini_eleva_chats
  ADD COLUMN IF NOT EXISTS audio_path TEXT,
  ADD COLUMN IF NOT EXISTS transcriptie TEXT;

-- ============================================================
-- 3. Storage-bucket voor voice-bestanden
--
-- Privé-bucket. Server-side via admin-client uploaden, en met signed
-- URLs aan de UI tonen. Buckets zijn idempotent te maken via
-- INSERT ... ON CONFLICT.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('mini-eleva-voice', 'mini-eleva-voice', false, 5242880) -- 5MB max
ON CONFLICT (id) DO NOTHING;

-- Storage-objects RLS, alleen server-side admin-client mag schrijven.
-- Lezen via signed URLs die we server-side genereren, dus geen
-- public read-policy nodig.
DROP POLICY IF EXISTS "mini_eleva_voice_team_select" ON storage.objects;
CREATE POLICY "mini_eleva_voice_team_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'mini-eleva-voice'
    AND auth.uid() IS NOT NULL
  );

COMMENT ON TABLE mini_eleva_prospect_subscriptions IS
  'Push-abonnementen voor prospects in mini-ELEVA, gekoppeld aan invitation (geen user_id want geen account).';

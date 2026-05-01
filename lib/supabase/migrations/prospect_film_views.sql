-- ============================================================
-- prospect_film_views, tracking voor films die member-naar-prospect verstuurt.
--
-- Werking:
-- 1. Member klikt 'Stuur film' op een prospect-kaart, kiest een film-slug.
-- 2. ELEVA maakt een rij aan met (prospect_id, member_user_id, film_slug)
--    en een uniek share_token.
-- 3. URL /prospect-film/[token] toont de film aan de prospect.
-- 4. Bij iframe-load: gestart_op wordt gezet.
-- 5. Bij 'ik heb 'm afgekeken'-knop: afgekeken_op wordt gezet, member
--    krijgt push, prospect schuift automatisch naar followup-fase.
--
-- Token is publieksgeheim: wie de link heeft kan de film bekijken.
-- Schrijf-acties (gestart/afgekeken markeren) gaan via service-role API,
-- nooit direct vanaf de prospect-pagina, want prospect heeft geen account.
-- ============================================================

CREATE TABLE IF NOT EXISTS prospect_film_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token text NOT NULL UNIQUE,
  prospect_id uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  member_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_slug text NOT NULL,
  -- Tracking-velden
  gestart_op timestamptz,
  afgekeken_op timestamptz,
  -- Optionele fields voor toekomstige uitbreiding (realtime % via YouTube
  -- IFrame API). Default 0, kan opgehoogd via API-endpoint.
  kijkpercentage int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexen voor de drie meest gebruikte queries:
--   1. Member ziet alle views voor zijn prospect (prospect-kaart-log)
--   2. Member ziet alle views voor hemzelf (overzicht statistiek)
--   3. Snel token-lookup voor de prospect-pagina
CREATE INDEX IF NOT EXISTS idx_pfv_prospect ON prospect_film_views(prospect_id);
CREATE INDEX IF NOT EXISTS idx_pfv_member ON prospect_film_views(member_user_id);
CREATE INDEX IF NOT EXISTS idx_pfv_token ON prospect_film_views(share_token);

ALTER TABLE prospect_film_views ENABLE ROW LEVEL SECURITY;

-- Member ziet alleen eigen film-views (waar 'ie zelf de afzender van is).
DROP POLICY IF EXISTS "Eigen prospect_film_views lezen" ON prospect_film_views;
CREATE POLICY "Eigen prospect_film_views lezen" ON prospect_film_views
  FOR SELECT
  USING (auth.uid() = member_user_id);

-- Member kan eigen rows aanmaken.
DROP POLICY IF EXISTS "Eigen prospect_film_views invoegen" ON prospect_film_views;
CREATE POLICY "Eigen prospect_film_views invoegen" ON prospect_film_views
  FOR INSERT
  WITH CHECK (auth.uid() = member_user_id);

-- Member kan eigen rows wijzigen (bv. om handmatig 'reset' te doen).
DROP POLICY IF EXISTS "Eigen prospect_film_views wijzigen" ON prospect_film_views;
CREATE POLICY "Eigen prospect_film_views wijzigen" ON prospect_film_views
  FOR UPDATE
  USING (auth.uid() = member_user_id)
  WITH CHECK (auth.uid() = member_user_id);

DROP POLICY IF EXISTS "Eigen prospect_film_views verwijderen" ON prospect_film_views;
CREATE POLICY "Eigen prospect_film_views verwijderen" ON prospect_film_views
  FOR DELETE
  USING (auth.uid() = member_user_id);

-- NB: GEEN public-select-policy. Anonymous (prospect zonder account) kan
-- de rij NIET direct lezen via Supabase client. De prospect-pagina haalt
-- de data op via een server-side API-route die de service-role gebruikt
-- en alleen de minimaal noodzakelijke velden doorgeeft (geen prospect_id
-- etc. die de prospect's identiteit zou kunnen onthullen).

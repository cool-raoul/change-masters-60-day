-- Change Masters — 60 Dagen Run Systeem
-- Voer dit SQL uit in jouw Supabase project → SQL Editor
-- Ga naar: https://supabase.com → jouw project → SQL Editor → Plak dit in → Run

-- =============================================
-- PROFILES (Teamleden)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'lid' CHECK (role IN ('leider', 'lid')),
  run_startdatum date NOT NULL DEFAULT '2026-04-12',
  onboarding_klaar boolean NOT NULL DEFAULT false,
  invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  sponsor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  taal text NOT NULL DEFAULT 'nl' CHECK (taal IN ('nl', 'en', 'fr', 'es', 'de', 'pt')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Maak automatisch een profiel aan bij nieuwe gebruiker
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  sponsor_uuid uuid;
BEGIN
  -- Lees sponsor_id uit metadata (nieuwe stijl) of invited_by (oud)
  sponsor_uuid := NULLIF(NEW.raw_user_meta_data->>'sponsor_id', '')::uuid;
  IF sponsor_uuid IS NULL THEN
    sponsor_uuid := NULLIF(NEW.raw_user_meta_data->>'invited_by', '')::uuid;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, sponsor_id, invited_by, taal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'lid'),
    sponsor_uuid,
    sponsor_uuid,
    COALESCE(NEW.raw_user_meta_data->>'taal', 'nl')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- WHY PROFILES (Persoonlijke WHY)
-- =============================================
CREATE TABLE IF NOT EXISTS why_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  wie_ben_jij text,
  huidige_situatie text,
  waarom_gestart text,
  financieel_doel_maand integer,
  financieel_doel_termijn integer,
  beschikbare_uren integer,
  korte_termijn_doel text,
  lange_termijn_doel text,
  levensverandering text,
  toekomstvisie text,
  toekomstgevoel text,
  gesprek_transcript jsonb DEFAULT '[]'::jsonb,
  why_samenvatting text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- PROSPECTS (Namenlijst / CRM)
-- =============================================
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  volledige_naam text NOT NULL,
  telefoon text,
  email text,
  instagram text,
  facebook text,
  notities text,
  pipeline_fase text NOT NULL DEFAULT 'lead'
    CHECK (pipeline_fase IN ('lead', 'uitgenodigd', 'presentatie', 'followup', 'klant', 'partner')),
  bron text CHECK (bron IN ('warm', 'social', 'doorverwijzing', 'koud')),
  prioriteit text NOT NULL DEFAULT 'normaal' CHECK (prioriteit IN ('hoog', 'normaal', 'laag')),
  laatste_contact date,
  volgende_actie_datum date,
  volgende_actie_notitie text,
  gearchiveerd boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospects_user_id_idx ON prospects(user_id);
CREATE INDEX IF NOT EXISTS prospects_pipeline_fase_idx ON prospects(pipeline_fase);
CREATE INDEX IF NOT EXISTS prospects_volgende_actie_datum_idx ON prospects(volgende_actie_datum);

-- =============================================
-- CONTACT LOGS (Contacthistorie)
-- =============================================
CREATE TABLE IF NOT EXISTS contact_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_type text NOT NULL CHECK (contact_type IN ('dm', 'bel', 'presentatie', 'followup', 'notitie')),
  notities text,
  fase_voor text,
  fase_na text,
  script_gebruikt text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_logs_prospect_id_idx ON contact_logs(prospect_id);

-- =============================================
-- HERINNERINGEN (Reminders)
-- =============================================
CREATE TABLE IF NOT EXISTS herinneringen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prospect_id uuid REFERENCES prospects(id) ON DELETE SET NULL,
  herinnering_type text NOT NULL CHECK (herinnering_type IN ('followup', 'product_herbestelling', 'custom')),
  titel text NOT NULL,
  beschrijving text,
  vervaldatum date NOT NULL,
  verlooptijd time NOT NULL DEFAULT '09:00',
  voltooid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS herinneringen_user_id_idx ON herinneringen(user_id);
CREATE INDEX IF NOT EXISTS herinneringen_vervaldatum_idx ON herinneringen(vervaldatum);

-- =============================================
-- PRODUCT BESTELLINGEN
-- =============================================
CREATE TABLE IF NOT EXISTS product_bestellingen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  besteldatum date NOT NULL,
  product_omschrijving text,
  tweede_bestelling_reminder_datum date GENERATED ALWAYS AS (besteldatum + INTERVAL '21 days') STORED,
  reminder_verstuurd boolean NOT NULL DEFAULT false,
  notities text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: maak automatisch een herinnering 21 dagen na bestelling
CREATE OR REPLACE FUNCTION maak_product_herinnering()
RETURNS TRIGGER AS $$
DECLARE
  prospect_naam text;
BEGIN
  SELECT volledige_naam INTO prospect_naam
  FROM prospects WHERE id = NEW.prospect_id;

  INSERT INTO herinneringen (
    user_id, prospect_id, herinnering_type, titel, beschrijving, vervaldatum
  ) VALUES (
    NEW.user_id,
    NEW.prospect_id,
    'product_herbestelling',
    'Herbestelling opvolging — ' || prospect_naam,
    'Neem contact op voor de tweede bestelling. Eerste bestelling was op ' || TO_CHAR(NEW.besteldatum, 'DD-MM-YYYY') || '.',
    NEW.besteldatum + INTERVAL '21 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS na_product_bestelling ON product_bestellingen;
CREATE TRIGGER na_product_bestelling
  AFTER INSERT ON product_bestellingen
  FOR EACH ROW EXECUTE FUNCTION maak_product_herinnering();

-- =============================================
-- DAGELIJKSE STATS
-- =============================================
CREATE TABLE IF NOT EXISTS dagelijkse_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stat_datum date NOT NULL,
  contacten_gemaakt integer NOT NULL DEFAULT 0,
  uitnodigingen integer NOT NULL DEFAULT 0,
  followups integer NOT NULL DEFAULT 0,
  presentaties integer NOT NULL DEFAULT 0,
  nieuwe_partners integer NOT NULL DEFAULT 0,
  nieuwe_klanten integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, stat_datum)
);

-- =============================================
-- SCRIPTS (Scriptbibliotheek)
-- =============================================
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titel text NOT NULL,
  categorie text NOT NULL CHECK (categorie IN ('uitnodiging', 'bezwaar', 'followup', 'sluiting', 'presentatie')),
  pipeline_fase text,
  inhoud text NOT NULL,
  tags text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- AI GESPREKKEN (Coach chatgeschiedenis)
-- =============================================
CREATE TABLE IF NOT EXISTS ai_gesprekken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prospect_id uuid REFERENCES prospects(id) ON DELETE SET NULL,
  titel text,
  berichten jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_gesprekken_user_id_idx ON ai_gesprekken(user_id);

-- =============================================
-- TEAM MEMBERS (Koppeling leider ↔ teamlid)
-- =============================================
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leider_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lid_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  uitgenodigd_op timestamptz NOT NULL DEFAULT now(),
  toegetreden_op timestamptz,
  UNIQUE(leider_id, lid_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Schakel RLS in op alle tabellen
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE herinneringen ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bestellingen ENABLE ROW LEVEL SECURITY;
ALTER TABLE dagelijkse_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_gesprekken ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Gebruikers lezen eigen profiel" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Gebruikers updaten eigen profiel" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Leiders lezen teamleden" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT lid_id FROM team_members WHERE leider_id = auth.uid()
    )
  );

-- Why profiles policies
CREATE POLICY "Eigen why lezen" ON why_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Eigen why aanmaken" ON why_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigen why updaten" ON why_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Prospects policies
CREATE POLICY "Eigen prospects beheren" ON prospects
  FOR ALL USING (auth.uid() = user_id);

-- Contact logs policies
CREATE POLICY "Eigen contactlogs beheren" ON contact_logs
  FOR ALL USING (auth.uid() = user_id);

-- Herinneringen policies
CREATE POLICY "Eigen herinneringen beheren" ON herinneringen
  FOR ALL USING (auth.uid() = user_id);

-- Product bestellingen policies
CREATE POLICY "Eigen bestellingen beheren" ON product_bestellingen
  FOR ALL USING (auth.uid() = user_id);

-- Dagelijkse stats policies
CREATE POLICY "Eigen stats beheren" ON dagelijkse_stats
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leiders lezen team stats" ON dagelijkse_stats
  FOR SELECT USING (
    user_id IN (
      SELECT lid_id FROM team_members WHERE leider_id = auth.uid()
    )
  );

-- Scripts policies (iedereen leest, alleen service role schrijft)
CREATE POLICY "Iedereen leest scripts" ON scripts
  FOR SELECT USING (true);

-- AI gesprekken policies
CREATE POLICY "Eigen ai gesprekken beheren" ON ai_gesprekken
  FOR ALL USING (auth.uid() = user_id);

-- Team members policies
CREATE POLICY "Leiders beheren team" ON team_members
  FOR ALL USING (auth.uid() = leider_id);
CREATE POLICY "Leden zien eigen koppeling" ON team_members
  FOR SELECT USING (auth.uid() = lid_id);

-- =============================================
-- VIDEO SYSTEM (Trainings- en motivatievideos)
-- =============================================
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titel text NOT NULL,
  beschrijving text,
  categorie text NOT NULL CHECK (categorie IN ('training', 'motivatie', 'testimoniaal', 'systeem')),
  thumbnail_url text,
  -- Video source: either YouTube URL, Vimeo URL, or Supabase storage path
  youtube_url text,
  vimeo_url text,
  supabase_storage_path text,
  -- Scheduling
  beschikbaar_vanaf date,
  beschikbaar_tot date,
  -- Metadata
  duratie_seconden integer,
  leider_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_source_check CHECK (
    (youtube_url IS NOT NULL) OR (vimeo_url IS NOT NULL) OR (supabase_storage_path IS NOT NULL)
  )
);

-- =============================================
-- VIDEO VIEWS (Trackingdata voor videokijken)
-- =============================================
CREATE TABLE IF NOT EXISTS video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seconds_watched integer NOT NULL DEFAULT 0,
  max_seconds_reached integer NOT NULL DEFAULT 0,
  watched_percentage integer GENERATED ALWAYS AS (
    CASE
      WHEN (SELECT duratie_seconden FROM videos WHERE id = video_id) IS NULL OR (SELECT duratie_seconden FROM videos WHERE id = video_id) = 0
      THEN 0
      ELSE ROUND((100.0 * max_seconds_reached) / (SELECT duratie_seconden FROM videos WHERE id = video_id))
    END
  ) STORED,
  is_completed boolean NOT NULL DEFAULT false,
  first_viewed_at timestamptz NOT NULL DEFAULT now(),
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(video_id, viewer_id)
);

-- =============================================
-- VIDEO CO-MANAGERS (Beheerders van videovoorraad)
-- =============================================
CREATE TABLE IF NOT EXISTS video_co_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leider_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  manager_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  kan_uploaden boolean NOT NULL DEFAULT true,
  kan_bewerken boolean NOT NULL DEFAULT true,
  kan_verwijderen boolean NOT NULL DEFAULT false,
  kan_publiceren boolean NOT NULL DEFAULT false,
  toegevoegd_op timestamptz NOT NULL DEFAULT now(),
  UNIQUE(leider_id, manager_id),
  CONSTRAINT niet_jezelf_toevoegen CHECK (leider_id != manager_id)
);

-- =============================================
-- PUSH SUBSCRIPTIONS (Web Push notificaties)
-- =============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Iedereen beheerd eigen subscription" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- ONBOARDING VOORTGANG (Voor member tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS onboarding_voortgang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stap_1_welkom boolean NOT NULL DEFAULT false,
  stap_2_run boolean NOT NULL DEFAULT false,
  stap_3_namen boolean NOT NULL DEFAULT false,
  stap_4_script boolean NOT NULL DEFAULT false,
  stap_5_doelen boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- VIDEO INDEXES & RLS
-- =============================================
CREATE INDEX IF NOT EXISTS videos_leider_id_idx ON videos(leider_id);
CREATE INDEX IF NOT EXISTS videos_categorie_idx ON videos(categorie);
CREATE INDEX IF NOT EXISTS videos_beschikbaar_idx ON videos(beschikbaar_vanaf, beschikbaar_tot);
CREATE INDEX IF NOT EXISTS video_views_video_id_idx ON video_views(video_id);
CREATE INDEX IF NOT EXISTS video_views_viewer_id_idx ON video_views(viewer_id);
CREATE INDEX IF NOT EXISTS video_views_first_viewed_idx ON video_views(first_viewed_at);
CREATE INDEX IF NOT EXISTS video_co_managers_leider_idx ON video_co_managers(leider_id);
CREATE INDEX IF NOT EXISTS onboarding_voortgang_user_idx ON onboarding_voortgang(user_id);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_co_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_voortgang ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Iedereen in het team ziet gepubliceerde videos" ON videos
  FOR SELECT USING (
    is_published = true
    AND (beschikbaar_vanaf IS NULL OR beschikbaar_vanaf <= CURRENT_DATE)
    AND (beschikbaar_tot IS NULL OR beschikbaar_tot >= CURRENT_DATE)
    AND leider_id IN (SELECT id FROM profiles WHERE id = (SELECT leider_id FROM team_members WHERE lid_id = auth.uid()) OR id = auth.uid())
  );

CREATE POLICY "Leider beheert eigen videos" ON videos
  FOR ALL USING (auth.uid() = leider_id);

CREATE POLICY "Co-managers met rechten beheren videos" ON videos
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT manager_id FROM video_co_managers
      WHERE leider_id = videos.leider_id
      AND (kan_bewerken = true OR kan_verwijderen = true)
    )
  );

-- Video views policies
CREATE POLICY "Iedereen kan eigen views zien" ON video_views
  FOR SELECT USING (auth.uid() = viewer_id);

CREATE POLICY "Leider ziet team views" ON video_views
  FOR SELECT USING (
    viewer_id IN (
      SELECT lid_id FROM team_members WHERE leider_id = auth.uid()
    )
  );

CREATE POLICY "Iedereen registreert eigen views" ON video_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Iedereen updated eigen views" ON video_views
  FOR UPDATE USING (auth.uid() = viewer_id);

-- Video co-managers policies
CREATE POLICY "Leider beheert co-managers" ON video_co_managers
  FOR ALL USING (auth.uid() = leider_id);

CREATE POLICY "Managers zien hun eigen rechten" ON video_co_managers
  FOR SELECT USING (auth.uid() = manager_id);

-- Onboarding voortgang policies
CREATE POLICY "Iedereen ziet eigen voortgang" ON onboarding_voortgang
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Iedereen update eigen voortgang" ON onboarding_voortgang
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Iedereen update eigen voortgang - UPDATE" ON onboarding_voortgang
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Leider ziet team voortgang" ON onboarding_voortgang
  FOR SELECT USING (
    user_id IN (
      SELECT lid_id FROM team_members WHERE leider_id = auth.uid()
    )
  );

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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Maak automatisch een profiel aan bij nieuwe gebruiker
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'lid')
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

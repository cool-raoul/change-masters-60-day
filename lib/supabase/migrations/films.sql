-- ============================================================
-- Films-CMS — content-management voor films in ELEVA
--
-- Doel: founders/leiders kunnen via /instellingen/films films per
-- slot toevoegen, vervangen en beheren ZONDER code-deploy. Embedded
-- via YouTube (unlisted) of Vimeo. ELEVA host geen video's zelf.
--
-- Slot-conventie: slug per plek waar een film hoort, bv.:
--   - onboarding-stap-6-webshop
--   - onboarding-stap-7-teams-admin
--   - onboarding-stap-8-kredietformulier
--   - onboarding-stap-9-bestellinks
--   - prospect-intro-1
--   - prospect-intro-2
--   - 3weg-gesprek
--
-- Een film mag bestaan zonder dat er een "slot" is — dan is het
-- gewoon een filmpje dat ergens los wordt opgehaald op slug.
-- ============================================================

CREATE TABLE IF NOT EXISTS films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  /** Unieke slug per slot/film. Voorbeeld: 'onboarding-stap-6-webshop' */
  slug TEXT NOT NULL UNIQUE,
  /** Titel zoals getoond aan member/prospect */
  titel TEXT NOT NULL,
  /** Optionele beschrijving onder het filmpje */
  beschrijving TEXT,
  /** Embed-URL voor YouTube/Vimeo. Bv. 'https://www.youtube.com/embed/ABCDE' */
  video_url TEXT,
  /** Toggle om film tijdelijk uit te schakelen zonder hem te deleten */
  tonen BOOLEAN NOT NULL DEFAULT true,
  /** Optionele duur in seconden (voor info naar gebruiker) */
  duur_seconden INTEGER,
  /** Wie de film toevoegde — voor audit */
  toegevoegd_door UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_films_slug ON films (slug);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_films_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_films_updated_at ON films;
CREATE TRIGGER trg_films_updated_at
BEFORE UPDATE ON films
FOR EACH ROW
EXECUTE FUNCTION update_films_updated_at();

-- ============================================================
-- film_views — wie heeft welke film bekeken/afgekeken
-- ============================================================

CREATE TABLE IF NOT EXISTS film_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  film_slug TEXT NOT NULL,
  /** True wanneer film tot het einde gespeeld is. False = nog niet klaar. */
  afgekeken BOOLEAN NOT NULL DEFAULT false,
  /** Wanneer voor het eerst gestart */
  gestart_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** Wanneer afgekeken (NULL als nog niet klaar) */
  afgekeken_op TIMESTAMPTZ,
  /** Optioneel: tot welke seconde de gebruiker is gekomen.
      Voor fase 2 realtime-percentage. */
  positie_seconden INTEGER,
  /** Voor prospect-films die via een test-token horen i.p.v. via
      ingelogde user (voor de niet-ingelogde prospect-flow). */
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** Een gebruiker heeft 1 view-rij per film (upsert). */
  UNIQUE (user_id, film_slug)
);

CREATE INDEX IF NOT EXISTS idx_film_views_user
  ON film_views (user_id);
CREATE INDEX IF NOT EXISTS idx_film_views_slug
  ON film_views (film_slug);
CREATE INDEX IF NOT EXISTS idx_film_views_prospect
  ON film_views (prospect_id) WHERE prospect_id IS NOT NULL;

-- ============================================================
-- updated_at trigger voor film_views
-- ============================================================

CREATE OR REPLACE FUNCTION update_film_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_film_views_updated_at ON film_views;
CREATE TRIGGER trg_film_views_updated_at
BEFORE UPDATE ON film_views
FOR EACH ROW
EXECUTE FUNCTION update_film_views_updated_at();

-- ============================================================
-- Row Level Security
--
-- films: iedereen die ingelogd is mag SELECT (films worden getoond aan
-- members en prospects via een RPC of admin-route). INSERT/UPDATE/
-- DELETE alleen voor leiders/founders.
--
-- film_views: alleen eigen rijen lezen/schrijven.
-- ============================================================

ALTER TABLE films ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "iedereen_select_films" ON films;
CREATE POLICY "iedereen_select_films"
  ON films FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE alleen voor founder (hoofdbeheerder).
-- In fase 2 kunnen we dit verbreden naar 'leider' zodat leiders eigen
-- films voor hun team kunnen plaatsen — voor nu: één persoon beheert
-- de bibliotheek voor iedereen.
DROP POLICY IF EXISTS "leiders_insert_films" ON films;
DROP POLICY IF EXISTS "founder_insert_films" ON films;
CREATE POLICY "founder_insert_films"
  ON films FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'founder'
    )
  );

DROP POLICY IF EXISTS "leiders_update_films" ON films;
DROP POLICY IF EXISTS "founder_update_films" ON films;
CREATE POLICY "founder_update_films"
  ON films FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'founder'
    )
  );

DROP POLICY IF EXISTS "leiders_delete_films" ON films;
DROP POLICY IF EXISTS "founder_delete_films" ON films;
CREATE POLICY "founder_delete_films"
  ON films FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'founder'
    )
  );

ALTER TABLE film_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_film_views_select" ON film_views;
CREATE POLICY "eigen_film_views_select"
  ON film_views FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_film_views_insert" ON film_views;
CREATE POLICY "eigen_film_views_insert"
  ON film_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_film_views_update" ON film_views;
CREATE POLICY "eigen_film_views_update"
  ON film_views FOR UPDATE
  USING (auth.uid() = user_id);

-- Founder mag alle film_views lezen voor analytics/overview.
-- In fase 2: sponsors mogen views van hun directe downline zien op de
-- prospect-kaart (welke films heeft de prospect afgekeken).
DROP POLICY IF EXISTS "leiders_lezen_alle_views" ON film_views;
DROP POLICY IF EXISTS "founder_lezen_alle_views" ON film_views;
CREATE POLICY "founder_lezen_alle_views"
  ON film_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'founder'
    )
  );

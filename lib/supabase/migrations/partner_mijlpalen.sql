-- ============================================================
-- Partner-mijlpalen — viering-state per member
--
-- Eén rij per gevierde mijlpaal. UNIQUE op (user_id, type) zorgt
-- ervoor dat een eerste-partner-viering exact één keer plaatsvindt.
--
-- Bij verwijdering van de partner blijft de mijlpaal staan
-- (ON DELETE SET NULL op partner_id) — de viering ging immers
-- echt gebeuren.
-- ============================================================

-- ============================================================
-- profiles.telefoon — nodig voor WhatsApp-knoppen in partner-flow
-- (PartnerCheckEmbed + EerstePartnerVieringTegel). Founder vult
-- 'm zelf via /instellingen.
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefoon TEXT;

CREATE TABLE IF NOT EXISTS partner_mijlpalen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  gevierd_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_partner_mijlpalen_user
  ON partner_mijlpalen (user_id);

ALTER TABLE partner_mijlpalen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_mijlpalen_select" ON partner_mijlpalen;
CREATE POLICY "eigen_mijlpalen_select"
  ON partner_mijlpalen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_mijlpalen_insert" ON partner_mijlpalen;
CREATE POLICY "eigen_mijlpalen_insert"
  ON partner_mijlpalen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Helper-functie: % verplichte taken voltooid in N afgelopen dagen
--
-- Returns 0-100. Telt UNIEKE (dag_nummer, taak_id) voltooiingen
-- in afgelopen N dagen voor user_id, gedeeld door totaal aantal
-- verplichte taken in dezelfde periode. Voor MVP gebruiken we
-- het aantal voltooiingen direct als proxy zonder per-dag-totaal
-- te kennen — dit is een ruwe-maar-bruikbare metric.
-- ============================================================

CREATE OR REPLACE FUNCTION bereken_taken_voltooid_pct(
  p_user_id UUID,
  p_dagen_terug INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_voltooid INT;
  v_dagen INT;
  v_verwacht_per_dag INT := 6;
BEGIN
  SELECT COUNT(*) INTO v_voltooid
  FROM dag_voltooiingen
  WHERE user_id = p_user_id
    AND voltooid_op > (now() - (p_dagen_terug || ' days')::INTERVAL);

  v_dagen := GREATEST(p_dagen_terug, 1);

  RETURN LEAST(
    100,
    GREATEST(
      0,
      ROUND((v_voltooid::NUMERIC / (v_dagen * v_verwacht_per_dag)::NUMERIC) * 100)::INT
    )
  );
END;
$$;

-- ============================================================
-- Helper-functie: bereken huidige dag uit run_startdatum
-- Kalender-modus: dagen sinds startdatum + 1, gecapped op 1-60.
-- ============================================================

CREATE OR REPLACE FUNCTION bereken_huidige_dag_voor_partner(
  p_run_startdatum DATE
)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_run_startdatum IS NULL THEN
    RETURN 1;
  END IF;

  RETURN LEAST(60, GREATEST(1, (CURRENT_DATE - p_run_startdatum)::INT + 1));
END;
$$;

-- ============================================================
-- Hoofd-RPC: partner_overview_voor_sponsor
--
-- Returnt directe partners + 2e laag voor een sponsor.
-- SECURITY DEFINER zodat sponsor alleen geaggregeerde velden
-- ziet (geen prospect-namen, geen Mentor-gesprekken).
-- ============================================================

CREATE OR REPLACE FUNCTION partner_overview_voor_sponsor(
  p_sponsor_id UUID
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  role TEXT,
  modus TEXT,
  huidige_dag INT,
  laatst_gezien_uren INT,
  taken_voltooid_pct INT,
  is_directe_partner BOOLEAN,
  via_partner_naam TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Toegangscheck: sponsor moet zichzelf opvragen
  IF auth.uid() IS DISTINCT FROM p_sponsor_id THEN
    RAISE EXCEPTION 'Geen toegang tot andermans partner-overview';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.role::TEXT,
    p.modus::TEXT,
    bereken_huidige_dag_voor_partner(p.run_startdatum::DATE),
    CASE
      WHEN COALESCE(p.presence_zichtbaar, false) = true AND p.last_seen_at IS NOT NULL
      THEN GREATEST(0, EXTRACT(EPOCH FROM (now() - p.last_seen_at))::INT / 3600)
      ELSE NULL
    END,
    bereken_taken_voltooid_pct(p.id, 7),
    true,
    NULL::TEXT
  FROM profiles p
  WHERE p.sponsor_id = p_sponsor_id

  UNION ALL

  SELECT
    p2.id,
    p2.full_name,
    p2.role::TEXT,
    p2.modus::TEXT,
    bereken_huidige_dag_voor_partner(p2.run_startdatum::DATE),
    CASE
      WHEN COALESCE(p2.presence_zichtbaar, false) = true AND p2.last_seen_at IS NOT NULL
      THEN GREATEST(0, EXTRACT(EPOCH FROM (now() - p2.last_seen_at))::INT / 3600)
      ELSE NULL
    END,
    bereken_taken_voltooid_pct(p2.id, 7),
    false,
    p1.full_name
  FROM profiles p2
  JOIN profiles p1 ON p2.sponsor_id = p1.id
  WHERE p1.sponsor_id = p_sponsor_id
    AND p2.id != p_sponsor_id
  LIMIT 50;
END;
$$;

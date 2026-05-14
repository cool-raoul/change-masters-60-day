-- ============================================================
-- partner_overview_voor_sponsor v2: voegt foto_url toe aan de RPC-output
-- zodat PartnerCheckEmbed avatars kan tonen zonder extra round-trip.
-- ============================================================

DROP FUNCTION IF EXISTS partner_overview_voor_sponsor(uuid);

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
  via_partner_naam TEXT,
  foto_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
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
    NULL::TEXT,
    p.foto_url
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
    p1.full_name,
    p2.foto_url
  FROM profiles p2
  JOIN profiles p1 ON p2.sponsor_id = p1.id
  WHERE p1.sponsor_id = p_sponsor_id
    AND p2.id != p_sponsor_id
  LIMIT 50;
END;
$$;

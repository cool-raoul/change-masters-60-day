-- ============================================================
-- herinneringen.voltooid_op — tijdstip waarop herinnering werd
-- voltooid. Nodig voor de momentum-radar auto-detect: prospects
-- waarvan een herinnering VANDAAG is voltooid, vallen automatisch
-- weg uit de radar-lijst (member heeft er al actie op ondernomen).
--
-- Plus trigger die 'm automatisch zet bij elke voltooi-update zodat
-- bestaande code-paden niet hoeven worden aangepast.
-- ============================================================

ALTER TABLE herinneringen ADD COLUMN IF NOT EXISTS voltooid_op TIMESTAMPTZ;

-- Backfill: oude voltooide herinneringen krijgen voltooid_op = NOW().
-- Niet perfect (we weten echte voltooi-tijd niet) maar voor pilot
-- voldoende. Auto-detect kijkt naar voltooid_op::date = today, dus
-- oude herinneringen tellen dan niet meer mee voor vandaag's radar.
-- Daarom backfillen we 'm op een DATUM IN HET VERLEDEN.
UPDATE herinneringen
SET voltooid_op = NOW() - INTERVAL '1 year'
WHERE voltooid = true AND voltooid_op IS NULL;

-- Trigger: zet voltooid_op automatisch bij elke voltooi-update.
CREATE OR REPLACE FUNCTION set_herinnering_voltooid_op() RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Bij INSERT met voltooid=true OF bij UPDATE van voltooid=false naar true:
  -- zet voltooid_op = NOW().
  IF NEW.voltooid = true
     AND (TG_OP = 'INSERT' OR OLD.voltooid IS DISTINCT FROM true) THEN
    NEW.voltooid_op = NOW();
  -- Bij UPDATE waar voltooid teruggezet wordt naar false: reset voltooid_op.
  ELSIF NEW.voltooid = false AND TG_OP = 'UPDATE' THEN
    NEW.voltooid_op = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_herinnering_voltooid_op_trigger ON herinneringen;
CREATE TRIGGER set_herinnering_voltooid_op_trigger
  BEFORE INSERT OR UPDATE ON herinneringen
  FOR EACH ROW
  EXECUTE FUNCTION set_herinnering_voltooid_op();

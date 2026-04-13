-- =============================================
-- CHANGE MASTERS — MIGRATIE V2
-- Voer dit SQL uit in Supabase → SQL Editor
-- =============================================

-- 1. Update pipeline_fase CHECK constraint (nieuwe fases: prospect, one_pager, not_yet, shopper, member)
-- Verwijder de oude constraint en voeg een nieuwe toe

ALTER TABLE prospects
  DROP CONSTRAINT IF EXISTS prospects_pipeline_fase_check;

ALTER TABLE prospects
  ADD CONSTRAINT prospects_pipeline_fase_check
  CHECK (pipeline_fase IN (
    'prospect',
    'uitgenodigd',
    'one_pager',
    'presentatie',
    'followup',
    'not_yet',
    'shopper',
    'member'
  ));

-- 2. Zet bestaande prospects met oude fases over naar nieuwe namen
UPDATE prospects SET pipeline_fase = 'prospect' WHERE pipeline_fase = 'lead';
UPDATE prospects SET pipeline_fase = 'shopper' WHERE pipeline_fase = 'klant';
UPDATE prospects SET pipeline_fase = 'member' WHERE pipeline_fase = 'partner';

-- 3. Update product bestelling trigger: 3 herinneringen i.p.v. 1
-- (21 dagen, 51 dagen, 81 dagen na bestelling)

CREATE OR REPLACE FUNCTION maak_product_herinnering()
RETURNS TRIGGER AS $$
DECLARE
  prospect_naam text;
BEGIN
  SELECT volledige_naam INTO prospect_naam
  FROM prospects WHERE id = NEW.prospect_id;

  -- Herinnering 1: 21 dagen na bestelling (eerste herbestelling check)
  INSERT INTO herinneringen (
    user_id, prospect_id, herinnering_type, titel, beschrijving, vervaldatum
  ) VALUES (
    NEW.user_id,
    NEW.prospect_id,
    'product_herbestelling',
    'Herbestelling check #1 — ' || prospect_naam,
    'Check in voor de tweede bestelling. Eerste bestelling was op ' || TO_CHAR(NEW.besteldatum, 'DD-MM-YYYY') || '.',
    NEW.besteldatum + INTERVAL '21 days'
  );

  -- Herinnering 2: 51 dagen na bestelling (derde maand check)
  INSERT INTO herinneringen (
    user_id, prospect_id, herinnering_type, titel, beschrijving, vervaldatum
  ) VALUES (
    NEW.user_id,
    NEW.prospect_id,
    'product_herbestelling',
    'Herbestelling check #2 — ' || prospect_naam,
    'Opvolging derde maand. Eerste bestelling was op ' || TO_CHAR(NEW.besteldatum, 'DD-MM-YYYY') || '.',
    NEW.besteldatum + INTERVAL '51 days'
  );

  -- Herinnering 3: 81 dagen na bestelling (vierde maand check)
  INSERT INTO herinneringen (
    user_id, prospect_id, herinnering_type, titel, beschrijving, vervaldatum
  ) VALUES (
    NEW.user_id,
    NEW.prospect_id,
    'product_herbestelling',
    'Herbestelling check #3 — ' || prospect_naam,
    'Langetermijn opvolging. Eerste bestelling was op ' || TO_CHAR(NEW.besteldatum, 'DD-MM-YYYY') || '.',
    NEW.besteldatum + INTERVAL '81 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hermaak de trigger (functie is hierboven al ververst)
DROP TRIGGER IF EXISTS na_product_bestelling ON product_bestellingen;
CREATE TRIGGER na_product_bestelling
  AFTER INSERT ON product_bestellingen
  FOR EACH ROW EXECUTE FUNCTION maak_product_herinnering();

-- 4. Voeg notificatie_email en resend_api_key toe aan profiles (als nog niet aanwezig)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notificatie_email text,
  ADD COLUMN IF NOT EXISTS resend_api_key text;

-- Klaar! De volgende wijzigingen zijn doorgevoerd:
-- ✓ Pipeline fases bijgewerkt (prospect, one_pager, not_yet, shopper, member)
-- ✓ Bestaande records gemigreerd (lead→prospect, klant→shopper, partner→member)
-- ✓ Product bestelling trigger maakt nu 3 herinneringen (21, 51, 81 dagen)
-- ✓ notificatie_email en resend_api_key kolommen toegevoegd aan profiles

-- ============================================================
-- Founder-rol toevoegen aan profiles.role check constraint
--
-- De oorspronkelijke leider-rol.sql migration introduceerde rollen 'lid'
-- en 'leider' (top-of-tree). Voor het Films-CMS hebben we een derde rol
-- nodig: 'founder' = de hoofdbeheerder van het hele systeem (Raoul).
--
-- 'founder' onderscheidt zich van 'leider' doordat alleen de founder
-- film-content beheert die voor IEDEREEN in het systeem zichtbaar wordt
-- (via /instellingen/films). Leiders kunnen later in fase 2 ook film-
-- rechten krijgen voor hun eigen team — voor nu één centrale beheerder.
--
-- Idempotent — veilig opnieuw te runnen.
-- ============================================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('lid', 'leider', 'founder'));

-- Zet de user die op de top van de stamboom staat (sponsor_id IS NULL)
-- standaard op 'founder' als er nog geen founder is. Dit voorkomt dat
-- het systeem zonder beheerder zit.
-- We doen dit voorzichtig: alleen als er nog GEEN enkele founder bestaat.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'founder') THEN
    -- Pak één leider zonder sponsor (top van stamboom) — deterministisch op
    -- created_at zodat we steeds dezelfde kiezen.
    UPDATE profiles
    SET role = 'founder'
    WHERE id = (
      SELECT id FROM profiles
      WHERE role = 'leider' AND sponsor_id IS NULL
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
END $$;

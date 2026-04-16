-- Zet alle gebruikers zonder sponsor (= top van de stamboom) op 'leider'
UPDATE profiles
SET role = 'leider'
WHERE sponsor_id IS NULL;

-- Zorg dat toekomstige registraties zonder sponsor ook leider worden
-- (pas de trigger aan zodat sponsor_id IS NULL → role = 'leider')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  sponsor_uuid uuid;
  nieuwe_rol text;
BEGIN
  -- Lees sponsor_id uit metadata (nieuwe stijl) of invited_by (oud)
  sponsor_uuid := NULLIF(NEW.raw_user_meta_data->>'sponsor_id', '')::uuid;
  IF sponsor_uuid IS NULL THEN
    sponsor_uuid := NULLIF(NEW.raw_user_meta_data->>'invited_by', '')::uuid;
  END IF;

  -- Geen sponsor = leider (top van stamboom), anders gewoon lid
  IF sponsor_uuid IS NULL THEN
    nieuwe_rol := 'leider';
  ELSE
    nieuwe_rol := 'lid';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, sponsor_id, invited_by, taal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    nieuwe_rol,
    sponsor_uuid,
    sponsor_uuid,
    COALESCE(NEW.raw_user_meta_data->>'taal', 'nl')
  );
  RETURN NEW;
END;
$$;

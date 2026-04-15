-- =============================================
-- STAMBOOM FIX — voer uit in Supabase SQL Editor
-- =============================================

-- 1. Zorg dat sponsor_id kolom bestaat (was al aangemaakt, maar voor zekerheid)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sponsor_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_sponsor_id ON profiles(sponsor_id);

-- 2. Update de trigger zodat nieuwe registraties via uitnodigingslink direct sponsor_id krijgen
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
  )
  ON CONFLICT (id) DO UPDATE SET
    sponsor_id = EXCLUDED.sponsor_id,
    taal = EXCLUDED.taal;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS: leiders mogen ook sponsor_id van teamleden lezen
DROP POLICY IF EXISTS "Leiders lezen teamleden" ON profiles;
CREATE POLICY "Leiders lezen teamleden" ON profiles
  FOR SELECT USING (true);

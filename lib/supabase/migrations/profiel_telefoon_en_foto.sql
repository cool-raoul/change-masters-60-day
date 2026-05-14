-- ============================================================
-- Profiel-uitbreiding: telefoon (registratie + bewerkbaar) + foto_url
--
-- 1. profiles.telefoon bestaat al (uit partner_mijlpalen-migratie),
--    maar de signup-trigger pakt 'm niet op. Wij breiden handle_new_user()
--    uit om raw_user_meta_data->>'telefoon' over te nemen.
-- 2. profiles.foto_url voor zelf-gekozen avatar (Supabase Storage URL).
-- 3. Supabase Storage bucket 'profile-photos' met RLS-policies zodat:
--    - publiek leesbaar (avatar's worden in app overal getoond)
--    - alleen eigenaar mag uploaden / overschrijven / verwijderen
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS foto_url TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  sponsor_uuid uuid;
BEGIN
  -- Lees sponsor_id uit metadata (nieuwe stijl) of invited_by (oud)
  sponsor_uuid := NULLIF(NEW.raw_user_meta_data->>'sponsor_id', '')::uuid;
  IF sponsor_uuid IS NULL THEN
    sponsor_uuid := NULLIF(NEW.raw_user_meta_data->>'invited_by', '')::uuid;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, sponsor_id, invited_by, taal, telefoon)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'lid'),
    sponsor_uuid,
    sponsor_uuid,
    COALESCE(NEW.raw_user_meta_data->>'taal', 'nl'),
    NULLIF(NEW.raw_user_meta_data->>'telefoon', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    sponsor_id = EXCLUDED.sponsor_id,
    taal = EXCLUDED.taal,
    telefoon = COALESCE(EXCLUDED.telefoon, profiles.telefoon);

  RETURN NEW;
END;
$function$;

-- ============================================================
-- Supabase Storage: bucket profile-photos
--
-- Publiek leesbaar (avatars zijn niet vertrouwelijk en moeten snel
-- laden). Alleen eigenaar mag uploaden — RLS via storage.objects.
-- Owner-path-conventie: profile-photos/{user_id}/avatar.{ext}
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "eigen_foto_insert" ON storage.objects;
CREATE POLICY "eigen_foto_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "eigen_foto_update" ON storage.objects;
CREATE POLICY "eigen_foto_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "eigen_foto_delete" ON storage.objects;
CREATE POLICY "eigen_foto_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "fotos_publiek_lezen" ON storage.objects;
CREATE POLICY "fotos_publiek_lezen"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

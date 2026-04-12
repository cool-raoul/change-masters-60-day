-- ==============================================
-- MIGRATIE: Team structuur (invited_by) + Taal
-- Voer dit uit in Supabase SQL Editor
-- ==============================================

-- 1. Voeg invited_by kolom toe aan profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Voeg taal kolom toe aan profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS taal text NOT NULL DEFAULT 'nl';

-- 3. Update de trigger functie zodat invited_by automatisch wordt ingevuld
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  uitnodiger_id uuid;
BEGIN
  uitnodiger_id := NULLIF(NEW.raw_user_meta_data->>'invited_by', '')::uuid;

  INSERT INTO public.profiles (id, full_name, email, role, invited_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'lid'),
    uitnodiger_id
  );

  -- Automatisch team_members koppeling maken als er een uitnodiger is
  IF uitnodiger_id IS NOT NULL THEN
    INSERT INTO public.team_members (leider_id, lid_id, uitgenodigd_op, toegetreden_op)
    VALUES (uitnodiger_id, NEW.id, now(), now())
    ON CONFLICT (leider_id, lid_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS policy zodat je teamleden hun profiel kunt lezen (via invited_by)
-- Verwijder oude policies als ze bestaan
DROP POLICY IF EXISTS "Leiders lezen teamleden" ON profiles;

-- Nieuwe policy: je kunt profielen lezen van iedereen in jouw downline
CREATE POLICY "Lezen van teamleden in downline" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR invited_by = auth.uid()
    OR id IN (
      SELECT p2.id FROM profiles p2
      WHERE p2.invited_by IN (
        SELECT p3.id FROM profiles p3 WHERE p3.invited_by = auth.uid()
      )
    )
    OR id IN (
      SELECT p2.id FROM profiles p2
      WHERE p2.invited_by IN (
        SELECT p3.id FROM profiles p3
        WHERE p3.invited_by IN (
          SELECT p4.id FROM profiles p4 WHERE p4.invited_by = auth.uid()
        )
      )
    )
  );

-- 5. Index voor snelle lookups op invited_by
CREATE INDEX IF NOT EXISTS profiles_invited_by_idx ON profiles(invited_by);

-- Add premium_tot to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_tot date;

-- Create coach_gebruik table to track daily usage
CREATE TABLE IF NOT EXISTS coach_gebruik (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  datum date NOT NULL DEFAULT CURRENT_DATE,
  berichten_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, datum)
);

ALTER TABLE coach_gebruik ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Eigen gebruik zien" ON coach_gebruik
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Eigen gebruik aanmaken" ON coach_gebruik
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Eigen gebruik bijwerken" ON coach_gebruik
  FOR UPDATE USING (auth.uid() = user_id);

-- Leider (admin) can read all usage
CREATE POLICY IF NOT EXISTS "Leider ziet gebruik" ON coach_gebruik
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'leider')
  );

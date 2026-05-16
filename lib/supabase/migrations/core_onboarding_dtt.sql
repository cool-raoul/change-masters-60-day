-- ============================================================
-- Core-onboarding state-laag
-- 1. onboarding_voltooiingen: cross-modus completion-tracking
-- 2. profiles.core_dtt: JSONB met Doel-Tijd-Termijn-antwoorden
-- 3. profiles.core_eigen_resultaat: boolean voor pre-post vs 21-post-vertakking
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_slug TEXT NOT NULL,
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  modus_waarin TEXT NOT NULL CHECK (modus_waarin IN ('sprint', 'core', 'pro')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, item_slug)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_voltooiingen_user
  ON onboarding_voltooiingen (user_id);

ALTER TABLE onboarding_voltooiingen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_onboarding_select" ON onboarding_voltooiingen;
CREATE POLICY "eigen_onboarding_select"
  ON onboarding_voltooiingen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_onboarding_insert" ON onboarding_voltooiingen;
CREATE POLICY "eigen_onboarding_insert"
  ON onboarding_voltooiingen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DTT-velden op profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_dtt JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_eigen_resultaat BOOLEAN;

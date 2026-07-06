-- Leer-lus van het Mentor-brein (blok 4, akkoord Raoul 2026-07-06):
-- elke door de Mentor geleverde post/reel wordt vastgelegd, zodat de
-- Mentor er later op kan terugkomen ("kreeg je post reacties?") en
-- goed scorende posts (na founder-akkoord) voorbeelden kunnen worden.
CREATE TABLE IF NOT EXISTS mentor_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gesprek_id uuid REFERENCES ai_gesprekken(id) ON DELETE SET NULL,
  taak text NOT NULL DEFAULT 'post',
  tekst text NOT NULL,
  codewoord text,
  reacties_score text CHECK (reacties_score IN ('geen', 'weinig', 'veel')),
  score_notitie text,
  als_voorbeeld boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mentor_posts_user_idx
  ON mentor_posts(user_id, created_at DESC);

ALTER TABLE mentor_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mentor_posts_eigen ON mentor_posts;
CREATE POLICY mentor_posts_eigen ON mentor_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

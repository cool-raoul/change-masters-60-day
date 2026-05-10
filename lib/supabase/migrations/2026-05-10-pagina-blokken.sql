-- ============================================================
-- pagina_blokken: founder-bewerkbare media-blokken op 5 vaste
-- posities per pagina (sprint-dag, core-stap).
--
-- Eén rij per blok. Volgorde-veld voor sortering binnen positie.
-- inhoud-jsonb verschilt per type:
--   video       { url, titel?, bron: 'vimeo' | 'youtube' }
--   afbeelding  { titel?, alt, breedte?, hoogte? }
--   pdf         { titel, beschrijving?, bestandsnaam }
-- storage_pad: alleen bij upload-types (afbeelding/pdf).
-- ============================================================

CREATE TABLE IF NOT EXISTS pagina_blokken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina_namespace text NOT NULL,
  pagina_id text NOT NULL,
  positie text NOT NULL,
  volgorde int NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('video', 'afbeelding', 'pdf')),
  inhoud jsonb NOT NULL,
  storage_pad text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pagina_blokken_lookup
  ON pagina_blokken (pagina_namespace, pagina_id, positie, volgorde);

-- Row Level Security
ALTER TABLE pagina_blokken ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lezen voor iedereen" ON pagina_blokken;
CREATE POLICY "lezen voor iedereen"
  ON pagina_blokken FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "schrijven door founders" ON pagina_blokken;
CREATE POLICY "schrijven door founders"
  ON pagina_blokken FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- updated_at automatisch bijwerken
CREATE OR REPLACE FUNCTION pagina_blokken_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pagina_blokken_updated_at_trigger ON pagina_blokken;
CREATE TRIGGER pagina_blokken_updated_at_trigger
  BEFORE UPDATE ON pagina_blokken
  FOR EACH ROW
  EXECUTE FUNCTION pagina_blokken_updated_at();

-- Storage bucket aanmaken (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pagina-media', 'pagina-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: founders mogen uploaden, iedereen mag downloaden via signed URL
DROP POLICY IF EXISTS "lezen pagina-media" ON storage.objects;
CREATE POLICY "lezen pagina-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pagina-media');

DROP POLICY IF EXISTS "uploaden pagina-media door founders" ON storage.objects;
CREATE POLICY "uploaden pagina-media door founders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pagina-media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

DROP POLICY IF EXISTS "verwijderen pagina-media door founders" ON storage.objects;
CREATE POLICY "verwijderen pagina-media door founders"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pagina-media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

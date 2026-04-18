-- Handmatige volgorde binnen een pipeline-kolom.
-- Default 0 zodat bestaande prospects allemaal dezelfde waarde hebben; wordt
-- pas relevant zodra iemand een kaart verplaatst. Lagere waarde = hoger in
-- de kolom. Per kolom onafhankelijk (we sorteren alleen binnen een fase).
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS pipeline_volgorde integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline_volgorde ON prospects(pipeline_fase, pipeline_volgorde);

-- Actief-status voor prospects.
-- Member/shopper die niet meer actief bestelt kan op niet-actief gezet worden.
-- Niet-actieve prospects zakken naar onderaan de namenlijst en pipeline-kolom.
-- Default true zodat alle bestaande prospects actief blijven.
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS actief boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_prospects_actief ON prospects(actief);

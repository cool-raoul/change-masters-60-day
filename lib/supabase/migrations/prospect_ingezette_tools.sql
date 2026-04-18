-- Ingezette tools/media per prospect (one pager, presentatie, darmvragenlijst, enz.)
-- Opgeslagen als text[] zodat de lijst makkelijk uit te breiden is zonder schema-wijziging.
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS ingezette_tools text[] NOT NULL DEFAULT '{}';

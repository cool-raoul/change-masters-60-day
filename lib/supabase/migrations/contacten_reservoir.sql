-- ============================================================
-- contacten_reservoir — ELEVA-geheugen voor geüploade contacten
--
-- Idee: member uploadt 1× zijn telefoon-adresboek (bv. 2000 contacten),
-- die landen ALLEMAAL in dit reservoir. Op /namenlijst staan ze NIET
-- standaard — daar staan alleen "actieve prospects" (de huidige
-- prospects-tabel). Member kiest stapsgewijs welke contacten 'ie wil
-- activeren naar de actieve namenlijst (= insert in prospects).
--
-- Voordeel: niet steeds opnieuw uploaden. Het reservoir blijft beschikbaar,
-- en groeit in de tijd. Member werkt rustig met een handvol actieve namen
-- per dag, terwijl de hele voorraadkast veilig op de achtergrond staat.
--
-- Geactiveerde rows krijgen prospect_id ingevuld zodat we de link
-- behouden — handig voor toekomstige features (bv. 'wie is uit reservoir
-- geactiveerd?', stats, undo).
-- ============================================================

CREATE TABLE IF NOT EXISTS contacten_reservoir (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volledige_naam text NOT NULL,
  telefoon text,
  bron text NOT NULL DEFAULT 'vcard', -- 'vcard' | 'contact-picker' | 'handmatig'
  -- Activatie: zodra een reservoir-row wordt geactiveerd, maken we een
  -- prospect aan en vullen we deze velden in. Niet-geactiveerde rows
  -- blijven 'sluimerend'.
  geactiveerd boolean NOT NULL DEFAULT false,
  geactiveerd_op timestamptz,
  prospect_id uuid REFERENCES prospects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexen voor de twee meest gebruikte queries:
--   1. Toon mijn niet-geactiveerde reservoir-contacten (kiezer-UI)
--   2. Snel checken of contact al in reservoir staat (dedup bij upload)
CREATE INDEX IF NOT EXISTS idx_contacten_reservoir_user_geactiveerd
  ON contacten_reservoir(user_id, geactiveerd);
CREATE INDEX IF NOT EXISTS idx_contacten_reservoir_dedup
  ON contacten_reservoir(user_id, lower(volledige_naam), telefoon);

-- RLS: members zien en bewerken alleen hun eigen reservoir.
ALTER TABLE contacten_reservoir ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Eigen reservoir lezen" ON contacten_reservoir;
CREATE POLICY "Eigen reservoir lezen" ON contacten_reservoir
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Eigen reservoir invoegen" ON contacten_reservoir;
CREATE POLICY "Eigen reservoir invoegen" ON contacten_reservoir
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Eigen reservoir wijzigen" ON contacten_reservoir;
CREATE POLICY "Eigen reservoir wijzigen" ON contacten_reservoir
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Eigen reservoir verwijderen" ON contacten_reservoir;
CREATE POLICY "Eigen reservoir verwijderen" ON contacten_reservoir
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- mentor_kennis_supplementen: founder-bewerkbare interne kennisbank
-- met aandoening-naar-supplement-koppelingen.
--
-- Bron: 2017-CSV met jaren product-ervaring + adviezen Dr. Dwight McKee.
-- LET OP: deze data is GEVOELIG en mag nooit publiek worden. RLS staat
-- daarom op founder-only. ELEVA Mentor zal pas regels gebruiken NA
-- founder-validatie (gevalideerd=true), en alleen via claim-vrije
-- formuleringen — nooit ziekenamen direct in publieke output.
-- ============================================================

CREATE TABLE IF NOT EXISTS mentor_kennis_supplementen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Originele CSV-term (bv. "Borstkanker", "Acne"). Voor founder-context.
  oorspronkelijke_term text NOT NULL,
  -- Genormaliseerde zoekterm (lowercase, voor matching). Founder kan
  -- synoniemen toevoegen via aparte synoniemen-kolom later.
  zoekterm text NOT NULL,
  -- Tekst-advies voor de basis-ondersteuning (vervangen 1,2,3 →
  -- Daily BioBasics + Proanthenols + OmeGold). Geen codes meer.
  basis_advies text,
  -- Aanvullende producten als array (bv. ["Brain Formula", "Discovery"]).
  aanvullende_producten text[] DEFAULT '{}',
  -- Optionele leefstijl-tip uit kolom 3 (bv. "vaak door laag B12").
  leefstijl_tip text,
  -- Originele rauwe rij-tekst voor founder-referentie.
  rauwe_bron_tekst text,
  -- Bron-jaar voor leeftijdscheck (2017 = ongevalideerd default).
  bron_jaar int NOT NULL DEFAULT 2017,
  -- Validatie-flag: ELEVA Mentor mag een regel pas gebruiken na deze
  -- aanvinken door een founder.
  gevalideerd boolean NOT NULL DEFAULT false,
  gevalideerd_door uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  gevalideerd_op timestamptz,
  -- Founder-aantekeningen tijdens validatie (bv. "vervang Iron Plus
  -- door huidige variant", "deze niet meer relevant").
  notitie text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_kennis_zoekterm
  ON mentor_kennis_supplementen (zoekterm);
CREATE INDEX IF NOT EXISTS idx_mentor_kennis_gevalideerd
  ON mentor_kennis_supplementen (gevalideerd);

-- RLS: ALLEEN founders mogen lezen, schrijven, valideren. Members,
-- testers, leiders krijgen NIETS te zien (te gevoelig).
ALTER TABLE mentor_kennis_supplementen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alleen founders" ON mentor_kennis_supplementen;
CREATE POLICY "alleen founders"
  ON mentor_kennis_supplementen FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- updated_at-trigger
CREATE OR REPLACE FUNCTION mentor_kennis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mentor_kennis_updated_at_trigger
  ON mentor_kennis_supplementen;
CREATE TRIGGER mentor_kennis_updated_at_trigger
  BEFORE UPDATE ON mentor_kennis_supplementen
  FOR EACH ROW
  EXECUTE FUNCTION mentor_kennis_updated_at();

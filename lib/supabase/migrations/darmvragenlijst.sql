-- ============================================================
-- Darmvragenlijst-uitslag op productadvies_tests
--
-- De darmvragenlijst is een korte vervolgvragenlijst (15 vragen) die
-- prospects kunnen invullen vanaf hun resultaatpagina. Iedereen krijgt
-- een advies — onder de 20 punten Darmen in Balans (basis), 20+ Plus.
--
-- Privacy-by-design: alleen de bucket-uitkomst wordt opgeslagen
-- ("basis" / "plus"), niet de individuele antwoorden.
-- ============================================================

ALTER TABLE productadvies_tests
  ADD COLUMN IF NOT EXISTS darmvragenlijst_uitslag JSONB,
  ADD COLUMN IF NOT EXISTS darmvragenlijst_ingevuld_op TIMESTAMPTZ;

COMMENT ON COLUMN productadvies_tests.darmvragenlijst_uitslag IS
  'Bucket-uitkomst van de optionele darmvragenlijst: { bucket: "basis" | "plus", totaal: number, max: number, advies_pakket_key: string }. Geen individuele antwoorden om privacy-redenen.';

COMMENT ON COLUMN productadvies_tests.darmvragenlijst_ingevuld_op IS
  'Tijdstip waarop de prospect de darmvragenlijst heeft afgerond.';

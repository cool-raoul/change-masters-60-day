-- ============================================================
-- prospect_situatie_kort, korte situatie-zin voor 3-weg-script
--
-- Achtergrond: het 3-weg-gesprek-script gebruikt een [situatie]-
-- placeholder in stap 2 ("Ze is op zoek naar [situatie]"). Tot nu
-- toe werd daar het volledige notities-veld in geplakt, met als
-- gevolg rare zinnen zoals "Ze is op zoek naar 45 jaar, zoekt
-- meer energie, bekend van lagere school..." (de aantekeningen
-- als geheel).
--
-- Dit veld is een KORT, los situatie-veldje, bedoeld voor 3-weg-
-- gebruik. Member vult bv. "meer energie en financiële vrijheid"
-- en dat is dan wat de prospect in het 3-weg-script terugleest.
--
-- Veld blijft NULL voor bestaande prospects, member vult zelf in
-- of klikt op de AI-samenvat-knop bij het bewerken van de prospect.
-- ============================================================

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS situatie_kort TEXT;

COMMENT ON COLUMN prospects.situatie_kort IS
  'Korte situatie-zin voor 3-weg-script ([situatie]-placeholder). Member-bewerkbaar, blijft NULL als niet ingevuld.';

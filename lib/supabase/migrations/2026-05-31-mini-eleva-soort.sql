-- ============================================================
-- Mini-ELEVA: soort-veld op uitnodigingen (2026-05-31).
--
-- Member kiest bij het aanmaken van een uitnodiging of die voor
-- de product-kant is of voor business + product. Default 'business'
-- voor backward-compat met bestaande uitnodigingen.
--
-- Filtering:
--   product  → landing toont geen business-module, FAQ verbergt
--              business-sectie, verhalen verbergt business-thema,
--              /business-route blokkeert binnenkomst, Mentor weigert
--              vriendelijk business-vragen.
--   business → alles zichtbaar, beide kanten kunnen verkend worden.
-- ============================================================

ALTER TABLE prospect_invitations
  ADD COLUMN IF NOT EXISTS soort TEXT NOT NULL DEFAULT 'business'
    CHECK (soort IN ('product', 'business'));

COMMENT ON COLUMN prospect_invitations.soort IS
  'product = prospect uitgenodigd voor product/programma kant. business = uitgenodigd voor opportunity + product (beide zichtbaar).';

-- FORM-context per prospect: Family, Occupation, Recreation, Money.
-- Door de Mentor genoteerd tijdens gesprekken (wanneer er een prospect in
-- context is), zichtbaar op de prospect-kaart. Additief, raakt bestaande
-- data niet. RLS op prospects (user-only) dekt deze kolom automatisch.

alter table public.prospects
  add column if not exists form_context jsonb;

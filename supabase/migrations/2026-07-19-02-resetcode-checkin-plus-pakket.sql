-- Feedback Raoul 19 juli:
-- 1. Check-in uitgebreider: naast stemming + gewicht ook energie,
--    slaap en buik-gevoel (allemaal tik-keuzes, geen typwerk).
-- 2. Darmen in Balans heeft twee pakketten (basis = rode schema,
--    5 producten; plus = blauwe schema, 8 producten). De klant kiest
--    het pakket, de Mentor antwoordt dan pakket-specifiek.

alter table public.resetcode_checkin
  add column if not exists energie text check (energie in ('weinig', 'oke', 'veel')),
  add column if not exists slaap text check (slaap in ('slecht', 'oke', 'goed')),
  add column if not exists buik text check (buik in ('onrustig', 'oke', 'rustig'));

alter table public.resetcode_klant_links
  add column if not exists pakket text check (pakket in ('basis', 'plus'));

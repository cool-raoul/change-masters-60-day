-- Welkomstfilm-bucket: maximale bestandsgrootte verhoogd van 200 MB naar
-- 250 MB, zodat een grensgeval-opname (bv. 197 MB van een telefoon) ruim
-- binnen de limiet valt. De app-kant (WelkomstfilmKiezer, MAX_BYTES) is in
-- dezelfde stap meegehoogd.
--
-- Al toegepast op productie op 2026-06-24.

update storage.buckets
set file_size_limit = 262144000 -- 250 * 1024 * 1024
where id = 'welkomstfilms';

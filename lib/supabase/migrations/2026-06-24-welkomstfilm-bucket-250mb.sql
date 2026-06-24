-- Welkomstfilm-bucket: maximale bestandsgrootte op 250 MB gezet (was 200 MB).
--
-- LET OP: dit is alleen de PER-BUCKET limiet. Op het free plan begrenst
-- Supabase project-breed op 50 MB (config/storage fileSizeLimit = 52428800),
-- en dat kan niet omhoog zonder upgrade naar een betaald plan. Daarom is de
-- echte upload-limiet 50 MB; de app (WelkomstfilmKiezer, MAX_BYTES) staat
-- daarom op 50 MB met een verwijzing naar YouTube/Vimeo voor grotere films.
-- De bucket blijft op 250 MB, zodat een eventuele upgrade meteen werkt.
--
-- Al toegepast op productie op 2026-06-24.

update storage.buckets
set file_size_limit = 262144000 -- 250 * 1024 * 1024
where id = 'welkomstfilms';

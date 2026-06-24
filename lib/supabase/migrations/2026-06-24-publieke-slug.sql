-- Leesbare, persoonlijke freebie-link: my-eleva.com/gezonde-start/<woord>.
--
-- Elk lid kan een uniek woord (publieke_slug) kiezen dat naar zijn eigen
-- freebie-token verwijst. De unieke index (case-insensitive) zorgt dat twee
-- leden nooit hetzelfde woord kunnen pakken.
--
-- Al toegepast op productie op 2026-06-24.

alter table freebie_bot_member_tokens
  add column if not exists publieke_slug text;

create unique index if not exists freebie_bot_tokens_publieke_slug_uniq
  on freebie_bot_member_tokens (lower(publieke_slug))
  where publieke_slug is not null;

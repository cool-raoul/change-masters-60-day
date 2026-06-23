-- Informatiefilm voor de freebie "Jouw gezonde start".
--
-- Naast de welkomstfilm (per lid) is er een tweede film: de informatie-/uitleg-
-- film die mensen ná de check te zien krijgen. Die is GLOBAAL en alleen door de
-- founder in te stellen. We bewaren 'm op de token-rij van het default-account
-- (raoulzeewijk@hotmail.com) en lezen die op de bot-pagina voor iedereen.
--
-- Al toegepast op productie op 2026-06-23.

alter table freebie_bot_member_tokens
  add column if not exists informatiefilm_url text,
  add column if not exists informatiefilm_soort text;

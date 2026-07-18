-- Startmoment van de klant (feedback Raoul 19 juli): de klant kiest
-- zelf wanneer dag 1 is (vandaag, morgen of een datum). Alle
-- dag-momenten (check-in, dag 10, einde) tellen vanaf deze datum.
alter table resetcode_klant_links
  add column if not exists start_datum date;

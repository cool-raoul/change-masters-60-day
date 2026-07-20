-- Waakhond-laag op de kennis-lus (Raoul 20 juli: "moet zo waterdicht
-- mogelijk, wij zien de klant-antwoorden niet"). Een tweede AI-check
-- beoordeelt elk klant-antwoord; verdachte antwoorden komen als
-- controle-item op /resetcode-kennis met het gegeven antwoord erbij.
alter table public.resetcode_kennis
  drop constraint if exists resetcode_kennis_bron_check;
alter table public.resetcode_kennis
  add constraint resetcode_kennis_bron_check
  check (bron in ('klant', 'founder', 'controle'));

alter table public.resetcode_kennis
  add column if not exists gegeven_antwoord text,
  add column if not exists controle_reden text;

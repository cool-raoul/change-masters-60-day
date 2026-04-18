-- Beroep-veld toevoegen aan prospects zodat gebruikers per klantkaart
-- het beroep kunnen vastleggen (relevant voor context, scripts, productadvies).
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS beroep text;

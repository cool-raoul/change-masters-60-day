-- Voorproef-afbeelding bij een webinar. Wordt automatisch uit de video
-- gehaald (Vimeo oEmbed of het vaste YouTube-adres) zodra de founder een
-- video-URL opslaat; hij kan er ook zelf een plakken.
--
-- Dubbel doel: op de aanmeldpagina staat niet langer alleen tekst, én
-- WhatsApp en socials tonen het plaatje in de link-preview.
alter table webinars
  add column if not exists thumbnail_url text;

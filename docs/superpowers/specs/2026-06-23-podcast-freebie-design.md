# Podcast-freebie (Sandy) — ontwerp

Datum: 2026-06-23. Status: ONTWERP, wacht op Raoul's go + keuzes.

## Doel
Podcast (Erit & Monique) → Sandy's welkomstfilm → freebie: gegevens + korte
test → darm-kuur-advies (Darm in balans / Darm in balans plus) als laagdrempelige
start (ideaal ook richting de Reset, en makkelijk te plannen rond vakanties),
met de Reset als grotere vervolg-reis. Contact-knop voor persoonlijk advies.

## Architectuur (volgt freebie-bot-architectuur-regel — GEEN eigen tabel/API)
- Nieuwe geregistreerde freebie-bot (slug TBD), `type: "score"`.
- Hergebruikt opt-in/contact/mail-queue/pipeline automatisch.
- Flow gemodelleerd op reset-check: `app/bot/<slug>/[token]/{page.tsx, flow.tsx}`.

## Flow (stappen)
1. Sandy-welkomstfilm (MediaBlokken `teaser`).
2. Gegevens: e-mail + telefoon (VERPLICHT), Instagram + Facebook (optioneel).
3. Korte test: darm-vragen (kern → kuur-score) + doel-vraag + sleutel-profiel
   (geslacht/leeftijd, afval-wens) + medische zelf-check.
4. Uitkomst: darm-kuur (Darm in balans / Darm in balans plus) als start, met de
   Reset als vervolg.
5. Informatie-film (MediaBlokken `verdieping`).
6. Contact-knop (persoonlijk advies).

## Naam + link
- Titel: **"Jouw gezonde start"**. Slug: `jouw-gezonde-start`. GEEN ManyChat-
  trigger-woord nodig (komt via de podcast-link, niet via een comment-trigger).
- **Mooie publieke link** (onder de podcast-video gedeeld): schone redirect-
  pagina `my-eleva.com/jouw-gezonde-start` die doorstuurt naar
  `/bot/jouw-gezonde-start/<token>`. Zelfde patroon als `/reset-check`. Pad in
  middleware-publicRoutes. Token = Sandy's (leads → Sandy's namenlijst);
  wordt gekoppeld zodra Sandy's account + bot-token bestaan (tot dan founder-
  token als placeholder).

## Stem (VERPLICHT)
Alle teksten in de freebie in onze DNA-stem (zie docs/stem-DNA.md +
docs/claimvrije-communicatie.md): warm + krachtig, ik-taal/beleving, geen
em-dashes, geen tijdsbeloftes, geen AI-isms, vrijblijvend. Sandy-perspectief
waar passend (zij heet welkom).

## Vragen
- **Darm (kern, scoort):** hergebruik `lib/zelftest/darm-vragen.ts` (15 vragen,
  drempel 20). Levert de score die het kuur-ADVIES bepaalt (zie Uitkomst).
- **Doel-vraag (nieuw, claimvrij — het is de eigen wens van de prospect, mag):**
  "Wat zou je positief willen veranderen?" (meerkeuze) opties:
  meer energie · afvallen · beter slapen · meer innerlijke rust en balans ·
  fitter & sterker · helderder kunnen denken · meer zin om te sporten ·
  libido · je huid verbeteren · anders (vrij veld).
- **Afval-wens (alleen tonen als 'afvallen' gekozen is):** hoeveel kg (uit
  reset-check). Routeert: tot ~3 kg kan met een darm-kuur; 5 kg of meer →
  de Reset is dan de weg.
- **Profiel:** geslacht + leeftijd (lichte context voor Sandy).
- **Medisch:** reset-check `MEDISCHE_PUNTEN` (zelf-check + disclaimer). Doel:
  contra-indicaties helder krijgen.
- **ANTI-OVERWHELM:** NIET alle 13 reset-score-vragen erbovenop. Darm = de
  scorende kern; een paar gerichte vragen (doel, afval-wens, geslacht/leeftijd).

## AVG (privacy-by-design)
- **Medische antwoorden: WEL opslaan, met 30-dagen-auto-wis** (zelfde patroon
  als reset-check; verifiëren/implementeren). Sandy moet de contra-indicaties
  in het gesprek kunnen zien, zodat de prospect ze niet opnieuw hoeft te
  vertellen. Nooit terug naar de prospect (niet in mail/scherm), alleen
  member-zicht. Na 30 dagen automatisch gewist.
- **Darm:** alleen de uitkomst-bucket + score opslaan (zoals productadvies-
  darmtest), niet de losse antwoorden.
- **Doel + profiel:** in `antwoorden` zoals gebruikelijk.

## Koppeling aan de warm-trigger-funnel (gisteren gebouwd)
- **Lead → namenlijst:** automatisch via `/api/freebie-bot/opt-in` + 🌷-marker.
- **Contact-knop:** `/api/freebie-bot/contact` → `warmNaarOpvolgen` (naar Opvolgen
  + herinnering) + push. AL GEBOUWD.
- **Informatie-film bekeken (na capture):** YouTube-%-tracking (zoals
  prospect-film / mini-eleva-film) → melding + `warmNaarOpvolgen`. NIEUWE
  koppeling in deze freebie.

## Uitkomst-filosofie (Raoul 2026-06-23)
- De darm-kuur is **advies, geen vonnis**. Laag scoren = niet per se nodig,
  wel raadzaam (Darm in balans als zachte start). Hoger (20+) = Darm in balans
  plus. Wie 5 kg+ wil afvallen → de Reset is de weg.
- **Er is altijd een route.** Past geen van beide programma's, dan zijn er
  andere "aanvliegroutes". Juist daarom is persoonlijk meekijken belangrijk →
  de uitkomst leidt warm naar de contact-knop ("Sandy kijkt met je mee").
- Niet prescriptief/streng; warm, claimvrij, vrijblijvend.

## Keuzes (vastgelegd)
1. Titel "Jouw gezonde start", slug `jouw-gezonde-start`, geen trigger-woord. ✓
2. Doel-vraag-opties: zie Vragen. ✓
3. Medisch WEL opslaan + 30-dagen-auto-wis (Sandy ziet contra-indicaties). ✓
4. Uitkomst = advies, darm + Reset-routing + altijd-een-route + persoonlijk. ✓
5. Anti-overwhelm: darm = scorende kern, geen 13 reset-vragen erbij. ✓
6. Mooie link `/jouw-gezonde-start`. ✓
7. Alle teksten in DNA-stem. ✓

## ALGEMEEN + zichtbaarheid + eigen welkomstfilm (update Raoul 2026-06-23)
- **Algemene freebie**, NIET Sandy-only. Normale per-member freebie-bot (eigen
  token per lid). Iedereen kan 'm straks gebruiken.
- **Zichtbaarheid nu beperkt:** alleen founders + Sandy zien 'm in
  /instellingen/mijn-tracking-links. Vrijgave-flag `vrijgegeven` (default false)
  → later op true = voor iedereen. Sandy via een kleine pre-release-allowlist
  (member-id/email) of haar directe token-link.
- **Welkomstfilm = twee lagen:**
  1. **Algemene welkomstfilm** (gedeelde default, voor iedereen die niks eigen
     heeft ingesteld).
  2. **Eigen welkomstfilm per lid:** lid kan de algemene wegklikken en z'n EIGEN
     film **uploaden vanaf de computer** (NIET via YouTube). De algemene blijft
     op de achtergrond bestaan.
- **NIEUW STUK INFRA:** video-upload-vanaf-computer = Supabase Storage-bucket +
  upload-UI + eigen <video>-speler + per-member video-record. Onze huidige
  film-blokken (MediaBlokken) werken met YouTube/Vimeo-URLs, dus dit is apart
  te bouwen.

## Bouw in fasen (na go)
- **Fase 1 (skelet om op te schieten):** de ALGEMENE freebie-flow registreren +
  mooie link + gegevens (e-mail+telefoon verplicht, IG/FB optioneel) + darm-
  vragen + darm-advies-uitkomst (altijd-een-route + Sandy/lid kijkt mee) +
  contact-knop. Zichtbaarheid: founders + Sandy. Welkomstfilm: placeholder-slot
  (komt in fase 2).
- **Fase 2 (de nieuwe infra):** eigen welkomstfilm per lid via MEERDERE opties
  (kostenbewust, Raoul 2026-06-23): YouTube-link + Vimeo-link (gratis
  bandbreedte) + direct uploaden vanaf computer (Supabase Storage, voor wie geen
  YouTube/Vimeo heeft). Zo draagt Supabase alleen de paar directe uploads, niet
  alle views. Plus de algemene default-film + vervangen/wegklikken.
- **Fase 3:** doel-vraag + afval-routing + medische zelf-check (opslaan + 30d-wis)
  + rijkere uitkomst (darm + Reset) + informatie-film + video-watch-trigger.
- **Fase 4:** vrijgave voor iedereen (flag op true).

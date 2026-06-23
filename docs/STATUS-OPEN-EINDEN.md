# Status & open einden

Levende lijst die Claude bijhoudt. Afspraak: nieuw werk komt hier eerst op,
en we maken iets ÉCHT af (gebouwd → getest → bevestigd) voordat we iets
nieuws beginnen. Bijwerken zodra een item van status verandert.

Laatst bijgewerkt: 2026-06-23

---

## ✅ Af + bevestigd door Raoul
- **Mijn freebies in het menu** (weg uit Instellingen)
- **Wachtwoord vergeten** (login → mail → nieuw wachtwoord)
- **Resend-SMTP + ELEVA-herstelmail** (mail komt aan)
- **Omgeving-knop in freebie-mail → direct in Mini-ELEVA** (niet meer login)
- **Project uit OneDrive naar lokale map** (git werkt, npm install ok)

## 🧪 Af + live, NOG TE TESTEN door Raoul
- **Freebie warm-trigger funnel**
  - Productadvies-open-link → prospect met 🌷 + in "Opvolgen" + uitslag op kaart
  - Lichte freebie (reset-check) met alleen e-mail → blijft 🌷 in "Prospect"
  - Telefoonnummer achterlaten → schuift naar "Opvolgen" + herinnering
- **Mini-ELEVA-video** → ~90% gekeken (auto, YouTube) → "Opvolgen" + herinnering + melding
- **Mini-ELEVA-activiteit** (chat/bericht als prospect) → "Opvolgen" + herinnering

## 🔧 Kleine acties voor Raoul (los van bouwen)
- [ ] Supabase access-token intrekken ("ELEVA mail setup")
- [ ] Oude/verkeerde Resend-key weggooien ("ELEVA SMTP 2" laten staan)
- [ ] Herstelmail markeren als "geen ongewenste e-mail" (+ pilot-team vragen)
- [ ] VSCode/Claude Code openen in `C:\Users\raoul\projects\change-masters`; oude OneDrive-map weggooien zodra alles goed voelt

## 🎬 Podcast-funnel (Sandy) — in wording
- **Welkomstfilm-script** gemaakt: `docs/scripts/welkomstfilmpje-sandy.md` (claimvrij, ± 3 min). Wacht op: Sandy vult persoonlijke stukjes in + neemt op.
- **Podcast-freebie "Jouw gezonde start"** (algemene freebie): spec in `docs/superpowers/specs/2026-06-23-podcast-freebie-design.md`.
  - ✅ **Fase 1 GEBOUWD + live** (te testen): mooie link `/jouw-gezonde-start` → flow (welkom-film-slot → gegevens e-mail+tel verplicht, IG/FB optioneel → darm-vragen → advies-uitkomst Darm in Balans / + → contact-knop). Komt in namenlijst + contact-knop = warm-trigger. Nu founder-token als placeholder (later Sandy).
  - ✅ **Fase 2 GEBOUWD + live** (te testen): eigen welkomstfilm per lid via `/instellingen/welkomstfilm` (founders+Sandy) — YouTube/Vimeo-link of upload vanaf computer/telefoon (Supabase Storage, max 200MB). Bot toont eigen film, anders algemene default. Premium freebie-look (crème-goud) staat ook live.
  - ⏳ Fase 3: **doel-vraag** ("wat wil je positief veranderen?" + opties) + **gepersonaliseerde gap-uitkomst** (hun stand → behoefte → wat Reset/Darm hierin biedt, passend bij hun antwoorden, NIET één standaardverhaal) + afval-routing + medische check (opslaan + 30d-wis) + info-film + video-watch-trigger. KEUZE: AI-bot vs vaste claim-vrije blokken (aanbeveling: blokken, zie chat).
  - ⏳ Fase 4: vrijgave voor iedereen (+ zichtbaarheid in tracking-links, nu nog niet zichtbaar voor leden).

## ⏸️ Bewust geparkeerd (geen los eindje, later met opzet)
- **Filter-per-freebie** op de namenlijst ("laat me alleen leads van freebie X zien" + bulk-actie). Spec: docs/superpowers/specs/2026-06-23-freebie-funnel-warm-trigger-design.md
- **Mini-ELEVA video-auto-trigger voor niet-YouTube** (Vimeo e.d.): nu alleen YouTube. Raoul embedt via YouTube, dus geen blokker.

## ❓ Te bevestigen / in de gaten houden
- Deliverability herstelmail naar Outlook/Hotmail: nieuw domein, warmt op met "geen ongewenst"-kliks. Even volgen of het verbetert.

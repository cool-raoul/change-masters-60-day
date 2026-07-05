# Status & open einden

Levende lijst die Claude bijhoudt. Afspraak: nieuw werk komt hier eerst op,
en we maken iets ÉCHT af (gebouwd → getest → bevestigd) voordat we iets
nieuws beginnen. Bijwerken zodra een item van status verandert.

Laatst bijgewerkt: 2026-07-05

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
  - ✅ **Fase 3a GEBOUWD + live** (te testen): doel-vraag (meerkeuze) + afval-wens-routing + **verhalende, gepersonaliseerde uitkomst** (vaste claimvrije blokken, geweven uit hun antwoorden; "wat we vaak zien bij mensen...", voelbare gap, geen ik-proef, geen standaardverhaal). DNA-stem.
  - ✅ **Fase 3b deels GEBOUWD + live** (te testen):
    - Freebie zichtbaar in **Mijn freebies** (founders + Sandy) met de welkomstfilm-instelling in de freebie-kaart (founder = algemene film voor iedereen, leden = eigen film).
    - **Founder-only informatiefilm**: één algemene uitleg-film voor het hele team, ingesteld via Mijn freebies (alleen founder ziet die instelling).
    - **Investerings-vraag** ("Ben je bereid te investeren in je gezondheid?", nee/misschien/altijd) → warm/lauw/koud-signaal in de spiegel-notitie op de prospect-kaart.
    - **Watch-trigger op de informatiefilm** (YouTube/Vimeo/upload): ~90% of einde → prospect naar Opvolgen + herinnering + push naar het lid (eenmalig).
    - **Founder-edit voor álle teksten** (voor iedereen, via "✍️ Founder"-toggle + tekst_overrides): de hele flow (welkom, 15 testvragen, antwoord-schaal, doel-/afval-/investerings-vraag + opties, knoppen, labels, bedankt, footer) ÉN de uitslag-bouwstenen (koppen, herkenning per score, verlangen, social-proof, programma-/reset-zinnen, afsluiter, per-doel-zinnen). Founder-ingang "✏️ Teksten aanpassen" in Mijn freebies; in edit-modus een "Spring naar de uitslag"-knop + bouwsteen-paneel. Werkt voor Raoul + Gaby (beiden founder).
    - **Lage-drempel-flow + AVG**: volgorde omgedraaid (eerst de check, pas daarna naam + e-mail om de uitslag te zien; telefoon pas bij "kijk persoonlijk mee"). AVG-privacyzin onder het formulier + echte **/privacybeleid**-pagina, gelinkt vanuit de freebie. YouTube-embed met rel=0 (geen vreemde filmpjes na afloop).
  - ⏳ Fase 3b rest: medische zelf-check (opslaan + 30-dagen-wis). Privacybeleid: officiële verantwoordelijke + contact-gegevens (bedrijfsnaam/e-mail/evt. KvK) nog door Raoul te bevestigen.
  - ⏳ Fase 4: vrijgave voor iedereen (nu nog founder + Sandy via pre-release-gate).

## 🔁 Generaliseren naar ALLE freebies (Raoul, 2026-06-25)
Alles wat we voor "Jouw gezonde start" maakten moet ook bij de andere freebies kunnen (energie-en-focus, hormonen-en-overgang, reset-check, productadvies). Niet steeds opnieuw tegen hetzelfde aanlopen.
- ✅ **Link-preview + publieke route**: root-default is nu neutraal (geen "aanbevelingsmarketing" meer in previews) en geldt direct voor álle freebies; de flow-pagina's hebben eigen OG. STANDING RULE staat in memory (freebie-publiek-en-preview): nieuwe freebie = publicRoute + eigen OG.
- ⏳ **Leesbare persoonlijke link** (`/<freebie>/<woord>`, slug per lid) — nu alleen `/gezonde-start/<woord>`. Generaliseren naar een gedeeld slug-mechanisme per freebie.
- ⏳ **Founder-edit van álle teksten**, **welkomst-/informatiefilm per lid + founder-algemeen**, **twee uitslag-knoppen (contact + resultaten)**, **officiële disclaimer onderaan**, **terug-navigatie + scroll-naar-boven**: nu alleen in de jouw-gezonde-start-flow. Score-bots/reset-check hebben eigen flows; uitrol vergt per freebie werk of een gedeeld flow-framework. Eerst bepalen: gedeeld framework vs. per-freebie kopiëren. Focus-ronde waard.

## ⏸️ Bewust geparkeerd (geen los eindje, later met opzet)
- **Filter-per-freebie** op de namenlijst ("laat me alleen leads van freebie X zien" + bulk-actie). Spec: docs/superpowers/specs/2026-06-23-freebie-funnel-warm-trigger-design.md
- **Mini-ELEVA video-auto-trigger voor niet-YouTube** (Vimeo e.d.): nu alleen YouTube. Raoul embedt via YouTube, dus geen blokker.

## 🔍 Restpunten uit de Fable-code-review (2026-07-05)
Twee review-agenten hebben al het recente Opus-werk doorgelicht (38 bevindingen).
De 17 belangrijkste zijn DIRECT gefixt en live (commit a93a9fb): eerlijke
foutmeldingen in de hele spraak-flow, contact_type-whitelist, regex-crash,
adviesvraag-is-geen-bestelling, onzichtbaar notities-veld weg, stilte-nudge
modus-bewust (deed niets voor nieuwe leden!), cron fail-closed, e-mail-wildcard-
escaping op publieke freebie-routes, welkomstfilm-URL-allowlist (XSS dicht),
/playbook-preview alleen founder/leider/tester. Rest hieronder, op prioriteit:

**Belangrijk (eerstvolgende fix-ronde):**
- [ ] Ochtend-reminder idempotent maken (kolom `laatste_dagelijkse_push_op`;
      GitHub-retry binnen het uur = nu dubbele mail+push). DB-wijziging, eerst
      akkoord Raoul.
- [ ] Voice: server-side validatie van LLM-acties op één plek (fase-guard op
      álle fase-dragende types, onbekende actie-types niet stil overslaan,
      dubbele namen markeren i.p.v. gokken).
- [ ] Freebie-flow: `vangProspect` heeft geen retry; netwerkfout bij prospect
      = lead stil verloren. Retry bij volgende stap inbouwen.
- [ ] Reminder-mail afzender: `onboarding@resend.dev` (sandbox, levert alleen
      aan key-eigenaar) → `team@mail.my-eleva.com`.
- [ ] Datum-anker "vandaag" overal Europe/Amsterdam i.p.v. UTC (00:00-02:00
      randgevallen in stats/besteldatum/taken + stilte-dagberekening).

**Kleiner (verzamelen tot een onderhoudsronde):**
- [ ] Voice-parse payload snoeien bij grote namenlijsten (alleen fuzzy-
      kandidaten meesturen; scheelt kosten + snelheid).
- [ ] 120s-opnamelimiet tijdens bij-spreken in bewerk-modus overschrijft de
      tekst i.p.v. invoegen.
- [ ] i18n: hele voice-flow + notitieboekje-labels zijn hardcoded NL (app
      ondersteunt 6 talen).
- [ ] ActieKaart stabiele keys (index-keys + bewerk-state kan verkeerde actie
      overschrijven); undo-scope eerlijk benoemen; VoiceFab opsplitsen.
- [ ] sponsor_stilte_pushes upsert-error checken (anders dagelijkse sponsor-
      push bij kapotte guard); film-bekeken dubbel-push race.
- [ ] `veld=info` in welkomstfilm-API founder-check; freebie-tokens via
      crypto i.p.v. Math.random; slug-route rowcount checken.
- [ ] render.tsx (gezonde start): 5-6 sequentiële queries per publieke
      page-view → Promise.all + default-films cachen; default-account-email
      één constante.
- [ ] Afvallen-zinnen in vragen.ts/uitkomst.ts nog eens langs claimvrije-
      communicatie sectie 7 leggen.
- [ ] Verifiëren na deploy: stilte-nudge vuurt nu wél voor een Core-account
      (Jaimie/testaccount) op het ingestelde uur.

## ❓ Te bevestigen / in de gaten houden
- Deliverability herstelmail naar Outlook/Hotmail: nieuw domein, warmt op met "geen ongewenst"-kliks. Even volgen of het verbetert.

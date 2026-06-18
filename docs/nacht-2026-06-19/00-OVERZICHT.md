# Nacht 18→19 juni — overzicht

Goedemorgen Raoul. Hieronder wat ik vannacht heb doorgelicht en gedaan, met
bovenaan de dingen die jouw beslissing vragen. Elke ronde heeft een eigen
rapport in deze map. Veilige fixes heb ik al gedaan + gepusht; alles wat jouw
stem, founder-tekst of de database raakt, heb ik laten staan als voorstel.

## 🔴 EERST DIT — twee pilot-blokkers (uit ronde 4)

1. **Core-members blijven eeuwig op dag 1.** De dag-voortgang leest de oude
   `CORE_DAGEN`-taak-id's, maar /vandaag bewaart de V9-id's. Ze matchen nergens,
   dus een echte recruit komt nooit voorbij dag 1 (founders/testers merken het
   niet → kalender-modus). **Door mij geverifieerd.** Exacte 1-regel-fix +
   test-instructie in `04-brede-audit.md`. Ik heb 'm bewust niet zelf gedeployed
   (dag-voortgang op de live flow, wil ik niet ongetest pushen).
2. **Registratie kan doodlopen** als Supabase "Confirm email" AAN staat. Even
   verifiëren dat 'ie UIT staat + één keer signup end-to-end testen. Details in
   `04-brede-audit.md`.

Beide moeten vóór 1 juli geregeld zijn. Verder is de fundering gezond.

---

## Status van de 4 rondes
- [x] **Ronde 1 — Reset-check funnel** → `01-resetcheck-funnel-audit.md`
- [x] **Ronde 2 — Core 21 dagen pilot-klaar scan** → `02-core-21-dagen.md`
- [x] **Ronde 3 — Em-dashes + AI-isms codebreed** → `03-emdash-ai-isms.md`
- [x] **Ronde 4 — Brede gezondheids-audit** → `04-brede-audit.md`

---

## Belangrijkste punten tot nu toe (ronde 1)

**Al veilig gefixt + gepusht:** dubbele-vangst-guard, lead-niet-kwijt-bij-
tabsluiten (keepalive), mini-ELEVA-aanvraag crasht niet meer bij dubbele kaart,
Stripe-fout-domein hersteld, diagnose-env opgeschoond, comment rechtgetrokken.

**Vraagt jouw beslissing (kort):**
1. **Hoog** — uitkomst-mail + push hangen aan de mail-queue-insert; ontkoppelen
   zodat ze niet stil wegvallen als een migratie achterloopt. (samen)
2. **Midden** — 3 kleine DB-migraties voor race-veiligheid (dubbele kaart /
   dubbele mailreeks / dubbele omgeving voorkomen). (samen)
3. **Midden** — contact-route: telefoonnummer kan stil verloren gaan; minimale
   prospect-kaart aanmaken als die ontbreekt.
4. **Stem/claim-vrij** — tijdsbeloftes in de uitkomst-content (regels 22/56/78
   van content.ts) loskoppelen van het effect. Jouw tekst, dus jouw keuze.

Details + file:regel per punt staan in `01-resetcheck-funnel-audit.md`.

---

## Ronde 2 — Core 21 dagen (samenvatting)

**Goed nieuws:** de Core-content is sterk. Geen em-dashes, geen ChatGPT-isms,
jullie stem zit er goed in. Polish + een paar stap-logica-bugs, geen herbouw.
Ik heb hier **niks** aangepast (jouw tekst). Alles staat per dag in
`02-core-21-dagen.md`.

**Eerst dit (kan een member laten vastlopen):**
1. Sideflows sturen naar "dag 2" terwijl ze pas vanaf dag 14 spelen.
2. Pre-post belooft "over 21 dagen" een seintje, maar het systeem triggert op
   dag 14. (kies één bron)
3. Dag 6 verwijst naar het 3-soorten-DM-script dat je in dag 1 mocht skippen.
4. Dag 11 "dashboard" vs. knop naar /statistieken; dag 12 Academy-anker checken.

**Daarna (jouw stem):** een korte claim-vrij/tijds-prognose-pass (dag 1/7/9/19 +
sideflows) en wat AI-ism/slogan-polish (dag 8/13/18/19/20/21). Sluit aan op de
`content.ts`-tijdsbeloftes uit ronde 1, handig samen te doen.

---

## Ronde 3 — Em-dashes + AI-isms (samenvatting)

**Gefixt + gepusht:** 11 em-dashes in member-facing UI-chrome (intro-tour,
push-banner, PWA-prompt, Mentor-knop, sponsor-chat). De echte content
(Core + Reset-check) had al **nul** em-dashes.

**Twee dingen die opvielen, in `03-emdash-ai-isms.md`:**
1. **Voor Gaby (urgent vóór de bots live gaan):** de energie- & hormonen-bots
   staan vol medische taal + 3 harde claims ("letterlijk levensreddend", "lichte
   vergif", "30% productiviteit"). Medisch→beleving-vertaalslag nodig.
2. **Mentor-prompt:** lijkt geen expliciet verbod op em-dashes/AI-isms + geen
   harde stem/claim-vrij-richtlijn te hebben. Eén kleine toevoeging dekt alle
   Mentor-output. Laat ik aan jou (raakt het hart van de Mentor).

---

## Ronde 4 — Brede audit (samenvatting)

Naast de twee blokkers bovenaan: de fundering is gezond (auth, RLS, cron-secrets,
Stripe-signatuur allemaal in orde). Aandachtspunten die geen blokker zijn maar
wel op de 1-juli-lijst horen: de uitkomst-mail/push ontkoppelen van de
mail-queue (ook ronde 1), Stripe-webhook + env verifiëren, alle migraties in
productie checken, schema-drift (role-CHECK kent geen 'founder'), en de
DB-uniciteit voor de funnel. Plus een paar content-taken (films opnemen, Gaby's
bot-herschrijf). Alles staat in `04-brede-audit.md`.

---

## Wat ik vannacht zélf heb gedaan + gepusht (veilige fixes)
- **r1:** in-flight guard + keepalive op de vangst (lead niet kwijt bij
  dubbelklik/tabsluiten), mini-ELEVA-aanvraag crasht niet bij dubbele kaart,
  Stripe-fout-domein → my-eleva.com, diagnose-env opgeschoond.
- **r3:** 11 em-dashes uit member-facing UI-chrome.

## Wat ik bewust heb laten liggen (voor jou / samen)
- Alles wat jouw **stem** of **founder-tekst** raakt (Core-polish, claim-vrij/
  tijds-prognoses, scripts, Mentor-prompt).
- Alles wat de **database/auth** of de **live dag-/vangst-logica** raakt
  (de twee blokkers, mail-gate-ontkoppeling, DB-indexen, migratie-checks).
- De **energie/hormonen-bot-content** (voor Gaby's stem+claim-ronde vóór ze
  live gaan).

Niets dat live de pilot kan breken is zonder jouw blik gedeployed. Slaap lekker
uitgeslapen, dit ligt klaar wanneer je wakker bent. 🌿

# Onboarding-redesign fase 2: gedeelde pre-day-1 + admin-rail + cross-modus skip

**Datum:** 2026-05-18
**Status:** Spec, klaar voor review door Raoul
**Voorganger:** Core-redesign fase 1 (`2026-05-16-core-redesign-design.md`) waarin DTT, 5 brackets, pre/post-vertakking en compensation-plan zijn gelegd.

---

## 1. Probleem

Sprint heeft sinds dag 1 van ELEVA een complete pre-day-1 onboarding gehad (4 stappen: welkom+app, WHY, run-uitleg, tempo-keuze). Core is op 2026-05-16 in productie gegaan zonder pre-day-1: de modus-keuze landt direct in `/vandaag` dag 1 waar WHY, DTT, pre/post-keuze en eerste-contact bij elkaar staan.

Vier concrete gevolgen:

- **Asymmetrie tussen modi.** Sprint-leden worden door 4 stappen rustig opgewarmd, Core-leden worden rauw in dag 1 gegooid met fundament-werk dat eigenlijk vóór dag 1 hoort.
- **Core dag 1 is overvol.** Vijf hoofdtaken plus drie afsluit-stappen, terwijl dag 1 conceptueel een rustige fundament-dag moet zijn.
- **Geen cross-modus skip op de juiste items.** WHY, eerste namen, vcard-import en admin-taken (webshop, krediet, teams, bestellinks) zijn eenmalige onderdelen die in beide modi voorkomen. Een member die switcht van Core naar Sprint of andersom moet ze nu opnieuw afvinken.
- **Sprint mist admin-taken die Core wel heeft.** Teams-administratie en bestellinks koppelen zijn alleen in Core ingebouwd, terwijl een Sprint-bouwer ze net zo hard nodig heeft.

## 2. Doel

Een onboarding-architectuur waarbij:

1. Sprint en Core dezelfde pre-day-1 doorlopen (3 gedeelde stappen + 1 modus-eigen keuze-stap).
2. Eenmalige admin-taken op één plek bij elkaar staan, los van de dag-flow, met een herinnerings-pop-up bij inloggen.
3. Eenmalig werk dat in een andere modus al is gedaan, in de nieuwe modus niet opnieuw hoeft.
4. Dag 1 in elke modus een inhoud-dag wordt zonder admin-werk of fundament-werk.

Pro blijft in deze ronde op z'n eigen 14-stappen pad. Pro doet niet mee in deze cross-modus skip en heeft geen aparte pre-day-1.

## 3. Architectuur in drie lagen

### Laag A: Gedeelde pre-day-1

Vier stappen achter elkaar, in `/onboarding` (bestaande route, wordt uitgebreid van Sprint-only naar Sprint+Core).

```
Stap 1   Welkom + app installeren + push aan
Stap 2   WHY (Mentor-gesprek via /mijn-why)
Stap 3   Eerste 5 namen (spontane warme kring)
Stap 4   Modus-uitleg + modus-keuze:
            Sprint: "Hoe werkt de 60-dagen-run, 3 blokken" + tempo 2 / 4 / 6 uur
            Core:   "Hoe werkt 40-dagen-opstart + lifetime DMO" + DTT (Doel-Tijd-Termijn)
```

Stap 1 t/m 3 zijn identiek voor Sprint en Core, modus-onafhankelijk. Stap 4 is modus-bewust: hij rendert de tempo-cards voor Sprint of het DTT-formulier voor Core, met daarboven een korte modus-eigen uitleg.

**Voltooiing van stap 4** = klaar voor `/vandaag` dag 1.

### Laag B: Admin-rail

Eigen pagina `/setup` (nieuw) met daarop alle eenmalige administratieve taken:

```
🛒 Webshop aanmaken
✅ Kredietformulier invullen
📋 Teams-administratie inrichten
🔗 Bestellinks koppelen
🧪 Productadvies-test zelf doen
```

Toegankelijk via menu (links onder hoofdnavigatie) en via een **pop-up bij inloggen** zolang niet alle items afgevinkt zijn. De pop-up:

- Verschijnt maximaal 1× per dag (cookie/localStorage).
- Toont aantal openstaande items + 3-dagen-advies.
- Heeft één "Open admin-checklist" knop en één "Later vandaag" knop.
- Verschijnt niet meer zodra alles afgevinkt is.
- Verschijnt ook niet als de gebruiker nog in pre-day-1 zit (eerst pre-day-1 af, daarna admin-pop-up actief).

De pop-up is **niet blokkerend**. Iemand kan z'n dag-flow gewoon in als de admin nog niet af is. De boodschap is "advies: binnen 3 dagen", niet "verplicht".

### Laag C: Cross-modus skip-tabel

Bestaande tabel `onboarding_voltooiingen` (gebouwd in fase 1) wordt uitgebreid. Sleutels die we toevoegen / consistent gaan gebruiken:

```
why
eerste-5-namen
vcard-import-gedaan
sponsor-eerste-bericht
app-geinstalleerd
push-aan
webshop-aangemaakt
kredietformulier-ingevuld
teams-admin-ingericht
bestellinks-gekoppeld
productadvies-test-gedaan
modus-keuze-tempo (Sprint-only)
modus-keuze-dtt (Core-only)
```

Werkwijze:

- Elke voltooide stap in pre-day-1 of admin-rail schrijft een rij in deze tabel (op `user_id` + `onderdeel_key`).
- Pre-day-1 stap 2 (WHY) kijkt eerst of `why` al gevuld is: zo ja, stap is automatisch afgevinkt en toont "Al gedaan tijdens Sprint/Core, je hoeft 'm niet opnieuw" met optie om 'm alsnog te bekijken/aanpassen.
- Idem voor stap 3 (eerste-5-namen) en stap 1 (app/push).
- Stap 4 is modus-specifiek: tempo-keuze en DTT-keuze zijn niet uitwisselbaar. Schakelt iemand van Sprint naar Core, dan moet 'ie alsnog z'n DTT invullen (en omgekeerd voor tempo).
- Admin-rail items kijken naar dezelfde tabel en tonen direct "Al gedaan" met groene check.

## 4. Dag 1 per modus, na de redesign

De inhoud die nu in Core dag 1 staat (WHY, DTT, pre/post, eerste contact) wordt herverdeeld:

- WHY → pre-day-1 stap 2
- DTT → pre-day-1 stap 4
- Pre/post-keuze → blijft Core dag 1 (modus-specifiek, niet eenmalig op cross-modus niveau)
- Eerste contact → blijft Core dag 1

**Sprint dag 1 nieuw:**

```
Vandaag doen:
- 📲 Importeer je telefooncontacten (cross-modus skip mogelijk)
- 💬 Stuur je sponsor een bericht: "Ik ben gestart" (cross-modus skip mogelijk)
- 🎯 Schrijf 3 namen op uit je telefoonlijst die je deze week wilt aanspreken
- 🎯 Open momentum-acties (verbergt zich onzichtbaar bij geen acties)
- 🤝 Partner-check (verbergt zich onzichtbaar zonder partners)
```

Verschil met huidige Sprint dag 1: **5 namen handmatig verdwijnt** (zit nu in pre-day-1 stap 3). Telefoonboek-import blijft dag 1 maar krijgt skip-laag.

**Core dag 1 nieuw:**

```
Vandaag doen:
- 📲 Importeer je telefooncontacten (cross-modus skip mogelijk)
- 💬 Stuur je sponsor een bericht: "Ik ben gestart" (cross-modus skip mogelijk)
- ❓ Heb je al eigen product-ervaring? (pre/post-vertakking)
- 🎯 Stuur vandaag 1 warm contact dat je gestart bent
- 🎯 Open momentum-acties
- 🤝 Partner-check
```

Verschil met huidige Core dag 1: **WHY en DTT verdwijnen** (verhuisd naar pre-day-1). Pre/post-keuze + eerste contact blijven.

De `watJeLeert` van dag 1 wordt in beide modi herschreven: niet meer "welkom bij Core/Sprint" maar "je fundament staat, vandaag begint het echte werk".

## 5. Wat verandert technisch

### Routes

- `/welkom-keuze` (modus-keuze): ongewijzigd, kiest sprint/core/pro en redirect.
- `/onboarding`: uitgebreid van Sprint-only naar Sprint+Core. Stap 4 wordt modus-bewust.
- `/welkom-core/page.tsx`: redirect wordt `/welkom-core` → `/onboarding` (was: → `/vandaag`).
- `/welkom-pro`: ongewijzigd.
- `/setup` (nieuw): admin-rail pagina met de 5 admin-items.
- `/vandaag`: krijgt `<SetupPopup>` component zolang admin-rail open is.

### Componenten (nieuw)

- `components/onboarding/Stap4ModusKeuze.tsx`: rendert tempo-cards (Sprint) of DTT-form (Core) afhankelijk van `profiles.modus`.
- `components/setup/AdminChecklist.tsx`: lijst met 5 items + status + "open uitleg" per item.
- `components/setup/SetupPopup.tsx`: dialog die 1×/dag toont op `/vandaag` zolang admin open is.
- `components/onboarding/AlGedaanLabel.tsx`: klein groen label "Al gedaan tijdens X-modus" met "Bekijk opnieuw"-link.

### Componenten (aanpassen)

- `app/onboarding/page.tsx`: laadt modus uit `profiles.modus`, leidt stap 4 naar nieuwe `<Stap4ModusKeuze>`. Leest cross-modus skip uit `onboarding_voltooiingen` en markeert stap 1-3 die al gedaan zijn.
- `lib/playbook/dagen.ts` (Sprint dag 1): `dag1-5-namen` verwijderen (verhuisd). `dag1-vcard` en `dag1-sponsor` krijgen cross-modus skip-check.
- `lib/playbook/core-dagen.ts` (Core dag 1): `core-dag1-why`, `core-dag1-dtt` verwijderen (verhuisd). `core-dag1-eerste-contact` blijft. Plus toevoegen: vcard-import + sponsor-bericht.
- `lib/playbook/dagen.ts` (Sprint dag 2): admin-taken `dag2-webshop` en `dag2-krediet` verwijderen (verhuisd naar admin-rail).
- `lib/playbook/core-dagen.ts` (Core dag 3): admin-taken `core-dag3-webshop`, `core-dag3-krediet`, `core-dag3-teams` verwijderen.
- `lib/playbook/core-dagen.ts` (Core dag 4): admin-taak `core-dag4-bestellinks` en `core-dag4-test` verwijderen. Commission-plan-tekst blijft op dag 4 (geen admin maar kennis).

### Database

- Bestaande tabel `onboarding_voltooiingen` blijft. Geen schema-wijziging nodig: we voegen alleen nieuwe `onderdeel_key`-waarden toe.
- Bestaande tabel `onboarding_voortgang` (Sprint-specifiek) blijft staan voor backwards-compat.

### Cross-modus check helpers

Bestaand: `lib/onboarding/voltooiingen.ts` met `isReedsVoltooid`, `markeerVoltooid`, `haalAlleVoltooiingenVoorUser`. Geen nieuwe helpers nodig, alleen meer keys gebruiken.

### Founder-overrides

`/instellingen/onboarding` (bestaand): blijft werken voor Sprint-onboarding. Core kan met zelfde EditableTekst-blokken bewerkt worden (modus-onafhankelijke stap 1-3 zijn één keer bewerken, stap 4 wordt apart per modus bewerkbaar).

## 6. Pop-up gedrag

Pop-up `<SetupPopup>` op `/vandaag`:

- **Trigger**: page-load van `/vandaag` (server-component checkt status, client-component rendert).
- **Condities voor tonen**: gebruiker is voorbij pre-day-1 (onboarding_stap >= 99) EN admin-rail nog niet compleet EN niet al getoond vandaag.
- **Inhoud**:
  ```
  Je hebt nog 3 admin-stappen openstaan
  Webshop, kredietformulier, teams-admin
  Advies: doe ze binnen 3 dagen, ze zijn nodig voor de rest van je traject
  
  [Open admin-checklist]   [Later vandaag]
  ```
- **"Later vandaag" knop**: schrijft `localStorage.setItem('setup_popup_dismissed', new Date().toISOString())`. Verschijnt morgen weer.
- **"Open admin-checklist" knop**: navigeert naar `/setup`.
- **Verdwijnt automatisch** zodra alle 5 items afgevinkt zijn (geen "klaar"-pop-up, geen viering, gewoon weg).

## 7. Stijl-regels

Conform `raoul-stem-anker` memory:

- Kennisbank-toon (`kennisbank/01-start-hier.md` als anker).
- Geen em-dashes.
- Geen tijdsprognoses ("over 30 dagen heb je X").
- Anti-overwhelm: zinnen kort, geen 5-stappen-formule-zinnen.
- Warme opening, niet functioneel.
- 7 ELEVA-waarden impliciet als toon-anker.

Pre-day-1 stap 4 uitleg-blokken (modus-eigen) worden in deze stem geschreven. Admin-rail items krijgen heel zakelijke korte beschrijvingen (geen warmte nodig, het zijn admin-stappen).

## 8. Wat niet in deze fase

- Pro doet niet mee in cross-modus skip.
- Geen herziening van Pro 14-stappen pad.
- Bestaande `core-stappen.ts` en `pro-stappen.ts` blijven staan (legacy, niet weggooien).
- Sprint dag 3-7 inhoud blijft ongewijzigd (alleen dag 1-2 worden bewerkt, en admin-items verdwijnen uit dag 2).
- Geen migratie van bestaande Sprint-leden: zij die al voorbij pre-day-1 zijn, zien gewoon dag 1+ verder lopen. De admin-rail-pop-up gaat ook voor hen aan zodra alles is gedeployed, met admin-items afgevinkt voor zover al gebeurd via de oude flow.

## 9. Modus-switchen: wat moet opnieuw, wat blijft

Iemand die van modus wisselt komt na de switch op `/vandaag` uit. Het systeem behoudt alles wat eenmalig is en vraagt alleen wat modus-specifiek is opnieuw. Symmetrisch in beide richtingen.

**Wat blijft (cross-modus behouden):**

- WHY (eenmalig)
- Eerste 5 namen + telefoonboek-import
- Sponsor-bericht "ik ben gestart"
- App + push
- Admin-rail items (webshop, krediet, teams-admin, bestellinks, productadvies-test)
- Sponsor-relatie en team-structuur

**Wat opnieuw moet (modus-specifiek):**

| Switch | Wat opnieuw |
|---|---|
| Sprint → Core | DTT invullen (doel, tijd, termijn) · Pre/post-keuze (eigen product-ervaring) · Modus-uitleg-film 40-dagen-opstart kort zien |
| Core → Sprint | Tempo kiezen (2/4/6 uur per dag) · Modus-uitleg-film 60-dagen-run kort zien |

**Dag-teller bij switch:** per modus apart bewaard, niet één gedeelde teller. Drie scenario's:

| Scenario | Wat gebeurt er |
|---|---|
| Eerste switch naar een nieuwe modus (Core → Sprint, nog nooit Sprint gedaan) | Sprint start op **dag 1**. Eenmalige items zijn al afgevinkt, dus dag 1 voelt licht (geen WHY, geen 5 namen, geen sponsor-bericht). |
| Switch terug naar eerder gebruikte modus (Sprint → Core na eerder Core dag 15 te hebben gedaan) | Banner met **keuze**: "Wil je Core oppakken waar je was (dag 15) of opnieuw beginnen bij dag 1?". Geen dwang. |
| Eerste switch ooit, geen eerdere modus | n.v.t. |

**Database-implicatie:** `profiles.run_startdatum` (één veld) is niet meer voldoende. We splitsen in twee velden:

```
profiles.sprint_startdatum   DATE NULL
profiles.core_startdatum     DATE NULL
```

Bij eerste activatie van een modus: dat veld wordt gevuld met today(). Bij her-activatie (de banner-keuze "opnieuw beginnen"): veld wordt gereset naar today(). Bij her-activatie "oppakken waar je was": veld blijft staan, dag-teller rolt door vanaf de oude datum.

De huidige `profiles.run_startdatum` blijft als legacy-veld voor backwards-compat met bestaande Sprint-leden, maar code leest voortaan uit de modus-specifieke velden.

**Implementatie:** banner op `/vandaag` voor het eerst-na-switch:

> "Je bent overgestapt naar [Sprint/Core]. Vul nog even je [tempo/DTT] in, dan kunnen we je dag 1 op maat maken."

Banner heeft één knop: "Vul nu in" → opent inline-embed of redirect naar `/instellingen`. Verdwijnt zodra de modus-specifieke keuze is gemaakt.

## 10. Founder-bewerkbaarheid (kritische eis)

Alles wat in deze redesign wordt gebouwd moet via Raoul's founder-functies bereikbaar én bewerkbaar zijn. Geen hardcoded teksten die alleen via code-deploy aangepast kunnen worden. Per onderdeel:

| Onderdeel | Bewerkbaar via | Hoe |
|---|---|---|
| Pre-day-1 stap 1 (welkom + app) | `/onboarding?stap=1` met EditModeToggle | Bestaand patroon, `EditableTekst` blokken met namespace `onboarding` |
| Pre-day-1 stap 2 (WHY) | `/onboarding?stap=2` met EditModeToggle | Bestaand patroon |
| Pre-day-1 stap 3 (5 namen) | `/onboarding?stap=3` met EditModeToggle | Bestaand patroon |
| Pre-day-1 stap 4 Sprint (tempo + uitleg) | `/onboarding?stap=4&modus=sprint` | EditableTekst voor modus-uitleg + tempo-card-beschrijvingen, bestaand patroon |
| Pre-day-1 stap 4 Core (DTT + uitleg) | `/onboarding?stap=4&modus=core` | Nieuwe EditableTekst-blokken voor DTT-uitleg, DTT-form-labels en bracket-resultaat-teksten |
| Admin-rail pagina `/setup` | EditModeToggle op pagina zelf | Nieuwe namespace `setup-admin`, EditableTekst per item-label en per item-uitleg-blok |
| Pop-up tekst | EditableTekst in `<SetupPopup>` | Namespace `setup-popup`, sleutels `titel`, `body`, `cta_open`, `cta_later` |
| Modus-switch banner op `/vandaag` | EditableTekst | Namespace `modus-switch`, sleutels `sprint-naar-core` en `core-naar-sprint` |
| Sprint dag 1 nieuwe `watJeLeert` | bestaande sprint-dag override-bak | Namespace `sprint-dag`, sleutel `dag1.watJeLeert` (huidige override blijft werken na de fix van 2026-05-17) |
| Core dag 1 nieuwe `watJeLeert` | nieuwe core-dag override-bak | Namespace `core-dag`, sleutel `dag1.watJeLeert` (lege bak, valt terug op code, gebouwd 2026-05-17) |
| Welkomstfilm per modus | bestaand `/instellingen/films` | Bestaand patroon, `MODUS_WELKOMSTFILM_SLUGS` map |

**Werkwijze voor founder (Raoul):** elke pagina die deze redesign aanpast, krijgt rechtsboven de `<EditModeToggle>` die hij ook al kent. Hij klikt 'm aan, tekst-blokken worden klikbaar, hij past aan, opslaan = direct live (geen deploy nodig).

## 11. Risico's en open punten

- **Sprint-leden in pilot zijn al voorbij pre-day-1.** Zij krijgen geen nieuwe pre-day-1 voor neus, ze hebben 'm al doorlopen. Admin-rail wordt voor hen geactiveerd, met items afgevinkt voor zover al gedaan (webshop+krediet zaten in oude Sprint dag 2). Teams-admin en bestellinks zijn niet eerder in Sprint geweest, dus die staan open in admin-rail.
- **Pop-up frequentie.** 1× per dag is de afspraak. Als pilot-feedback komt dat 't te vaak is, verschuiven we naar 1× per week voor de 2e-7e dag.
- **Dag-teller reset bij switch.** Iemand verliest z'n voortgang in de oude modus. Dit is bewust (Sprint dag 15 ≠ Core dag 15 qua inhoud), maar moet wel duidelijk gecommuniceerd worden op de switch-pagina ("je begint in de nieuwe modus op dag 1, je eenmalige werk blijft behouden").

## 12. Volgende stap

Spec laten reviewen door Raoul. Daarna `superpowers:writing-plans` om implementatie-plan te maken (geschat 9-11 taken: pre-day-1 modus-bewust maken, admin-rail bouwen, pop-up bouwen, modus-switch banner bouwen, dag 1 herstructureren per modus, cross-modus skip toepassen op alle nieuwe sleutels, founder-bewerkbaarheid per onderdeel, verificatie via `npm run build` per taak).

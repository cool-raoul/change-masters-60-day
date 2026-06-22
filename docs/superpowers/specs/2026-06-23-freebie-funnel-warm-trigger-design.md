# Freebie-funnel: warm-trigger naar Opvolgen (ontwerp)

Datum: 2026-06-23
Status: ONTWERP, wacht op Raoul's go vóór implementatie (raakt live pijplijn).

## Aanleiding

De productadvies-vragenlijst gedroeg zich anders dan de score-bot-freebies
(reset-check, energie, hormonen): hij sprong bij invullen automatisch naar
"Opvolgen" en kreeg geen freebie-marker. Bij het gelijktrekken kwam de echte
funnel-vraag boven: een freebie-lead via social media heeft vaak alleen een
e-mailadres, geen telefoon. Die kun je niet persoonlijk opvolgen, dus hoort
'ie (nog) niet in "Opvolgen".

## Het model (Raoul's visie)

Twee soorten binnenkomst:
- **Koude prospect** die de member zelf toevoegt → blijft in "Prospect".
- **Freebie-lead** die zelf een freebie invulde → krijgt het 🌷-freebie-balletje.

Een freebie-lead met **alleen e-mail** gaat NIET naar "Opvolgen". Hij blijft
staan als freebie-lead en wordt **automatisch warm gehouden door de 5-mail-
serie**, die naar zijn eigen Mini-ELEVA leidt. "Opvolgen" blijft zo gereserveerd
voor mensen die de member daadwerkelijk persoonlijk kan benaderen.

**Twee warm-triggers** verschuiven een LICHTE freebie-lead naar "Opvolgen",
steeds mét een automatische opvolg-herinnering:
1. **Direct contact**: laat een telefoonnummer achter of vraagt om contact.
2. **Mini-ELEVA, duidelijke stap (keuze C)**: een eerste bezoek aan Mini-ELEVA
   geeft alleen een melding (member ziet de beweging), maar pas bij een
   **film afkijken** of **gegevens/contactvoorkeur achterlaten** schuift de
   lead echt naar "Opvolgen" + herinnering.

**Twee tiers freebie:**
- **Lichte freebies** (score-bots: reset-check, energie, hormonen): invullen =
  warm houden via de mailserie; pas bij een warm-trigger → "Opvolgen".
- **Zware freebie** (productadvies-vragenlijst): een volledige advies-lijst die
  eindigt in een concreet pakket-advies = koop-/intentiesignaal. Daarom is
  **invullen zelf al genoeg** om naar "Opvolgen" + herinnering te gaan. Dit
  BLIJFT zoals het nu is.

Vervolgstap (aparte ronde, NIET nu): filter op de namenlijst per freebie
("laat me alleen de leads van freebie X zien") + bulk-actie op die groep.

## Concrete wijzigingen

### 1. Productadvies krijgt het 🌷-freebie-balletje
De marker (rose randje + 🌷-label in PipelineKanban) verschijnt als
`ingezette_tools` een `"Freebie:"`-tag bevat (zie `isFreebieTag` /
PipelineKanban-detectie). Score-bots zetten die tag; productadvies zet alleen
de gewone tool-tag `"Productadvies-vragenlijst"`.
- Open-testlink-intake (`app/api/productadvies-test/open-intake/route.ts`):
  voeg `"Freebie: Productadvies-vragenlijst"` toe aan `ingezette_tools`.
- Submit (`app/api/productadvies-test/submit/route.ts`): voeg
  `"Vragenlijst ingevuld"` toe (zelfde conventie als de bots), zodat de
  "Freebies binnengekomen"-samenvatting compleet is.

### 2. Twee tiers: zwaar vs licht
- **Productadvies (zwaar)**: invullen → "Opvolgen" + herinnering BLIJFT zoals
  het is. `submit/route.ts` op dit punt ONGEWIJZIGD (de PRE_FOLLOWUP_FASES-move
  + de herinnering blijven). Sterk koop-/intentiesignaal.
- **Score-bots (licht)**: blijven bij invullen in "prospect"; gaan pas naar
  "Opvolgen" via een warm-trigger (zie 3). Geen wijziging aan hun opt-in-fase.

### 3. Warm-trigger → "Opvolgen" + herinnering (gedeelde helper)
Nieuwe helper, bv. `lib/prospect/warm-naar-opvolgen.ts`:
`warmNaarOpvolgen({ supabase, prospectId, memberId, reden })` die
- `pipeline_fase` op `"followup"` zet ALS de prospect nu in een pre-followup-
  fase staat (niet terugschuiven vanuit latere fases), en
- één opvolg-herinnering aanmaakt als er nog geen open herinnering is
  (titel met de reden, vervaldatum +24u, type "followup").

Aangeroepen vanuit:
- **a) Telefoon / contact-verzoek**:
  - `app/api/freebie-bot/contact/route.ts` (reset-check stap 5, telefoon).
  - `app/api/freebie-bot/opt-in/route.ts` wanneer `contactGewenst` / telefoon
    aanwezig is.
  - Productadvies wanneer een telefoonnummer wordt vastgelegd.
- **b) Mini-ELEVA, duidelijke stap**:
  - Bij een film-view (film_views) OF het achterlaten van gegevens in
    Mini-ELEVA → `warmNaarOpvolgen`. Eerste bezoek = alleen de bestaande
    melding, geen fase-verschuiving.

## Wat ongewijzigd blijft
- De marker-detectie in PipelineKanban / IngezetteTools (productadvies gaat
  er alleen aan voldoen).
- De 5-mail-serie en de Mini-ELEVA-meldingen (we koppelen de pijplijn-move
  eraan, we bouwen ze niet opnieuw).

## Nog te bevestigen tijdens bouw
- Exacte Mini-ELEVA-events die als "duidelijke stap" tellen (welke film-view-
  registratie, welk "gegevens achterlaten"-moment).
- Of de per-prospect handmatige productadvies-verzending (member stuurt naar
  bestaande prospect) ook de freebie-marker moet krijgen, of alleen de
  open-link-freebie-route. Voorstel: alleen de open-link-route.
- Definitieve herinnering-tekst per trigger.

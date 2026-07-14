# Mentor-audit 13/14 juli 2026 — testbank en bevindingen

Op verzoek van Raoul ("bedenk wat ik allemaal fout zou kunnen doen en fix
alles") is de klant-Mentor systematisch doorgezaagd met een geautomatiseerde
testbank: **33 strik-vragen tegen de LIVE API** (echte prompt, echt model,
echte route), via tijdelijke test-klant-links die na afloop zijn opgeruimd.

Herdraaien: `node scripts/audit-resetcode-mentor.cjs` vanuit de repo-root
(maakt drie test-links aan onder Raouls account en ruimt ze op; resultaten
in scratchpad/audit/resultaten.json van de sessie).

## Wat er getest is

- **Fase 2-discipline** (15 vragen): onbeperkt fruit, welk fruit, banaan,
  stewardess/onregelmatige diensten, herhaald smokkelen, olijfolie,
  calorieën, kwark, noten bij honger, dressing, alcohol, laatste maaltijd,
  proteïne-hoeveelheid, doorgeef-beloftes, FatSecret.
- **Laaddagen**: dagopdracht (3500+, vetten, geen FatSecret),
  menstruatie-timing.
- **Darmprogramma** (6): banaan (mag wél!), rijst, tomaat, koffie, quinoa,
  varkensvlees.
- **Fase 3/4**: correctie-dag bij aankomen, geen dagelijkse
  koolhydraat-test.
- **Bezwaren**: piramide-vraag, Kruidvat-vergelijking, "werkt het echt?"
  (geen beloftes), "kan ik niet gewoon gezond eten?".
- **Bouwer-vlag**: webshop-vraag bij is_bouwer (geen pitch).
- **Medisch**: schildkliermedicatie, zwangerschap (huisarts, niet zelf
  regels aanpassen).

## Gevonden en gefixt

1. **Cross-programma-verwarring (echte fout):** de Mentor verbood banaan in
   het dármprogramma (daar mag biologische banaan wél; het verbod geldt
   fase 2). Fix: expliciet contrast-blok in de prompt (banaan, tomaat/
   paprika, noten verschillen per programma) + notitie in de darm-lijst.
   Hertest: goed.
2. **Intent-randgevallen (code):** "verder" in een gewone zin schoof de
   klant een fase door; "tips" in "heb je tips tegen hoofdpijn?" toonde de
   generieke tips-kaart; "de lijst" in een productvraag toonde de
   lijst-kaart; "erbij" in "mag er kaas erbij?" toonde de contact-kaart.
   Alle commando's werken nu alleen nog als losstaand commando.
3. **Contact-kaart zonder contactmoment** toonde een lege regel; heeft nu
   een nette fallback-tekst.
4. Eerder in dezelfde audit-reeks (aanleiding): loze doorgeef-beloftes
   verboden, fase-discipline-blok, exacte boekje-lijsten, altijd het
   sterke model. Zie commits 0a22daf t/m fbe1efb.

## Eindstand

Ronde 1: 30/33 goed (1 echte fout, 2 vals alarm van de checkers).
Ronde 2 (na fixes): alle inhoudelijke checks groen; 1 netwerk-hikje
(vraag niet aangekomen) en 1 bekend vals alarm ("werkt het echt?"-antwoord
is handmatig gecontroleerd en correct: geen beloftes, eigen meetpunten,
geld-terug-garantie).

## Bekende grenzen

- De testbank checkt met woordpatronen; nieuwe formuleringen kunnen vals
  alarm geven. Antwoorden bij vlaggen altijd even nalezen.
- Member-rol en foto-etiket-checks zitten (nog) niet in de bank.
- De bank kost een paar dubbeltjes per run (33 × gpt-4o) en schrijft niets
  blijvends: test-links worden opgeruimd.

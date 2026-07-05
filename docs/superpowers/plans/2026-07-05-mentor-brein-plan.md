# Mentor-brein 2.0, bouwplan

Datum: 2026-07-05. Besluit Raoul: hoogste prioriteit, gebouwd met Fable 5 als architect.
Doorlichting van de huidige stack: zie de sessie-analyse (agent-rapport 2026-07-05). Kern:
de Mentor is informatierijk (900-regel prompt, mentor_profielen, coach_voorbeelden,
kennisbank per vraagtype, adviesgids, gevalideerde supplement-kennis) maar geen slimme
kern: geen centrale context-motor, vraagtype-gok bepaalt het model, geen interview-eerst,
claim-regels en stem-DNA zitten NIET in de prompts, geen leer-lus.

## Doel

Eén Mentor-brein dat: (a) elk lid en elke prospect-kaart volledig kent (incl. tags,
notitieboekje, freebie-uitslagen), (b) per taak het juiste vastgepinde model gebruikt
(schrijfwerk altijd sterk), (c) bij publieke content eerst interviewt, (d) altijd binnen
stem-DNA + claim-vrij schrijft (anti-slop), (e) de copywriting-motor van de lanceerweek
draagt (hooks, angst-laag, harde waarheid, codewoord-CTA, drie instromen), (f) leert van
posts die scoren.

## Blokken

### Blok 1a, Fundament-modules (ZELFSTANDIG, geen rewiring)
- `lib/mentor/taak-register.ts`: register van alle Mentor-taken → model (sterk/snel),
  maxTokens, interviewEerst, schrijfwerk-vlag. Eén plek om modellen te wisselen.
- `lib/mentor/schrijfregels.ts`: stem-DNA-distillaat + AI-isms-blacklist + claim-vrije
  post-regels (uit docs/stem-DNA.md en docs/claimvrije-communicatie.md, promptklaar) +
  interview-eerst-instructie + zelfcheck.
- `lib/mentor/copywriting.ts`: story-post-framework (7 beats), hook-types, codewoord-CTA,
  pre-post/21-dagen-structuur, de drie lanceerweek-instromen, weekritme-rotatie.
STATUS: gebouwd 2026-07-05.

### Blok 1b, Rewiring hoofd-Mentor
- app/api/coach/route.ts gebruikt het taak-register voor model-keuze (weg met de
  zwaarModel-gok; alle schrijftaken sterk model).
- Schrijftaken (reel, post, dm, drieweg) krijgen schrijfregels + copywriting-modules in
  de prompt; interview-eerst-instructie actief bij publieke content.
- vraagType-detectie uitbreiden met "post"-herkenning (lanceerweek/pre-post/resultaten-
  post/week-plan) zodat post-verzoeken nooit meer op "algemeen"/mini landen.

### Blok 2, Context-motor
- `lib/mentor/context-motor.ts`: één assembler voor member-context (profiel, WHY,
  mentor_profielen, dag/modus, taal) + prospect-context (kaart, notitieboekje/contact_logs,
  tags/ingezette_tools, bestellingen, herinneringen, EN de nu-missende freebie-uitslagen +
  film-kijkdata). Alle routes (coach, mini-eleva, situatie-samenvatting, voice-uitnodiging)
  stappen erop over; einde copy-paste-context.

### Blok 3, Lanceerweek-schrijfflows
- Interview-flow per instroom (starter-met-resultaat, starter-zonder [pre-post dag 2,
  resultaten-post dag 21], doorbouwer) die de copywriting-motor voedt; output copy-paste-
  klaar. UI komt in de lanceerweek-bouw (apart traject, zie docs/attraction-marketing-vs-eleva.md).

### Blok 4, Leer-lus
- Terugkoppeling "kreeg deze post reacties?" → winnende posts (semi-automatisch, founder-
  akkoord) naar coach_voorbeelden. Kleine DB-uitbreiding nodig → eerst akkoord Raoul.

## Bewaakpunten
- Claim-vrij + stem-DNA zijn vanaf blok 1b een verplichte onderlaag bij elk schrijfwerk.
- Modellen per taak in ÉÉN bestand (taak-register), zodat runtime-modellen later goedkoop
  wisselbaar zijn (OpenAI ↔ Claude).
- Geen regressie in bestaande flows: bestaande vraagtypes blijven werken; nieuwe modules
  worden toegevoegd, niet vervangen-in-één-klap.

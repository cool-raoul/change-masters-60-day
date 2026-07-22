# Mentor agent-architectuur (fase 2/3) — design

Akkoord Raoul 22 juli 2026: de member-Mentor wordt opgebouwd uit specialisten-agents in plaats van één mega-prompt (±19 lagen, tot 101k tekens, regex-loterij). Fase 1 (veiligheid) is GEBOUWD op 22 juli: AI-waakhond + actieve regex-scan op de coach, kennis-match forceert gpt-4o ≥1600 tokens, [STUUR]-vangrails (alleen met concrete ontvanger, nooit ziektenamen in doorstuurtekst), server-side blocklist (Colloidal Silver), improviseer-licentie geschrapt.

## Doel-architectuur

1. **Receptionist (router)**: kleine LLM-call (gpt-4o-mini, temperature 0, JSON) die élke inkomende vraag classificeert naar een specialist. Vervangt `detecteerVraagType`-regex in `lib/knowledge/coach-boeken.ts:62-85`. Twijfelregel: bij twijfel → gespreks-coach; gaat het over producten/gezondheid → áltijd productadvies-specialist.
2. **Specialisten-register** (uitbreidbaar, config-gedreven; Raouls wens: nieuwe agents = één registratie): per specialist { id, beschrijving-voor-router, promptbouwer, model, maxTokens, waakhond: boolean }. Start-set:
   - `gesprek`: dm/opener/drieweg/bezwaar/closing/followup/motivatie/accountability/algemeen → kennisbank + scripts (alleen relevante categorie!) + voorbeelden. GEEN productadvies-reglement, GEEN adviesgids.
   - `productadvies`: adviesgids + prijslijst + kennisrijen + contra-lijst + strengste claim-kader. Altijd gpt-4o + waakhond.
   - `schrijver`: bestaat al (post-schrijver-prompt, route B) — social/captions hierheen verhuizen (nu nog route C met copywriting-laag).
   - `kennismaker`: bestaat al (route A).
3. **Gedeelde kern** (klein, iedereen): member-profiel/WHY/prospect-context, ELEVA-stem + AI-isms-blacklist, claim-vrij basiskader, [PROFIEL]/[PROSPECT]-opslag.
4. **Waakhond**: bestaat (fase 1), per specialist aan/uit via register.

## Opruimlijst bij het uitpakken (uit de multi-agent-audit 21/22 juli)

- Fase-plan-plicht (coach-systeem-prompt regel 6, :313-318) alleen naar productadvies-specialist; kennisrij-match wint expliciet van fase-plan én budget-vraag op ALLE plekken (nu 4 voorschrijvende plekken: :298, :367, :384, :667).
- Eén disclaimer-tekst (nu wij-vorm :291 + ik-vorm gids:916 + onbepaald kennis).
- Intake gelijktrekken: gids stap-0 (één open vraag) wint van prompt regel 9 (2-4 vragen).
- Scripts-laag: "algemeen" krijgt nu ALLE 63 scripts (23k tekens) op het goedkoopste model — alleen relevante categorie meesturen.
- Dode code verwijderen: lib/mentor/laag-1/2/3 + index (nooit aangesloten).
- Dubbel: basisproduct-filosofie, Lifeplus-only, productnamenlijst, pre-post-structuur (3 plekken), follow-up-openers (4 plekken, incl. het verboden "Wat vond je ervan?" dat nota bene als voorbeeld in kennisbank-followup staat — die corrigeren!).
- Kolommen `risico` ('laag'/'hoog') + `nooit_doorsturen` op mentor_kennis_supplementen + UI in validatiescherm; hoog-risico-rijen: arts-eerst-formulering, nooit in [STUUR].
- Coach-waakhond-correcties van founders landen nu in resetcode_kennis (programma 'algemeen') — later eigen coach-teamkennis-injectie zodat de correctie ook het coach-brein voedt.

## Volgorde

1. Router + register (stopt wisselende antwoorden direct).
2. Productadvies-specialist uitpakken (claim-risico) + testbank-scenario's ervoor.
3. Gespreks-coach + schrijver-verhuizing social.
4. Opruimlijst + risico-vlaggen.
Per specialist: testbank draaien vóór live (patroon scripts/audit-resetcode-mentor.cjs).

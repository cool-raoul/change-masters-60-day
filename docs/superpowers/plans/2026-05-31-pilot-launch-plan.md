# ELEVA Pilot Launch Plan, 2026-05-31

> **Doel:** Pilot binnen 1 week, live met breder team binnen 3 weken.
> **Raoul-werkdruk:** 8-12 uur per dag, bewust gekozen.

## Status op 2026-05-31

### Live op productie (Vercel)

- **Core V9 als member-flow op `/vandaag`**, 21 dagen + 2 side-flows op day-2-diepte (lessen + concrete step-uitleg in BTC-stem)
- **Wat nu?-knop** overal globaal (AppShell + /vandaag + /core-v9)
- **Side-flow tussen-scherm** vanaf dag 2: prominent, blokkeert dag-content tot bewuste keuze (open of bewust overslaan; komt terug bij volgend bezoek tot afgerond)
- **Side-flow op `/sideflow/[slug]`** (verhuisd weg van V9-prefix), met terug-link naar `/vandaag`
- **Mini-ELEVA** met vijf prospect-modules: producten, verhalen, business, business-verhalen, FAQ. Plus mentor (AI) + chat (mens).
- **Mentor-prompt** met concrete bezwaar-templates (piramide, Herbalife-vergelijking, geen tijd, geen geld, ik kan dit niet, ik ken al iemand, verdienen, product-werking, programma-uitleg, hype-vraag), product-namen-lijst, IP-uitleg, twee-spoor-bewustzijn
- **Twee-spoor-systeem** (product/business) met soort-veld op uitnodigingen + filtering op alle modules (graceful fallback als migratie niet gedraaid)
- **Founder-preview-hub** op `/instellingen/mini-eleva-preview` voor alle 5 modules (edit-mode, MediaBlokken beheer)
- **Uitnodigingen-hub** op `/uitnodigingen`: wizard (kies kant → kies prospect uit lijst) + overzicht van lopende/verlopen uitnodigingen
- **Sidebar-links**: "Mini-ELEVA uitnodigingen" + "Mini-ELEVA beheren" (founder-only)
- **IP-uitleg** (Internationale Punten) + 40 IP-minimum-afname overal correct
- **Mini-ELEVA mentor-prompt** weet ook over de productnamen-lijst, programma's, sleutelzinnen

### Geparkeerd tot na live (niet flexen)

- **Leader-track** (post-Builder-pad, train-the-trainer, eigen-stem-spoor)
- **Structurele 30-daagse herindeling** (spec 2026-05-28: tempo uit DTT, DMO bij beweging, kern+uitklap)
- **Productie-niveau-films** (voice-memo's volstaan voor pilot)
- **Detail-polish op Core V9-content** (al op day-2-diepte, klaar voor pilot)
- **"Er gaat iets mis"-melding** van eerder (verifiëren in pilot)

## Week 1, pilot-klaar

### Must-do per persoon

**Raoul:**
1. Pilot-team aanwijzen + uitnodigen (jij + Gaby + 2-3 bouwers)
2. Test-doorloop als test-member: maak een test-account, doorloop Core dag 1 + side-flow + dag 2 + Mini-ELEVA-prospect-flow. Brokjes en gaten noteren.
3. Bug-rapporten-kanaal opzetten (WhatsApp-groep is prima)
4. (Optioneel) SQL-migratie soort-veld draaien op Supabase voor echt twee-spoor: `lib/supabase/migrations/2026-05-31-mini-eleva-soort.sql`. Zonder migratie krijgen alle uitnodigingen default 'business', met migratie werkt product-spoor-filtering echt.
5. (Einde week) `/ultrareview` zelf starten in chat voor onafhankelijke kwaliteitscheck

**Gaby:**
1. Mini-ELEVA-content doorlezen via `/instellingen/mini-eleva-preview` (5 modules). Noteren wat ze anders zou zeggen
2. Eerste batch voice-memo's opnemen voor MediaBlokken-slots: minimaal 5 stuks
   - Welkom-video van Gaby (eenmalig, herbruikbaar)
   - "ELEVA in 3 minuten"-uitleg
   - 1 productverhaal (slaap of energie)
   - 1 business-ervaring (eerste 3-weg of eerste klant)
   - 1 antwoord op een veelgestelde FAQ-vraag (bijv. "is dit een piramide?")
3. Founder-edit-mode gebruiken om tekst aan te passen waar woordkeuze anders moet (zodra ik die heb opgeleverd)
4. Prospect-ervaring testen: laat Raoul je een Mini-ELEVA-uitnodiging sturen vanaf zijn test-account

**Claude (mij):**
1. Founder-edit-mode inbouwen op alle 5 Mini-ELEVA-modules zodat Raoul/Gaby zelf tekst kunnen patchen (HOOGSTE PRIORITEIT)
2. Bug-fixes op Raoul-rapport binnen 24u
3. Geen nieuwe scope tijdens pilot-week behalve bugs

### Dag-voor-dag

**Maandag-dinsdag (dag 1-2):**
- Raoul: pilot-team prikken, link `/instellingen/mini-eleva-preview` naar Gaby
- Claude: founder-edit-mode bouwen op alle Mini-ELEVA-modules
- Gaby: content doorlezen, noteren

**Woensdag-donderdag (dag 3-4):**
- Raoul: test-doorloop op `/vandaag` als member, brokjes noteren
- Gaby: tekst-aanpassingen via founder-edit + eerste 5 voice-memo's
- Claude: brokjes fixen die Raoul rapporteert

**Vrijdag (dag 5):**
- Raoul: stuur Mini-ELEVA naar Gaby als prospect (van een test-account)
- Gaby: ervaart `/m/[token]`-flow als prospect, feedback
- Claude: laatste fixes

**Zaterdag (dag 6):**
- Raoul: draai `/ultrareview` voor onafhankelijke check, reageert op bevindingen
- Gaby: resterende voice-memo's

**Zondag (dag 7):**
- **Pilot start.** Bouwers krijgen toegang, beginnen onboarding + dag 1
- Bug-tracking via WhatsApp-groep
- Korte status-check eind van dag

## Week 2-3, live-klaar

### Week 2

- Bouwers doen Core dag 1-7
- Dagelijkse 30-min status van Raoul + Gaby
- Bugs binnen 24u gefixt door Claude
- Gaby maakt 5-10 voice-memo's per dag (FAQ-antwoorden, productverhalen)
- Bouwers gebruiken `/uitnodigingen` richting eerste prospects (echte data)

### Week 3

- Bouwers doen dag 8-14, komen door de side-flow heen
- Verzamel quotes, eerste klanten, eerste prospect-reacties
- Maak launch-checklist: toegang voor nieuwe leden, support-proces, eerste-week-onboarding voor breed team
- Eind week 3: live-launch met breder nieuwe team

## Eerlijke trade-offs

- Voice-memo's i.p.v. films op live. Films komen na launch in batches.
- Geen leader-track. Volgt later (mensen moeten eerst Builder zijn).
- Mini-ELEVA voelt minder rijk dan ooit geschetst in de 4-buckets-onderdompeling-spec. Groeit terwijl het draait, niet alles tegelijk klaar.
- Pilot-team = testen-team. Real-world testen i.p.v. lab-testen. Dat is een feature, niet een bug.
- Soort-veld functioneert alleen met SQL-migratie (zonder migratie default 'business' voor iedereen). Voor pilot acceptabel, vóór live runnen.

## Wat dit plan NIET dekt

- Marketing-pakket voor breder team (folders, social posts, etc.) — Raoul + Gaby's eigen werk
- ManyChat / freebie-funnels — geparkeerd in andere ronde
- Lifeplus-event-films in Mini-ELEVA — Gaby's bucket 2 uit de Mini-ELEVA-spec
- Train-the-Mentor founder-CMS — Mini-ELEVA-bucket 4

## Klaar voor pilot betekent

- Member kan inloggen, onboarding doorlopen, Core dag 1 doen, side-flow oppakken (of overslaan), dag 2-7 doen zonder vast te lopen
- Member kan een Mini-ELEVA-uitnodiging maken voor een prospect, prospect kan landen, alle modules zien, AI-mentor stellen, chatten
- Raoul + Gaby kunnen tekst aanpassen zonder code-changes (founder-edit-mode)
- Bug-rapport-loop draait: WhatsApp-melding → 24u-fix → push naar live

## Klaar voor live betekent

- 14 dagen pilot zonder structurele blockers
- Minstens 5 prospect-uitnodigingen succesvol gebruikt
- Minstens 1 echte klant via Mini-ELEVA-flow
- Eerste voice-memo's op minimaal 50% van de MediaBlokken-slots
- Launch-checklist + support-proces gedocumenteerd

---

Wijziging volgt zodra er beweging is in de pilot.

# Core, tempo-gestuurd leerpad + just-in-time kennislaag

**Datum:** 2026-05-28
**Status:** ontwerp, klaar voor review door Raoul. Nog niet bouwen.
**Aanleiding:** Raoul-feedback op Core V9. Twee zorgen: (1) DMO staat vanaf dag 1, te vroeg. (2) Nieuwe member wordt overweldigd, stappen moeten behapbaar blijven, maar wie snel wil moet ook snel kunnen.

---

## Het probleem in één alinea

Core V9 zet 21 ankerstappen in een vaste volgorde, met de DMO (dagelijks ritme) zichtbaar vanaf dag 1, en stap 1 propvol (welkom + onboarding-bevestiging + Builder-uitleg met IP-getallen + sponsor + post-keuze). Voor een complete nieuweling is dat te veel ineens. Tegelijk is "alles maar verspreiden" ook niet goed, want zodra iemand een gesprek krijgt heeft 'ie meteen kennis nodig (videolink delen, 3-weg, bezwaren). Die spanning lossen we op met twee lagen.

---

## De oplossing: twee lagen naast elkaar

### Laag 1, Het leerpad (de ankerstappen)

- De 21 ankerstappen blijven de ruggengraat. We bouwen de structuur niet opnieuw.
- Het pad wordt verspreid over circa 30 dagen in plaats van een vaste 21-op-21.
- Het tempo komt uit Doel-Tijd-Termijn (DTT) dat de member in de onboarding al heeft opgegeven. Geen nieuwe vraag nodig.
- Elke stap krijgt een korte kern (wat doe je vandaag, waarom, 1-3 acties) plus een uitklap-verdieping (uitleg, voorbeelden, quotes) voor wie meer wil.

### Laag 2, Just-in-time kennislaag

- Altijd oproepbaar, onafhankelijk van waar je in het pad staat.
- Bevat de gespreks-kritische kennis die je nú nodig kunt hebben:
  - Hoe deel ik de videolink / het juiste prospect-filmpje
  - Hoe werkt een 3-weg-gesprek + inplannen
  - Hoe neem ik een bezwaar weg
  - Wat stuur ik als iemand reageert of liket (3-soorten-mensen-DM)
  - Hoe open ik Mini-ELEVA voor een prospect
- Toegang via de Mentor en/of een vaste "wat nu?"-knop.
- Wordt vroeg kort geïntroduceerd, maar is altijd terug te halen, ook als je nog bij stap 3 staat.

---

## Tempo: hoe DTT het pad uitrekt of comprimeert

De member geeft in onboarding drie dingen: doel, beschikbare tijd, termijn. Daaruit leiden we een tempo af.

| Profiel | Tempo | Pad-spreiding |
|---|---|---|
| Groot doel + veel tijd + korte termijn | Snel | Bordjes dicht op elkaar, meerdere stappen per week |
| Gemiddeld | Normaal | Ongeveer een stap per één à twee dagen |
| Bescheiden doel + weinig tijd + lange termijn | Rustig | Bordjes verder uit elkaar, langer de tijd per stap |

### Momentum-ondergrens (Eric Worre-principe)

Hoe rustig het tempo ook staat, een paar resultaat-momenten vallen sowieso vroeg, voor iedereen:

- Eerste post (pre-post of 21-dagen-post)
- Eerste paar uitnodigingen
- Eerste 3-weg

Reden: een nieuwe bouwer moet snel een eerste succesje halen, anders zakt het momentum weg. Het tempo regelt de spreiding van de rest, niet of deze kern-momenten gebeuren.

---

## DMO, wanneer wel zichtbaar

- Niet vanaf dag 1.
- Verschijnt zodra er echte beweging is: na de eerste post-sidestep, of zodra de eerste reacties / prospects binnenkomen.
- Daarvoor verborgen of ingeklapt, zodat een lege takenlijst geen valse druk geeft.

---

## Wat dit betekent voor de bouw (later, niet nu)

1. Tempo-berekening uit profiel-DTT, vertaald naar pad-spreiding (welke stap op welke kalenderdag).
2. Momentum-ankers markeren in de stap-data, zodat ze niet te ver naar achteren schuiven bij rustig tempo.
3. Stap-rendering: korte kern + uitklap-verdieping (de UI splitst de bestaande lestekst).
4. Just-in-time-laag: een component of Mentor-prompt die de gespreks-kennis altijd bereikbaar maakt, plus een "wat nu?"-ingang.
5. DMO conditioneel tonen op basis van eerste-beweging-signaal.

---

## Wat NIET verandert

- De 21 ankerstappen zelf (inhoud + volgorde) blijven staan zoals in V9.
- De stem (Be The Change, stem-DNA) blijft leidend.
- De side-flows (pre-post, 21-dagen-post) blijven.

---

## Open vragen voor Raoul

1. Tempo-mapping: zijn drie tempo's (snel / normaal / rustig) genoeg, of wil je fijnere stappen?
2. Welke stappen zijn precies de momentum-ankers die altijd vroeg vallen? Voorstel nu: eerste post, eerste uitnodigingen, eerste 3-weg.
3. Just-in-time-laag: liever via de Mentor ("vraag het de Mentor zodra het gebeurt"), of ook een vaste zichtbare "wat nu?"-knop op het scherm?
4. Spreiding over 30 dagen: is 30 het richtgetal, of laten we de termijn uit DTT het volledig bepalen?

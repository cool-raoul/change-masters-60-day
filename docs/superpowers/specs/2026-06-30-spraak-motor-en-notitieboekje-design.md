# Ontwerp: slimme spraak-motor + één notitieboekje per klant

Datum: 2026-06-30
Status: goedgekeurd door Raoul (ontwerp), klaar voor uitwerking naar bouwplan

## Probleem

Twee samenhangende problemen rond de klantenkaart (`app/namenlijst/[id]`):

1. **Notities staan verspreid.** Over één klant leven notities op 6 tot 8 plekken. De twee zichtbare op de kaart zijn de hoofdpijn:
   - `prospects.notities`: één groot tekstveld waar de freebie-intake in gedumpt wordt. Geen datum per stuk, en handmatig bewerken overschrijft het geheel.
   - `contact_logs`: een nette gedateerde tijdlijn (nieuwste boven), maar daar landen nu alleen handmatig getypte aantekeningen.
   Resultaat: de eerste intake-info en de latere aantekeningen zitten in twee aparte systemen, in twee aparte blokken. Voelt warrig.

2. **De spraak-motor splitst een verhaal niet betrouwbaar op.** De belofte ("Voice, spraak werkt overal") is: praat vrijuit, het systeem snapt zelf wat een naam, herinnering, status, notitie, bestelling of vraag is en zet elk op de juiste plek. In de praktijk:
   - Een afspraak met datum ("opvolgafspraak 3 juli") wordt geen herinnering, omdat de motor alleen een taak maakt bij expliciete woorden ("herinner me om..."). Zie `app/api/voice-parse/route.ts` regel ~395-416.
   - Een bestelling wordt alleen bij heel specifieke woorden herkend, anders blijft het in de notitie staan en gaan de automatische opvolg-herinneringen (+21/+51/+81 dagen) niet lopen.
   - Een lang verhaal met meerdere onderdelen valt terug op één grote notitie in plaats van losse acties.
   - Naam-matching is broos: de motor matcht fonetisch tegen de namenlijst, maar `VoiceFab.tsx` (regel ~735) zoekt daarna een **exacte** match. Geen match (verkeerd verstaan of nieuwe persoon) betekent dat de actie stilletjes wordt gedropt, en de gebruiker ziet "er is niets overgenomen".
   - De huidige kaart-context (welke prospect je openhebt) wordt niet meegestuurd naar de motor; alles hangt aan de verstane naam.
   - Een valse "Opgeslagen!" is mogelijk terwijl er niets is weggeschreven.

Concreet voorbeeld dat dit blootlegde (Gaby, 30 juni 2026): een ingesproken verhaal over een nieuwe member met het Darmen-in-Balans-programma, een memberbestelling en twee opvolgafspraken (3 juli en 21 juli) belandde als één notitie. De twee afspraken werden geen herinneringen en de bestelling werd niet geregistreerd.

## Doel en succescriteria

1. **Eén notitieboekje per klant.** Alles wat met die persoon gebeurt staat op één plek, chronologisch, nieuwste boven, met datum. Of het nu getypt, uit de freebie-intake, of ingesproken is. Scrollbaar bij veel inhoud. Bovenaan een nieuwe notitie toevoegen (getypt of ingesproken).
2. **Spraak splitst betrouwbaar op.** Eén verhaal levert meerdere, correct gerouteerde acties (notitie + herinneringen + bestelling + status + naam), robuust over verschillende manieren van vertellen.
3. **Dubbele controle voor opslaan.** Een controle-scherm toont wat hij hoorde en alles wat hij gaat doen. Per regel aanpasbaar of te verwijderen, zelf toe te voegen, naam corrigeerbaar. Akkoord legt het vast. Nooit een valse succesmelding.

## Ontwerp

### Deel A: het notitieboekje (de bestemming)

- `contact_logs` wordt hét notitieboekje. Die tabel heeft al `created_at`, `contact_type` en losse records, precies wat nodig is.
- De freebie-intake-dump (nu in `prospects.notities`) verhuist als eerste gedateerde regel het boekje in, type `intake`. Eénmalige migratie zet bestaande dumps om naar een `contact_logs`-regel met de juiste datum (uit de "(dd-mm-jjjj)" in de dump, anders `created_at`). Idempotent en gemarkeerd, zodat het niet dubbel gebeurt.
- Weergave: de twee losse blokken ("CONTACTGEGEVENS -> AANTEKENINGEN" en "BIJHOUDEN WAT BESPROKEN") worden samengevoegd tot één blok "Notitieboekje": nieuwste boven, scrollbaar, met datum + type-icoon per regel (notitie / intake / bel / dm / bestelling / status).
- Toevoegen: bovenaan een "+ notitie" (getypt) en de mic (ingesproken) landen allebei hier.
- De Mentor-context (`form_context`: familie / werk / geld) blijft een apart klein profiel-blok, geen tijdlijn-item. De Mini-ELEVA-chat en de ELEVA-Mentor-gesprekken blijven hun eigen draadje (zichtbaar en aanklikbaar op de kaart), niet door de tijdlijn gemengd.

### Deel B: de slimmere spraak-motor (de hersenen)

Aanpassingen in `app/api/voice-parse/route.ts` (vooral de systeemprompt):

- **Multi-intent verplicht.** Een verhaal wordt altijd opgedeeld in alle losse acties. "Notitie" mag niet langer het vangnet zijn voor alles wat niet 100% duidelijk is.
- **Datum-afspraak = herinnering.** Elke genoemde opvolg-actie met een datum (expliciet of relatief: "opvolgen op 3 juli", "in september bellen", "volgende week checken") wordt een `taak`, ook zonder "herinner me". De huidige strenge regel wordt verruimd.
- **Bredere bestelling-herkenning.** "Memberbestelling gedaan", "pakket meegegeven", "programma gestart", "besteld/gekocht" leiden tot een `product_bestelling`-actie (zet automatisch de opvolg-herinneringen).
- **Kaart-context meesturen.** `VoiceFab` stuurt de huidige `prospect_id` mee (afgeleid van het pad `/namenlijst/[id]`). Bij een ontbrekende of onduidelijke naam wordt die context-prospect de standaard.
- **Robuustheid.** Meer voorbeeldformuleringen in de prompt; de verplichte redenatie-stap blijft.

De output blijft de bestaande acties-array; de uitvoering per actietype (`voerActiesUit` in `VoiceFab.tsx`) bestaat al.

### Deel C: het controle-scherm (de dubbele controle)

In `components/voice/VoiceFab.tsx`, na het parsen en vóór het wegschrijven:

- Toon "wat ik hoorde" (het gecorrigeerde transcript, inklapbaar) + de lijst voorgenomen acties.
- Per actie: icoon + type + korte samenvatting + bewerken (potlood) + verwijderen (kruis). Bewerken opent een klein veld (datum / tekst / persoon).
- "+ Toevoegen": handmatig een actie erbij (herinnering / notitie / bestelling / naam / status) die hij miste.
- "Akkoord" voert alles in één keer uit. "Opnieuw inspreken" neemt opnieuw op.
- **Geen valse "Opgeslagen!".** Per actie wordt getoond of het lukte; bij een fout een duidelijke melding, geen success-toast als er fouten zijn.

### Deel D: de naam-controle

- Elke persoon-gebonden actie toont de naam; bovenaan een "Over: [naam]" controle.
- Betere resolutie dan alleen exacte match: (1) kaart-context `prospect_id`; (2) fonetische/fuzzy match tegen de lijst met een drempel; (3) geen of zwakke match betekent: markeer als "nieuwe kaart" met een bewerkbaar naam-veld, of toon de dichtstbijzijnde suggestie om te kiezen ("bedoel je [bestaande naam]?").
- De naam is bewerkbaar in het scherm; een wijziging propageert naar alle acties die aan die persoon hangen.
- Akkoord is geblokkeerd zolang een onbekende of onbevestigde naam openstaat.
- Een actie wordt nooit meer stilletjes gedropt wegens naam-mismatch; een onbekende naam komt altijd als vraag op het scherm.

## Datamodel-impact

- `contact_logs`: mogelijk een extra `contact_type`-waarde (`intake`, eventueel `spraak`) en een optioneel bron-veld om herkomst te tonen.
- Eénmalige migratie: `prospects.notities` intake-dumps -> `contact_logs`-regels (idempotent, gemarkeerd).
- Geen nieuwe tabel nodig.

## Componenten die geraakt worden

- `app/api/voice-parse/route.ts`: prompt (multi-intent, datum-herinnering, bestelling, context).
- `components/voice/VoiceFab.tsx`: context meesturen, controle-scherm, naam-resolutie en -correctie, eerlijke terugkoppeling.
- `app/namenlijst/[id]/page.tsx` + de notitie-componenten: samenvoegen tot één boekje, toevoegen-knop.
- Migratie-script: intake-dump -> `contact_logs`.

## Buiten scope (nu niet)

- De Mini-ELEVA-chat en de Mentor-gesprekken samenvoegen in de tijdlijn; die blijven eigen draadjes.
- De visuele wegwijzing / context-kleur (apart traject).
- Pratende-video en andere voice-uitbreidingen.

## Voorgestelde bouwvolgorde

1. Notitieboekje samenvoegen + intake-dump-migratie (zichtbaar resultaat, raakt de spraak nog niet).
2. Spraak-hersenen: multi-intent + datum-herinneringen + bestelling-herkenning + kaart-context.
3. Controle-scherm + naam-controle + eerlijke terugkoppeling.

Elk blok is apart te testen en live te zetten.

## Open vragen

- Mini-ELEVA- en Mentor-gesprekken: alleen aanklikbaar vanuit het boekje, of ook als korte regel ("Mentor-gesprek gevoerd") in de tijdlijn? Voorstel: alleen linken, niet mengen.
- Intake-dump: als één nette gedateerde "intake"-regel in het boekje (leesbaar geformatteerd), niet opgesplitst per vraag. Voorstel: één regel.

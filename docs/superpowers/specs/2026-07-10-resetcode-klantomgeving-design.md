# Resetcode-klantomgeving + klant-Mentor (ontwerp, akkoord Raoul 10 juli 2026)

Raoul gaf akkoord in chat ("ja, top, bouwen maar") op het ontwerp hieronder, na vier
richting-keuzes via vraagronde: token-link zonder account, Mentor als warme ELEVA-gids
met het member zichtbaar, scope = de hele Resetcode, kennisbron = alleen het eigen
Boardslink-materiaal (docs/resetcode/).

## Wat het is

De klanten-kant van ELEVA rond "De Resetcode": eerst het 16-daagse Darmen in
Balans-programma, daarna de Holistic Reset (4 fases, 3.0-variant; de 2.0-variant
bestaat voor ons niet). De klant krijgt één rustige omgeving met drie dingen:

1. **Waar sta ik**: de reis als stations (voorbereiding, darm 16 dagen, laaddagen,
   vetverbranding, stabilisatie, Logisch Leven). Fase-overgangen bevestigt de klant
   zelf (fase 2 mag verlengd tot 40 dagen), geen automatische datum-klik.
   Anti-overwhelm: altijd alleen de fase van nu.
2. **De documenten en video's van de fase**: als slots per fase, Raoul vult ze zelf
   (MediaBlokken-principe). Geen centrale bibliotheek.
3. **De klant-Mentor**: chat, put alleen uit het Boardslink-materiaal. Warme gids,
   verwijst bij persoonlijke, medische of buiten-materiaal-vragen actief en met naam
   naar het member ("bespreek dit even met Gaby"). Nooit medische claims, nooit
   productbeloftes, geen AI-geur.

## Twee ingangen, één kennisbron (toevoeging Raoul 10 juli)

Members doen het programma zelf ook. Dezelfde programma-motor en dezelfde kennis
krijgen daarom twee stemmen:

- **Klant** via `/k/[token]` (later, DB-stap): gids-stem, member zichtbaar als mens.
- **Member** ingelogd in de app: zelfde kennis, stem richting collega-bouwer die zelf
  bezig is; verwijst naar sponsor of upline waar dat past, en mag benoemen dat de
  eigen ervaring straks goud is voor eigen klanten.

## Klantcontact (WhatsApp-vraag Raoul)

Ronde één: automatische e-mails (bestaande Resend-infra) + member-seintje met
kant-en-klaar appje en één WhatsApp-knop (lib/util/wa-nummer.ts). Echte automatische
WhatsApp via de Business API van Meta staat op de parkeerlijst (kosten per gesprek,
template-goedkeuring, bedrijfsverificatie); oppakken als de pilot laat zien dat
members de knop te vaak laten liggen.

## Member-venster

De klantenkaart wordt het venster: fase-voortgang, seintjes op de contactmomenten die
Boardslink al voorschrijft (gestart, rond einde 16 dagen, vóór einde fase 2, einde
fase 4 met vervolg-gesprek), en haal-erbij-signalen uit de Mentor-chat. Pulse-momenten
(dag 0/5/14/28/56) blijven voor gewone productklanten; Resetcode-klanten krijgen de
programma-momenten.

## Bouwvolgorde

1. **NU: founder-preview zonder DB** op `/resetcode-preview` (founders + testers):
   de reis, elke fase als klant-scherm, werkende Mentor-chat met klant/member-
   stem-schakelaar, document- en videoslots leeg. Raoul beslist door zien.
2. **Na doorklik-akkoord: DB-spec apart voorleggen** (risico-regel): tabel voor
   klant-links (patroon prospect_invitations) + programma-status (huidige fase,
   fase-startdatum) + chatgeschiedenis met 30-dagen-opruiming (patroon
   mini_eleva_chats). `/k/[token]` in middleware publicRoutes + eigen claimvrije
   OG-metadata (standing rule). Koppeling klantenkaart + mails + member-seintjes.

## Inhoudsregels

- Alle klant-teksten claim-vrij (programma-instructies zijn feitelijk en mogen;
  product-effecten nooit). Bron: docs/resetcode/, met de README-waarschuwing dat
  films en documenten elkaar op details tegenspreken; twijfelgevallen aan Raoul.
- Bekende correctie verwerkt: fase 4 is NIET "elke dag 1 koolhydraat testen" maar
  toevoegen waar je trek in hebt binnen 80/20.
- Mentor-prompt hergebruikt ANTI_AI_GEUR uit lib/mentor/schrijfregels.ts en de
  kosten-mitigaties uit de mini-ELEVA-chat (model-router, history-trim, quotum).

## Addendum 10 juli (avond): kennisbron verruimd

Raoul meldde dat de Holistic Reset afstamt van het HCG/Bio-HCG-protocol
(Simeons) en gaf akkoord: de acht begeleidings-adviezen uit
docs/resetcode/17-analyse-hcg-achtergrond.md zijn programma-regels geworden
(correctie-dag fase 3, ±1 kg-anker, onderbrekings-protocol, menstruatie-timing,
drink-regels, plateau-grens van vier dagen, pauze tussen rondes,
medicatie-voorbehoud) en de Mentor mag uit dit achtergrond-distillaat putten.
Grenzen: de namen HCG/Bio-HCG/Simeons nooit actief richting klanten, en in
fase 2 van de 3.0 worden GEEN calorieën geteld (500/700 kcal is de
klassieke/2.0-wereld; eten van de fase 2-lijst is de regel).

## Buiten deze ronde

Bestellen/winkelmandje (geparkeerd), score-bots koppelen, 2017-kennisbank,
automatische WhatsApp, echte video's (slots staan klaar).

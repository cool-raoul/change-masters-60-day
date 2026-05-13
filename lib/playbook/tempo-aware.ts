// ============================================================
// lib/playbook/tempo-aware.ts
//
// Maakt de playbook-dagen reagerend op het gekozen tempo
// (commitment_uren: 2 / 4 / 6). Concept:
//
//   - Dag 1 = NIET tempo-aware (Raoul: 'gaat erom dat mensen
//             gewoon hun eerste stappen hebben gedaan').
//   - Dag 2 = niet tempo-aware in deze ronde (de '20 namen'-stap
//             heeft al de drie opties: geheugen / vcard / handmatig).
//   - Dag 3 = tempo-aware. Standaard-stappen-model: A+B+C+D+E.
//   - Dag 4 = tempo-aware. Standaard-stappen-model + dag-specifieke
//             admin-taken (aanpak-kiezen per prospect, bestellinks
//             koppelen). watJeLeert blijft de uitnodig-les met de
//             4-stappen-structuur die de member vandaag toepast.
//   - Dag 5-21 = nog niet tempo-aware (volgende rondes).
//
// De helper neemt een Dag-object + commitment_uren en retourneert
// een nieuwe Dag waarin de tempo-afhankelijke taken zijn
// vervangen door de juiste varianten. Voor dagen zonder tempo-
// specifieke logica gewoon passthrough.
//
// ARCHITECTUUR: deze functie wordt aangeroepen in app/vandaag/page.tsx
// NA de DAGEN.find() en VOOR de override-passes, zodat:
//   - founder-overrides (playbook_overrides / tekst-overrides) nog
//     steeds bovenop tempo-varianten kunnen worden gelegd
//   - aanpassingen aan de tempo-tabel via berekenDagdoelen() direct
//     doorwerken zonder DB-migratie
// ============================================================

import { berekenDagdoelen, type CommitmentUren } from "@/lib/dagdoelen";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";

/**
 * Tempo-specifieke vervangings-data voor dag 3.
 * Wordt aangeroepen vanuit pasTempoToeOpDag().
 *
 * Aantallen komen DIRECT uit berekenDagdoelen() uit lib/dagdoelen.ts.
 * Dat is de bron-of-truth waar de tempo-keuze in /instellingen en
 * /onboarding ook uit leest. Zo blijft alles consistent.
 *
 * Filosofie van dag 3 (afspraak Raoul, 2026-05-13):
 *
 *   Stap A: voeg X nieuwe namen toe aan je lijst
 *   Stap B: stuur eerste bericht naar X mensen (meestal dezelfde
 *           als A, maar mag uit buffer komen)
 *   Stap C: nodig X mensen uit ('sta je open om iets te bekijken?')
 *           Als ze JA zeggen, deel je de link. Dat is het einde van
 *           jouw uitnodig-handeling, jouw werk is dan af voor die
 *           persoon. Verder wachten op tracking-signaal of ze hebben
 *           gekeken.
 *   Stap D: doe je openstaande follow-ups vandaag. GEEN vast getal,
 *           variabel. Mensen die de film/one-pager/presentatie hebben
 *           gezien staan in fase 'one_pager' of 'presentatie' en
 *           wachten op opvolging (3-weg-gesprek, Mini-ELEVA, of
 *           gewone opvolg-vraag). Iemand kan meerdere follow-up-
 *           momenten doorlopen.
 *   Stap E: 1 tot 3 stories + reageren op anderen
 *
 * Plus voor iedereen gelijk:
 *   Sponsor-checkin (optioneel)
 *   Teams-administratie (eenmalig)
 *
 * Opvolg-zin als jij vraagt 'wat moet ik zeggen bij follow-up':
 * "Wat spreekt je hier het meeste in aan?" (NIET "wat vond je ervan").
 */
function bouwDag3VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag3-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Vandaag breidt je netwerk-overzicht uit met ${dd.contacten} nieuwe mensen. Alleen toevoegen, het bericht komt in de volgende stap.\n\nWAAR HAAL JE DEZE ${dd.contacten} MENSEN VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd over dit. Familie, oud-collega's, sportmaatjes, buren, oude vrienden.\n\n2. Je social media-vrienden: mensen die jou al volgen of die jij volgt, maar waar je al een tijd niet mee hebt gesproken. Open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n\n3. Mensen die je dagelijks tegenkomt: bij de koffietent, sportschool, school, werk. Iemand met wie je een gewone kleine babbel had.\n\n4. Nieuwe mensen op social media (advanced): via hashtags die jouw doelgroep gebruikt, mensen in jouw stad, accounts die je volgt en waarvan de volgers passen.\n\nVoeg ze toe in je namenlijst met 1 woord context per persoon ('fitness', 'oud-collega', 'koffietent'). Niet meer, geen biografie. Het label is genoeg om te onthouden waar je 'm zat toen je 'm noteerde.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste bericht sturen ---
    {
      id: "dag3-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze 1-op-1 een persoonlijk bericht. Meestal zijn dit dezelfde ${dd.contacten} die je net hebt toegevoegd, maar als je al een buffer hebt mag je daaruit kiezen.\n\nWAT SCHRIJF JE?\n\nGeen pitch. Geen 'ik heb een geweldige kans'. Gewoon een menselijke vraag waar je oprecht nieuwsgierig naar bent. Een specifieke verwijzing naar iets dat zij hebben gedeeld of een herinnering uit jullie verleden.\n\nVoorbeelden:\n• "Hé Linda, ik moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"\n• "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"\n• "Hé Anne, hoe lang is het ook alweer geleden dat we elkaar hebben gesproken? Hoe is het bij jou?"\n\nZodra je het bericht hebt verstuurd, vertel het aan de Spraak-FAB: "Ik heb een gesprek gestart met [naam]". De prospect gaat dan automatisch van 'prospect' naar 'in gesprek' in je pijplijn. Zo zie je later precies met wie het loopt.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigen om iets te bekijken ---
    {
      id: "dag3-uitnodigingen",
      label: `📨 Nodig ${dd.uitnodigingen} mensen uit om iets te bekijken`,
      uitleg: `Naast de eerste-bericht-stap: nodig ${dd.uitnodigingen} mensen uit om iets kort te bekijken. Dit zijn mensen waarmee je al even in gesprek bent, waarvan je weet wat ze bezighoudt, of waar je sponsor je bij kan ondersteunen.\n\nWAT IS UITNODIGEN PRECIES?\n\nNiet 'plan een meeting'. Wel: de vraag stellen "sta je open om iets kort te bekijken?". Als ze JA zeggen, deel je de link (film, one-pager, of homepage). Dat is het einde van jouw uitnodig-handeling, hun werk begint dan.\n\nLoop je vast bij het bericht? Vraag de Mentor: "Schrijf een uitnodiging voor [naam] die [context]". Of overleg met je sponsor.\n\nZodra je de link hebt gedeeld, vertel het aan de Spraak-FAB: "Ik heb [naam] uitgenodigd en de link gestuurd". De pijplijn-fase wordt automatisch op 'uitgenodigd' gezet. Vanaf nu is het wachten op signaal dat ze hebben gekeken.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag3-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: `Mensen die jouw uitnodiging hebben aangenomen EN inmiddels de film, one-pager of presentatie hebben gezien, staan op opvolging te wachten. Geen vast getal vandaag, dat hangt af van hoeveel mensen je in deze fase hebt.\n\nOpen je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'. Wie staat er open?\n\nDE OPENINGSZIN BIJ EEN FOLLOW-UP:\n\n"Wat spreekt je hier het meeste in aan?"\n\nDeze vraag richt de aandacht op wat hen RAAKT, niet op kritische beoordeling. Vermijd "wat vond je ervan?" — dat lokt vaak negatieve focus uit.\n\nDe vraag opent de echte follow-up-flow:\n1. Peil wat het meeste aansprak\n2. Maak eventuele twijfel helder (Feel-Felt-Found)\n3. Stel closing-vragen, geef richting\n4. Doel-Tijd-Termijn: laat ze hun eigen motivatie uitspreken\n5. Volgende stap: plan of eerste stap\n\nIemand kan in deze follow-up-fase meerdere momenten doorlopen. Geen druk om in één gesprek af te ronden. Wel: blijf eerlijk en consistent terugkomen.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories + reageren op anderen ---
    {
      id: "dag3-stories",
      label: "📱 1 tot 3 stories plaatsen + reageren op anderen",
      uitleg: `Deel 1 tot 3 momenten uit je dag op Instagram of Facebook (stories, niet feed). Een ontbijt, een wandeling, een rustig moment, een blije gedachte. Geen verkoop, geen "kom in m'n business". Gewoon laten zien dat je leeft. Mensen worden door wat ze zien aangetrokken, niet door wat ze lezen.\n\nDaarnaast: reageer ECHT op een paar stories van anderen. Geen "👏👏👏" maar 2-3 zinnen die laten zien dat je hun moment hebt gezien. Zo blijf je in beeld zonder iets te pushen.\n\nDit kost je 5-10 minuten en bouwt zichtbaarheid op een rustige, respectvolle manier.`,
      verplicht: true,
    },

    // --- Sponsor-checkin (optioneel) ---
    {
      id: "dag3-sponsor-checkin",
      label: "💬 Korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor 1 bericht: hoeveel nieuwe namen je vandaag hebt toegevoegd, hoeveel eerste berichten je hebt gestuurd en hoeveel uitnodigingen je hebt geplaatst. Sponsor weet dat je beweegt, jij voelt de lijn naar boven open.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },

    // --- Teams-administratie (eenmalig, niet tempo-aware) ---
    {
      id: "dag3-teams-admin",
      label: "📋 Teams-administratiesysteem aanmaken",
      uitleg:
        "Lifeplus Partner-aanmelding, eenmalige administratieve registratie. Bekijk de korte film in deze taak voor de exacte stappen.",
      verplicht: true,
      filmSlug: "onboarding-stap-7-teams-admin",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 4.
 *
 * Dag 4-thema: 'Vandaag leer je uitnodigen, 4 stappen die werken'.
 * De les zelf staat in watJeLeert (in dagen.ts, statisch). Hier
 * staat de UITVOERINGS-kant: vandaag pas je actief toe wat je leest.
 *
 * Stappen (dezelfde A-B-C-D-E structuur als dag 3 + dag-4-specifiek):
 *
 *   A. X namen toevoegen (consistente dagritme)
 *   B. X eerste berichten sturen (dezelfde of buffer)
 *   C. X uitnodigingen met de 4-stappen-structuur (vandaag pas
 *      je actief toe wat je hebt geleerd)
 *   D. Voor wie 'ja' zei: kies de aanpak (3-weg of Mini-ELEVA).
 *      Eenmalige actie per prospect, niet tempo-afhankelijk
 *      (afhankelijk van hoeveel ja's je hebt).
 *   E. Doe je openstaande follow-ups
 *   F. 1 tot 3 stories + reageren
 *   + Sponsor-checkin (optioneel)
 *   + Bestellinks koppelen (eenmalig admin)
 */
function bouwDag4VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag4-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Dagritme blijft: ${dd.contacten} nieuwe mensen toevoegen aan je netwerk-overzicht. Mensen uit je telefoon die je nog niet hebt benaderd, social-media-vrienden waar je al een tijd niet mee hebt gesproken, mensen die je dagelijks tegenkomt, of nieuwe verbindingen via socials. Eén woord context per persoon is genoeg.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag4-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur een persoonlijk eerste bericht. Geen pitch, gewoon een menselijke vraag waar je oprecht nieuwsgierig naar bent. Spraak-FAB: "Ik heb een gesprek gestart met [naam]" zet ze automatisch op fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen met de 4-stappen-structuur (vandaag's les) ---
    {
      id: "dag4-uitnodigingen-4stappen",
      label: `📨 ${dd.uitnodigingen} uitnodigingen met de 4-stappen-structuur`,
      uitleg: `Vandaag pas je actief toe wat je leest in 'Wat je leert' hierboven. Voor elke uitnodiging:\n\n1. COMPLIMENT of erkenning ('je bent iemand die...')\n2. UITNODIGEN ('wil je het zien?'), kies de variant die past bij hoe warm de prospect is (direct / indirect / super-indirect)\n3. PLAN met twee opties ('vanavond of morgen?'), geen open vraag\n4. Optionele opener bij business-prospects ('ik heb weinig tijd, maar...')\n\nDoel: ja op het KIJKMOMENT, niet ja op jou. Als de prospect ja zegt, deel je de link. De pijplijn-fase wordt 'uitgenodigd'. Vertel het aan de Spraak-FAB: "Ik heb [naam] uitgenodigd en de link gestuurd".\n\nLoop je vast? Vraag de Mentor: "Schrijf een uitnodiging voor [naam] die [context]".`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: aanpak kiezen voor wie ja zei ---
    {
      id: "dag4-aanpak-kiezen",
      label: "🧭 Voor wie 'ja' zei: kies de aanpak (3-weg of Mini-ELEVA)",
      uitleg: `Voor elke prospect die ja zei tegen een kijkmoment: open hun kaart in de namenlijst en kies één van twee paden via het keuze-blok bovenaan.\n\n🤝 3-WEG-GESPREK voor: warme prospects, mensen die snel willen schakelen, kort traject mogelijk, persoonlijk contact passend. Stappenplan staat klaar achter de '3-weg'-knop op de kaart. Op dag 7 verdiep je dit verder.\n\n✨ MINI-ELEVA voor: twijfelaars, prospects met druk leven, mensen die eerst zelf willen kijken. 14 dagen eigen toegang, welkomstvideo's, AI-mentor, chat met jou en je sponsor. Klik 'Mini-ELEVA-uitnodiging maken' op de kaart.\n\nNiet zeker? Druk op 'Overleg met sponsor' in het keuze-blok, dan opent een vooringevulde WhatsApp aan je sponsor met de prospect-context.\n\nJe hoeft niet voor iedereen vandaag te kiezen, alleen voor de mensen die je deze week serieus opvolgt.`,
      verplicht: false,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: openstaande follow-ups ---
    {
      id: "dag4-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag, afhankelijk van wie er klaar staat in je pijplijn.\n\nOpen je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nDE OPENINGSZIN BIJ EEN FOLLOW-UP:\n\n"Wat spreekt je hier het meeste in aan?"\n\nVraag op het positieve dat hen RAAKT, niet op kritische beoordeling. Vermijd "wat vond je ervan?".\n\nDaarna volg je de flow: peil wat aansprak → twijfel helder maken → closing-vragen → Doel-Tijd-Termijn → volgende stap.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap F: stories + reageren ---
    {
      id: "dag4-stories",
      label: "📱 1 tot 3 stories plaatsen + reageren op anderen",
      uitleg: `Deel 1 tot 3 momenten uit je dag op Instagram of Facebook (stories, niet feed). Geen verkoop, gewoon laten zien dat je leeft. Plus echte reacties op stories van anderen, 2-3 zinnen per reactie. Geen "👏👏👏".`,
      verplicht: true,
    },

    // --- Sponsor-checkin (optioneel) ---
    {
      id: "dag4-sponsor-checkin",
      label: "💬 Korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor 1 bericht: hoe ging het toepassen van de 4-stappen-uitnodiging vandaag? Voelde de structuur natuurlijk of nog stroef? Eén zin.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },

    // --- Bestellinks koppelen (eenmalig, admin) ---
    {
      id: "dag4-bestellinks",
      label: "🔗 Bestellinks koppelen aan ELEVA",
      uitleg:
        "Plak per pakket je Lifeplus-webshop-URL in ELEVA. Daarna gebruikt ELEVA die links automatisch in productadvies-flows. Vraag je sponsor om mee te kijken voor de juiste shop-product-pagina's per pakket.",
      verplicht: false,
      actieRoute: "/instellingen/bestellinks",
      filmSlug: "onboarding-stap-9-bestellinks",
    },
  ];
}

/**
 * Past tempo-specifieke vervangingen toe op een dag.
 *
 * Voor dagen met tempo-aware logica (momenteel dag 3 + dag 4):
 * vervangt vandaagDoen. Voor andere dagen passthrough.
 *
 * @param dag             Basis-dag uit DAGEN[].
 * @param commitmentUren  Het tempo dat de user heeft gekozen. Null
 *                        = nog geen keuze gemaakt; in dat geval
 *                        passthrough (geen vervanging).
 */
export function pasTempoToeOpDag(
  dag: Dag,
  commitmentUren: CommitmentUren | null,
): Dag {
  // Geen tempo gekozen of dag is niet tempo-aware -> ongewijzigd terug.
  if (commitmentUren === null) return dag;

  if (dag.nummer === 3) {
    return {
      ...dag,
      vandaagDoen: bouwDag3VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 4) {
    return {
      ...dag,
      vandaagDoen: bouwDag4VandaagDoen(commitmentUren),
    };
  }

  // Andere dagen: voorlopig nog niet tempo-aware. Hier komen volgende
  // rondes de varianten voor dag 5-21 te zien.
  return dag;
}

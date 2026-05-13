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

// ============================================================
// Tekst-blok dat we hergebruiken op alle tempo-aware dagen:
// stories-uitleg + follow-up-uitleg. Zo blijft het consistent
// en updaten we het op één plek.
// ============================================================

const STORIES_UITLEG = `Deel 1 tot 3 momenten uit je dag op Instagram of Facebook (stories, niet feed). Een ontbijt, een wandeling, een rustig moment, een blije gedachte. Geen verkoop, geen "kom in m'n business". Gewoon laten zien dat je leeft. Mensen worden door wat ze zien aangetrokken, niet door wat ze lezen.\n\nREAGEREN OP STORIES VAN ANDEREN is minstens zo belangrijk als zelf posten. Waarom? Als je reageert op iemands story, land je RECHTSTREEKS in z'n DM. Dat is de plek waar het echte gesprek begint. Eén oprechte 2-3 zinnen-reactie op een story is goud waard.\n\nWat doe je vandaag?\n\n1. Plaats 1 tot 3 stories uit je dag (lifestyle, geen pitch)\n2. Open Instagram of Facebook en geef bij 3 stories van anderen een ECHTE reactie. Geen "👏👏👏" maar 2-3 zinnen die laten zien dat je hun moment hebt gezien.\n3. Wordt het een gesprek? Top. Als dit een NIEUW persoon is (nog niet op je lijst), voeg ze toe en zet ze op fase 'in gesprek' (gebruik Spraak-FAB: "Ik heb een gesprek gestart met [naam]").\n\nZo bouw je rustige zichtbaarheid + concrete nieuwe gesprekken zonder iets te pushen.`;

const FOLLOWUP_UITLEG = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag — afhankelijk van wie er klaar staat in je pijplijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nDE OPENINGSZIN, twee varianten:\n\n• ALGEMEEN: "Wat spreekt je hier het meeste in aan?"\n  Richt de aandacht op wat hen RAAKTE. Werkt altijd.\n\n• WHY-GERICHT (als jij hun WHY al kent): "Zie je hoe dit je kan brengen tot [hun WHY]?"\n  Voorbeelden:\n    - "Zie je hoe dit je kan brengen tot die extra vrije dag die je graag zou willen?"\n    - "Zie je hoe dit je kan brengen tot die vakantiedagen die je extra zou willen?"\n    - "Zie je hoe dit je kan brengen tot meer tijd met je kinderen?"\n  Deze variant raakt direct in hun motivatie. Krachtig als je het goed weet.\n\nVermijd ABSOLUUT "Wat vond je ervan?" — dat lokt oordeel uit in plaats van verbinding.\n\nWAT KOMT NA HET ANTWOORD?\n\n1. ANTWOORD VAN PROSPECT → luister wat ze zeggen, doorvragen op wat ze NOEMEN.\n\n2. KIES DE VALIDATIE-VORM. Pas hier en NU bepaal je per prospect of dit:\n   🤝 een 3-WEG-GESPREK wordt (met sponsor erbij, klassiek, persoonlijk)\n   ✨ een MINI-ELEVA wordt (14 dagen eigen omgeving voor wie eerst rustig wil verkennen)\n   Open de prospect-kaart in de namenlijst, het keuze-blok bovenaan zit klaar. Niet zeker? Klik 'Overleg met sponsor' en je sponsor krijgt een vooringevulde WhatsApp.\n\n3. BIJ TWIJFEL OF VRAGEN: gebruik Feel-Felt-Found.\n   - "Ik begrijp dat je dat voelt" (Feel)\n   - "Veel mensen voelden dat in het begin ook" (Felt)\n   - "Wat ze ontdekten was..." (Found, met iets concreets)\n\n4. CLOSING-VRAGEN, richting geven:\n   - "Hoe serieus zou je hiernaar willen kijken?"\n   - "Wat heb je nog nodig om hier een goede beslissing over te nemen?"\n   - "Zie je jezelf hier eerder als klant, of zie je ook de opbouwkant?"\n\n5. DOEL-TIJD-TERMIJN, laat HEN hun motivatie uitspreken (gebruik dit als ze geïnteresseerd zijn):\n   - "Hoeveel euro per maand zou je willen verdienen?"\n   - "Hoeveel uur per week heb je realistisch?"\n   - "Na hoeveel maanden zou dat moment er moeten zijn?"\n   - "Als ik een realistisch plan kan laten zien, ben je dan bereid serieus te kijken?"\n\n6. VOLGENDE STAP: of een plan tonen, of direct de eerste stap zetten.\n\nEén prospect kan meerdere follow-up-momenten doorlopen. Geen druk om in 1 gesprek af te ronden. Wel: blijf eerlijk en consistent terugkomen.`;

/**
 * Tempo-specifieke vervangings-data voor dag 3.
 *
 * Dag 3 is CONSOLIDEREND, niet uitnodigend. Reden: dag 4 leert pas
 * de 4-stappen-uitnodiging-structuur. Op dag 3 doe je geen NIEUWE
 * uitnodigingen, je focust op contact leggen (A+B), follow-ups
 * (D, op dag 3 vaak nog 0-2 want op dag 2 heb je samen met je
 * sponsor 3 invites gedaan), stories (E), sponsor-checkin en de
 * eenmalige Teams-administratie.
 */
function bouwDag3VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag3-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Vandaag breidt je netwerk-overzicht uit met ${dd.contacten} nieuwe mensen. Alleen toevoegen, het bericht komt in de volgende stap.\n\nWAAR HAAL JE DEZE ${dd.contacten} MENSEN VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd over dit. Familie, oud-collega's, sportmaatjes, buren, oude vrienden.\n\n2. Je social media-vrienden: mensen die jou al volgen of die jij volgt, maar waar je al een tijd niet mee hebt gesproken. Open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n\n3. Mensen die je dagelijks tegenkomt: bij de koffietent, sportschool, school, werk. Iemand met wie je een gewone kleine babbel had.\n\n4. Nieuwe mensen op social media: via hashtags die jouw doelgroep gebruikt, mensen in jouw stad, accounts die je volgt en waarvan de volgers passen.\n\nVoeg ze toe in je namenlijst met 1 woord context per persoon ('fitness', 'oud-collega', 'koffietent'). Niet meer, geen biografie.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste bericht sturen ---
    {
      id: "dag3-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze 1-op-1 een persoonlijk bericht. Meestal zijn dit dezelfde ${dd.contacten} die je net hebt toegevoegd, maar als je al een buffer hebt mag je daaruit kiezen.\n\nWAT SCHRIJF JE?\n\nGeen pitch. Geen 'ik heb een geweldige kans'. Gewoon een menselijke vraag waar je oprecht nieuwsgierig naar bent. Een specifieke verwijzing naar iets dat zij hebben gedeeld of een herinnering uit jullie verleden.\n\nVoorbeelden:\n• "Hé Linda, ik moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"\n• "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"\n• "Hé Anne, hoe lang is het ook alweer geleden dat we elkaar hebben gesproken? Hoe is het bij jou?"\n\nZodra je het bericht hebt verstuurd, vertel het aan de Spraak-FAB: "Ik heb een gesprek gestart met [naam]". De prospect gaat dan automatisch van 'prospect' naar 'in gesprek' in je pijplijn.\n\nMORGEN (dag 4) leer je hoe je deze gesprekken omzet in echte uitnodigingen voor een kijkmoment. Vandaag focus op het opbouwen van het gesprek.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag3-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories + reageren op anderen ---
    {
      id: "dag3-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- Sponsor-checkin (optioneel) ---
    {
      id: "dag3-sponsor-checkin",
      label: "💬 Korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor 1 bericht over hoe dag 3 is geweest. Hoeveel nieuwe namen, hoeveel eerste gesprekken? Niets uitgebreids, gewoon een update.",
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
 * de uitvoerings-kant: vandaag pas je actief toe wat je leest.
 *
 * Aanpak-keuze (3-weg vs Mini-ELEVA) is NIET een aparte stap maar
 * onderdeel van follow-up. Reden: je kiest pas welke validatie-vorm
 * past NA dat de prospect heeft gekeken EN op de openings-vraag
 * heeft gereageerd. Dat is fase 'follow-up'. Wel apart noemen in
 * de uitleg van die stap, niet als losse afvink-taak vooraf.
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
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur een persoonlijk eerste bericht. Geen pitch, gewoon een menselijke vraag. Spraak-FAB: "Ik heb een gesprek gestart met [naam]" zet ze automatisch op fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen met de 4-stappen-structuur (vandaag's les) ---
    {
      id: "dag4-uitnodigingen-4stappen",
      label: `📨 ${dd.uitnodigingen} uitnodigingen met de 4-stappen-structuur`,
      uitleg: `Vandaag pas je actief toe wat hierboven in "Wat je leert" staat. Voor elke uitnodiging:\n\n1. COMPLIMENT of erkenning ("je bent iemand die...")\n2. UITNODIGEN ("wil je het zien?"), kies de variant die past bij hoe warm de prospect is (direct / indirect / super-indirect)\n3. PLAN met twee opties ("vanavond of morgen?"), geen open vraag\n4. Optionele opener bij business-prospects ("ik heb weinig tijd, maar...")\n\nDoel: ja op het KIJKMOMENT, niet ja op jou. Als de prospect ja zegt, deel je de link. De pijplijn-fase wordt 'uitgenodigd'. Vertel het aan de Spraak-FAB: "Ik heb [naam] uitgenodigd en de link gestuurd".\n\nLoop je vast? Vraag de Mentor: "Schrijf een uitnodiging voor [naam] die [context]". Of overleg met je sponsor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups (inclusief aanpak-keuze NA antwoord) ---
    {
      id: "dag4-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories + reageren ---
    {
      id: "dag4-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
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

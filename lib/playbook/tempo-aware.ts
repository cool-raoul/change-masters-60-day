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

const STORIES_UITLEG = `Deel 1 tot 3 momenten uit je dag op Instagram of Facebook (stories, niet feed). Een ontbijt, een wandeling, een rustig moment, een blije gedachte. Geen verkoop, geen "kom in m'n business". Gewoon laten zien dat je leeft. Mensen worden door wat ze zien aangetrokken, niet door wat ze lezen.\n\nREAGEREN OP STORIES VAN ANDEREN is minstens zo belangrijk als zelf posten. Waarom? Als je reageert op iemands story, land je RECHTSTREEKS in z'n DM. Dat is de plek waar het echte gesprek begint. Eén oprechte 2-3 zinnen-reactie op een story is goud waard.\n\nWat doe je vandaag?\n\n1. Plaats 1 tot 3 stories uit je dag (lifestyle, geen pitch)\n2. Open Instagram of Facebook en geef bij 3 stories van anderen een ECHTE reactie. Geen "👏👏👏" maar 2-3 zinnen die laten zien dat je hun moment hebt gezien.\n3. Wordt het een gesprek? Top. Als dit een NIEUW persoon is (nog niet op je lijst), voeg ze toe en zet ze op fase 'in gesprek' via de spraakfunctie ("Ik heb een gesprek gestart met [naam]").\n\nZo bouw je rustige zichtbaarheid + concrete nieuwe gesprekken zonder iets te pushen.`;

// Voor dag 3 + dag 4 (start-fase): alleen de openings-zin + luisteren.
// De diepere flow (Feel-Felt-Found, closing-vragen, Doel-Tijd-Termijn,
// volgende stap) komt stap-voor-stap in latere dagen aan bod, niet
// allemaal tegelijk op dag 3 of 4 — dat zou overweldigend zijn voor
// een member die net begint. Onderaan staat WEL al de verwijzing
// naar sponsor + Mentor, zodat een member die direct vastloopt op
// een specifiek bericht weet waar 'ie per direct hulp kan halen.
const FOLLOWUP_UITLEG_BASIS = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag — afhankelijk van wie er klaar staat in je pijplijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nVOOR NU FOCUS JE OP ÉÉN DING, de openingszin. De diepere opvolg-technieken (twijfel ombuigen, closing-vragen, doel-tijd-termijn) komen in de dagen hierna stap voor stap aan bod. Vandaag oefen je alleen het OPENEN van het gesprek.\n\nDE OPENINGSZIN, twee varianten:\n\n• ALGEMEEN: "Wat spreekt je hier het meeste in aan?"\n  Werkt altijd. Richt de aandacht op wat hen RAAKTE.\n\n• WHY-GERICHT (als je hun WHY al kent): "Zie je hoe dit je kan brengen tot [hun WHY]?"\n  Voorbeelden:\n    - "Zie je hoe dit je kan brengen tot die extra vrije dag die je graag zou willen?"\n    - "Zie je hoe dit je kan brengen tot die vakantiedagen die je extra zou willen?"\n    - "Zie je hoe dit je kan brengen tot meer tijd met je kinderen?"\n  Krachtig als je hun WHY weet.\n\nVermijd "Wat vond je ervan?" — dat lokt oordeel uit in plaats van verbinding.\n\nLUISTER WAT ZE ZEGGEN. Doorvragen op wat ze NOEMEN. Geen pitch, geen druk om vandaag iets te beslissen. De volgende stappen (validatie, twijfel ombuigen, closen) leer je later in het playbook.\n\n🆘 KOM JE NU VAST OP EEN SPECIFIEK BERICHT?\n\nWacht niet tot je het zelf moet verzinnen. Je hebt twee snelle hulplijnen — gebruik ze:\n\n• Je sponsor — stuur een korte WhatsApp met de letterlijke tekst die je hebt ontvangen, plus één vraag ("Hoe zou jij hier op reageren?"). Sponsors zijn er precies hiervoor.\n• De Mentor (in het zijmenu) — plak het bericht, vraag een reactie-suggestie. De Mentor schrijft op maat in jouw toon en houdt rekening met fase + WHY van de prospect.\n\nDieper-ingaan op berichten leer je later, maar deze vangnetten zijn er nu al.`;

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
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze 1-op-1 een persoonlijk bericht.\n\n📱 HOE JE DIRECT IN WHATSAPP, INSTAGRAM OF FACEBOOK BELANDT\n\nIn je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik op het juiste icoon en de juiste app opent met die persoon — geen kopiëren-en-plakken, geen zoeken. Vereiste: telefoonnummer of social-handle moet ingevuld zijn op de kaart. Heb je dat niet? Klik op de prospect, vul het in, en daarna verschijnen de icoontjes vanzelf op zowel de lijst als de detail-kaart.\n\nBELANGRIJK: DIT IS EEN OPENER, GEEN CASUAL CATCH-UP.\n\nTopcoaches in netwerkmarketing zijn er duidelijk over: een eerste bericht is bedoeld om een gesprek te openen dat BINNEN 1 TOT 3 BERICHTEN leidt tot een uitnodiging voor een kijkmoment. Niet om eerst weken te koffieklokken en pas later 'iets te vertellen'. Dat tweede pad voelt voor de prospect als een verborgen agenda — ze hebben jou prima door wanneer de pitch eindelijk komt.\n\nDe regel: open zo dat het natuurlijk voelt, en wees binnen 1-3 berichten bij je uitnodiging. Vandaag oefen je STAP 1, het openen. MORGEN (dag 4) leer je de uitnodig-formule die je per direct mag toepassen op iedereen die vandaag warm reageert.\n\nWAT SCHRIJF JE ALS OPENER?\n\nGeen pitch. Geen 'ik heb een geweldige kans'. Wél een menselijke, specifieke vraag waar je oprecht nieuwsgierig naar bent. Een specifieke verwijzing naar iets dat zij hebben gedeeld of een herinnering uit jullie verleden.\n\nVoorbeelden:\n• "Hé Linda, ik moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"\n• "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"\n• "Hé Anne, hoe lang is het ook alweer geleden dat we elkaar hebben gesproken? Hoe is het bij jou?"\n\nZodra je het bericht hebt verstuurd, vertel het aan de spraakfunctie: "Ik heb een gesprek gestart met [naam]". De prospect gaat dan automatisch van 'prospect' naar 'in gesprek' in je pijplijn.\n\nALS IEMAND WARM TERUGKOMT vandaag, hoef je niet te wachten tot morgen. Reageer kort, peil wat ze nu bezighoudt en bewaar de uitnodig-stap voor wanneer dat natuurlijk past — maar weet: het móét niet weken wachten.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: openstaande follow-ups ---
    {
      id: "dag3-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_BASIS,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap D: stories + reageren op anderen ---
    {
      id: "dag3-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
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

    // --- LAATSTE STAP: sponsor-checkin (afsluiting van de dag) ---
    {
      id: "dag3-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 3 erop zitten. Stuur je sponsor een berichtje met hoe het ging: hoeveel nieuwe namen, hoeveel eerste gesprekken, hoe het voelt. Niets uitgebreids, gewoon even een update om de dag mooi af te sluiten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
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
    // --- HOOFDTAAK: 4-stappen-uitnodiging meteen toepassen (vandaag's les) ---
    // Eerste stap zodat de les bovenaan ('Wat je leert') vers in het hoofd
    // is wanneer de member de uitnodigingen schrijft.
    {
      id: "dag4-uitnodigingen-4stappen",
      label: `📨 Pas vandaag de 4-stappen-uitnodiging toe bij ${dd.uitnodigingen} mensen`,
      uitleg: `DE LES van vandaag staat hierboven in 'Wat je leert' met voorbeelden van Eric Worre. Pak die er bij wanneer je gaat schrijven.\n\nDE FORMULE in het kort:\n\n1. COMPLIMENT of erkenning ("je bent iemand die...")\n2. UITNODIGEN ("wil je het zien?"), kies de variant die past bij hoe warm de prospect is (direct / indirect / super-indirect)\n3. PLAN met twee opties ("vanavond of morgen?"), geen open vraag\n4. Optionele opener bij business-prospects ("ik heb weinig tijd, maar...")\n\nDoel: ja op het KIJKMOMENT, niet ja op jou. Als de prospect ja zegt, deel je de link. De pijplijn-fase wordt 'uitgenodigd'. Vertel het aan de spraakfunctie: "Ik heb [naam] uitgenodigd en de link gestuurd".\n\nHULP NODIG? De drie knoppen onder dit vak zijn er om mee te starten:\n• Voorbeelden bekijken: complete scripts klaar om aan te passen\n• Met je sponsor: open WhatsApp met een vraag om hulp\n• Met de Mentor: laat de Mentor een uitnodiging op maat schrijven`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap A: nieuwe namen toevoegen (dagritme) ---
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
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur een persoonlijk eerste bericht.\n\n📱 DIRECT IN WHATSAPP/IG/FB BELANDEN: in je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik en de juiste app opent met die persoon. Vereiste: telefoonnummer of social-handle staat op de kaart. Niet ingevuld? Open de prospect, vul aan, en de icoontjes verschijnen vanzelf.\n\nLINK MET DE LES VAN VANDAAG: dit is je OPENER. Je 4-stappen-uitnodiging hierboven leer je vandaag niet om in losse berichten over weken uit te smeren, maar om in dezelfde chat-flow door te zetten zodra het natuurlijk past. Topcoaches zijn het er over eens: openen → korte verbinding → uitnodigen, het liefst in dezelfde gespreksbeurt, hooguit binnen een paar berichten. Wachten met de uitnodiging tot 'over een week' voelt voor de prospect als een verborgen agenda.\n\nPRAKTISCH:\n\n1. Open met een menselijke, specifieke vraag (geen pitch). "Hé [naam], moest aan je denken omdat..." of "Hé [naam], hoe gaat het nu met...?"\n2. Laat ze reageren. Lees wat ze NOEMEN (energie, druk, doelen, zorgen).\n3. Brug naar de uitnodiging: gebruik de 4-stappen-formule van vandaag. Compliment → uitnodiging → twee tijdsblokken. Heb je hulp nodig? Drie knoppen onder de hoofd-stap brengen je naar voorbeelden, je sponsor of de Mentor.\n\nVia de spraakfunctie meld je: "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'. Zodra je hen ook uitnodigt: "Ik heb [naam] uitgenodigd" → fase 'uitgenodigd'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Openstaande follow-ups (alleen basis-flow voor nu) ---
    {
      id: "dag4-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_BASIS,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stories + reageren ---
    {
      id: "dag4-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- Bestellinks koppelen (start van meerdere dagen) ---
    {
      id: "dag4-bestellinks",
      label: "🔗 Bestellinks koppelen, begin vandaag met zoveel mogelijk",
      uitleg:
        "Plak per pakket je Lifeplus-webshop-URL in ELEVA. Daarna gebruikt het systeem die links automatisch in productadvies-flows.\n\nDIT IS HET BEGIN. Doe vandaag zoveel als je kunt, in de dagen hierna voegen we de rest toe. Niet alles vandaag verplicht — beter rustig en kloppend dan haastig en fout.\n\nVraag je sponsor om mee te kijken voor de juiste shop-product-pagina's per pakket.",
      verplicht: false,
      actieRoute: "/instellingen/bestellinks",
      filmSlug: "onboarding-stap-9-bestellinks",
    },

    // --- LAATSTE STAP: sponsor-checkin (afsluiting van de dag) ---
    {
      id: "dag4-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "Je hebt dag 4 erop zitten. Stuur je sponsor in 30 seconden hoe het ging: hoe voelde de 4-stappen-uitnodiging? Natuurlijk of nog stroef? Eén zin is genoeg.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
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

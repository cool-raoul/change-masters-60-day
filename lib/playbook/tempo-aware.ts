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

import {
  berekenDagdoelen,
  dagdoelenMinimum,
  type CommitmentUren,
} from "@/lib/dagdoelen";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";

// ============================================================
// Tekst-blok dat we hergebruiken op alle tempo-aware dagen:
// stories-uitleg + follow-up-uitleg. Zo blijft het consistent
// en updaten we het op één plek.
// ============================================================

const STORIES_UITLEG = `Deel 1 tot 3 momenten uit je dag op Instagram of Facebook (stories, niet feed). Een ontbijt, een wandeling, een rustig moment, een blije gedachte. Geen verkoop, geen "kom in m'n business". Gewoon laten zien dat je leeft. Mensen worden door wat ze zien aangetrokken, niet door wat ze lezen.\n\nREAGEREN OP STORIES VAN ANDEREN is minstens zo belangrijk als zelf posten. Waarom? Als je reageert op iemands story, land je RECHTSTREEKS in z'n DM. Dat is de plek waar het echte gesprek begint. Eén oprechte 2-3 zinnen-reactie op een story is goud waard.\n\nWat doe je vandaag?\n\n1. Plaats 1 tot 3 stories uit je dag (lifestyle, geen pitch)\n2. Open Instagram of Facebook en geef bij 3 stories van anderen een ECHTE reactie. Geen "👏👏👏" maar 2-3 zinnen die laten zien dat je hun moment hebt gezien.\n3. Wordt het een gesprek? Top. Als dit een NIEUW persoon is (nog niet op je lijst), voeg ze toe en zet ze op fase 'in gesprek' via de spraakfunctie ("Ik heb een gesprek gestart met [naam]").\n\nZo bouw je rustige zichtbaarheid + concrete nieuwe gesprekken zonder iets te pushen.`;

// Voor dag 3 + dag 4 (start-fase): alleen de openings-zin + luisteren.
// De diepere flow (Feel-Felt-Found vanaf dag 5, follow-up-cadans vanaf
// dag 6, closing-vragen en Doel-Tijd-Termijn vanaf dag 8+) komt
// stap-voor-stap in latere dagen aan bod, niet allemaal tegelijk op
// dag 3 of 4 — dat zou overweldigend zijn voor een member die net
// begint. Onderaan staat WEL al de verwijzing naar sponsor + Mentor,
// zodat een member die direct vastloopt op een specifiek bericht weet
// waar 'ie per direct hulp kan halen.
const FOLLOWUP_UITLEG_BASIS = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag — afhankelijk van wie er klaar staat in je pijplijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nVOOR NU FOCUS JE OP ÉÉN DING, de openingszin. De diepere opvolg-technieken (Feel-Felt-Found voor bezwaren, follow-up-cadans, closing-vragen, doel-tijd-termijn) komen verderop in de playbook stap voor stap aan bod (vanaf dag 5). Vandaag oefen je alleen het OPENEN van het gesprek.\n\nDE OPENINGSZIN, twee varianten:\n\n• ALGEMEEN: "Wat spreekt je hier het meeste in aan?"\n  Werkt altijd. Richt de aandacht op wat hen RAAKTE.\n\n• WHY-GERICHT (als je hun WHY al kent): "Zie je hoe dit je kan brengen tot [hun WHY]?"\n  Voorbeelden:\n    - "Zie je hoe dit je kan brengen tot die extra vrije dag die je graag zou willen?"\n    - "Zie je hoe dit je kan brengen tot die vakantiedagen die je extra zou willen?"\n    - "Zie je hoe dit je kan brengen tot meer tijd met je kinderen?"\n  Krachtig als je hun WHY weet.\n\nVermijd "Wat vond je ervan?" — dat lokt oordeel uit in plaats van verbinding.\n\nLUISTER WAT ZE ZEGGEN. Doorvragen op wat ze NOEMEN. Geen pitch, geen druk om vandaag iets te beslissen. De volgende stappen (validatie, twijfel ombuigen, closen) komen verderop in het playbook (vanaf dag 5).\n\n🆘 KOM JE NU VAST OP EEN SPECIFIEK BERICHT?\n\nWacht niet tot je het zelf moet verzinnen. Je hebt twee snelle hulplijnen — gebruik ze:\n\n• Je sponsor — stuur een korte WhatsApp met de letterlijke tekst die je hebt ontvangen, plus één vraag ("Hoe zou jij hier op reageren?"). Sponsors zijn er precies hiervoor.\n• De Mentor (in het zijmenu) — plak het bericht, vraag een reactie-suggestie. De Mentor schrijft op maat in jouw toon en houdt rekening met fase + WHY van de prospect.\n\nDieper-ingaan op berichten komt verderop in het playbook, maar deze vangnetten zijn er nu al.`;

// Voor dag 7+: members hebben Feel-Felt-Found (FFF, op dag 5) EN
// follow-up-cadans + 5-fasen-flow (op dag 6) al geleerd. De tekst
// toont BEIDE technieken compact als referentie (concrete zinnen
// per fase, FFF-structuur) zodat de member ze direct kan toepassen
// zonder eerst terug-bladeren. Daarna een drie-stappen-aanpak
// 'eerst-zelf-dan-check' die voor beide technieken werkt. Doel:
// vakmanschap door eigen denken, niet afhankelijkheid van Mentor.
const FOLLOWUP_UITLEG_NA_DAG6 = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag — afhankelijk van wie er klaar staat in je pijplijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nDE OPENINGSZIN, twee varianten:\n\n• ALGEMEEN: "Wat spreekt je hier het meeste in aan?"\n• WHY-GERICHT (als je hun WHY al kent): "Zie je hoe dit je kan brengen tot [hun WHY]?"\n\nVermijd "Wat vond je ervan?" — dat lokt oordeel uit in plaats van verbinding.\n\n💪 VANDAAG GA JE ZELF OEFENEN MET TWEE TECHNIEKEN\n\nDe afgelopen twee dagen heb je twee technieken geleerd. Vandaag pas je ze ZELF toe — dat is de overgang van leren naar kunnen.\n\nDE 5-FASEN-FOLLOW-UP (van dag 6) — concrete zinnen per fase:\n\n1. CHECK-IN (24-48u na uitnodiging): "Even inchecken, hoe gaat het met je?"\n2. PEILEN (na 3-5 dagen): "Wat sprak je het meeste aan van wat je gezien hebt?"\n3. VERDIEPEN (na 7-10 dagen): "Dit wilde ik je ook nog laten zien..." + tweede waardevol punt\n4. UITNODIGING NAAR EVENT/3-WEG (na 10-14 dagen): "Er is binnenkort iets dat past, wil je erbij zijn?"\n5. SLUITEN OF NOT-YET (na 14-21 dagen): "Wat is voor jou het belangrijkste punt om helder te krijgen?"\n\nPLUS de stilgevallen-zin als iemand al langer stil is:\n"Hé [naam], ik zag dat je niet meer had gereageerd op mijn laatste berichtje. Is dat omdat je druk was of omdat je geen interesse hebt op dit moment? Allebei prima hoor, ik dacht: ik vraag het even!"\n\nFEEL-FELT-FOUND (FFF, van dag 5) — voor wanneer er een bezwaar komt:\n\n• FEEL: "Ik snap dat het zo voelt."\n• FELT: "Veel mensen voelden dat in het begin ook."\n• FOUND: "Wat zij merkten was [korte herframing]."\n• DOORVRAAG: "Maar vertel eens, waar zit het 'm nu écht in?"\n\nDE DRIE-STAPPEN-AANPAK BIJ ELK NIEUW BERICHT\n\n1. EERST ZELF SCHRIJVEN. Open je notitie-app of typ in WhatsApp (concept, niet versturen). Welk fase-zin past bij deze prospect (waar staan ze in de 5 fasen)? Komt er een bezwaar? Schrijf de FFF-reactie in jouw stijl. Geen scripts kopiëren, geen Mentor vragen.\n\n2. CHECK TEGEN WAT JE HEBT GELEERD. Klopt de fase-zin die je koos? Past de FFF-volgorde (feel-felt-found-doorvraag) op het bezwaar? Voelt het natuurlijk of geforceerd?\n\n3. PAS DAN HULP VRAGEN, ALS JE TWIJFELT. Stuur je concept + korte prospect-context naar sponsor of Mentor met de vraag 'Klopt dit volgens jou?'. Niet 'schrijf 'm voor mij' — wel 'kijk mee'.\n\nWaarom in deze volgorde? Omdat zelf nadenken een SPIER is die je bouwt door 'm te gebruiken. Hulp meteen vragen is comfort, maar het houdt je beginner. Eerst zelf, dan check — dat is hoe je een professional wordt.\n\nDieper terug-bladeren? Menu → Playbook → Dag 5 (FFF in detail) en Dag 6 (5-fasen-flow in detail).\n\n🆘 KOM JE ECHT VAST?\n\n• Je sponsor — stuur de letterlijke tekst die je hebt ontvangen + jouw concept-reactie + de vraag 'wat zou jij ervan vinden?'\n• De Mentor (in het zijmenu) — zelfde aanpak: deel je concept en vraag om feedback. De Mentor is getraind om mee te kijken, niet om voor jou te schrijven.`;

// ============================================================
// Anti-uitval-blokken voor dag 5 en dag 6. Bovenin de uitleg van
// de eerste stap (dag5-namen-toevoegen / dag6-namen-toevoegen)
// staat dit korte blokje dat de wiskunde van drop-off normaliseert.
// Doel: het 'zes-nees-en-stoppen'-uitval-patroon ondervangen.
// ============================================================

const ANTI_UITVAL_DAG5 = `ℹ️ EVEN VOOR DE RUST: VEEL MENSEN TWIJFELEN ROND DIT MOMENT\n\nHeb je deze week 5-10 mensen benaderd en weinig terug gekregen? Dat is normaal en wiskundig verwacht. De gemiddelde response-ratio in netwerk-marketing ligt rond 1 op 15-20 contacten. Dat is geen falen, dat is gewoon hoe het werkt.\n\nWat je vandaag aan extra ankerpunten hebt:\n- De Feel-Felt-Found-formule (FFF) die je zo gaat leren — voor bezwaren ombuigen\n- Je sponsor of de Mentor om hulp aan te vragen bij een specifiek bericht\n- De DMO-training in de Academy als je meer wilt begrijpen van de cijfers\n\nVerder met je dag-flow.\n\n──────────────────────────────────────────\n\n`;

const ANTI_UITVAL_DAG6 = `ℹ️ EVEN VOOR DE RUST: VEEL MENSEN ONDERSCHATTEN DE 80%-WAARDE\n\n80% van alle ja's in netwerk-marketing komen na de DERDE of latere follow-up. 80% van netwerkers stopt al na de eerste of tweede follow-up. Daar zit het grote verschil tussen mensen die doorbreken en mensen die afhaken: niet talent, niet pitch-kunst, wel hoe goed je opvolgt.\n\nVandaag leer je dat systematisch. Loopt het ergens vast? Sponsor en Mentor staan klaar (zie 'Vraag 1 tip'-stap). Meer over de wiskunde in de DMO-training les 4.1 in de Academy.\n\nVerder met je dag-flow.\n\n──────────────────────────────────────────\n\n`;

// Uitgebreide follow-up-uitleg voor dag 6, met 24-48u-regel,
// 5-fasen-flow en de stilgevallen-gesprekken-zin. Op dag 3, 4, 5
// en 7 wordt FOLLOWUP_UITLEG_BASIS / NA_DAG6 gebruikt; op dag 6 deze
// diepere variant omdat de hele dag-les daarover gaat.
//
// Onderaan is een drie-stappen-blok toegevoegd dat verwijst naar
// Feel-Felt-Found (FFF, geleerd op dag 5) als enige techniek voor
// zelf-toepassen. De 5-fasen-flow is JUIST vandaag de leerstof,
// dus die toetsen we vandaag nog niet zelf. Dat doen we vanaf dag 7.
const FOLLOWUP_UITLEG_DAG6 = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Vandaag is de DAG om hier scherp en systematisch in te zijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nDE 24-48U-REGEL\n\nStuur 24-48 uur na een uitnodiging je eerste check-in. Niet eerder (dan voelt het opdringerig), niet later (dan is de psychologische ruimte alweer dicht). Gemiddeld zijn 5 contactmomenten nodig voordat iemand een echte beslissing maakt — dat is geen drammen, dat is gewoon de statistiek van menselijk gedrag.\n\nDE 5-FASEN-FOLLOW-UP\n\n1. CHECK-IN (24-48u): "Even inchecken, hoe gaat het met je?" GEEN "heb je al nagedacht?"\n2. PEILEN (na 3-5 dagen): "Wat sprak je het meeste aan van wat je gezien hebt?" Open vraag op WAT, niet op JA/NEE.\n3. VERDIEPEN (na 7-10 dagen): "Dit wilde ik je ook nog laten zien..." Tweede waardevol punt, een testimonial, een nieuw filmpje.\n4. UITNODIGING NAAR EVENT/3-WEG (na 10-14 dagen): "Er is binnenkort iets dat past, wil je erbij zijn?"\n5. SLUITEN OF NOT-YET (na 14-21 dagen): "Wat is voor jou het belangrijkste punt om helder te krijgen?"\n\nDE STILGEVALLEN-GESPREKKEN-ZIN\n\nWanneer iemand een paar dagen of weken niet meer reageert, werkt deze zin bijna altijd:\n\n"Hé [naam], ik zag dat je niet meer had gereageerd op mijn laatste berichtje. Is dat omdat je druk was of omdat je geen interesse hebt op dit moment? Allebei prima hoor, ik dacht: ik vraag het even!"\n\nWaarom dit werkt:\n- Geen verwijt, geen druk: 'allebei prima hoor' geeft de uitweg.\n- Eerlijk antwoord: mensen die druk waren ('sorry, vergeten!') komen terug. Mensen die geen interesse hebben, geven dat aan zonder ongemak.\n- Helderheid voor jou: je weet waar je staat, kunt verder.\n\nWAT JE WEL EN NIET DOET\n\n- WEL: "Even inchecken" - vriendelijk, niet beoordelend\n- WEL: "Wat sprak je aan?" - focus op wat positief is\n- NIET: "Heb je al nagedacht?" - zet ze in beoordelaar-positie\n- NIET: "Wat vond je ervan?" - vraagt om oordeel, opent kritiek\n- NIET: stilte na 1 keer geen reactie - fataal, je verliest 80%\n\n💪 KOMT ER EEN BEZWAAR TIJDENS JE FOLLOW-UP? PAS FFF ZELF TOE\n\nGisteren (dag 5) heb je Feel-Felt-Found (FFF) geleerd. Als een prospect vandaag een bezwaar uit ('ik heb geen tijd', 'ik wil eerst nadenken'), pas dan FFF zelf toe — in deze volgorde:\n\n1. EERST ZELF SCHRIJVEN. Open je notitie-app of typ in WhatsApp (concept, niet versturen). Schrijf de FFF-reactie in jouw eigen stijl. Geen scripts kopiëren.\n\n2. CHECK TEGEN FFF. Klopt het patroon? Feel (ik snap dat het zo voelt) → Felt (anderen voelden dat ook) → Found (wat zij merkten was...) → doorvraag-zin.\n\n3. PAS DAN HULP VRAGEN, ALS JE TWIJFELT. Stuur je concept naar sponsor of Mentor met de vraag 'Klopt dit volgens jou?'. Niet 'schrijf 'm voor mij' — wel 'kijk mee'. Bezwaren-bibliotheek terug-bladeren? Menu → Playbook → Dag 5.\n\n🆘 KOM JE ECHT VAST OP EEN SPECIFIEK BERICHT?\n\n• Je sponsor - stuur de letterlijke tekst die je hebt ontvangen + jouw eerste concept-reactie + de vraag 'wat zou jij ervan vinden?'\n• De Mentor (in het zijmenu) - zelfde aanpak: deel je concept en vraag om feedback. De Mentor is getraind om mee te kijken, niet om voor jou te schrijven.`;

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
 * Tempo-specifieke vervangings-data voor dag 5.
 *
 * Dag 5-thema: Bezwaren omgaan met Feel-Felt-Found. Vanaf vandaag
 * is uitnodigen ook een dagelijks ritme (niet meer enkel een
 * 'leerdag' zoals dag 4). De FFF-roleplay als specifieke dag-stap.
 * Anti-uitval-blok bovenin om het 'zes-nees-en-stoppen'-patroon
 * te normaliseren met wiskunde-context.
 */
function bouwDag5VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen (met anti-uitval-blok bovenin) ---
    {
      id: "dag5-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `${ANTI_UITVAL_DAG5}Vandaag breidt je netwerk-overzicht uit met ${dd.contacten} nieuwe mensen.\n\nWAAR HAAL JE DEZE ${dd.contacten} MENSEN VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd.\n2. Je social media-vrienden: open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n3. Mensen die je dagelijks tegenkomt: bij de koffietent, sportschool, school, werk.\n4. Nieuwe mensen via hashtags of comments op accounts die je volgt.\n\nVoeg ze toe in je namenlijst met 1 woord context per persoon ('fitness', 'oud-collega', 'koffietent').`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag5-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze 1-op-1 een persoonlijk bericht.\n\n📱 HOE JE DIRECT IN WHATSAPP, INSTAGRAM OF FACEBOOK BELANDT\n\nIn je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik en de juiste app opent met die persoon. Vereiste: telefoonnummer of social-handle staat op de kaart. Niet ingevuld? Open de prospect, vul aan, en de icoontjes verschijnen vanzelf.\n\nDIT IS EEN OPENER, GEEN CASUAL CATCH-UP\n\nEen eerste bericht is bedoeld om een gesprek te openen dat BINNEN 1 TOT 3 BERICHTEN leidt tot een uitnodiging voor een kijkmoment. Niet om eerst weken te koffieklokken.\n\nWAT SCHRIJF JE\n\nGeen pitch. Wél een menselijke, specifieke vraag waar je oprecht nieuwsgierig naar bent.\n\nVoorbeelden:\n- "Hé Linda, ik moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"\n- "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"\n\nZodra je het bericht hebt verstuurd, vertel het aan de spraakfunctie: "Ik heb een gesprek gestart met [naam]". De prospect gaat dan automatisch van 'prospect' naar 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen (vanaf dag 5 vast onderdeel van het ritme) ---
    {
      id: "dag5-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (4-stappen-formule)`,
      uitleg: `Vanaf vandaag is uitnodigen een vast onderdeel van je dagelijkse ritme. Je past de 4-stappen-formule toe die je gisteren leerde op ${dd.uitnodigingen} mensen.\n\nDE FORMULE IN HET KORT\n\n1. COMPLIMENT of erkenning ("je bent iemand die...")\n2. UITNODIGEN ("wil je het zien?"), kies de variant die past bij hoe warm de prospect is (direct / indirect / super-indirect)\n3. PLAN met twee opties ("vanavond of morgen?"), geen open vraag\n4. Optionele opener bij business-prospects ("ik heb weinig tijd, maar...")\n\nMix warm (mensen die je goed kent) met lauw (telefoon-contacten waar je weinig mee praat). Bij een ja, vertel de spraakfunctie: "Ik heb [naam] uitgenodigd en de link gestuurd".\n\nHULP NODIG\n\nDe drie knoppen onder dit vak zijn er om mee te starten:\n- Voorbeelden bekijken: complete scripts klaar om aan te passen\n- Met je sponsor: open WhatsApp met een vraag om hulp\n- Met de Mentor: laat de Mentor een uitnodiging op maat schrijven`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    // Dag 5 leert FFF in stap F (na deze stap). Hier gebruiken we de
    // basis-uitleg zonder drie-stappen-frame — FFF is nog niet
    // beschikbaar als techniek om zelf op te toetsen. Dat komt vanaf
    // dag 6 (waar FFF inmiddels van gisteren is).
    {
      id: "dag5-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_BASIS,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    {
      id: "dag5-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- Stap F: Feel-Felt-Found-roleplay (dag-specifiek) ---
    {
      id: "dag5-fff-roleplay",
      label: "🛡️ Korte Feel-Felt-Found-roleplay (FFF) met sponsor of Mentor",
      uitleg:
        "Waarom oefenen met bezwaren belangrijk is: in een echt gesprek krijg je geen tweede kans om iets te formuleren. Als jij staat te zoeken naar woorden, voelt de prospect onzekerheid en verliest hij vertrouwen. Door vooraf een paar keer te oefenen, weet je in grote lijnen hoe je elk bezwaar kunt aanvliegen, zelfs als je niet de exacte woorden paraat hebt.\n\nVraag je sponsor om 1-2 typische bezwaren te 'spelen' en oefen Feel-Felt-Found (FFF). Geen sponsor beschikbaar? Vraag de Mentor: 'Speel een prospect die zegt: ik heb geen tijd', en oefen je antwoord. Daarna een nieuwe ronde met een ander bezwaar. Vier of vijf rondes is genoeg om het ritme te pakken.",
      verplicht: true,
      actieRoute: "/coach",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag5-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 5 erop zitten. Stuur je sponsor een berichtje met hoe het ging: hoe voelde de Feel-Felt-Found-oefening (FFF)? Liep je vandaag tegen een bezwaar aan dat je hebt omgebogen? Niets uitgebreids, gewoon een update om de dag mooi af te sluiten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 6.
 *
 * Dag 6-thema: Follow-up systematiek (24-48u-regel + 5-fasen-flow +
 * stilgevallen-zin). Uitnodigen blijft vast onderdeel van het ritme.
 * Sponsor-tip als zesde stap, sponsor-checkin als afsluiter.
 * Anti-uitval-blok bovenin focust op de 80%-wet van follow-up.
 */
function bouwDag6VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen (met anti-uitval-blok bovenin) ---
    {
      id: "dag6-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `${ANTI_UITVAL_DAG6}Vandaag breidt je netwerk-overzicht uit met ${dd.contacten} nieuwe mensen.\n\nWAAR HAAL JE DEZE ${dd.contacten} MENSEN VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd.\n2. Je social media-vrienden: open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n3. Mensen die je dagelijks tegenkomt.\n4. Nieuwe mensen via hashtags of comments.\n\nVoeg ze toe met 1 woord context per persoon.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag6-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze een persoonlijk eerste bericht.\n\n📱 DIRECT IN WHATSAPP/IG/FB BELANDEN: in je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik en de juiste app opent met die persoon. Vereiste: telefoonnummer of social-handle staat op de kaart.\n\nDit is een OPENER, geen casual catch-up. Doel: binnen 1-3 berichten leiden naar een uitnodiging. Vandaag verstuur je later ook uitnodigingen — voor mensen die warm reageren kun je vandaag al doorzetten.\n\nVia de spraakfunctie meld je: "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag6-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (4-stappen-formule)`,
      uitleg: `Pas de 4-stappen-formule toe op ${dd.uitnodigingen} mensen vandaag. Compliment → uitnodigen → plan met twee opties → eventueel haast (alleen business-prospects).\n\nMix warm (bekenden) en lauw (telefoon-contacten). Bij een ja, deel de link en vertel de spraakfunctie: "Ik heb [naam] uitgenodigd en de link gestuurd".\n\nHulp nodig? De drie knoppen onder dit vak: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups (UITGEBREIDE uitleg op dag 6) ---
    {
      id: "dag6-openstaande-followups",
      label: "🔄 Follow-ups vandaag (24-48u-regel + 5-fasen-flow)",
      uitleg: FOLLOWUP_UITLEG_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    {
      id: "dag6-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- Stap F: sponsor-tip (dag-specifiek) ---
    {
      id: "dag6-sponsor-tip",
      label: "💡 Vraag sponsor of Mentor: 1 tip op je lastigste follow-up",
      uitleg:
        "Heb je 1 contact waar je niet weet wat je moet sturen? Vraag je sponsor: 'Hoe zou jij dit aanpakken?'. Sponsor even druk? Dan de Mentor: 'Help me met een follow-up voor [naam] die [situatie]'. Je hoeft het niet alleen te bedenken.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag6-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 6 erop zitten. Stuur je sponsor een berichtje: hoe voelde het om systematisch door je pijplijn te lopen? Werkte de 24-48u-regel? Niets uitgebreids, gewoon even een update om de dag af te sluiten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 7.
 *
 * Dag 7-thema: Week 1-reflectie. Bewust RUSTIGER dan dag 5+6 zodat
 * er ruimte is voor de review en de sponsor-call, maar pijplijn-
 * instroom kakt niet in. Filosofie: minimum-aantallen ipv harde
 * halvering. Label gebruikt 'Minimaal X', uitleg zegt 'meer mag,
 * minder niet'. Sponsor-call (15 min, langer dan checkin) als
 * afsluitende stap.
 */
function bouwDag7VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const min = dagdoelenMinimum(uren);

  return [
    // --- Stap 1: Wekelijkse review (EERST, focus van de dag) ---
    {
      id: "dag7-review",
      label: "📋 Vul de wekelijkse review in (5 min reflectie)",
      uitleg:
        "Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Aan het eind kun je kiezen of je de review met je sponsor wilt delen, zodat hij of zij weet hoe je ervoor staat en waar je in kan groeien.",
      verplicht: true,
      actieRoute: "/statistieken",
    },

    // --- Stap 2: namen toevoegen (MINIMAAL) ---
    {
      id: "dag7-namen-toevoegen",
      label: `📲 Voeg minimaal ${min.contacten} namen toe aan je lijst`,
      uitleg: `Minimaal ${min.contacten} nieuwe namen vandaag, meer mag altijd. Vandaag is review-dag, dus rustiger op de input — maar je pijplijn houdt z'n stroom. Minder dan ${min.contacten} doe je niet, dat breekt het ritme dat je deze week hebt opgebouwd.\n\nWAAR HAAL JE ZE VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd.\n2. Je social media-vrienden: open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n3. Mensen die je dagelijks tegenkomt.\n4. Nieuwe mensen via hashtags of comments.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap 3: eerste berichten (MINIMAAL) ---
    {
      id: "dag7-eerste-berichten",
      label: `💬 Stuur minimaal ${min.contacten} mensen een eerste bericht`,
      uitleg: `Minimaal ${min.contacten} eerste berichten vandaag, meer mag.\n\n📱 In je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik en de juiste app opent met die persoon.\n\nDit is een opener, geen casual catch-up. Doel: binnen 1-3 berichten leiden naar een uitnodiging. Via de spraakfunctie meld je: "Ik heb een gesprek gestart met [naam]".`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap 4: uitnodigingen (MINIMAAL) ---
    {
      id: "dag7-uitnodigingen",
      label: `📨 Verstuur minimaal ${min.uitnodigingen} uitnodigingen`,
      uitleg: `Minimaal ${min.uitnodigingen} uitnodigingen vandaag, meer mag. Pas de 4-stappen-formule toe. Compliment → uitnodigen → plan met twee opties → eventueel haast (alleen business).\n\nHulp nodig? De drie knoppen onder dit vak: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap 5: openstaande follow-ups (met volledige drie-stappen-
    // frame omdat member nu FFF + 5-fasen-flow al heeft geleerd) ---
    {
      id: "dag7-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap 6: stories ---
    {
      id: "dag7-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- LAATSTE STAP: sponsor-call (15 min, langer dan checkin) ---
    {
      id: "dag7-sponsor-call",
      label: "📞 15 min sponsor-call over week 2",
      uitleg:
        "Wat werkte? Wat gaan we anders doen? Wat is het thema van week 2? Deze call is langer dan een dagelijkse checkin — neem 15 minuten samen om week 1 door te lopen en week 2 vorm te geven. Tip: deel je review-formulier vóór de call zodat je sponsor zich kan voorbereiden.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 8.
 *
 * Dag 8-thema: Snelheid wint. In jouw eigen tempo (Fundament/Bouwen/
 * Doorbreken) ga je vandaag de perfectie-val omzeilen: max 30-60 sec
 * per uitnodiging, verzonden is altijd beter dan perfect. De F-stap
 * is een korte lees-stap om de mindset binnen te krijgen voordat je
 * de C-stap (uitnodigingen) doet — dus de F-stap staat ZONDER eigen
 * extra uitnodigingen, het is een SKILL-laag bovenop de C-stap.
 */
function bouwDag8VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag8-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Vandaag breidt je netwerk-overzicht uit met ${dd.contacten} nieuwe mensen.\n\nWAAR HAAL JE DEZE ${dd.contacten} MENSEN VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd.\n2. Je social media-vrienden: open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n3. Mensen die je dagelijks tegenkomt.\n4. Nieuwe mensen via hashtags of comments op accounts die je volgt.\n\nVoeg ze toe met 1 woord context per persoon.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag8-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze een persoonlijk eerste bericht.\n\n📱 DIRECT IN WHATSAPP/IG/FB: in je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik en de juiste app opent. Geen kopiëren-en-plakken, geen zoeken.\n\nDit is een opener, geen casual catch-up. Doel: binnen 1-3 berichten leiden naar een uitnodiging. Via de spraakfunctie meld je: "Ik heb een gesprek gestart met [naam]".`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag8-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (4-stappen-formule)`,
      uitleg: `Pas de 4-stappen-formule toe op ${dd.uitnodigingen} mensen vandaag. Compliment → uitnodigen → plan met twee opties → eventueel haast (alleen business).\n\nVANDAAG IS HET SNELHEID-DAG. Bovenaan deze pagina staat onder 'Wat je leert' de mindset die je vandaag toepast: snelheid wint van perfectie. Lees die eerst, dan haal je deze ${dd.uitnodigingen} uitnodigingen in 5 tot 10 minuten.\n\nVuistregel: max 30 tot 60 seconden bedenktijd per uitnodiging. Daarna druk je op verzenden, geen herlezen.\n\nMix warm (bekenden) en lauw (telefoon-contacten). Hulp nodig? De drie knoppen onder dit vak: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups (drie-stappen-frame met FFF + 5-fasen) ---
    {
      id: "dag8-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    {
      id: "dag8-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag8-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 8 erop zitten — eerste dag van week 2. Stuur je sponsor een berichtje: hoe voelde de snelheid-modus? Lukte het om de perfectie-val te vermijden? Niets uitgebreids.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 9.
 *
 * Dag 9-thema: 3-weg-gesprek meesterclass — 5 stappen + edification.
 * Leerdag (lees-stap F), niet doe-dag. Dag 10 is de doe-dag.
 */
function bouwDag9VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag9-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Dagritme: ${dd.contacten} nieuwe mensen toevoegen aan je netwerk-overzicht. Eén woord context per persoon.\n\nGebruik de vier bronnen (Eleva-geheugen, Facebook, Instagram, LinkedIn) in de strip hieronder als ingang.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag9-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen uit je lijst en stuur ze een persoonlijk eerste bericht.\n\n📱 DIRECT IN WHATSAPP/IG/FB: in je namenlijst staan naast elke prospect kleine icoontjes. Eén klik en de juiste app opent met die persoon.\n\nDit is een opener, geen casual catch-up. Via de spraakfunctie: "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag9-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (4-stappen-formule)`,
      uitleg: `Pas de 4-stappen-formule toe op ${dd.uitnodigingen} mensen vandaag. Compliment → uitnodigen → plan met twee opties → eventueel haast (alleen business).\n\nMix warm + lauw. Bij een ja, deel de link en vertel de spraakfunctie: "Ik heb [naam] uitgenodigd en de link gestuurd". Hulp nodig? Drie knoppen: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag9-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    {
      id: "dag9-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag9-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 9 erop zitten — de 3-weg-meesterclass gelezen. Stuur je sponsor een berichtje: ben je klaar om morgen je eerste (of volgende) 3-weg in praktijk te brengen? Vraag of zij of hij beschikbaar is voor het groepje.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 10.
 *
 * Dag 10-thema: 3-weg-gesprek in praktijk. Geen theorie-dag, een
 * DOE-dag. De F-stap is concreet: vandaag start je je eerstvolgende
 * 3-weg-gesprek met een warme prospect en je sponsor.
 */
function bouwDag10VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag10-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Dagritme: ${dd.contacten} nieuwe mensen toevoegen. Eén woord context per persoon. Gebruik de vier bronnen in de strip hieronder.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag10-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen en stuur een persoonlijk eerste bericht.\n\n📱 Gebruik de kleine icoontjes in je namenlijst om direct in WhatsApp/Instagram/Facebook te belanden — geen kopiëren-en-plakken.\n\nVia de spraakfunctie: "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag10-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (4-stappen-formule)`,
      uitleg: `Pas de 4-stappen-formule toe op ${dd.uitnodigingen} mensen vandaag.\n\nMix warm + lauw. Hulp nodig? Drie knoppen: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag10-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    {
      id: "dag10-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- Stap F: 3-weg-gesprek starten (dag-specifiek, de DOE-stap) ---
    {
      id: "dag10-3weg-doen",
      label: "🤝 Start je eerstvolgende 3-weg-gesprek (vandaag of morgen)",
      uitleg:
        "Vandaag is GEEN theorie-dag, vandaag is een DOE-dag. Gisteren leerde je de 5 stappen, vandaag start je je eerstvolgende 3-weg in de praktijk.\n\nKIES 1 WARME PROSPECT\n\nIemand die nog geen 3-weg heeft gehad, met wie het gesprek warm is, en die heeft gezien wat jij doet (one-pager of film). Geen koude prospect — die werkt nog niet voor een 3-weg.\n\nDE 5 STAPPEN (recap van dag 9, scripts staan in de prospect-kaart):\n\n1. AANKONDIGING — stuur je prospect een bericht: 'Ik maak even een groepje aan met mijn mentor [sponsor], die kan met je meekijken.'\n2. INTRODUCTIE IN HET GROEPJE — edifieer je sponsor + geef prospect-context aan sponsor.\n3. JIJ STAPT TERUG ⚠️ — DIT IS DE LASTIGSTE STAP. Zwijg in het groepje. Niet meepraten. Niet aanvullen. Sponsor neemt over.\n4. SPONSOR OPENT — sponsor bouwt rapport met de prospect, luistert eerst.\n5. FOLLOW-UP — JIJ stuurt de prospect apart binnen 24u: 'Wat sprak je het meeste in aan?'.\n\nDE EERSTE 3-WEG VOELT ONHANDIG\n\nDat hóórt. De vijfde voelt natuurlijk. Alleen door te DOEN kom je daar. Achteraf 5 min met je sponsor debriefen: wat ging goed, wat liep niet soepel, welke vraag bracht 'm in moeilijkheden?\n\nGEEN WARME PROSPECT KLAAR? VRAAG SPONSOR\n\nStuur sponsor een bericht: 'Ik wil mijn eerstvolgende 3-weg starten maar weet niet bij wie te beginnen. Mag ik samen met jou kijken in mijn namenlijst?'.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag10-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor een berichtje: hoe voelde je eerste (of volgende) 3-weg vandaag? Wat ging goed, wat liep niet soepel? Vraag of jullie er 5 min over kunnen debriefen.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 11.
 *
 * Dag 11-thema: Pipeline-flow + wanneer one-pager versus presentatie.
 * De F-stap is een lees-stap PLUS een pipeline-check in de namenlijst.
 */
function bouwDag11VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag11-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: `Dagritme: ${dd.contacten} nieuwe mensen toevoegen. Eén woord context per persoon. Gebruik de vier bronnen in de strip hieronder.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag11-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht`,
      uitleg: `Pak ${dd.contacten} mensen en stuur een persoonlijk eerste bericht.\n\n📱 Gebruik de kleine icoontjes in je namenlijst om direct in WhatsApp/Instagram/Facebook te belanden.\n\nVia de spraakfunctie: "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag11-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (4-stappen-formule)`,
      uitleg: `Pas de 4-stappen-formule toe op ${dd.uitnodigingen} mensen vandaag.\n\nMix warm + lauw. Hulp nodig? Drie knoppen: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag11-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    {
      id: "dag11-stories",
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },

    // --- Stap F: pipeline-check + leerstof (dag-specifiek) ---
    {
      id: "dag11-pipeline-check",
      label: "🎯 Pipeline-check: weet voor elke prospect wat de volgende stap is",
      uitleg:
        "Bovenaan deze pagina onder 'Wat je leert' staat de uitleg over one-pager versus presentatie. Lees die door, daarna doe je deze check.\n\nDE KERN IN ÉÉN ZIN: niemand slaat een stap over. Iedereen doorloopt: prospect → uitnodiging → one-pager of 3-weg → presentatie → beslissing. Geen sprongen, geen omleidingen.\n\nDE CHECK (5 minuten)\n\nOpen je namenlijst, schakel naar pijplijn-weergave. Kijk per fase wat je ziet:\n\n• PROSPECT — nog niet benaderd. Doel: vandaag of morgen een opener sturen.\n• IN GESPREK — eerste bericht is uit, gesprek loopt. Doel: zodra het natuurlijk past, een uitnodiging sturen volgens de 4-stappen-formule.\n• UITGENODIGD — uitnodiging is verstuurd, wachtend op JA. Doel: 24-48u check-in als ze stil zijn.\n• ONE-PAGER — info-pagina is gestuurd, wachtend op reactie. Doel: de tussenstap-zin sturen (staat letterlijk uitgeschreven in 'Wat je leert' bovenaan).\n• PRESENTATIE — diepgaand gesprek of 3-weg gehad. Doel: de 5-fasen-follow-up volgen (zie dag 6).\n• FOLLOW-UP — denkt na, twijfelt. Doel: de openings-zin 'wat spreekt je het meeste in aan?' of FFF bij bezwaren (zie dag 5).\n\nWAAR IS JE VERSTOPPING?\n\nDe fase waar de MEESTE mensen op staan is je verstopping — daar zit je vandaag werk. Per fase een concrete vervolgactie:\n\n• Veel mensen op IN GESPREK? Je hebt veel gesprekken lopen maar nog geen uitnodigingen verstuurd. Vandaag: schrijf voor 2 tot 3 van hen een uitnodiging volgens de 4-stappen-formule.\n• Veel mensen op UITGENODIGD? Ze hebben ja gezegd op een kijkmoment maar nog geen info gekregen. Vandaag: stuur ze de one-pager of plan een 3-weg in.\n• Veel mensen op ONE-PAGER? Ze hebben gekeken maar je hebt nog geen vervolg gestuurd. Vandaag: stuur de tussenstap-zin (zie 'Wat je leert' bovenaan voor de letterlijke tekst).\n• Veel mensen op PRESENTATIE? Goed werk — hier zit veel van de echte beweging. Volg de 5-fasen-follow-up van dag 6.\n• Veel mensen op FOLLOW-UP? Ze denken na. Stuur een natuurlijke heropener of, als ze een bezwaar hebben geuit, pas Feel-Felt-Found (FFF) toe van dag 5.\n\nDe truc is niet om alle fases tegelijk te bedienen, wel om VANDAAG je grootste verstopping te ontstoppen.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag11-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor een berichtje: hoe ziet jouw pijplijn eruit na de check? Waar zit je bottleneck? Vraag of zij of hij een tip heeft voor de fase waar de meeste mensen vastzitten.",
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

  if (dag.nummer === 5) {
    return {
      ...dag,
      vandaagDoen: bouwDag5VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 6) {
    return {
      ...dag,
      vandaagDoen: bouwDag6VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 7) {
    return {
      ...dag,
      vandaagDoen: bouwDag7VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 8) {
    return {
      ...dag,
      vandaagDoen: bouwDag8VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 9) {
    return {
      ...dag,
      vandaagDoen: bouwDag9VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 10) {
    return {
      ...dag,
      vandaagDoen: bouwDag10VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 11) {
    return {
      ...dag,
      vandaagDoen: bouwDag11VandaagDoen(commitmentUren),
    };
  }

  // Andere dagen: voorlopig nog niet tempo-aware. Hier komen volgende
  // rondes de varianten voor dag 12-21 te zien.
  return dag;
}

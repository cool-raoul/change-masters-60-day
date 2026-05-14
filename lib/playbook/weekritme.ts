// ============================================================
// lib/playbook/weekritme.ts
//
// Dag 22 tot en met 60: na de eerste 21 dagen leerstof switcht de
// Sprint naar 'weekritme'-modus. Geen nieuwe technieken meer leren,
// alleen DOEN wat je hebt geleerd, dag in dag uit. De dagelijkse
// content roteert op basis van de WEEKDAG, niet het dag-nummer.
//
// Filosofie (Raoul, 2026-05-14): dagelijks afvinken blijven, niet
// wekelijks. Reden: dagelijks ritme borgt gewoonte. Wekelijks
// overzicht laat mensen 2 dagen vergeten, dan 5 dagen, dan stop.
//
// PATROON
//
// Maandag    🔍 Pipeline-analyse via Mentor
// Dinsdag    🎧 Audio-onderweg, 1 track luisteren
// Woensdag   📱 Lifestyle-content op socials
// Donderdag  🤝 3-weg of presentatie plannen
// Vrijdag    🔄 Follow-up-batch (drie-stappen-aanpak)
// Zaterdag   🪞 Lichte week-reflectie
// Zondag     📋 Wekelijkse review + sponsor-call (minimum-aantallen)
//
// ELKE DAG: A namen + B berichten + C uitnodigingen + D follow-ups
// + E stories + F (roterend per weekdag) + Z sponsor-checkin
// (of sponsor-call op zondag, 15 min).
//
// Zondag specifiek: minimum-aantallen op A/B/C (zoals dag 7/14/21)
// zodat er ruimte is voor review + sponsor-call. Andere dagen vol-tempo.
// ============================================================

import {
  berekenDagdoelen,
  dagdoelenMinimum,
  type CommitmentUren,
} from "@/lib/dagdoelen";
import type { Dag, ControllableTaak } from "./types";
import {
  FOLLOWUP_UITLEG_NA_DAG6,
  STORIES_UITLEG,
  standaardABCDEstappen,
} from "./tempo-aware";

// Run-weekdag: 0-6, gebaseerd op (dagNummer - 1) % 7.
// Dag 1 = 0 (weekstart), dag 7 = 6 (review).
// Voor dag 22-60: dag 22 = weekstart van week 4, dag 28 = review-dag, etc.
//
// We gebruiken de RUN-weekdag (positie binnen de week sinds run-start),
// NIET de kalender-weekdag (echte maandag/dinsdag). Reden: members
// starten op willekeurige kalenderdagen, en hun ritme moet hun eigen
// weekstart volgen — niet de echte zondag-tot-zaterdag. Zo voorkom je
// ook dat dag 21 (review) en dag 22 (review als dat een zondag was)
// op elkaar botsen.
type RunWeekdag = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function runWeekdagVoorDag(dagNummer: number): RunWeekdag {
  return ((dagNummer - 1) % 7) as RunWeekdag;
}

// ============================================================
// Per-weekdag F-stap definities
// ============================================================

function weekstartFStap(): ControllableTaak {
  return {
    id: "weekritme-weekstart-funnel-analyse",
    label: "🔍 Pipeline-analyse via ELEVA Mentor",
    uitleg:
      "Vandaag is weekstart-dag van een nieuwe week in jouw run. Voordat je in nieuwe acties stort, kijk je eerst even waar de pijplijn staat. ELEVA's Mentor pakt je actuele cijfers per fase, identificeert je grootste bottleneck, en geeft een concrete focus voor deze week.\n\nKlik op de knop hieronder — de cijfers worden automatisch opgehaald, de Mentor opent met een gerichte analyse. Geen typewerk. Vraag eventueel door: 'wat is de slimste verbetering deze week?'.",
    verplicht: true,
    inlineEmbed: "funnel-analyse",
  };
}

function audiodagFStap(): ControllableTaak {
  return {
    id: "weekritme-audiodag-onderweg",
    label: "🎧 Luister 1 audio-onderweg-track (15-20 min)",
    uitleg:
      "Vandaag is audio-dag. Open in de Academy de training 'Audio onderweg met Eric Worre' en kies één track om vandaag te luisteren — in de auto, tijdens een wandeling of bij koffie.\n\nNiet alle 8 tracks tegelijk. Kies de skill waar je deze week aan wilt werken: vinden, uitnodigen, presenteren, follow-up, closing, getting started, of events. Eén track per week, in 8 weken heb je ze allemaal.\n\nDeze dag is bewust dieper dan de andere — luistermomenten zetten de mindset waar de andere zes dagen op draaien.",
    verplicht: true,
    actieRoute: "/academy/audio-onderweg",
  };
}

function contentdagFStap(): ControllableTaak {
  return {
    id: "weekritme-contentdag-lifestyle",
    label: "📱 Maak 1 wat-langere lifestyle-story die je leven laat zien",
    uitleg:
      "Vandaag is content-dag. Naast je gewone 1-3 stories vandaag maak je er één wat dieper: een moment uit je dag dat laat zien wie je bent. Geen pitch, geen 'kom in m'n business'. Wel iets dat een vriendin van je interessant zou vinden om te zien.\n\nIDEEËN:\n• Een mooie wandeling met 1 zin reflectie\n• Iets wat je vandaag hebt geleerd of dat je raakte\n• Een gezond ontbijt met een uitleg waarom je dit doet\n• Een rustig moment, een blije gedachte\n\nDe regel: hoe meer je laat zien wie je BENT, hoe meer mensen je vinden. Lifestyle-content trekt aan, pitch-content jaagt weg.\n\nWil je dieper? In de Academy staat de training 'Social Media Strategie' — die geeft je in 14 modules de hele aanpak.",
    verplicht: true,
  };
}

function planningsdagFStap(): ControllableTaak {
  return {
    id: "weekritme-planningsdag-3weg-of-presentatie",
    label: "🤝 Plan minstens 1 3-weg of presentatie voor deze week",
    uitleg:
      "Vandaag is plannings-dag. Kijk in je namenlijst: wie zit er in fase 'one-pager' of 'follow-up' en is klaar voor een diepere exposure? Plan vandaag voor minimaal 1 prospect een 3-weg-gesprek of een presentatie deze week.\n\nDE STAPPEN\n\n1. Kies de prospect (warmste eerst).\n2. Stuur de aankondiging-zin: 'Ik maak een groepje met mijn mentor [sponsor], die kan met je meekijken.'\n3. App je sponsor: 'Heb je deze week 30 min voor een 3-weg met [naam]?'\n4. Maak de afspraak vast in je agenda.\n\nWeekritme-tip: één 3-weg per week is hét tempo voor consistente groei. Geen, dan stagneert de pijplijn. Meer dan twee, dan kakt je voorbereiding in.",
    verplicht: true,
    actieRoute: "/namenlijst",
  };
}

function followupdagFStap(): ControllableTaak {
  return {
    id: "weekritme-followupdag-hardste-cases",
    label: "🔄 Follow-up-batch: pak je 5 hardste cases (drie-stappen-aanpak)",
    uitleg:
      "Vandaag is focus-follow-up-dag. Naast de gewone openstaande follow-ups (stap 4 hierboven) pak je vandaag SPECIFIEK je 5 hardste cases — prospects waar je niet zo goed weet wat te schrijven.\n\nDE DRIE-STAPPEN-AANPAK PER CASE\n\n1. EERST ZELF: open je notitie-app of typ direct in WhatsApp (concept). Schrijf wat JIJ zou willen sturen, in jouw stijl. Geen scripts kopiëren.\n\n2. CHECK TEGEN WAT JE HEBT GELEERD: past Feel-Felt-Found (FFF) op een bezwaar? Klopt de 5-fasen-fase? Past de openingszin 'wat spreekt je het meeste in aan?'?\n\n3. PAS DAN HULP VRAGEN: stuur je concept naar sponsor of Mentor met 'klopt dit volgens jou?'. Niet 'schrijf 'm voor mij'.\n\nWaarom in deze volgorde: zelf nadenken is een spier die je bouwt door 'm te gebruiken. Hulp meteen vragen is comfort, maar het houdt je beginner.\n\nDieper terug-bladeren? Menu → Playbook → Dag 5 (FFF) en Dag 6 (5-fasen-flow).",
    verplicht: true,
    actieRoute: "/namenlijst",
  };
}

function reflectiedagFStap(): ControllableTaak {
  return {
    id: "weekritme-reflectiedag-licht",
    label: "🪞 5 min reflectie op de week (lichter moment)",
    uitleg:
      "Vandaag is een lichter moment. Geen extra opdracht buiten je ABCDE-ritme, alleen 5 minuten reflectie.\n\nDRIE VRAGEN VOOR JEZELF\n\n1. Wat ging deze week beter dan vorige week?\n2. Welk moment voelde voor jou als groei (klein of groot)?\n3. Welke prospect of fase houdt vooral mijn aandacht?\n\nSchrijf het op (notitie-app of via de spraakfunctie). Niet als verplichting, wel als anker. Mensen die wekelijks korte reflectie doen, bouwen sneller vakmanschap dan mensen die alleen actie hebben.\n\nMorgen doe je de uitgebreide wekelijkse review. Vandaag is alleen een eerste aanloop.",
    verplicht: false,
  };
}

function weekreviewFStap(): ControllableTaak {
  return {
    id: "weekritme-weekreview",
    label: "📋 Vul de wekelijkse review in (5 min reflectie)",
    uitleg:
      "Vandaag is week-review-dag. Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Aan het eind kun je 'm met je sponsor delen — dan kan zij of hij zich voorbereiden op jullie call.\n\nKijk bij de review naar PATRONEN, niet alleen 'deed ik m'n aantallen?'. Welke berichten kregen reactie? Welke fase heeft de meeste vastzittende prospects? Waar zit je bottleneck? De ELEVA Mentor kan je daarbij helpen via de funnel-analyse-knop op de volgende weekstart-dag.",
    verplicht: true,
    actieRoute: "/statistieken",
  };
}

// ============================================================
// Per-weekdag thema (titel + watJeLeert)
// ============================================================

type WeekdagThema = {
  titel: string;
  watJeLeert: string;
};

function themaVoor(runWeekdag: RunWeekdag): WeekdagThema {
  switch (runWeekdag) {
    case 0: // weekstart (dag 22, 29, 36, 43, 50, 57)
      return {
        titel: "🔍 Weekstart-dag — pipeline-analyse",
        watJeLeert: `Vandaag start een nieuwe week in jouw run. Voordat je in nieuwe acties stort, kijk je eerst waar je staat. De Mentor van ELEVA analyseert je actuele pijplijn-cijfers en wijst je naar de fase waar de meeste prospects vastzitten. Dat is je focus voor de week.\n\nGEEN NIEUWE THEORIE\n\nDe eerste 21 dagen heb je alles geleerd wat je nodig hebt: 4-stappen-uitnodiging, Feel-Felt-Found, 5-fasen-follow-up, edification, Doel-Tijd-Termijn. Vanaf nu hoef je niets nieuws meer te leren — alleen blijven DOEN. Dat is waar 80% afhaakt. De 20% die wel doorgaat, daar zit de werkelijke groei.\n\nHET WEEKRITME (op basis van JOUW startdatum)\n\nElke 'weekdag' in je run heeft één extra focus naast het standaard-ritme:\n• Dag 1 van de week (weekstart) = pipeline-analyse\n• Dag 2 = audio onderweg\n• Dag 3 = lifestyle-content\n• Dag 4 = 3-weg of presentatie plannen\n• Dag 5 = follow-up-batch (drie-stappen-aanpak)\n• Dag 6 = lichte reflectie\n• Dag 7 = wekelijkse review + sponsor-call\n\nVoor de meeste mensen die op een willekeurige kalenderdag zijn gestart, valt dat niet samen met maandag-tot-zondag. Het systeem volgt JOUW startdatum, niet de echte kalenderweek. Dat houdt je ritme persoonlijk.`,
      };
    case 1: // audio-dag
      return {
        titel: "🎧 Audio-dag — onderweg met Eric Worre",
        watJeLeert: `Vandaag is audio-dag. Vandaag voed je je mindset met één track uit de Audio-onderweg-Academy. Eric Worre's Seven Skills, perfect voor in de auto, tijdens een wandeling of bij koffie.\n\nWAAROM AUDIO?\n\nLezen en doen vraagt je hoofd. Luisteren tijdens beweging activeert een andere laag. Veel netwerkers melden dat de stof pas écht in plaats valt na de 4e of 5e keer luisteren — niet door één keer doorscannen. Audio-discipline: één track per week.\n\nIN 8 WEKEN HEB JE ALLE SEVEN SKILLS\n\nKies elke audio-dag de skill waarvan je voelt dat je 'm nu het meeste nodig hebt. Geen volgorde verplicht (na de intro). Sommige dagen is dat 'vinden van prospects', andere dagen 'follow-up' of 'closing'. Volg je intuïtie.\n\nNiet beschikbaar voor audio vandaag? Schuif door naar de volgende audio-dag (over 7 dagen). Een gemist moment is geen drama, een gemist patroon wel.`,
      };
    case 2: // content-dag
      return {
        titel: "📱 Content-dag — lifestyle-story op socials",
        watJeLeert: `Vandaag is content-dag. Naast je gewone stories maak je vandaag één wat dieper moment dat laat zien wie je bent. Geen pitch — wel lifestyle.\n\nWAAROM DIT WERKT\n\nMensen worden aangetrokken door wie je BENT, niet door wat je VERKOOPT. Hoe meer je je echte leven laat zien (gezonde keuzes, mooie wandelingen, rustige momenten, doelen waar je aan werkt), hoe meer mensen je zelf opzoeken. Geen DM's meer hoeven sturen — mensen sturen JOU.\n\nDit is een lang spel. Eén lifestyle-post per week bouwt over 6-12 maanden een aanwezigheid op die geen 100 cold-DM's kunnen evenaren.\n\nDIEPER LEREN\n\nIn de Academy staat de training 'Social Media Strategie' (14 modules, 42 lessen). Daar leer je profielinrichting, story-strategie, FORM in DM's, lifestyle-leakage. Geen verplichting — voor wanneer je 'm wilt pakken.\n\nHet komt allemaal in jouw eigen ritme. Eén content-dag tegelijk.`,
      };
    case 3: // plannings-dag
      return {
        titel: "🤝 Plannings-dag — 3-weg of presentatie boeken",
        watJeLeert: `Vandaag is plannings-dag. Niet uitvoeren in de week, plannen. Eén 3-weg of presentatie voor deze week vastleggen, agenda erbij.\n\nWAAROM PLANNEN ALS APARTE STAP?\n\nVeel netwerkers 'doen het wel als het uitkomt'. Resultaat: er KOMT geen 3-weg uit. Twee weken zonder een 3-weg = pijplijn-stagnatie = afhaken. Met één afgesproken moment per week houd je de motor draaiend.\n\nDE PLANNINGS-FORMULE\n\n1. Kies de warmste prospect die in fase 'one-pager' of 'follow-up' staat.\n2. Stuur de aankondiging.\n3. App je sponsor of teamlid om beschikbaarheid.\n4. Zet 't in je agenda — niet 'ergens deze week' maar dag + tijdslot.\n\nEEN PER WEEK\n\nMinder dan een per week = pijplijn kakt in. Meer dan twee per week = je voorbereiding lijdt eronder en je sponsor raakt overbelast. Eén is het gulden midden tijdens onderhouds-modus.\n\nDieper terug-bladeren: Menu → Playbook → Dag 9 (3-weg-meesterclass) en Dag 10 (3-weg doen).`,
      };
    case 4: // follow-up-dag
      return {
        titel: "🔄 Follow-up-dag — hardste cases (drie-stappen-aanpak)",
        watJeLeert: `Vandaag is focus-follow-up-dag. Naast je gewone openstaande follow-ups pak je vandaag specifiek de 5 HARDSTE cases — prospects waar je niet meteen weet wat te schrijven.\n\nWAAROM DRIE-STAPPEN-AANPAK\n\nDe valkuil van starters: bij elke hardere case meteen de Mentor of sponsor om hulp vragen. Comfort, maar het houdt je beginner. Door eerst ZELF te schrijven, dan te checken tegen wat je hebt geleerd (FFF, 5-fasen-fase, openingszin), bouw je je eigen instinct. Pas als je twijfelt vraag je een tweede mening.\n\nDE WERKING\n\n1. Eerst zelf schrijven (concept, in je notitie-app of WhatsApp)\n2. Check tegen wat je hebt geleerd (FFF, 5-fasen, openingszin)\n3. Pas dan hulp vragen aan sponsor of Mentor — 'klopt dit volgens jou?'\n\nNa 5 weken follow-up-dagen heb je 25 moeilijke cases bewust aangepakt. Dat is waar je vakmanschap echt scherp wordt.`,
      };
    case 5: // reflectie-dag (licht)
      return {
        titel: "🪞 Reflectie-dag — lichter moment",
        watJeLeert: `Vandaag is een lichter moment in je weekritme. Geen zware opdrachten, geen aparte planning. Alleen je gewone ABCDE-ritme + 5 minuten reflectie + sponsor-checkin.\n\nWAAROM EEN 'LICHTERE' DAG IN HET WEEKRITME?\n\nConsistente intensiteit zonder pauze leidt tot uitval. Een natuurlijk pauze-moment per week voorkomt dat. Niet je werk weglaten, wel het ritme zacht doorzetten.\n\nDE REFLECTIE-VRAAG\n\n'Wat ging deze week beter dan vorige week? En welk moment voelde voor jou als groei?'\n\nKlein, lief, persoonlijk. Schrijf het op of spreek het in. Morgen doe je de uitgebreide review met sponsor-call — vandaag is alleen het EERSTE rondje.\n\nNetwerkers die hun ritme bewust lichter pakken op één dag per week, halen méér uit hun werkdagen. Het is geen luiheid, het is ritme-bewaking.`,
      };
    case 6: // week-review-dag
    default:
      return {
        titel: "📋 Week-review-dag + sponsor-call",
        watJeLeert: `Vandaag is review-dag (dag 7 van jouw week-cyclus). Lichter op de input (minimum-aantallen voor ABCDE), zwaarder op de reflectie + sponsor-call. Dezelfde aanpak als dag 7, 14, 21 in je eerste 21 dagen — herhaalbaar wekelijks.\n\nDE WEKELIJKSE REVIEW\n\nDrie vragen die je beantwoordt in /statistieken:\n1. Wat ging goed deze week?\n2. Wat liep niet soepel?\n3. Waar focus ik volgende week op?\n\nDeel de review met je sponsor (toggle aan het eind van het formulier). Sponsor kan zich daardoor voorbereiden op jullie call.\n\nDE SPONSOR-CALL (15 min)\n\nWeek doorlopen. Niet alleen 'wat gebeurde' — vooral 'wat ga ik volgende week anders'. De sponsor-call is het moment waar week-na-week patroon-herkenning gebeurt.\n\nMINIMUM-AANTALLEN VANDAAG\n\nA, B en C op minimum-aantallen vandaag (zoals dag 7). Reden: review + sponsor-call vragen ruimte. Maar je pijplijn houdt z'n stroom — minder dan minimum doe je niet.`,
      };
  }
}

// ============================================================
// HOOFD-FUNCTIE
// ============================================================

/**
 * Genereert een synthetisch Dag-object voor dag 22-60.
 *
 * @param dagNummer  Tussen 22 en 60.
 * @param commitmentUren  Het tempo dat de user heeft gekozen.
 *
 * De F-stap (en review-/lichtere structuur op dag 7 van elke week)
 * wordt afgeleid uit de RUN-weekdag = (dagNummer - 1) % 7. Zo blijft
 * het ritme synchroon met de start-datum van de member, ongeacht welke
 * kalenderdag het toevallig is.
 */
export function genereerWeekritmeDag(
  dagNummer: number,
  commitmentUren: CommitmentUren | null,
): Dag | null {
  if (dagNummer < 22 || dagNummer > 60) return null;

  const runWeekdag = runWeekdagVoorDag(dagNummer);
  const thema = themaVoor(runWeekdag);
  const fStap = kiesFStap(runWeekdag);

  // Run-weekdag 6 = review-dag (dag 28, 35, 42, 49, 56). Minimum-aantallen
  // voor ABCDE zodat er ruimte is voor review + sponsor-call. Andere
  // dagen vol-tempo.
  const isReviewDag = runWeekdag === 6;
  const stappen: ControllableTaak[] = isReviewDag
    ? bouwReviewdagABCDEstappen(dagNummer, commitmentUren)
    : commitmentUren
      ? standaardABCDEstappen(dagNummer, commitmentUren)
      : [];

  // F-stap inschuiven na ABCDE
  stappen.push(fStap);

  // Z-stap: sponsor-checkin (review-dag: sponsor-call 15 min, langer)
  stappen.push(
    isReviewDag
      ? {
          id: `dag${dagNummer}-sponsor-call`,
          label: "📞 15 min sponsor-call: week doorlopen + volgende voorbereiden",
          uitleg:
            "Wat werkte deze week? Wat ga je anders doen? Wat is het thema van volgende week? Neem 15 minuten samen om de week door te lopen en de volgende vorm te geven. Tip: deel je review-formulier vóór de call zodat je sponsor zich kan voorbereiden.",
          verplicht: false,
          inlineEmbed: "sponsor-melding",
        }
      : {
          id: `dag${dagNummer}-sponsor-checkin`,
          label: "💬 Sluit af met een korte sponsor-checkin",
          uitleg: `30 seconden. Vandaag is dag ${dagNummer} van je Sprint. Stuur je sponsor een berichtje hoe het ging vandaag — kort en menselijk.`,
          verplicht: false,
          inlineEmbed: "sponsor-melding",
        },
  );

  return {
    nummer: dagNummer,
    titel: thema.titel,
    fase: 4,
    vandaagDoen: stappen,
    faseDoel:
      "Weekritme-modus (dag 22-60): consistent ritme bouwen, niets nieuws leren, oogsten wat je in de eerste 21 dagen hebt gezaaid.",
    waarInEleva: [
      {
        actie: "Mentor voor vragen of advies",
        menupad: "Menu → Mentor",
        route: "/coach",
      },
      {
        actie: "Statistieken en pijplijn-voortgang",
        menupad: "Menu → Statistieken",
        route: "/statistieken",
      },
      {
        actie: "Academy voor verdere skill-bouw",
        menupad: "Menu → Academy",
        route: "/academy",
      },
    ],
    watJeLeert: thema.watJeLeert,
    waaromWerktDit: {
      tekst:
        "Je hebt 21 dagen alles geleerd wat je nodig hebt. Vanaf nu hoef je niets nieuws meer te leren — alleen blijven DOEN. Dat is waar 80% afhaakt. Bij de 20% die wel doorgaat zit de werkelijke groei.",
    },
  };
}

// ============================================================
// HELPERS
// ============================================================

function kiesFStap(runWeekdag: RunWeekdag): ControllableTaak {
  switch (runWeekdag) {
    case 0:
      return weekstartFStap();
    case 1:
      return audiodagFStap();
    case 2:
      return contentdagFStap();
    case 3:
      return planningsdagFStap();
    case 4:
      return followupdagFStap();
    case 5:
      return reflectiedagFStap();
    case 6:
      return weekreviewFStap();
  }
}

/**
 * Review-dag-versie van A-B-C-D-E stappen: minimum-aantallen op A/B/C,
 * gewone follow-ups (D) en stories (E). Spiegelt het dag-7-patroon.
 * Wordt aangeroepen op run-weekdag 6 (dag 28, 35, 42, 49, 56).
 */
function bouwReviewdagABCDEstappen(
  dagNummer: number,
  commitmentUren: CommitmentUren | null,
): ControllableTaak[] {
  if (!commitmentUren) return [];
  const min = dagdoelenMinimum(commitmentUren);
  // berekenDagdoelen niet nodig op zondag (gebruikt minimum), maar
  // de import wordt in dezelfde file ook elders nuttig — laten staan.
  void berekenDagdoelen;

  return [
    {
      id: `dag${dagNummer}-namen-toevoegen`,
      label: `📲 Voeg minimaal ${min.contacten} namen toe aan je lijst`,
      uitleg: `Minimaal ${min.contacten} nieuwe namen vandaag, meer mag altijd. Vandaag is week-review-dag, dus rustiger op de input — maar je pijplijn houdt z'n stroom. Minder doe je niet, dat breekt het ritme.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: `dag${dagNummer}-eerste-berichten`,
      label: `💬 Stuur minimaal ${min.contacten} mensen een eerste bericht`,
      uitleg: `Minimaal ${min.contacten} eerste berichten vandaag, meer mag.\n\n📱 In je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik en de juiste app opent met die persoon.\n\nVia de spraakfunctie: "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: `dag${dagNummer}-uitnodigingen`,
      label: `📨 Verstuur minimaal ${min.uitnodigingen} uitnodigingen`,
      uitleg: `Minimaal ${min.uitnodigingen} uitnodigingen vandaag, meer mag. Pas de 4-stappen-formule toe. Hulp nodig? Drie knoppen onder dit vak: voorbeelden, sponsor of Mentor.`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },
    {
      id: `dag${dagNummer}-openstaande-followups`,
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: `dag${dagNummer}-stories`,
      label: "📱 1 tot 3 stories + reageren op andermans stories",
      uitleg: STORIES_UITLEG,
      verplicht: true,
    },
  ];
}

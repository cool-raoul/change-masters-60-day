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

// Weekdag-mapping: JavaScript Date.getDay() returnt 0 = zondag,
// 1 = maandag, ..., 6 = zaterdag.
type Weekdag = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const WEEKDAG_NAMEN: Record<Weekdag, string> = {
  0: "zondag",
  1: "maandag",
  2: "dinsdag",
  3: "woensdag",
  4: "donderdag",
  5: "vrijdag",
  6: "zaterdag",
};

// ============================================================
// Per-weekdag F-stap definities
// ============================================================

function maandagFStap(): ControllableTaak {
  return {
    id: "weekritme-maandag-funnel-analyse",
    label: "🔍 Pipeline-analyse via ELEVA Mentor",
    uitleg:
      "Het is maandag, weekstart. Voordat je in nieuwe acties stort, kijk je eerst even waar de pijplijn staat. ELEVA's Mentor pakt je actuele cijfers per fase, identificeert je grootste bottleneck, en geeft een concrete focus voor deze week.\n\nKlik op de knop hieronder — de cijfers worden automatisch opgehaald, de Mentor opent met een gerichte analyse. Geen typewerk. Vraag eventueel door: 'wat is de slimste verbetering deze week?'.",
    verplicht: true,
    inlineEmbed: "funnel-analyse",
  };
}

function dinsdagFStap(): ControllableTaak {
  return {
    id: "weekritme-dinsdag-audio-onderweg",
    label: "🎧 Luister 1 audio-onderweg-track (15-20 min)",
    uitleg:
      "Het is dinsdag, audio-dag. Open in de Academy de training 'Audio onderweg met Eric Worre' en kies één track om vandaag te luisteren — in de auto, tijdens een wandeling of bij koffie.\n\nNiet alle 8 tracks tegelijk. Kies de skill waar je deze week aan wilt werken: vinden, uitnodigen, presenteren, follow-up, closing, getting started, of events. Eén track per dinsdag, in 8 weken heb je ze allemaal.\n\nDeze weekdag is bewust dieper dan de andere — luistermomenten zetten de mindset waar de andere zes dagen op draaien.",
    verplicht: true,
    actieRoute: "/academy/audio-onderweg",
  };
}

function woensdagFStap(): ControllableTaak {
  return {
    id: "weekritme-woensdag-lifestyle-content",
    label: "📱 Maak 1 wat-langere lifestyle-story die je leven laat zien",
    uitleg:
      "Het is woensdag, content-dag. Naast je gewone 1-3 stories vandaag maak je er één wat dieper: een moment uit je dag dat laat zien wie je bent. Geen pitch, geen 'kom in m'n business'. Wel iets dat een vriendin van je interessant zou vinden om te zien.\n\nIDEEËN:\n• Een mooie wandeling met 1 zin reflectie\n• Iets wat je vandaag hebt geleerd of dat je raakte\n• Een gezond ontbijt met een uitleg waarom je dit doet\n• Een rustig moment, een blije gedachte\n\nDe regel: hoe meer je laat zien wie je BENT, hoe meer mensen je vinden. Lifestyle-content trekt aan, pitch-content jaagt weg.\n\nWil je dieper? In de Academy staat de training 'Social Media Strategie' — die geeft je in 14 modules de hele aanpak.",
    verplicht: true,
  };
}

function donderdagFStap(): ControllableTaak {
  return {
    id: "weekritme-donderdag-3weg-of-presentatie",
    label: "🤝 Plan minstens 1 3-weg of presentatie voor deze week",
    uitleg:
      "Het is donderdag, plannings-dag. Kijk in je namenlijst: wie zit er in fase 'one-pager' of 'follow-up' en is klaar voor een diepere exposure? Plan vandaag voor minimaal 1 prospect een 3-weg-gesprek of een presentatie deze week.\n\nDE STAPPEN\n\n1. Kies de prospect (warmste eerst).\n2. Stuur de aankondiging-zin: 'Ik maak een groepje met mijn mentor [sponsor], die kan met je meekijken.'\n3. App je sponsor: 'Heb je deze week 30 min voor een 3-weg met [naam]?'\n4. Maak de afspraak vast in je agenda.\n\nWeekritme-tip: één 3-weg per week is hét tempo voor consistente groei. Geen, dan stagneert de pijplijn. Meer dan twee, dan kakt je voorbereiding in.",
    verplicht: true,
    actieRoute: "/namenlijst",
  };
}

function vrijdagFStap(): ControllableTaak {
  return {
    id: "weekritme-vrijdag-followup-batch",
    label: "🔄 Follow-up-batch: pak je 5 hardste cases (drie-stappen-aanpak)",
    uitleg:
      "Het is vrijdag, focus-follow-up-dag. Naast de gewone openstaande follow-ups (stap 4 hierboven) pak je vandaag SPECIFIEK je 5 hardste cases — prospects waar je niet zo goed weet wat te schrijven.\n\nDE DRIE-STAPPEN-AANPAK PER CASE\n\n1. EERST ZELF: open je notitie-app of typ direct in WhatsApp (concept). Schrijf wat JIJ zou willen sturen, in jouw stijl. Geen scripts kopiëren.\n\n2. CHECK TEGEN WAT JE HEBT GELEERD: past Feel-Felt-Found (FFF) op een bezwaar? Klopt de 5-fasen-fase? Past de openingszin 'wat spreekt je het meeste in aan?'?\n\n3. PAS DAN HULP VRAGEN: stuur je concept naar sponsor of Mentor met 'klopt dit volgens jou?'. Niet 'schrijf 'm voor mij'.\n\nWaarom in deze volgorde: zelf nadenken is een spier die je bouwt door 'm te gebruiken. Hulp meteen vragen is comfort, maar het houdt je beginner.\n\nDieper terug-bladeren? Menu → Playbook → Dag 5 (FFF) en Dag 6 (5-fasen-flow).",
    verplicht: true,
    actieRoute: "/namenlijst",
  };
}

function zaterdagFStap(): ControllableTaak {
  return {
    id: "weekritme-zaterdag-reflectie",
    label: "🪞 5 min reflectie op de week (lichter weekend-moment)",
    uitleg:
      "Het is zaterdag, lichter moment. Vandaag geen extra opdracht buiten je ABCDE-ritme, alleen 5 minuten reflectie.\n\nDRIE VRAGEN VOOR JEZELF\n\n1. Wat ging deze week beter dan vorige week?\n2. Welk moment voelde voor jou als groei (klein of groot)?\n3. Welke prospect of fase houdt vooral mijn aandacht?\n\nSchrijf het op (notitie-app of via de spraakfunctie). Niet als verplichting, wel als anker. Mensen die wekelijks korte reflectie doen, bouwen sneller vakmanschap dan mensen die alleen actie hebben.\n\nMorgen (zondag) doe je de uitgebreide wekelijkse review. Vandaag is alleen een eerste aanloop.",
    verplicht: false,
  };
}

function zondagFStap(): ControllableTaak {
  return {
    id: "weekritme-zondag-review",
    label: "📋 Vul de wekelijkse review in (5 min reflectie)",
    uitleg:
      "Het is zondag, review-dag. Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Aan het eind kun je 'm met je sponsor delen — dan kan zij of hij zich voorbereiden op jullie call.\n\nKijk bij de review naar PATRONEN, niet alleen 'deed ik m'n aantallen?'. Welke berichten kregen reactie? Welke fase heeft de meeste vastzittende prospects? Waar zit je bottleneck? De ELEVA Mentor kan je daarbij helpen via de funnel-analyse-knop op maandag.",
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

function themaVoor(weekdag: Weekdag): WeekdagThema {
  switch (weekdag) {
    case 1: // maandag
      return {
        titel: "🔍 Maandag — pipeline-analyse-dag",
        watJeLeert: `Maandag = de week-opener. Voordat je in nieuwe acties stort, kijk je eerst waar je staat. De Mentor van ELEVA analyseert je actuele pijplijn-cijfers en wijst je naar de fase waar de meeste prospects vastzitten. Dat is je focus voor de week.\n\nGEEN NIEUWE THEORIE\n\nDe eerste 21 dagen heb je alles geleerd wat je nodig hebt: 4-stappen-uitnodiging, Feel-Felt-Found, 5-fasen-follow-up, edification, Doel-Tijd-Termijn. Vanaf nu hoef je niets nieuws meer te leren — alleen blijven DOEN. Dat is waar 80% afhaakt. De 20% die wel doorgaat, daar zit de werkelijke groei.\n\nHET WEEKRITME\n\nElke weekdag heeft één extra focus naast het standaard-ritme:\n• Maandag = pipeline-analyse\n• Dinsdag = audio onderweg\n• Woensdag = lifestyle-content\n• Donderdag = 3-weg of presentatie plannen\n• Vrijdag = follow-up-batch (drie-stappen-aanpak)\n• Zaterdag = lichte reflectie\n• Zondag = wekelijkse review + sponsor-call\n\nDe basis blijft elke dag hetzelfde (namen, berichten, uitnodigingen, follow-ups, stories). De F-stap roteert zodat geen dag hetzelfde voelt — terwijl het ritme wel doorloopt.`,
      };
    case 2: // dinsdag
      return {
        titel: "🎧 Dinsdag — audio onderweg",
        watJeLeert: `Dinsdag = audio-dag. Vandaag voed je je mindset met één track uit de Audio-onderweg-Academy. Eric Worre's Seven Skills, perfect voor in de auto, tijdens een wandeling of bij koffie.\n\nWAAROM AUDIO?\n\nLezen en doen vraagt je hoofd. Luisteren tijdens beweging activeert een andere laag. Veel netwerkers melden dat de stof pas écht in plaats valt na de 4e of 5e keer luisteren — niet door één keer doorscannen. Dinsdag-discipline: één track per week.\n\nIN 8 WEKEN HEB JE ALLE SEVEN SKILLS\n\nKies elke dinsdag de skill waarvan je voelt dat je 'm nu het meeste nodig hebt. Geen volgorde verplicht (na de intro). Sommige dagen is dat 'vinden van prospects', andere dagen 'follow-up' of 'closing'. Volg je intuïtie.\n\nNiet beschikbaar voor audio vandaag? Schuif door naar dinsdag volgende week. Een gemist moment is geen drama, een gemist patroon wel.`,
      };
    case 3: // woensdag
      return {
        titel: "📱 Woensdag — lifestyle-content op socials",
        watJeLeert: `Woensdag = content-dag. Naast je gewone stories maak je vandaag één wat dieper moment dat laat zien wie je bent. Geen pitch — wel lifestyle.\n\nWAAROM DIT WERKT\n\nMensen worden aangetrokken door wie je BENT, niet door wat je VERKOOPT. Hoe meer je je echte leven laat zien (gezonde keuzes, mooie wandelingen, rustige momenten, doelen waar je aan werkt), hoe meer mensen je zelf opzoeken. Geen DM's meer hoeven sturen — mensen sturen JOU.\n\nDit is een lang spel. Eén lifestyle-post per week bouwt over 6-12 maanden een aanwezigheid op die geen 100 cold-DM's kunnen evenaren.\n\nDIEPER LEREN\n\nIn de Academy staat de training 'Social Media Strategie' (14 modules, 42 lessen). Daar leer je profielinrichting, story-strategie, FORM in DM's, lifestyle-leakage. Geen verplichting — voor wanneer je 'm wilt pakken.\n\nHet komt allemaal in jouw eigen ritme. Eén woensdag tegelijk.`,
      };
    case 4: // donderdag
      return {
        titel: "🤝 Donderdag — 3-weg of presentatie plannen",
        watJeLeert: `Donderdag = plannings-dag. Niet uitvoeren in de week, plannen. Eén 3-weg of presentatie voor deze week vastleggen, agenda erbij.\n\nWAAROM PLANNEN ALS APARTE STAP?\n\nVeel netwerkers 'doen het wel als het uitkomt'. Resultaat: er KOMT geen 3-weg uit. Twee weken zonder een 3-weg = pijplijn-stagnatie = afhaken. Met één afgesproken moment per week houd je de motor draaiend.\n\nDE PLANNINGS-FORMULE\n\n1. Kies de warmste prospect die in fase 'one-pager' of 'follow-up' staat.\n2. Stuur de aankondiging.\n3. App je sponsor of teamlid om beschikbaarheid.\n4. Zet 't in je agenda — niet 'ergens deze week' maar dag + tijdslot.\n\nEEN PER WEEK\n\nMinder dan een per week = pijplijn kakt in. Meer dan twee per week = je voorbereiding lijdt eronder en je sponsor raakt overbelast. Eén is het gulden midden tijdens onderhouds-modus.\n\nDieper terug-bladeren: Menu → Playbook → Dag 9 (3-weg-meesterclass) en Dag 10 (3-weg doen).`,
      };
    case 5: // vrijdag
      return {
        titel: "🔄 Vrijdag — follow-up-batch met drie-stappen-aanpak",
        watJeLeert: `Vrijdag = focus-follow-up-dag. Naast je gewone openstaande follow-ups pak je vandaag specifiek de 5 HARDSTE cases — prospects waar je niet meteen weet wat te schrijven.\n\nWAAROM DRIE-STAPPEN-AANPAK\n\nDe valkuil van starters: bij elke hardere case meteen de Mentor of sponsor om hulp vragen. Comfort, maar het houdt je beginner. Door eerst ZELF te schrijven, dan te checken tegen wat je hebt geleerd (FFF, 5-fasen-fase, openingszin), bouw je je eigen instinct. Pas als je twijfelt vraag je een tweede mening.\n\nDE BESTE TIJD VOOR HARDE CASES\n\nVrijdagmiddag of -avond. Reden: mensen zijn op vrijdag iets meer ontspannen dan dinsdagochtend. Een doordachte vraag krijgt vrijdag een doordacht antwoord. Op een drukke woensdag krijg je sneller een halve reactie.\n\nNa 5 weken vrijdag-batch heb je 25 moeilijke cases bewust aangepakt. Dat is waar je vakmanschap echt scherp wordt.`,
      };
    case 6: // zaterdag
      return {
        titel: "🪞 Zaterdag — lichte week-reflectie",
        watJeLeert: `Zaterdag = lichter moment. Geen zware opdrachten, geen aparte planning. Alleen je gewone ABCDE-ritme + 5 minuten reflectie + sponsor-checkin.\n\nWAAROM EEN 'LICHTERE' DAG IN HET WEEKRITME?\n\nConsistente intensiteit zonder pauze leidt tot uitval. Het weekend is het natuurlijke pauze-moment. Niet je werk weglaten, wel het ritme zacht doorzetten.\n\nDE REFLECTIE-VRAAG VAN ZATERDAG\n\n'Wat ging deze week beter dan vorige week? En welk moment voelde voor jou als groei?'\n\nKlein, lief, persoonlijk. Schrijf het op of spreek het in. Morgen (zondag) doe je de uitgebreide review met sponsor-call — vandaag is alleen het EERSTE rondje.\n\nNetwerkers die hun weekend bewust lichter pakken, halen méér uit hun werkweken. Het is geen luiheid, het is ritme-bewaking.`,
      };
    case 0: // zondag
    default:
      return {
        titel: "📋 Zondag — wekelijkse review + sponsor-call",
        watJeLeert: `Zondag = review-dag. Lichter op de input (minimum-aantallen voor ABCDE), zwaarder op de reflectie + sponsor-call. Dezelfde aanpak als dag 7, 14, 21 — herhaalbaar wekelijks.\n\nDE WEKELIJKSE REVIEW\n\nDrie vragen die je beantwoordt in /statistieken:\n1. Wat ging goed deze week?\n2. Wat liep niet soepel?\n3. Waar focus ik volgende week op?\n\nDeel de review met je sponsor (toggle aan het eind van het formulier). Sponsor kan zich daardoor voorbereiden op jullie call.\n\nDE SPONSOR-CALL (15 min)\n\nWeek doorlopen. Niet alleen 'wat gebeurde' — vooral 'wat ga ik volgende week anders'. De sponsor-call is het moment waar week-na-week patroon-herkenning gebeurt.\n\nMINIMUM-AANTALLEN VANDAAG\n\nA, B en C op minimum-aantallen vandaag (zoals dag 7). Reden: review + sponsor-call vragen ruimte. Maar je pijplijn houdt z'n stroom — minder dan minimum doe je niet.`,
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
 * @param weekdag    JavaScript Date.getDay() output (0 = zondag, ..., 6 = zaterdag).
 * @param commitmentUren  Het tempo dat de user heeft gekozen.
 */
export function genereerWeekritmeDag(
  dagNummer: number,
  weekdag: Weekdag,
  commitmentUren: CommitmentUren | null,
): Dag | null {
  if (dagNummer < 22 || dagNummer > 60) return null;

  const thema = themaVoor(weekdag);
  const fStap = kiesFStap(weekdag);

  // Zondag: minimum-aantallen voor ABCDE (zoals dag 7-patroon).
  // Andere weekdagen: vol-tempo.
  const isZondag = weekdag === 0;
  const stappen: ControllableTaak[] = isZondag
    ? bouwZondagABCDEstappen(dagNummer, commitmentUren)
    : commitmentUren
      ? standaardABCDEstappen(dagNummer, commitmentUren)
      : [];

  // F-stap inschuiven na ABCDE
  stappen.push(fStap);

  // Z-stap: sponsor-checkin (zondag: sponsor-call 15 min, langer)
  stappen.push(
    isZondag
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
          uitleg: `30 seconden. Het is ${WEEKDAG_NAMEN[weekdag]}, dag ${dagNummer} van je Sprint. Stuur je sponsor een berichtje hoe het ging vandaag — kort en menselijk.`,
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

function kiesFStap(weekdag: Weekdag): ControllableTaak {
  switch (weekdag) {
    case 0:
      return zondagFStap();
    case 1:
      return maandagFStap();
    case 2:
      return dinsdagFStap();
    case 3:
      return woensdagFStap();
    case 4:
      return donderdagFStap();
    case 5:
      return vrijdagFStap();
    case 6:
      return zaterdagFStap();
  }
}

/**
 * Zondag-versie van A-B-C-D-E stappen: minimum-aantallen op A/B/C,
 * gewone follow-ups (D) en stories (E). Spiegelt het dag-7-patroon.
 */
function bouwZondagABCDEstappen(
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
      uitleg: `Minimaal ${min.contacten} nieuwe namen vandaag, meer mag altijd. Zondag is reflectie-dag, dus rustiger op de input — maar je pijplijn houdt z'n stroom. Minder doe je niet, dat breekt het ritme.`,
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

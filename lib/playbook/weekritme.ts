// ============================================================
// PLAYBOOK — weekritme voor dag 22-60
// Na de eerste 21 dagen (Fundament → Momentum → Ritme) zit de
// member in "ritme-verduurzaming": dezelfde acties, maar nu als
// vast weekritme. Elke weekdag heeft één hoofdfocus.
//
// De controllable-lat voor dag 22-60:
//   • 10 uitnodigingen per dag (ma-vr)
//   • 10 follow-ups per dag (ma-vr)
//   • 3 namen per dag toevoegen (ma-vr)
//   • 2 3-weg-gesprekken per week (woensdag-focus)
//   • 1 weekly review (zondag)
//   • 1 planning-moment (maandag)
// ============================================================

import { Weekdag } from "./types";

export const WEEKRITME: Weekdag[] = [
  // ──────────────────────────────────────────────────────────
  // MAANDAG · Plannen
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 1,
    titel: "Maandag · plannen",
    focus:
      "Je week begint met overzicht. Wie zit waar in de pipeline? Wie krijgt deze week welke stap? Pak even 20 minuten om je week te tekenen vóór je uitnodigingen stuurt.",
    vandaagDoen: [
      {
        id: "ma-pipeline-review",
        label: "Pipeline-review: wie zit in welke fase?",
        uitleg:
          "Open Pipeline in ELEVA. Loop elke fase af: wie wacht op wat? Wie is langer dan 5 dagen niet bewogen? Die krijgen deze week prioriteit.",
        verplicht: true,
      },
      {
        id: "ma-week-plan",
        label: "Week-plan: 3 prioriteit-prospects kiezen",
        uitleg:
          "Kies 3 mensen die deze week een beslissing nodig hebben. Niet meer. Focus werkt.",
        verplicht: true,
      },
      {
        id: "ma-inhaaldag-bouwen",
        label: "Inhaaldag inbouwen indien nodig",
        uitleg:
          "Heb je vorige week dagen overgeslagen? Plan deze week 1-2 dagen waar je +50% aantallen draait (15 invites ipv 10). Niet straffen, gewoon inhalen. Op andere dagen blijft het normale ritme.",
        verplicht: false,
      },
      {
        id: "ma-10-invites",
        label: "10 uitnodigingen versturen",
        verplicht: true,
      },
      {
        id: "ma-10-followups",
        label: "10 follow-ups doen",
        verplicht: true,
      },
      {
        id: "ma-3-namen",
        label: "3 nieuwe namen toevoegen",
        verplicht: true,
      },
      {
        id: "ma-sponsor-plan",
        label: "Deel je week-plan met je sponsor (optioneel)",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Pipeline-review",
        menupad: "Menu → Pipeline → Alle fases",
        route: "/pipeline",
      },
      {
        actie: "Week-plan noteren",
        menupad: "Menu → Weekritme → Deze week",
        spraak: '"Deze week focus op Jan, Marieke en Peter"',
        route: "/week",
      },
    ],
    teaching:
      "Een week die je niet plant, plant jou. Maandag 20 minuten vooruit-denken spaart je 5 dagen drijven. Pak pen en papier als ELEVA even te klein voelt. Het resultaat hoort in ELEVA, het denken mag overal.",
  },

  // ──────────────────────────────────────────────────────────
  // DINSDAG · Uitnodigen
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 2,
    titel: "Dinsdag · uitnodigen",
    focus:
      "Vandaag is invite-dag. De 10 uitnodigingen die je stuurt zijn niet random. Ze komen uit je pipeline 'nieuw' en uit je maandag-plan. Kwantiteit mét richting.",
    vandaagDoen: [
      {
        id: "di-10-invites",
        label: "10 uitnodigingen versturen",
        uitleg:
          "Gebruik het 4-stappen-script (haast, complimentje, vraag, set tijd). Varieer de opening. Een tweede invite aan dezelfde persoon vraagt om een andere hoek.",
        verplicht: true,
      },
      {
        id: "di-10-followups",
        label: "10 follow-ups doen",
        verplicht: true,
      },
      {
        id: "di-3-namen",
        label: "3 nieuwe namen toevoegen",
        verplicht: true,
      },
      {
        id: "di-no-show-check",
        label: "No-shows van afgelopen week inhalen",
        uitleg:
          "Wie heeft vorige week niet gereageerd op een invite? Eén herkansing, zachte toon. Daarna pas over 2 weken weer.",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Uitnodigingen versturen",
        menupad: "Menu → Uitnodigen → Kies prospect",
        spraak: '"Stuur uitnodiging naar Jan"',
        route: "/uitnodigen",
      },
      {
        actie: "Uitnodig-scripts openen",
        menupad: "Menu → Hulpbronnen → Scripts → Uitnodiging",
        route: "/scripts",
      },
    ],
    teaching:
      "De regel: 'Make it short, make it urgent, get off the phone.' 30 seconden is genoeg. Hoe langer je praat, hoe meer je jezelf in de weg zit. Je bouwt geen rapport bij een uitnodiging. Je zet alleen even een afspraak.",
  },

  // ──────────────────────────────────────────────────────────
  // WOENSDAG · 3-weg / Samen werken
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 3,
    titel: "Woensdag · 3-weg",
    focus:
      "Midden van de week: samenwerken met je sponsor of een geupline. Een 3-weg is geen presentatie. Het is een getuigenis met drie stemmen.",
    vandaagDoen: [
      {
        id: "wo-3weg-plannen",
        label: "Minstens 1 3-weg-gesprek deze week plannen/voeren",
        uitleg:
          "Liefst vandaag zelf, anders deze week. Regel: elke prospect die bijna-ja of bijna-nee zegt, krijgt een 3-weg aangeboden.",
        verplicht: true,
      },
      {
        id: "wo-10-invites",
        label: "10 uitnodigingen versturen",
        verplicht: true,
      },
      {
        id: "wo-10-followups",
        label: "10 follow-ups doen",
        verplicht: true,
      },
      {
        id: "wo-3-namen",
        label: "3 nieuwe namen toevoegen",
        verplicht: true,
      },
      {
        id: "wo-edification-check",
        label: "Sponsor ge-edifieerd vóór het gesprek?",
        uitleg:
          "Vertel je prospect vóórdat de sponsor aanhaakt waarom die goed is, wat hij/zij doet. Zonder edification geen autoriteit.",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "3-weg-gesprek plannen",
        menupad: "Menu → Sponsor → 3-weg plannen",
        spraak: '"Plan 3-weg met sponsor en Marieke voor donderdag 20u"',
        route: "/sponsor/3-weg",
      },
      {
        actie: "Edification-zinnen ophalen",
        menupad: "Menu → Hulpbronnen → Scripts → Edification",
        route: "/scripts#edification",
      },
    ],
    teaching:
      "Het 3-weg-principe: jij bent de brug, de sponsor is de autoriteit, de prospect is de beslisser. Jouw taak is edificeren, niet antwoorden. Hoe minder jij zegt in een 3-weg, hoe meer je groeit als vakman.",
  },

  // ──────────────────────────────────────────────────────────
  // DONDERDAG · Follow-up
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 4,
    titel: "Donderdag · follow-up",
    focus:
      "De fortuin zit in de follow-up. Vandaag extra gewicht op doorvragen: wie heeft iets gezien maar nog niet beslist? Met welke vraag breng je 'm een stap verder?",
    vandaagDoen: [
      {
        id: "do-10-followups-plus",
        label: "10 follow-ups doen, met open vraag",
        uitleg:
          'Niet "heb je nog nagedacht?", maar "wat sprak je het meest aan?" of "wat was je grootste zorg?". Open vragen brengen antwoorden.',
        verplicht: true,
      },
      {
        id: "do-10-invites",
        label: "10 uitnodigingen versturen",
        verplicht: true,
      },
      {
        id: "do-3-namen",
        label: "3 nieuwe namen toevoegen",
        verplicht: true,
      },
      {
        id: "do-beslissing-vragen",
        label: "Vraag bij 2 prospects de beslissing",
        uitleg:
          "Wie al 2+ follow-ups heeft gehad zonder beslissing: vraag vandaag expliciet. 'Wat is je gevoel: meedoen als member, als shopper, of nu even niet?'",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Follow-up-lijst per fase",
        menupad: "Menu → Pipeline → Follow-up nodig",
        route: "/pipeline?filter=followup",
      },
      {
        actie: "Follow-up-scripts (open vragen)",
        menupad: "Menu → Hulpbronnen → Scripts → Follow-up",
        route: "/scripts#followup",
      },
    ],
    teaching:
      "80% van de beslissingen valt op follow-up 5-12. Niet op 1 of 2. Als jij stopt bij nummer 3, laat je geld en impact liggen. Maak het zacht, consistent, zonder pushen. Een 'nog niet' is geen 'nooit'.",
  },

  // ──────────────────────────────────────────────────────────
  // VRIJDAG · Socials / Lijst uitbreiden
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 5,
    titel: "Vrijdag · socials",
    focus:
      "Einde van de werkweek: uitbreiden. Wie heeft deze week op je sociale media gereageerd, geliked, gecommentarieerd? Die mensen willen gezien worden, geef ze een DM.",
    vandaagDoen: [
      {
        id: "vr-5-dms",
        label: "5 DM's naar reageerders van deze week",
        uitleg:
          "Geen verkoop-DM, gewoon een menselijk bericht. 'Leuk dat je reageerde op mijn post, hoe gaat het?'. En dan FORM openen.",
        verplicht: true,
      },
      {
        id: "vr-social-post",
        label: "1 waarde-post plaatsen (product OF lifestyle)",
        uitleg:
          "Niet verkopen op socials, gewoon delen. Je workout, je ontbijt met Daily BioBasics, je ochtendritueel. Laat zien wie je bent, niet wat je verkoopt.",
        verplicht: true,
      },
      {
        id: "vr-10-invites",
        label: "10 uitnodigingen versturen",
        verplicht: true,
      },
      {
        id: "vr-5-followups",
        label: "5 follow-ups doen (lichtere dag)",
        verplicht: true,
      },
      {
        id: "vr-3-namen-socials",
        label: "3 nieuwe namen uit socials toevoegen",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Social-challenge widget",
        menupad: "Dashboard → Social-challenge",
        spraak: '"Voeg 3 namen toe uit Instagram"',
        route: "/dashboard#social",
      },
      {
        actie: "Post-ideeën",
        menupad: "Menu → Hulpbronnen → Content → Post-ideeën",
        route: "/content",
      },
    ],
    teaching:
      "Sociale media is geen verkoopkanaal. Het is een vindkanaal. Mensen kopen niet uit je feed, ze ontdekken dat je bestaat. De verkoop gebeurt in de DM, dan in de one-pager, dan in de presentatie. Je feed doet stap 1, jij doet stap 2 t/m 5.",
  },

  // ──────────────────────────────────────────────────────────
  // ZATERDAG · Events / Leren
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 6,
    titel: "Zaterdag · events & leren",
    focus:
      "Lichtere dag. Weekend-events, team-calls, training, nieuwe leden onboarden. Een dag om te groeien als vakman, niet om door te duwen.",
    vandaagDoen: [
      {
        id: "za-event-of-training",
        label: "Aanwezig bij team-event OF 30 min training",
        uitleg:
          "Als er een team-call, zoom of live-event is: erbij zijn. Geen event? Pak Go Pro, een goede networking-video, of een ELEVA-training uit de bibliotheek.",
        verplicht: true,
      },
      {
        id: "za-nieuwe-leden-welkom",
        label: "Nieuwe leden deze week welkom heten",
        uitleg:
          "Heb je deze week iemand ingeschreven? Stuur een persoonlijk bericht, plan hun eerste 'waarom-ik-meedeed' gesprek in.",
        verplicht: false,
      },
      {
        id: "za-5-invites",
        label: "5 uitnodigingen (lichter weekend-tempo)",
        verplicht: false,
      },
      {
        id: "za-5-followups",
        label: "5 follow-ups (lichter weekend-tempo)",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Team-events bekijken",
        menupad: "Menu → Team → Agenda",
        route: "/team/agenda",
      },
      {
        actie: "Training-bibliotheek",
        menupad: "Menu → Leren → Bibliotheek",
        route: "/leren",
      },
      {
        actie: "Welkom-flow nieuw lid",
        menupad: "Menu → Leden → [nieuw lid] → Welkom-flow",
        route: "/leden",
      },
    ],
    teaching:
      "Je groeit niet door méér te doen, je groeit door beter te worden. Zaterdag is je leer-dag. 30 minuten bewust trainen is meer waard dan 3 uur hulpeloos invites versturen. Leer eerst, dan produceer.",
  },

  // ──────────────────────────────────────────────────────────
  // ZONDAG · Review & Reflectie
  // ──────────────────────────────────────────────────────────
  {
    dagVanDeWeek: 0,
    titel: "Zondag · review",
    focus:
      "Einde van de week: terugkijken. Wat heb je gedaan? Wat heeft gewerkt? Wat niet? Welke prospect heeft je verrast? De review is je grootste leermoment.",
    vandaagDoen: [
      {
        id: "zo-week-review",
        label: "Week-review invullen in ELEVA",
        uitleg:
          "Aantal invites / follow-ups / gesprekken / beslissingen. Plus: wat leerde je deze week over jezelf? Over het vak?",
        verplicht: true,
      },
      {
        id: "zo-cijfers-check",
        label: "Controllable-lat checken: gehaald of niet?",
        uitleg:
          "10 invites/dag × 5 dagen = 50. 10 follow-ups/dag × 5 = 50. Haalde je dat? Zo niet: waar zat de lek? Tijd, focus, angst?",
        verplicht: true,
      },
      {
        id: "zo-win-van-week",
        label: "1 win van de week vieren",
        uitleg:
          "Klein of groot: iemand zei ja, iemand deed z'n eerste one-pager, je sponsor gaf een complimentje. Schrijf het op. Momentum voedt zich met erkenning.",
        verplicht: true,
      },
      {
        id: "zo-volgende-week",
        label: "Top-3 prioriteiten volgende week bedenken",
        uitleg:
          "Niet het plan zelf, dat doe je maandag. Wél: welke 3 prospects krijgen volgende week jouw focus? Wat is je emotionele insteek?",
        verplicht: true,
      },
      {
        id: "zo-inhaaldag-check",
        label: "Inhaal-check: dagen overgeslagen? Plan inhaaldag(en)",
        uitleg:
          "Tellen: hoeveel dagen heb je deze week niet de lat geraakt? Geen schaamte. Plan voor volgende week 1-2 inhaaldagen waar je de aantallen verhoogt (+50% invites/follow-ups). Je staat zo weer op koers.",
        verplicht: true,
      },
      {
        id: "zo-overwelhm-check",
        label: "Overwelhm-check: wat schuurde, wat gaf energie?",
        uitleg:
          "Wat voelde te veel? Wat ging makkelijker dan vorige week? Schrijf 1 zin op. Wat schuurt is meestal precies wat groei geeft. Daar zit volgende week je oefening, niet je probleem.",
        verplicht: true,
      },
      {
        id: "zo-sponsor-checkin",
        label: "Sponsor-check-in (optioneel)",
        uitleg:
          "Een zondagse 'zo ging m'n week'-bericht naar je sponsor is kort, krachtig, en voedt de relatie.",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Week-review",
        menupad: "Menu → Weekritme → Review",
        spraak: '"Start mijn week-review"',
        route: "/week/review",
      },
      {
        actie: "Cijfer-dashboard",
        menupad: "Dashboard → Mijn week",
        route: "/dashboard#week",
      },
      {
        actie: "Wins loggen",
        menupad: "Menu → Weekritme → Wins",
        route: "/wins",
      },
    ],
    teaching:
      "Wat je niet meet, verbeter je niet. Wat je meet zonder te vieren, put je uit. De week-review combineert beide: harde cijfers (heb ik de lat gehaald?) en zachte voeding (wat heeft me gevormd?). Neem er 20 minuten voor. Het is de duurste 20 minuten van je week.\n\nInhaal-regel: dagen worden niet 'verloren'. Een gemiste dag is een verzetbare dag. Plan 'm in de week erna in en til de aantallen op die dag op met 50%. Niet schuld dragen, gewoon doorgaan. De 60-dagenrun beloont volharding, niet perfectie.",
  },
];

/**
 * Haal de weekdag op voor een specifieke dag in de run (22-60).
 * Dag 22 = maandag als de run op maandag start; berekening loopt
 * via de JS Date van de start-datum.
 */
export function getWeekdagVoorRundag(
  rundagNummer: number,
  runStartDatum: Date
): Weekdag {
  const dagenVanaf = rundagNummer - 1;
  const datum = new Date(runStartDatum);
  datum.setDate(datum.getDate() + dagenVanaf);
  const dagVanDeWeek = datum.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return WEEKRITME.find((w) => w.dagVanDeWeek === dagVanDeWeek)!;
}

/**
 * Direct een weekdag ophalen op basis van JS day-of-week.
 * 0 = zondag, 1 = maandag, ... 6 = zaterdag.
 */
export function getWeekdag(dagVanDeWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6): Weekdag {
  return WEEKRITME.find((w) => w.dagVanDeWeek === dagVanDeWeek)!;
}

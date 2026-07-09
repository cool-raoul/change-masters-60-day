// File: lib/playbook/lanceer-routes.ts
//
// DE LANCEER-REIS (preview, goedgekeurde opzet 2026-07-09):
// de 21-dagen-werkwijze van het team, verdeeld over 30-40 dagen,
// met de pre-post en de 21-dagen-post als REEKS in plaats van als
// één post op één dag. Twee routes uit dezelfde bouwblokken:
//
//   ROUTE A (±40 dagen, nog geen eigen resultaat):
//     start → 6-daagse pre-post-lancering → oogst & opvolgen →
//     opportunity (pioniers-versie) → skills & ritme →
//     10-daagse resultaten-reeks (VERVOLG-smaak: hervertellen,
//     niet herhalen) → opportunity (bewezen) → top-20 → afronding
//
//   ROUTE B (±30 dagen, wél eigen resultaat):
//     start → 10-daagse resultaten-reeks (VERSE smaak) → oogst →
//     opportunity → skills & ritme → top-20 → afronding
//
// HERGEBRUIK (één tekstbron, stabiele taak-ids):
//   - uitV9(): dagen 1-op-1 uit CORE_V9_STAPPEN (skills, top-20, reflectie)
//   - uitV10(): de oogst-dag en de business-boog uit CORE_V10_STAPPEN
//   - nieuwe dagen: de drie lanceer-reeksen + kennismaking + bewezen-boog
//
// De posts zelf schrijft het Mentor-brein per persoon (interview-eerst,
// stem-DNA, claim-vrij, codewoord). Hier staan alleen de dag-rollen en
// de prefills die de schrijver-stand met de juiste rol openen. Voor de
// vervolg-reeks geldt de regel: HERVERTELLEN, NIET HERHALEN; de writer
// krijgt daarvoor iemands eerder geschreven posts mee (mentor_posts).
//
// Status: PREVIEW naast V9. Live Core blijft V9 tot Raouls akkoord;
// omschakel-plek te zijner tijd: lib/playbook/dagen-voor-modus.ts +
// bereken-dag.ts (zelfde patroon als V6→V9).

import type { Dag, ControllableTaak } from "./types";
import { CORE_V9_STAPPEN } from "./core-dagen-v9";
import { CORE_V10_STAPPEN } from "./core-dagen-v10";

const PA = "lanceer-a-dag";
const PB = "lanceer-b-dag";

/** Mentor-link met voorgevulde schrijfopdracht (opent de schrijver-rol). */
function mentorPost(prefill: string): string {
  return `/coach?prefill=${encodeURIComponent(prefill)}&submit=1`;
}

/** Dag 1-op-1 uit V9, alleen nummer + fase geremapt (taak-ids stabiel). */
function uitV9(v9Nummer: number, nieuwNummer: number, fase: 1 | 2 | 3 | 4): Dag {
  const bron = CORE_V9_STAPPEN.find((d) => d.nummer === v9Nummer);
  if (!bron) throw new Error(`lanceer-routes: V9-dag ${v9Nummer} niet gevonden`);
  return { ...bron, nummer: nieuwNummer, fase };
}

/** Dag 1-op-1 uit de V10-preview (oogst + business-boog zijn daar al goed). */
function uitV10(v10Nummer: number, nieuwNummer: number, fase: 1 | 2 | 3 | 4): Dag {
  const bron = CORE_V10_STAPPEN.find((d) => d.nummer === v10Nummer);
  if (!bron) throw new Error(`lanceer-routes: V10-dag ${v10Nummer} niet gevonden`);
  return { ...bron, nummer: nieuwNummer, fase };
}

/**
 * Dag 1 van de lanceer-reis: eigen welkom-dag. Hergebruikt de Builder-
 * uitleg en het sponsor-berichtje uit V9-dag-1 (stabiele taak-ids), maar
 * met een EIGEN dag-tekst: de oude post-keuze (pre-post of 21-dagen-post
 * via sideflow) bestaat hier niet meer, want de posts zitten als reeks
 * ín de dagen en de route-keuze is al bij de instroom gemaakt.
 */
function startDag(
  nieuwNummer: number,
  fase: 1 | 2 | 3 | 4,
  route: "a" | "b",
): Dag {
  const bron = uitV9(1, nieuwNummer, fase);
  const lanceerZin =
    route === "a"
      ? "Overmorgen begint je lancering: zes dagen, elke dag één post, en de Mentor schrijft ze allemaal met je mee. Je publiek gaat je zien beginnen, en dat is precies de bedoeling."
      : "Overmorgen begint je lancering: tien dagen rond jouw eigen ervaring, elke dag één post, en de Mentor schrijft ze allemaal met je mee.";
  return {
    ...bron,
    titel: "🚀 Welkom, jouw lanceer-reis begint",
    watJeLeert: `Wat fijn dat je er bent 🥰

Dit is dag één van je reis, en die begint rustig: vandaag leer je waar je naartoe werkt, en je stuurt je sponsor één berichtje. Meer hoeft er echt niet.

WAAR JE NAARTOE WERKT

${lanceerZin}

Geen lijstjes bellen, geen ongemakkelijke berichtjes naar mensen die er niet om vroegen. Jij deelt je verhaal, en de mensen die zich erin herkennen komen naar jóu. Elke reactie wordt vanzelf een warm gesprek, en bij elk warm gesprek sta je er niet alleen voor: je sponsor en de Mentor lopen de hele reis mee.

BUILDER, DE RODE DRAAD

Eén woord om mee te dragen, want dit is de rode draad door alles wat hier volgt: Builder.

Builder is een drempel. Op het moment dat jij Builder bent, kunnen de stappen die jou hier hebben gebracht door jou worden doorgegeven aan de drie of vier of vijf mensen die jou zijn gevolgd. Vóór Builder bouw jij in je eentje; vanaf Builder bouwt je team met je mee.

Wat is er nodig? Twee dingen. Eerste drie levels in jouw team samen 1500 IP, jouw eigen bestelling telt mee. En minimaal drie members met een bestelling vanaf 40 IP.

"Succes is geen toeval, succes is ingepland."

Morgen leert de Mentor je kennen (jouw verhaal en jouw stem), zodat elke post die hij straks voor je schrijft klinkt als jij. We gaan samen 💟`,
    vandaagDoen: bron.vandaagDoen.filter(
      (t) => t.inlineEmbed !== "prepost-keuze",
    ),
  };
}

// ============================================================
// GEDEELDE NIEUWE DAG: de Mentor leert jou kennen (dag 2)
// ============================================================

function kennismakingsDag(prefix: string, nummer: number, fase: 1 | 2 | 3 | 4): Dag {
  return {
    nummer,
    fase,
    titel: "🤝 De Mentor leert jou kennen",
    faseDoel:
      "Voor je gaat lanceren zorgen we dat de Mentor jou kent: jouw verhaal en jouw stem. Daarna schrijft hij elke post alsof jij 'm schreef.",
    watJeLeert: `Vanaf morgen ga je posten, en de Mentor gaat elke post voor je schrijven. Maar een post die niet als jij klinkt, prikken je vrienden er zo uit. Daarom doe je vandaag twee korte kennismakings-gesprekjes met de Mentor: eentje over jouw verhaal, eentje over jouw stem.

Het voelt als gewoon kletsen. De Mentor stelt een vraag, jij vertelt, en hij onthoudt het. Bij het stem-gesprek plak je een stukje tekst dat je ooit zelf schreef (een post, een lang appje), en dan laat hij je meteen iets moois zien: een alinea in jóuw stem. Vanaf dat moment schrijft hij nooit meer als een robot, maar als jij op je beste dag 🥰

En als je vandaag ook je eigen producten-routine start, heb je straks precies waar je reeks over gaat: je eigen echte ervaring.`,
    waaromWerktDit: {
      tekst: "Mensen ruiken AI-tekst meteen. Het verschil zit niet in slimmere technologie, maar in een Mentor die jou écht kent.",
      bron: "Eigen principe Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${prefix}${nummer}-kennismaking-1`,
        label: "Kennismaking ronde 1: jouw verhaal (± 5 minuten)",
        uitleg: "De Mentor vraagt naar je gewone dag, de druppel waarom je begon, en wat er over een jaar anders moet zijn. Dit wordt het fundament onder elke post.",
        verplicht: true,
        actieRoute: mentorPost("Start kennismaking ronde 1: jouw verhaal"),
        actieRouteLabel: "Start het gesprek →",
      },
      {
        id: `${prefix}${nummer}-kennismaking-2`,
        label: "Kennismaking ronde 2: jouw stem (± 5 minuten)",
        uitleg: "Plak een stukje tekst dat je zelf ooit schreef (geen AI-tekst) en vertel welke woorden typisch jij zijn. Eindigt met de stem-check: klinkt dit als jij?",
        verplicht: true,
        actieRoute: mentorPost("Start kennismaking ronde 2: jouw stem"),
        actieRouteLabel: "Start het gesprek →",
      },
      {
        id: `${prefix}${nummer}-producten`,
        label: "Start (of check) je eigen dagelijkse producten-routine",
        uitleg: "Jouw eigen ervaring is straks de brandstof van je posts. Vandaag beginnen is morgen al iets te vertellen hebben.",
        verplicht: true,
      },
      {
        id: `${prefix}${nummer}-opstart-call`,
        label: "Plan je opstart-call met je sponsor (± 30 minuten)",
        uitleg:
          "Samen je lancering doorlopen: wat ga je posten, wanneer bellen jullie kort bij, en hoe speel je warme reacties door (3-weg of Mini-ELEVA). Spreek meteen een vast wekelijks bel-momentje af; je staat er in deze weken nooit alleen voor.",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: `${prefix}${nummer}-profiel-bekijken`,
        label: "Kijk even wat de Mentor nu over je weet",
        verplicht: false,
        actieRoute: "/instellingen/mentor-profiel",
        actieRouteLabel: "Open je Mentor-profiel →",
      },
    ],
    waarInEleva: [
      {
        actie: "Alle kennismakings-rondes terugvinden",
        menupad: "Menu → Instellingen → Wat de Mentor over je weet",
        route: "/instellingen/mentor-profiel",
      },
    ],
  };
}

// ============================================================
// REEKS-FABRIEK: bouwt een lanceer-dag met de standaard-taken
// (schrijf met Mentor → plaats → reageer → stories), plus wat
// een specifieke post-rol extra nodig heeft.
// ============================================================

type LanceerPostDag = {
  nummer: number;
  fase: 1 | 2 | 3 | 4;
  prefix: string;
  key: string;
  titel: string;
  faseDoel: string;
  watJeLeert: string;
  waarom: { tekst: string; bron?: string };
  prefill: string;
  /** Extra uitleg bij de plaats-taak (bv. beeld-noot). */
  plaatsUitleg?: string;
  /** true = ook codewoord-opvolg-taak toevoegen. */
  metCodewoord?: boolean;
  /** true = sponsor-vangnet-embed toevoegen (warme interesse doorspelen). */
  metVangnet?: boolean;
  /** true = concept eerst naar sponsor (upline-check). */
  metUplineCheck?: boolean;
  /** false = geen stories-taak (bv. dag 1 van de reeks). */
  metStories?: boolean;
  /** Vervangt de standaard post-taken volledig (bv. oogst-dag zonder post). */
  eigenTaken?: ControllableTaak[];
};

function lanceerDag(d: LanceerPostDag): Dag {
  const id = (slug: string) => `${d.prefix}${d.nummer}-${slug}`;
  const taken: ControllableTaak[] =
    d.eigenTaken ??
    ([
      {
        id: id("post-schrijven"),
        label: "Schrijf deze post met de Mentor",
        uitleg:
          "De Mentor kent je profiel en je eerdere posts. Hij vraagt alleen wat er nog mist en levert de post copy-paste-klaar, met een beeld-tip erbij.",
        verplicht: true,
        actieRoute: mentorPost(d.prefill),
        actieRouteLabel: "✍️ Schrijf 'm met de Mentor →",
      },
      ...(d.metUplineCheck
        ? [
            {
              id: id("upline-check"),
              label: "Stuur je concept even naar je sponsor (tweede paar ogen)",
              uitleg:
                "Geen goedkeuring, gewoon een frisse blik. Geen reactie binnen een dag? Dan plaats je 'm gewoon.",
              verplicht: false,
              inlineEmbed: "sponsor-melding" as const,
            },
          ]
        : []),
      {
        id: id("plaatsen"),
        label: "Plaats de post op Facebook (en Instagram)",
        uitleg: d.plaatsUitleg,
        verplicht: true,
      },
      {
        id: id("reageren"),
        label: "Reageer binnen een uur op elke reactie, ook op likes",
        verplicht: true,
      },
      ...(d.metCodewoord
        ? [
            {
              id: id("codewoord"),
              label: "Stuur elke codewoord-reageerder meteen wat je beloofde",
              uitleg:
                "De Mentor gaf je bij de post het juiste linkje mee. Dit is je warmste groep: die heeft letterlijk om meer gevraagd.",
              verplicht: true,
            },
          ]
        : []),
      ...(d.metVangnet
        ? [
            {
              id: id("vangnet"),
              label: "Wil iemand écht verder? Meld 'm bij je sponsor voor een 3-weg",
              uitleg:
                "Jij hoeft nog niks te kunnen: jij verbindt, je sponsor praat mee. Of stuur een Mini-ELEVA-uitnodiging en laat die omgeving het werk doen.",
              verplicht: false,
              inlineEmbed: "sponsor-melding" as const,
            },
          ]
        : []),
      ...(d.metStories !== false
        ? [
            {
              id: id("stories"),
              label: "3 korte stories (moment, proces, vraag)",
              verplicht: false,
            },
          ]
        : []),
    ] as ControllableTaak[]);

  return {
    nummer: d.nummer,
    fase: d.fase,
    titel: d.titel,
    faseDoel: d.faseDoel,
    watJeLeert: d.watJeLeert,
    waaromWerktDit: d.waarom,
    vandaagDoen: taken,
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
      },
      {
        actie: "Reageerders in je namenlijst zetten",
        spraak: "Voeg [naam] toe aan mijn namenlijst, reageerde op mijn post",
        route: "/namenlijst",
      },
    ],
  };
}

// ============================================================
// DE 6-DAAGSE PRE-POST-LANCERING (route A, dag 3-8)
// De klassieke pre-post is dag 3 van de reeks (het scharnierpunt).
// ============================================================

function zesDaagsePrePost(startDag: number, prefix: string, fase: 1 | 2 | 3 | 4): Dag[] {
  const FASE_DOEL =
    "Zes dagen, elke dag één post die naar je pre-post toewerkt en erna oogst. Mensen komen naar jóu toe.";
  return [
    lanceerDag({
      nummer: startDag,
      fase,
      prefix,
      key: "prepost-1",
      titel: "🌤️ Lanceerdag 1: de warm-up",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag begint je lancering, en de eerste post gaat nergens over. Dat is precies de bedoeling.

Je plaatst iets puur persoonlijks: een moment uit je dag, iets waar je blij van werd, een vraag aan je vrienden. Nul business. Waarom? Twee redenen. Je feed wordt wakker (elke reactie vertelt het algoritme: laat deze persoon vaker zien) en jíj wordt wakker: de drempel van het posten is na vandaag alvast genomen, met de makkelijkste post die er bestaat.

De Mentor schrijft 'm met je, in jouw woorden. Vijf minuten werk, en je lancering loopt 💟`,
      waarom: {
        tekst: "De post van vandaag maakt ruimte voor het verhaal van overmorgen. Reacties nu betekenen bereik straks.",
        bron: "Attraction-marketing-principe",
      },
      prefill:
        "Lanceerdag 1 van mijn pre-post-lancering: schrijf mijn warm-up-post. Puur persoonlijk, nul business: een echt moment uit mijn leven of een open vraag aan mijn vrienden, in mijn stem. Vraag me eerst kort wat er speelt in mijn dagen.",
      metStories: false,
    }),
    lanceerDag({
      nummer: startDag + 1,
      fase,
      prefix,
      key: "prepost-2",
      titel: "💭 Lanceerdag 2: hoe je je voelde",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag deel je hoe je je de laatste tijd voelde. Eerlijk, in gevoelstaal: futloos, niet lekker in je vel, energie die wegzakte, een hoofd dat te vol zat. Wat bij jou past.

Dit is de post waar mensen zich in herkennen. Er komt nog geen oplossing in voor, geen aankondiging, geen plan. Alleen het eerlijke verhaal van hoe het was. Morgen komt de beslissing, en juist omdat vandaag alleen het gevoel deelt, landt die morgen tien keer harder.

Spannend om dit te delen? Logisch. Weet dat dit soort posts de warmste reacties krijgen die er bestaan, juist van mensen waar je het niet van verwacht 🥰`,
      waarom: {
        tekst: "Wie zichzelf in jouw verhaal herkent, is al overtuigd voordat je iets hoeft uit te leggen.",
        bron: "Attraction-marketing-principe",
      },
      prefill:
        "Lanceerdag 2 van mijn pre-post-lancering: schrijf mijn hoe-ik-me-voelde-post. Alleen het eerlijke gevoel van de laatste tijd (claim-vrij, gevoelstaal), nog geen oplossing of aankondiging. Interview me eerst kort over hoe het echt was.",
    }),
    lanceerDag({
      nummer: startDag + 2,
      fase,
      prefix,
      key: "prepost-3",
      titel: "🌱 Lanceerdag 3: DE BESLISSING (je pre-post)",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag is het zover: je pre-post. De post waar jullie als team al jaren de mooiste dingen uit halen, en die nu twee dagen aanloop heeft gehad.

Je vertelt open en eerlijk wat je hebt besloten: de komende drie weken bewust met je leefstijl aan de slag. Gezonder eten, meer water, beter slapen, meer rust. Je bedankt degene die je erin meeneemt, en je sluit af met een wish me luck. Geen raadsels, geen geheimzinnig gedoe, gewoon jouw voornemen.

En dan gebeurt wat er altijd gebeurt: mensen gaan meeleven. Elke reactie en elke like van vandaag is een opening naar een gesprek, en jouw publiek gaat de komende weken vanzelf vragen hoe het gaat. Dat is je lancering 💟`,
      waarom: {
        tekst: "Je warme markt is niet opgebrand. De oude manier van benaderen is opgebrand.",
        bron: "Attraction-marketing-principe",
      },
      prefill:
        "Lanceerdag 3, de belangrijkste: schrijf mijn pre-post volgens de vaste team-opbouw (opener die de scroll stopt, hoe ik me voelde, wat ik heb besloten: 21 dagen bewust met mijn leefstijl, bedankje aan mijn begeleider, wish me luck). Gebruik wat je al van me weet uit dag 1 en 2 van deze reeks.",
      plaatsUitleg:
        "Met een echte eigen foto (de Mentor gaf je de beeld-tip). Klaar is klaar: niet meer bijschaven na het plaatsen.",
      metUplineCheck: true,
      metVangnet: true,
    }),
    lanceerDag({
      nummer: startDag + 3,
      fase,
      prefix,
      key: "prepost-4",
      titel: "📆 Lanceerdag 4: je eerste-dagen-update",
      faseDoel: FASE_DOEL,
      watJeLeert: `Gisteren kondigde je het aan, vandaag laat je zien dat het echt is. Eén concrete scène uit je eerste dagen: je nieuwe ochtend, de grote fles water op je bureau, de wandeling die je anders nooit maakte.

Klein houden werkt hier het best. Eén moment, één detail, één vraag aan je lezers ("herken je dat, die 15:00-dip?"). Vanaf vandaag starten ook je stories: drie kleine inkijkjes per dag, vijftien minuutjes werk. De feed is voor de grote momenten, stories houden de rest warm.`,
      waarom: {
        tekst: "Social media is een koffietentje, geen megafoon. Je wint met gesprekken, niet met bereik.",
        bron: "ELEVA Academy, Social Media-training",
      },
      prefill:
        "Lanceerdag 4 van mijn pre-post-lancering: schrijf mijn eerste-dagen-update. Eén concrete scène uit mijn eerste dagen (vraag me welke), klein en echt, met een vraag aan de lezer. Geen resultaat-claims, ik ben net begonnen.",
    }),
    lanceerDag({
      nummer: startDag + 4,
      fase,
      prefix,
      key: "prepost-5",
      titel: "🤝 Lanceerdag 5: wie doet er gezellig mee?",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag zet je de deur open: je zoekt mensen die gezellig met je meedoen. Niet omdat je iets verkoopt, maar omdat samen makkelijker is dan alleen. En dat is nog waar ook.

De post eindigt voor het eerst met een codewoord: wie wil weten hoe jij ervoor staat of zelf nieuwsgierig is, reageert met één woord en krijgt van jou een berichtje met je korte check. Drie minuten invullen, en jij ziet meteen wie er warm is en waar het bij diegene zit. De Mentor kent jouw check-linkjes al, dus die geeft je precies wat je moet sturen 🥰`,
      waarom: {
        tekst: "Een freebie geeft eerst, en vraagt pas daarna. Precies de volgorde waarin vertrouwen groeit.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        "Lanceerdag 5 van mijn pre-post-lancering: schrijf mijn meedoen-post. Ik zoek mensen die gezellig met me meedoen, met een codewoord-oproep naar mijn check (in de post heet dat een korte check of test). Vraag me eerst welke check het beste past.",
      metCodewoord: true,
      metVangnet: true,
    }),
    lanceerDag({
      nummer: startDag + 5,
      fase,
      prefix,
      key: "prepost-6",
      titel: "🎉 Lanceerdag 6: oogst en open deur",
      faseDoel: FASE_DOEL,
      watJeLeert: `De laatste post van je lanceerreeks is een bedankje met een open deur. Je benoemt hoe leuk alle reacties en steun waren, en je zegt er eerlijk bij: wie nieuwsgierig is mag me altijd een berichtje sturen.

En dan begint het echte werk van vandaag: de grote DM-dag. Naar iederéén die deze week reageerde of likete stuur je een berichtje. Drie soorten mensen, drie aanpakken: wie vroeg wat je doet krijgt info plus een filmpje, wie warm reageerde of alleen likete krijgt je gezellig-meedoen-berichtje, en wie het codewoord typte heeft je check al (die volg je binnen twee dagen op). De Mentor helpt bij elke DM die net even anders ligt 💪🏽`,
      waarom: {
        tekst: "Meet echte gesprekken, geen likes. Eén warm gesprek is meer waard dan honderd views.",
        bron: "ELEVA Academy, Social Media-training",
      },
      prefill:
        "Lanceerdag 6, de afsluiter van mijn pre-post-lancering: schrijf mijn oogst-post. Een warm bedankje voor alle reacties van deze week, met een open deur (wie nieuwsgierig is mag me altijd een berichtje sturen). Geen pitch.",
      metCodewoord: true,
      metVangnet: true,
    }),
  ];
}

// ============================================================
// DE 10-DAAGSE RESULTATEN-LANCERING
// Twee smaken uit hetzelfde skelet:
//   "vers"    → route B dag 3-12: publiek kent het verhaal nog niet
//   "vervolg" → route A dag 21-30: publiek zag de pre-post-reeks;
//                hervertellen in nieuwe woorden, nooit herhalen
// De klassieke 21-dagen-post is dag 4 van de reeks (het hoogtepunt).
// ============================================================

function tienDaagseResultaten(
  startDag: number,
  prefix: string,
  fase: 1 | 2 | 3 | 4,
  smaak: "vers" | "vervolg",
): Dag[] {
  const vervolg = smaak === "vervolg";
  const FASE_DOEL = vervolg
    ? "Tien dagen: de finale van het verhaal dat je publiek zag beginnen. Hervertellen voor wie het miste, terugverwijzen voor wie meekeek."
    : "Tien dagen, elke dag één rol: van warm-up naar jouw resultaten-post en de oogst erna. Mensen komen naar jóu toe.";
  const hervertelNoot = vervolg
    ? " Belangrijk: dit is de vervolg-versie. Verwijs terug naar mijn eerdere posts uit mijn pre-post-lancering en vertel alles opnieuw in nieuwe woorden en nieuwe scènes; herhaal nooit letterlijk wat ik al plaatste."
    : "";

  return [
    lanceerDag({
      nummer: startDag,
      fase,
      prefix,
      key: `${smaak}-1`,
      titel: "🌤️ Lanceerdag 1: de warm-up",
      faseDoel: FASE_DOEL,
      watJeLeert: vervolg
        ? `Je resultaten-reeks begint zoals elke goede reeks: met een post die nergens over gaat. Puur persoonlijk, en over een ánder onderwerp dan je vorige warm-up, want een deel van je publiek kent die nog.

Je feed wordt weer wakker, het algoritme gaat weer voor je werken, en jij staat weer aan. De komende tien dagen vertel je de afloop van het verhaal dat drie weken geleden begon. Dit wordt de mooiste reeks van allemaal 🥰`
        : `Je lancering begint met een post die nergens over gaat. Puur persoonlijk: een moment uit je dag, iets waar je blij van werd, een vraag aan je vrienden. Nul business.

Waarom? Je feed wordt wakker (elke reactie vertelt het algoritme: laat deze persoon vaker zien) en de drempel van het posten is meteen genomen, met de makkelijkste post die er bestaat. De Mentor schrijft 'm met je, in jouw woorden. Vijf minuten werk, en je lancering loopt 💟`,
      waarom: {
        tekst: "De post van vandaag maakt ruimte voor het verhaal van overmorgen. Reacties nu betekenen bereik straks.",
        bron: "Attraction-marketing-principe",
      },
      prefill: vervolg
        ? "Lanceerdag 1 van mijn resultaten-reeks (vervolg op mijn pre-post-lancering): schrijf mijn warm-up-post. Puur persoonlijk, nul business, en over een ander onderwerp dan mijn vorige warm-up." + hervertelNoot
        : "Lanceerdag 1 van mijn resultaten-lancering: schrijf mijn warm-up-post. Puur persoonlijk, nul business: een echt moment uit mijn leven of een open vraag aan mijn vrienden, in mijn stem. Vraag me eerst kort wat er speelt in mijn dagen.",
      metStories: false,
    }),
    lanceerDag({
      nummer: startDag + 1,
      fase,
      prefix,
      key: `${smaak}-2`,
      titel: vervolg
        ? "📆 Lanceerdag 2: de laatste-week-update"
        : "⏪ Lanceerdag 2: hoe het was",
      faseDoel: FASE_DOEL,
      watJeLeert: vervolg
        ? `Vandaag vertel je je publiek dat je 21 dagen er bijna op zitten. Kort en echt: wat merk je nu al, zonder het grote verhaal weg te geven. Dat komt overmorgen.

Wie je pre-post zag, leeft al weken mee en gaat dit niet willen missen. Wie 'm miste, stapt hier gewoon in. Eerlijke aankondiging, geen raadsels: je zegt gewoon dat je binnenkort deelt hoe het is gegaan.`
        : `Vandaag het before-verhaal: hoe het was voordat je begon. Futloos, niet lekker in je vel, de energie die elke middag wegzakte. Jouw versie, in gevoelstaal, claim-vrij.

Nog geen oplossing, nog geen resultaat. Alleen het eerlijke verhaal van hoe het was, want daar herkennen mensen zich in. De resultaten komen overmorgen, en die landen pas echt als mensen eerst dít gevoeld hebben.`,
      waarom: {
        tekst: "Wie zichzelf in jouw verhaal herkent, is al overtuigd voordat je iets hoeft uit te leggen.",
        bron: "Attraction-marketing-principe",
      },
      prefill: vervolg
        ? "Lanceerdag 2 van mijn resultaten-reeks: schrijf mijn laatste-week-update. Mijn 21 dagen zitten er bijna op; deel kort en eerlijk wat ik nu al merk (vraag me ernaar), zonder het grote verhaal al weg te geven. Geen raadsel-tease: ik kondig gewoon eerlijk aan dat ik binnenkort vertel hoe het ging." + hervertelNoot
        : "Lanceerdag 2 van mijn resultaten-lancering: schrijf mijn hoe-het-was-post. Het eerlijke before-verhaal in gevoelstaal (claim-vrij), nog zonder oplossing of resultaat. Interview me eerst over hoe het echt was.",
    }),
    lanceerDag({
      nummer: startDag + 2,
      fase,
      prefix,
      key: `${smaak}-3`,
      titel: vervolg
        ? "⏪ Lanceerdag 3: hoe het was, opnieuw verteld"
        : "🛤️ Lanceerdag 3: de aanpak",
      faseDoel: FASE_DOEL,
      watJeLeert: vervolg
        ? `Veel mensen hebben je pre-post nooit gezien, zo werken feeds nu eenmaal. Daarom vertel je vandaag nog één keer hoe het was, maar in nieuwe woorden en met een nieuwe scène. Zelfde waarheid, vers verteld.

De Mentor kent je eerdere posts letterlijk en zorgt dat dit een nieuwe post wordt, geen kopie. Voor nieuwkomers is het de instap in je verhaal, voor volgers een korte terugblik die de finale van morgen aankondigt.`
        : `Vandaag vertel je wat je precies bent gaan doen. Open en eerlijk: een duidelijk plan met eten, ritme, rust, én wat je elke ochtend neemt. Zonder merknaam, zonder claims, gewoon feitelijk wat jouw aanpak was.

Dit is een belangrijke post, want hij maakt morgen geloofwaardig. Resultaten zonder aanpak voelen als een loterij; resultaten mét een aanpak maken mensen nieuwsgierig naar het hoe. En dat hoe deel je in het gesprek, niet in de post.`,
      waarom: {
        tekst: vervolg
          ? "Hervertellen is een vak: zelfde waarheid, nieuwe woorden. Herkenning voor volgers, instap voor nieuwkomers."
          : "Feitelijk vertellen dat je iets volgt of iets neemt is geen claim; zeggen wat het medisch doet wél.",
        bron: "ELEVA claim-vrije lijn",
      },
      prefill: vervolg
        ? "Lanceerdag 3 van mijn resultaten-reeks: hervertel mijn before-verhaal (hoe het was voordat ik begon) in nieuwe woorden en met een nieuwe scène, voor iedereen die mijn pre-post miste." + hervertelNoot
        : "Lanceerdag 3 van mijn resultaten-lancering: schrijf mijn aanpak-post. Open en feitelijk wat ik ben gaan doen (eten, ritme, rust, en wat ik elke ochtend neem), zonder merknaam en claim-vrij. Vraag me eerst hoe mijn aanpak er echt uitzag.",
    }),
    lanceerDag({
      nummer: startDag + 3,
      fase,
      prefix,
      key: `${smaak}-4`,
      titel: "✨ Lanceerdag 4: DE RESULTATEN-POST",
      faseDoel: FASE_DOEL,
      watJeLeert: vervolg
        ? `Vandaag is de dag waar alles naartoe werkte: je resultaten-post, mét terugverwijzing. "21 dagen geleden schreef ik dat het roer omging. Dit is wat er gebeurde."

Alle positieve veranderingen die je hebt gemerkt komen erin, claim-vrij: dieper slapen, meer pit, lichter voelen, rustiger hoofd. Alles, want verschillende mensen worden door verschillende dingen geraakt. Wie je pre-post volgde krijgt de afloop van het verhaal, wie 'm miste leest een compleet verhaal. Dit wordt je sterkste post tot nu toe, en je publiek heeft 'm zien aankomen 💟`
        : `Vandaag de post waar deze reeks omheen gebouwd is: jouw resultaten-post. De post die in jullie team al jaren bewezen sterk is, en nu drie dagen aanloop heeft gehad.

Alle positieve veranderingen die je hebt gemerkt, claim-vrij verteld: dieper slapen, meer pit overdag, lichter voelen, rustiger hoofd, positiever in je dag. Allemaal, want één verandering raakt één persoon en alle veranderingen samen raken iedereen die meeleest. Afsluiten doe je met dankbaarheid, en met je codewoord voor wie wil weten hoe jij het aanpakte.`,
      waarom: {
        tekst: "Eén verandering raakt één persoon. Alle veranderingen samen raken iedereen die meeleest.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill: vervolg
        ? "Lanceerdag 4, het hoogtepunt: schrijf mijn 21-dagen-resultaten-post MET terugverwijzing naar mijn pre-post (iets als: 21 dagen geleden schreef ik dat het roer omging, dit is wat er gebeurde). Inventariseer eerst met mij ALLE positieve veranderingen die ik heb gemerkt, claim-vrij, en sluit af met dankbaarheid en mijn codewoord." + hervertelNoot
        : "Lanceerdag 4, het hoogtepunt: schrijf mijn 21-dagen-resultaten-post volgens de vaste team-opbouw. Inventariseer eerst met mij ALLE positieve veranderingen die ik heb gemerkt (slaap, energie, vel, stemming, alles), claim-vrij geformuleerd, en sluit af met dankbaarheid en mijn codewoord.",
      plaatsUitleg:
        "Met een echte eigen foto (de Mentor gaf je de beeld-tip). Blijf vandaag in de buurt: deze post gaat lopen.",
      metCodewoord: true,
      metUplineCheck: true,
      metVangnet: true,
    }),
    lanceerDag({
      nummer: startDag + 4,
      fase,
      prefix,
      key: `${smaak}-5`,
      titel: "📬 Lanceerdag 5: de oogst-dag",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag geen nieuwe post. Vandaag oogst je wat gisteren losmaakte, en dat is meer dan je denkt.

Naar iederéén die reageerde of likete gaat een berichtje: wie vroeg wat je hebt gedaan krijgt info plus een filmpje, wie warm reageerde krijgt je ik-help-nu-anderen-berichtje, wie alleen likete krijgt hetzelfde, en wie het codewoord typte heeft voorrang: die krijgt meteen wat je beloofde. Elke warme naam gaat je namenlijst in, en voor de warmste plan je vandaag de volgende stap: een 3-weg met je sponsor of een Mini-ELEVA-uitnodiging.`,
      waarom: {
        tekst: "Meet echte gesprekken, geen likes. Eén warm gesprek is meer waard dan honderd views.",
        bron: "ELEVA Academy, Social Media-training",
      },
      prefill: "",
      eigenTaken: [
        {
          id: `${prefix}${startDag + 4}-dm-ronde`,
          label: "Stuur iedereen die reageerde of likete een DM (3-soorten-aanpak)",
          uitleg:
            "Info-vragers: info + filmpje. Warme reageerders en likers: je helpen-berichtje. Codewoord-reageerders: meteen je beloofde linkje. De Mentor schrijft elke DM die net even anders ligt.",
          verplicht: true,
          actieRoute: mentorPost(
            "Het is mijn oogst-dag na mijn resultaten-post. Help me met mijn DM-ronde: ik vertel per persoon hoe die reageerde, en jij schrijft het berichtje in mijn stem.",
          ),
          actieRouteLabel: "DM's maken met de Mentor →",
        },
        {
          id: `${prefix}${startDag + 4}-namen`,
          label: "Zet alle warme reageerders in je namenlijst",
          verplicht: true,
          actieRoute: "/namenlijst",
          actieRouteLabel: "Open je namenlijst →",
        },
        {
          id: `${prefix}${startDag + 4}-drieweg`,
          label: "Plan voor je warmste naam een 3-weg (of stuur een Mini-ELEVA-uitnodiging)",
          uitleg:
            "Jij verbindt, je sponsor praat mee. Of Mini-ELEVA neemt je prospect bij de hand. Inschrijven doe je in deze fase nooit alleen.",
          verplicht: true,
          inlineEmbed: "sponsor-melding",
        },
        {
          id: `${prefix}${startDag + 4}-stories`,
          label: "3 stories (je ritme loopt gewoon door)",
          verplicht: false,
        },
      ],
    }),
    lanceerDag({
      nummer: startDag + 5,
      fase,
      prefix,
      key: `${smaak}-6`,
      titel: "🔍 Lanceerdag 6: één verandering uitgelicht",
      faseDoel: FASE_DOEL,
      watJeLeert: vervolg
        ? `Je resultaten-post noemde alles; vandaag pak je er één verandering uit en maak je 'm groot. Kies er een die in je pre-post-reeks nog níet voorbijkwam, zodat ook je trouwste volgers iets nieuws lezen.

Eén scène, zintuiglijk verteld: waar was je, wat deed je, wat viel je op. Kleine verhalen als deze zijn wat mensen onthouden en doorvertellen.`
        : `Je resultaten-post noemde alles; vandaag pak je er één verandering uit en maak je 'm groot. De sterkste, of de meest verrassende.

Eén scène, zintuiglijk verteld: waar was je, wat deed je, wat viel je op. De trap op zonder te puffen. Om 15:00 nog gewoon zin hebben. Kleine verhalen als deze zijn wat mensen onthouden en doorvertellen.`,
      waarom: {
        tekst: "Details overtuigen. Niemand herkent zich in 'meer energie', iedereen herkent zich in de trap op zonder puffen.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        (vervolg
          ? "Lanceerdag 6 van mijn resultaten-reeks: licht één verandering uit in een scène-post, met een ándere invalshoek dan wat in mijn pre-post-reeks al voorbijkwam."
          : "Lanceerdag 6 van mijn resultaten-lancering: licht één verandering uit mijn resultaten-post uit in een scène-post.") +
        " Vraag me eerst welke verandering het meest verraste en laat me de scène beschrijven (waar, wat, wat viel op)." +
        hervertelNoot,
    }),
    lanceerDag({
      nummer: startDag + 6,
      fase,
      prefix,
      key: `${smaak}-7`,
      titel: "🧪 Lanceerdag 7: de check-post",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag geef je je publiek iets: je korte check. Drie minuten invullen, en iemand ziet hoe die er zelf voor staat. Voor jou is elke ingevulde check een warm signaal mét context: je ziet precies waar het bij iemand zit.

De post maakt nieuwsgierig naar de check, met je codewoord als deurtje. De Mentor kent jouw check-linkjes en je eigen ervaring ermee, dus deze post schrijft bijna zichzelf 🥰`,
      waarom: {
        tekst: "Een freebie geeft eerst, en vraagt pas daarna. Precies de volgorde waarin vertrouwen groeit.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        "Lanceerdag 7 van mijn resultaten-reeks: schrijf mijn check-post. Maak mensen nieuwsgierig naar mijn korte check (freebie), met codewoord-oproep. Vraag me eerst welke check het beste bij mijn mensen past." +
        hervertelNoot,
      metCodewoord: true,
    }),
    lanceerDag({
      nummer: startDag + 7,
      fase,
      prefix,
      key: `${smaak}-8`,
      titel: "💛 Lanceerdag 8: anderen helpen",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag zet je de stap die jullie team al jaren maakt na een goede resultaten-post: je vertelt dat je hebt besloten anderen hiermee te helpen. En dat past nu, want je hebt het zelf ervaren.

Geen verkooppraatje. Gewoon: dit bracht mij zoveel dat ik het anderen gun, en wie het voor zichzelf of iemand anders wil weten mag me altijd een berichtje sturen. Deze post geeft de stille meelezers (en dat zijn er altijd meer dan je denkt) de toestemming om eindelijk iets te zeggen.`,
      waarom: {
        tekst: "Ik ben hier zo blij mee dat ik heb besloten anderen er ook mee te helpen. Die zin werkt omdat 'ie waar is.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        "Lanceerdag 8 van mijn resultaten-reeks: schrijf mijn anderen-helpen-post. Ik heb dit zelf ervaren en heb besloten anderen ermee te helpen; open uitnodiging om een berichtje te sturen, geen pitch." +
        hervertelNoot,
      metVangnet: true,
    }),
    lanceerDag({
      nummer: startDag + 8,
      fase,
      prefix,
      key: `${smaak}-9`,
      titel: "🏡 Lanceerdag 9: de opportunity-brug",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag vertel je voor het eerst dat dit meer werd dan een leefstijl-project: je bouwt er ook iets mee op. Rustig aan, naast je werk, in je eigen tempo.

De spelregels ken je: geen bedragen, geen beloftes. Wel je eerlijke waarom: wat hoop je dat dit je gezin, je tijd, je vrijheid gaat brengen? Deze post is het bruggetje naar de business-dagen die hierna komen, en hij vangt precies de mensen die stiekem al dachten: zou dit ook iets voor mij zijn?`,
      waarom: {
        tekst: "Laat vooral zien welke leefstijl je ermee bouwt: jouw why, jouw doelen, jouw dromen. Dat is wat mag én wat werkt.",
        bron: "ELEVA claim-vrije lijn",
      },
      prefill:
        "Lanceerdag 9 van mijn resultaten-reeks: schrijf mijn opportunity-brug-post. Dit werd meer dan een leefstijl-project: ik bouw er rustig iets mee op naast mijn werk, in mijn eigen tempo. Claim-compliant (geen bedragen, geen beloftes), met mijn eerlijke waarom. Interview me daar kort over." +
        hervertelNoot,
      metVangnet: true,
    }),
    lanceerDag({
      nummer: startDag + 9,
      fase,
      prefix,
      key: `${smaak}-10`,
      titel: "🚪 Lanceerdag 10: de open-deur-finale",
      faseDoel: FASE_DOEL,
      watJeLeert: `De laatste post van je reeks is een feestje: je bedankt iedereen die meeleefde, je viert wat deze weken je brachten, en je zet de deur wagenwijd open. Wie er ooit meer over wil weten, voor zichzelf of voor iemand anders, weet je te vinden.

En daarna: de grote opvolgronde. Alle open gesprekken bijwerken, elke codewoord-reageerder gehad, elke warme naam in je lijst met een volgende stap. Je lancering zit erop; wat blijft is je ritme, en een namenlijst vol mensen die naar jóu toe kwamen. Trots mag. Dit hebben de meeste mensen in dit vak nog nooit zo gedaan 💟`,
      waarom: {
        tekst: "Kwetsbaarheid is geen zwakte in dit vak. Het is de reden dat mensen jóu kiezen.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        "Lanceerdag 10, de finale van mijn resultaten-reeks: schrijf mijn open-deur-post. Een feestelijk bedankje aan iedereen die meeleefde, wat deze weken me brachten, en een wagenwijd open deur voor wie er ooit meer over wil weten." +
        hervertelNoot,
      metCodewoord: true,
      metVangnet: true,
    }),
  ];
}

// ============================================================
// BEWEZEN-OPPORTUNITY (route A, dag 31-32): twee nieuwe posts
// die de business-boog een tweede lading geven, nu mét eigen
// resultaat. Dag 33-34 zijn de 3-weg-skills uit V9 (inschrijven).
// ============================================================

function bewezenOpportunity(startDag: number, prefix: string, fase: 1 | 2 | 3 | 4): Dag[] {
  const FASE_DOEL =
    "De business-boog, tweede ronde: nu met eigen ervaring als bewijs. Bouwers vinden en je eerste inschrijvingen samen doen.";
  return [
    lanceerDag({
      nummer: startDag,
      fase,
      prefix,
      key: "bewezen-1",
      titel: "🏡 Business-post: nu met eigen verhaal",
      faseDoel: FASE_DOEL,
      watJeLeert: `Drie weken geleden vertelde je dat je hiernaast iets ging opbouwen. Toen was het een voornemen; nu heb je er zelf iets bij te vertellen. Vandaag deel je hoe het bouwen jóu tot nu toe verraste: wat het je bracht aan mensen, gesprekken en zin.

Zelfde spelregels als altijd: geen bedragen, geen beloftes, wel jouw echte verhaal. Wie eerder je pioniers-post zag maar nog twijfelde, krijgt vandaag het bewijs dat het echt is.`,
      waarom: {
        tekst: "Je zoekt niemand over te halen. Je zoekt wie al op zoek is.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        "Schrijf mijn tweede business-post: drie weken geleden vertelde ik dat ik hiernaast iets ging opbouwen, en nu deel ik wat het bouwen me tot nu toe echt bracht (mensen, gesprekken, zin). Claim-compliant, geen bedragen of beloftes. Verwijs terug naar mijn eerdere business-post en herhaal niets letterlijk.",
      metVangnet: true,
    }),
    lanceerDag({
      nummer: startDag + 1,
      fase,
      prefix,
      key: "bewezen-2",
      titel: "🌅 Zo ziet mijn dag eruit (+ codewoord voor bouwers)",
      faseDoel: FASE_DOEL,
      watJeLeert: `Vandaag laat je gewoon een dag zien. Hoe je dit werk tussen je leven vlecht: het kwartier bij je koffie, de berichtjes tussendoor, de wandeling waarin je een voice-memo terugstuurt. Echt en onopgesmukt.

De post eindigt met een codewoord voor iedereen die weleens wil zien hoe dit er van binnen uitziet. Wie reageert krijgt van jou een berichtje, en samen met je sponsor (of via Mini-ELEVA) pak je door. Dit is de dag waarop bouwers zich melden.`,
      waarom: {
        tekst: "Mensen stappen niet in een bedrijf, ze stappen in een leven dat ze zichzelf ook gunnen.",
        bron: "Eigen principe Team Be The Change",
      },
      prefill:
        "Schrijf mijn zo-ziet-mijn-dag-eruit-post: hoe ik dit werk tussen mijn gewone leven vlecht, echt en onopgesmukt, met een codewoord-oproep voor wie weleens wil zien hoe dit er van binnen uitziet. Vraag me eerst hoe mijn dag er echt uitziet.",
      metCodewoord: true,
      metVangnet: true,
    }),
  ];
}

// ============================================================
// ROUTE A · ±40 dagen · nog geen eigen resultaat
// ============================================================

export const LANCEER_ROUTE_A: Dag[] = [
  // Start (1-2)
  startDag(1, 1, "a"),
  kennismakingsDag(PA, 2, 1),
  // 6-daagse pre-post-lancering (3-8)
  ...zesDaagsePrePost(3, PA, 1),
  // Oogst & opvolgen (9-13)
  uitV10(7, 9, 2), // de oogst: warme namenlijst + 3-weg/Mini-ELEVA plannen
  uitV9(10, 10, 2), // FORM-verdieping, nu de eerste DM-gesprekken lopen
  uitV9(5, 11, 2), // Bezwaren, 3-weg en Mini-ELEVA: leren doorspelen
  uitV9(3, 12, 2), // Productkennis-licht (de eerste productvragen komen binnen)
  uitV9(7, 13, 2), // Verdienmodel + Builder-pad, vóór de business-boog
  // Opportunity, pioniers-versie (14-17) = de V10-business-boog
  uitV10(9, 14, 2),
  uitV10(10, 15, 2),
  uitV10(11, 16, 2),
  uitV10(12, 17, 2),
  // Skills & ritme (18-21), met updates over je eigen 21 dagen
  uitV9(4, 18, 3), // Drie verhalen + jouw stem + edification
  uitV9(6, 19, 3), // Social media basis + je eerste freebie
  uitV9(12, 20, 3), // Stories, reels en je freebie via social
  uitV9(13, 21, 3), // Niche-aanscherping (nu mét reactie-data)
  // 10-daagse resultaten-reeks, VERVOLG-smaak (22-31)
  ...tienDaagseResultaten(22, PA, 3, "vervolg"),
  // Opportunity, bewezen-versie + zelf leren inschrijven (32-35)
  ...bewezenOpportunity(32, PA, 4),
  uitV9(8, 34, 4), // 3-weg-meesterclass: de 5 stappen
  uitV9(9, 35, 4), // Je volgende 3-weg, in praktijk
  // Top-20 + meesterschap + afronding (36-44): alle V9-verdieping
  uitV9(2, 36, 4), // De top-20, nú verdiend
  uitV9(11, 37, 4), // 5 typen prospects + funnel als ritme (5 namen/week)
  uitV9(15, 38, 4), // Klantcontact + opvolg-routine
  uitV9(14, 39, 4), // Members en netwerkers herkennen + ideale klant
  uitV9(16, 40, 4), // Tweede 3-weg, met meer eigen leiding
  uitV9(17, 41, 4), // Edification-verdieping
  uitV9(19, 42, 4), // Pipeline-check + de moedige vraag
  uitV9(20, 43, 4), // Builder-status-check + duplicatie
  uitV9(21, 44, 4), // Eindreflectie, talent en je doel voor maand 2
];

// ============================================================
// ROUTE B · ±30 dagen · wél eigen resultaat
// ============================================================

export const LANCEER_ROUTE_B: Dag[] = [
  // Start (1-2)
  startDag(1, 1, "b"),
  kennismakingsDag(PB, 2, 1),
  // 10-daagse resultaten-lancering, VERSE smaak (3-12)
  ...tienDaagseResultaten(3, PB, 1, "vers"),
  // Oogst & opvolgen (13-17)
  uitV10(7, 13, 2), // de grote oogst
  uitV9(10, 14, 2), // FORM-verdieping
  uitV9(5, 15, 2), // Bezwaren, 3-weg en Mini-ELEVA: leren doorspelen
  uitV9(3, 16, 2), // Productkennis-licht
  uitV9(7, 17, 2), // Verdienmodel + Builder-pad, vóór de business-boog
  // Opportunity (18-21) = de V10-business-boog
  uitV10(9, 18, 3),
  uitV10(10, 19, 3),
  uitV10(11, 20, 3),
  uitV10(12, 21, 3),
  // Skills & gesprekken (22-27)
  uitV9(8, 22, 3), // 3-weg-meesterclass
  uitV9(9, 23, 3), // Je volgende 3-weg, in praktijk
  uitV9(4, 24, 3), // Drie verhalen + jouw stem + edification
  uitV9(6, 25, 3), // Social media basis + je eerste freebie
  uitV9(12, 26, 3), // Stories, reels en je freebie via social
  uitV9(13, 27, 3), // Niche-aanscherping
  // Top-20 + meesterschap + afronding (28-36): alle V9-verdieping
  uitV9(2, 28, 4), // De top-20, nú verdiend
  uitV9(11, 29, 4), // 5 typen prospects + funnel als ritme (5 namen/week)
  uitV9(15, 30, 4), // Klantcontact + opvolg-routine
  uitV9(14, 31, 4), // Members en netwerkers herkennen + ideale klant
  uitV9(16, 32, 4), // Tweede 3-weg, met meer eigen leiding
  uitV9(17, 33, 4), // Edification-verdieping
  uitV9(19, 34, 4), // Pipeline-check + de moedige vraag
  uitV9(20, 35, 4), // Builder-status-check + duplicatie
  uitV9(21, 36, 4), // Eindreflectie, talent en je doel voor maand 2
];

// ============================================================
// FASE-GROEPEN voor de preview-weergave (los van Dag.fase, die
// grover is en door de bestaande V9-UI wordt gebruikt).
// ============================================================

export type LanceerFaseGroep = {
  emoji: string;
  titel: string;
  dagen: [number, number];
  detail: string;
};

export const ROUTE_A_FASEN: LanceerFaseGroep[] = [
  { emoji: "🌱", titel: "Start", dagen: [1, 2], detail: "Welkom, producten, opstart-call met je sponsor en de Mentor leert je kennen" },
  { emoji: "🚀", titel: "6-daagse pre-post-lancering", dagen: [3, 8], detail: "Elke dag één post, de klassieke pre-post is dag 5 van je reis" },
  { emoji: "📬", titel: "Oogst & opvolgen", dagen: [9, 13], detail: "DM's, FORM, 3-weg en Mini-ELEVA leren doorspelen, productkennis, verdienmodel" },
  { emoji: "🏡", titel: "Opportunity (pionier)", dagen: [14, 17], detail: "Stap vanaf het begin met me in" },
  { emoji: "🛠️", titel: "Skills & ritme", dagen: [18, 21], detail: "Stem, social, reels en je niche, met updates over je eigen 21 dagen" },
  { emoji: "✨", titel: "Resultaten-reeks (vervolg)", dagen: [22, 31], detail: "De finale: hervertellen, terugverwijzen, oogsten" },
  { emoji: "🏡", titel: "Opportunity (bewezen) + inschrijven leren", dagen: [32, 35], detail: "Business-boog met eigen bewijs, 3-weg-meesterclass en je eerste 3-weg" },
  { emoji: "👑", titel: "Top-20 & meesterschap", dagen: [36, 44], detail: "De verdiende namenlijst, funnel-ritme, tweede 3-weg, pipeline-check en eindreflectie" },
];

export const ROUTE_B_FASEN: LanceerFaseGroep[] = [
  { emoji: "🌱", titel: "Start", dagen: [1, 2], detail: "Welkom, opstart-call met je sponsor en de Mentor leert je kennen" },
  { emoji: "✨", titel: "10-daagse resultaten-lancering", dagen: [3, 12], detail: "De grote lancering, meteen: de klassieke 21-dagen-post is dag 6 van je reis" },
  { emoji: "📬", titel: "Oogst & opvolgen", dagen: [13, 17], detail: "DM's, FORM, 3-weg en Mini-ELEVA leren doorspelen, productkennis, verdienmodel" },
  { emoji: "🏡", titel: "Opportunity", dagen: [18, 21], detail: "De business-boog: bouwers vinden" },
  { emoji: "🛠️", titel: "Skills & gesprekken", dagen: [22, 27], detail: "3-weg-meesterclass en je eerste 3-weg, stem, social en je niche" },
  { emoji: "👑", titel: "Top-20 & meesterschap", dagen: [28, 36], detail: "De verdiende namenlijst, funnel-ritme, tweede 3-weg, pipeline-check en eindreflectie" },
];

export type LanceerRoute = "a" | "b";

export function routeDagen(route: LanceerRoute): Dag[] {
  return route === "a" ? LANCEER_ROUTE_A : LANCEER_ROUTE_B;
}

export function routeFasen(route: LanceerRoute): LanceerFaseGroep[] {
  return route === "a" ? ROUTE_A_FASEN : ROUTE_B_FASEN;
}

export function vindLanceerDag(route: LanceerRoute, nummer: number): Dag | undefined {
  return routeDagen(route).find((d) => d.nummer === nummer);
}

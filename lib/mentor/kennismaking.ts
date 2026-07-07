// ============================================================
// Kennismakings-rondes: de Mentor leert het teamlid écht kennen.
//
// Zes thema-rondes, elk een paar minuten, gestart vanaf de
// profielpagina (Instellingen → Wat de Mentor over je weet) via
// /coach?prefill=...&submit=1. De Mentor stelt de vragen ÉÉN
// voor één en slaat elk antwoord op via het bestaande
// [PROFIEL]-mechanisme. Ronde 2 eindigt met de stem-check: één
// alinea terug in de stem van het lid, "klinkt dit als jij?".
//
// Waarom dit bestaat (Raoul, 7 juli 2026): iedereen kan ChatGPT
// een DNA-profiel voeren, maar het blijft AI-voelen. Ons verschil
// is een Mentor die het lid kent op de punten die ONZE business
// nodig heeft (verhaal, stem, mensen, social-durf, producten-
// ervaring, ritme) en die kennis stil toepast. Vragen zijn per
// ronde teruggeredeneerd vanuit de taken: pre-post, 21-dagen-post,
// reels, DM's, freebie-keuze, top-20 en opvolging.
// ============================================================

import type { MentorProfiel } from "@/lib/mentor-profiel/types";

export type KennismakingsRonde = {
  nummer: number;
  emoji: string;
  titel: string;
  /** Voor de profielpagina: wat levert deze ronde het lid op. */
  belofte: string;
  /** Voor de prompt: waarom de Mentor dit wil weten (intern). */
  waarom: string;
  vragen: string[];
  /** Welke [PROFIEL]-velden deze ronde mag vullen (prompt-instructie). */
  profielVelden: string;
  /** Extra ronde-specifieke prompt-instructies. */
  speciaal?: string;
};

export const KENNISMAKINGS_RONDES: KennismakingsRonde[] = [
  {
    nummer: 1,
    emoji: "🌱",
    titel: "Jouw verhaal",
    belofte: "Daarna schrijft de Mentor met jóuw verhaal, niet met een algemeen verhaal.",
    waarom:
      "Dit is het ruwe materiaal voor de pre-post en de 21-dagen-post: de druppel, wat al geprobeerd was, één concrete scène, en het echte waarom. Zonder dit schrijft elke AI een inwisselbaar verhaal.",
    vragen: [
      "Vertel eens in een paar zinnen wie je bent en hoe je gewone dag eruitziet. Werk, gezin, wat je dag vult.",
      "Wat was voor jou de druppel om hieraan te beginnen? Het moment dat je dacht: zo wil ik het niet langer.",
      "Wat had je allemaal al geprobeerd voordat dit op je pad kwam? En waarom hield dat geen stand?",
      "Beschrijf één concreet moment waarop je zelf iets merkte. Niet in het algemeen, maar een scène: waar was je, wat deed je, wat viel je op?",
      "Waarom doe je dit écht? Wat moet er over een jaar anders zijn in je leven?",
    ],
    profielVelden:
      '"situatie" (vraag 1), "drieVerhalen": { "persoonlijk": "druppel + waarom, in hun eigen woorden" } (vraag 2 en 5), "historieNotitie" (korte samenvatting van waar diegene nu staat). Vangt een antwoord een typische eigen zin, sla die dan ook op in "stemVoorbeelden".',
  },
  {
    nummer: 2,
    emoji: "🗣️",
    titel: "Jouw stem",
    belofte: "Daarna klinken teksten van de Mentor als jij, niet als een robot.",
    waarom:
      "Het grootste risico van AI-hulp is dat het hele team hetzelfde gaat klinken. Eigen tekst-fragmenten, praattaal en nooit-woorden zijn de vaccinatie daartegen.",
    vragen: [
      "Plak hier een stuk tekst dat je ooit zélf schreef. Een post, een lang appje, een mailtje, maakt niet uit. Belangrijk: alleen echt eigen tekst, niets uit ChatGPT of een andere AI.",
      "Welke uitdrukkingen zeg je in het echt zó vaak dat vrienden zouden zeggen: typisch jij?",
      "Welke woorden of soort zinnen zou je nóóit gebruiken? Denk aan: te zweverig, te verkoperig, te formeel.",
      "Hoe schrijf je op social media: veel of weinig emoji's, korte of lange stukken, spreektaal of netjes?",
    ],
    profielVelden:
      '"eigenPosts": ["het geplakte fragment, letterlijk"] (vraag 1), "praattaal": ["uitdrukking", ...] (vraag 2), "nooitWoorden": ["...", ...] (vraag 3), "schrijfVoorkeuren" (vraag 4).',
    speciaal:
      'DE STEM-CHECK (het beloningsmoment van deze ronde): direct nadat het eigen tekst-fragment is geplakt reageer je kort en menselijk, en schrijf je daarna één korte alinea (3 à 4 zinnen) over een gewoon onderwerp uit hun leven, in precies de stem van dat fragment. Vraag dan: "Klinkt dit als jij?" Hun antwoord gebruik je om bij te stellen, en een rake correctie sla je op als "nooitWoorden" of "praattaal". Ruikt het geplakte fragment naar AI (gladde opsommingen, em-dashes, "Het is belangrijk om...")? Vraag dan vriendelijk of dit echt eigen tekst is; leg in één zin uit dat alleen echte eigen tekst helpt om als henzelf te klinken.',
  },
  {
    nummer: 3,
    emoji: "👥",
    titel: "Jouw mensen",
    belofte: "Daarna kiest de Mentor de invalshoek en de check die bij jóuw mensen past.",
    waarom:
      "Niche, ideale klant en de bovenste namen van de lijst bepalen de invalshoek per post, welke freebie de Mentor voorstelt, en hoe hij helpt bij uitnodigen en opvolgen.",
    vragen: [
      "Als je aan één persoon denkt die je dit écht gunt, wie is dat? Leeftijd, situatie, waar zit die persoon mee?",
      "Waar lopen de mensen om jou heen het meest op vast? Energie, drukke hoofden, de ochtenden, er nooit aan toekomen?",
      "Waarover krijg jij nu al vragen of complimenten uit je omgeving? Dat is vaak je natuurlijke niche, zonder dat je het doorhad.",
      "Denk aan de bovenste drie mensen van je namenlijst: wat weet je van hun gezin, werk, hobby's en situatie?",
    ],
    profielVelden:
      '"idealeKlant" (vraag 1), "nicheZaadje" (vraag 2 en 3), "formContexts": [{ "contactNaam": "...", "family": "...", "occupation": "...", "recreation": "...", "money": "..." }] (vraag 4, alleen de delen die genoemd worden).',
  },
  {
    nummer: 4,
    emoji: "📱",
    titel: "Jij en social media",
    belofte: "Daarna weet de Mentor of hij alles kant-en-klaar aanlevert of met je spart op niveau.",
    waarom:
      "Dit bepaalt welke van de twee wegen bij iemand past: de nooit-gepost-groep krijgt alles copy-paste-klaar met moed-steun, de kenners krijgen sparring op niveau. En de grenzen bewaakt de Mentor daarna in élk advies.",
    vragen: [
      "Op welke platforms zit je, en ben je daar vooral kijker of plaats je zelf ook weleens iets?",
      "Heb je ooit iets persoonlijks gepost? Hoe voelde dat, en wat gebeurde er?",
      "Wat vind je het spannendst aan posten over dit onderwerp? Je gezicht op video, reacties van bekenden, niet weten wat je moet zeggen?",
      "Wat wil je pertinent níet? Bijvoorbeeld: gezicht op camera, je kinderen in beeld, bepaalde privézaken.",
      "Hoeveel mensen volgen je ongeveer, en ken je ze echt of zijn het vooral vage connecties?",
    ],
    profielVelden:
      '"socialSituatie" (vraag 1, 2, 3 en 5 samengevat: platforms, kijker/plaatser, durf-niveau, bereik), "grenzen": ["...", ...] (vraag 4, letterlijk en serieus). Blijkt een duidelijk talent (schrijver/spreker/filmer/DM-er), sla dat op als "talent".',
  },
  {
    nummer: 5,
    emoji: "🌿",
    titel: "Jouw producten-ervaring",
    belofte: "Daarna schrijft de Mentor vanuit wat jij écht meemaakte, en bewaakt hij de regels.",
    waarom:
      "De producten maakten het verschil en dat mag in posts niet wegvallen (product-brug). Deze ronde geeft eerlijk, doorleefd materiaal; de Mentor vertaalt het later stil naar claim-vrije posts. In dit gesprek zelf mag alles gezegd worden, het is privé.",
    vragen: [
      "Wat neem of gebruik je zelf elke dag? Hoe ziet jouw ochtendroutine er precies uit?",
      "Wat is je eigen favoriet, en waarom juist die?",
      "Is er een moment geweest dat je het een tijdje vergat of ermee stopte? Wat merkte je toen? Alleen wat écht gebeurd is.",
      "Welke check denk je dat het beste past bij de mensen om jou heen?",
    ],
    profielVelden:
      '"eigenProducten": ["...", ...] (vraag 1 en 2), "drieVerhalen": { "product": "wat diegene zelf merkte, in eigen woorden" } (vraag 2 en 3).',
  },
  {
    nummer: 6,
    emoji: "⏰",
    titel: "Jouw ritme en je eerste feestje",
    belofte: "Daarna doseert de Mentor zijn advies op jouw tijd, en weet hij wat we gaan vieren.",
    waarom:
      "Iemand met 20 minuten per dag krijgt ander advies dan iemand met 2 uur. En een concreet eerste doel geeft de Mentor iets om naartoe te werken en straks te vieren.",
    vragen: [
      "Hoeveel tijd heb je hier per dag echt voor, en op welk moment van de dag werk je het liefst?",
      "Wat zou over 90 dagen een feestje waard zijn? Zo concreet mogelijk: je eerste drie shoppers, je eerste inschrijving, tien goede gesprekken.",
      "Wat geeft jou energie in dit werk, en waar zie je tegenop?",
    ],
    profielVelden:
      '"ritme" (vraag 1), "eersteFeestje" (vraag 2), "historieNotitie" (vraag 3 kort verwerkt: wat energie geeft en wat spannend is). Past een passie of talent erbij, vul "passies" of "talent" aan.',
  },
];

/** Prefill-tekst die een ronde start (moet matchen met detectie hieronder). */
export function kennismakingPrefill(ronde: KennismakingsRonde): string {
  return `Start kennismaking ronde ${ronde.nummer}: ${ronde.titel.toLowerCase()}`;
}

/**
 * Detecteert of dit gesprek een kennismakings-ronde is. Kijk over ALLE
 * user-tekst (zelfde principe als isPostVerzoek): de start-zin valt in het
 * eerste bericht, de beurten daarna zijn antwoorden. Bij meerdere rondes in
 * één gesprek wint de laatst gestarte.
 */
export function detecteerKennismakingsRonde(alleUserTekst: string): number | null {
  const re = /start kennismaking ronde\s*([1-6])/gi;
  let laatste: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(String(alleUserTekst))) !== null) {
    laatste = Number(m[1]);
  }
  return laatste;
}

/**
 * Dedicated systeemprompt voor een kennismakings-ronde. Vervangt de brede
 * coach-prompt volledig (zelfde patroon als de post-schrijver): één rol,
 * één werkwijze, geen kennisbank-ballast.
 */
export function bouwKennismakingPrompt(opties: {
  voornaam: string;
  taal: string;
  rondeNummer: number;
  mentorProfiel: MentorProfiel | null | undefined;
}): string {
  const { voornaam, taal, rondeNummer } = opties;
  const p = opties.mentorProfiel || {};
  const ronde =
    KENNISMAKINGS_RONDES.find((r) => r.nummer === rondeNummer) ??
    KENNISMAKINGS_RONDES[0];

  const taalNaam: Record<string, string> = {
    nl: "Nederlands",
    en: "Engels",
    fr: "Frans",
    es: "Spaans",
    de: "Duits",
    pt: "Portugees",
  };

  // Compact wat al bekend is, zodat de Mentor niets dubbel vraagt.
  const bekend: string[] = [];
  if (p.situatie) bekend.push(`Situatie: ${p.situatie}`);
  if (p.nicheZaadje) bekend.push(`Niche: ${p.nicheZaadje}`);
  if (p.idealeKlant) bekend.push(`Ideale klant: ${p.idealeKlant}`);
  if (p.eigenProducten?.length)
    bekend.push(`Eigen producten: ${p.eigenProducten.join(", ")}`);
  if (p.socialSituatie) bekend.push(`Social: ${p.socialSituatie}`);
  if (p.grenzen?.length) bekend.push(`Grenzen: ${p.grenzen.join("; ")}`);
  if (p.ritme) bekend.push(`Ritme: ${p.ritme}`);
  if (p.eersteFeestje) bekend.push(`Eerste feestje: ${p.eersteFeestje}`);
  if (p.historieNotitie) bekend.push(`Waar diegene staat: ${p.historieNotitie}`);

  return [
    `Je bent de ELEVA Mentor en je leert ${voornaam} vandaag écht kennen. Dit is kennismakings-ronde ${ronde.nummer} van 6: ${ronde.emoji} ${ronde.titel}.`,
    `Waarom deze ronde bestaat (intern, nooit uitleggen als lesje): ${ronde.waarom}`,
    "",
    "WERKWIJZE (strikt):",
    "- Stel de vragen ÉÉN voor één, nooit twee tegelijk. Wacht op het antwoord.",
    "- Reageer op elk antwoord eerst kort en menselijk (1 of 2 zinnen, warm en specifiek op wat er gezegd is; geen analyse, geen tips, geen lesje), en stel dan pas de volgende vraag.",
    "- De vragen hieronder zijn je leidraad. Je mag ze in je eigen woorden stellen, maar de kern blijft gelijk. Is een vraag al beantwoord door een eerder antwoord of door wat je al weet, sla 'm dan over.",
    `- ${voornaam} mag altijd een vraag overslaan of stoppen: "helemaal prima" en door (of warm afronden). Nooit aandringen, nooit doorvragen op iets waar iemand niet over wil praten.`,
    `- Dit gesprek is PRIVÉ. Alles mag hier gezegd worden, ook medische woorden of productnamen; regels voor publieke teksten gelden hier niet en daar begin je dus ook niet over.`,
    "- EERSTE BEURT: verwelkom in één warme zin, zeg in één zin wat deze ronde oplevert, en stel meteen vraag 1. Geen lange intro.",
    "",
    `DE VRAGEN VAN RONDE ${ronde.nummer}:`,
    ...ronde.vragen.map((v, i) => `${i + 1}. ${v}`),
    "",
    ...(ronde.speciaal ? [ronde.speciaal, ""] : []),
    "OPSLAAN (dit is waar deze ronde om draait):",
    `Sluit elke beurt waarin ${voornaam} iets vertelde af met een [PROFIEL]-blok dat de nieuwe informatie opslaat. Formaat, helemaal aan het eind van je antwoord:`,
    "[PROFIEL]",
    "{ ...alleen de velden die dit antwoord vult... }",
    "[/PROFIEL]",
    `Velden voor deze ronde: ${ronde.profielVelden}`,
    "Sla op in de EIGEN WOORDEN van " +
      voornaam +
      ", niet in jouw samenvatting-taal. Het blok is onzichtbaar; noem het nooit en vraag er geen toestemming voor.",
    "",
    "AFRONDEN:",
    `Na de laatste vraag: bedank warm en noem één concreet ding dat je nu over ${voornaam} weet. Zeg in één zin wat je hiermee kunt (bijvoorbeeld: "als je straks een post wil, schrijf ik 'm in jouw stem"). Wijs op de profielpagina (Instellingen → Wat de Mentor over je weet) waar de volgende ronde klaarstaat voor wanneer ${voornaam} wil. Begin NOOIT zelf aan een volgende ronde. Sluit je afrond-beurt af met:`,
    "[PROFIEL]",
    `{ "rondeKlaar": ${ronde.nummer} }`,
    "[/PROFIEL]",
    `(Combineer gerust met de laatste opslag-velden in één blok.)`,
    "",
    ...(bekend.length > 0
      ? [
          `=== WAT JE AL WEET OVER ${voornaam.toUpperCase()} (niet opnieuw vragen) ===`,
          ...bekend,
          "",
        ]
      : []),
    `Schrijf alles in het ${taalNaam[taal] || "Nederlands"}. Warm, kort, menselijk; nooit als formulier of intake.`,
  ].join("\n");
}

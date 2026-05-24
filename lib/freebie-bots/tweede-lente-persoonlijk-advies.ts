// File: lib/freebie-bots/tweede-lente-persoonlijk-advies.ts
//
// Personalisatie-laag voor de Tweede Lente spiegel. De bot heeft 7
// multi-choice vragen, elk antwoord taggt een set thema's (slaap,
// stress, energie, hormonen, botten, hersenen, etc.). Dit bestand
// bevat de bibliotheek van ankers + nutriënten + basis-tips, elk met
// tags. De functie selecteerAdvies(antwoorden) filtert + rankt + kiest.
//
// Doel: dat twee vrouwen met andere antwoorden ook echt ANDER advies
// krijgen. Niet één-size-fits-all hardcoded blok.
//
// Alle teksten zijn claim-vrij (EFSA + ACM-compliant). Nutriënt-claims
// zijn EFSA-goedgekeurde health-claims (Verordening EU 1924/2006).

import type { TweedeLenteAntwoorden } from "./types";

// ============================================================
// THEMA-TAGS
// ============================================================
//
// Elke kaart heeft 1-3 thema-tags. Antwoorden mappen ook op deze tags.
// Bij selectie tellen we hoe vaak elke kaart matcht met de antwoord-tags,
// en kiezen we de top-N.

export type Thema =
  | "slaap"
  | "stress"
  | "energie"
  | "stemming"
  | "warmte"
  | "hormonen"
  | "cyclus"
  | "lichaam"
  | "botten"
  | "spieren"
  | "hersenen"
  | "spijsvertering"
  | "immuun"
  | "verbinding"; // sociaal

// ============================================================
// THEMA-MAPPING VANUIT ANTWOORDEN
// ============================================================

function themaTagsUitAntwoorden(a: TweedeLenteAntwoorden): Thema[] {
  const tags = new Set<Thema>();

  // Fase
  if (a.fase === "peri-overgang" || a.fase === "volle-overgang") {
    tags.add("hormonen");
    tags.add("warmte");
  }
  if (a.fase === "post-overgang") {
    tags.add("botten");
    tags.add("hormonen");
  }
  if (a.fase === "pre-overgang") {
    tags.add("hormonen");
    tags.add("energie");
  }

  // Wat valt op (1-3 keuzes)
  for (const w of a.watValtOp) {
    switch (w) {
      case "energie-patroon":
        tags.add("energie");
        tags.add("stress");
        break;
      case "slaapritme":
        tags.add("slaap");
        tags.add("stress");
        break;
      case "stemming":
        tags.add("stemming");
        tags.add("hersenen");
        break;
      case "warmte-golven":
        tags.add("warmte");
        tags.add("hormonen");
        break;
      case "cyclus-veranderingen":
        tags.add("cyclus");
        tags.add("hormonen");
        break;
      case "lichaamsbeleving":
        tags.add("lichaam");
        tags.add("spieren");
        tags.add("spijsvertering");
        break;
      case "mentaal-helder-zijn":
        tags.add("hersenen");
        tags.add("energie");
        break;
    }
  }

  // Eet-ritme
  if (a.eetRitme === "vaak-snel-tussendoor" || a.eetRitme === "wisselt-per-dag") {
    tags.add("spijsvertering");
    tags.add("energie");
  }

  // Beweging
  if (a.beweging === "weinig" || a.beweging === "wisselend") {
    tags.add("spieren");
    tags.add("botten");
  }

  // Rust
  if (a.rust === "hoofd-staat-aan" || a.rust === "draai-door") {
    tags.add("stress");
    tags.add("slaap");
  }

  // Deel-met
  if (a.deel === "met-niemand-echt") {
    tags.add("verbinding");
  }

  return Array.from(tags);
}

// ============================================================
// ANKER-BIBLIOTHEEK (gedrags-handvatten met waarom-uitleg)
// ============================================================

export type Anker = {
  id: string;
  titel: string;
  actie: string;
  waarom: string;
  themas: Thema[];
  prioriteit: number; // hoger = belangrijker bij gelijke match
  /** Emoji-icoon voor visuele herkenning. */
  icoon: string;
  /** Tailwind-kleur-suffix voor accenten (rose, amber, emerald, sky, violet). */
  kleur: "rose" | "amber" | "emerald" | "sky" | "violet" | "stone";
};

export const ANKER_BIBLIOTHEEK: Anker[] = [
  {
    id: "ochtend-rust",
    titel: "Ochtend-anker",
    actie:
      "Eerste kwartier na het wakker worden: geen scherm, één glas water, kort de dag in jezelf doorlopen.",
    waarom:
      "In de eerste minuten ontwaakt het cortisol-ritme, dat regelt je energie de hele dag. Een paar minuten rust zonder scherm laat dat ritme natuurlijk omhoog komen, zonder dat externe prikkels het uit balans halen. Een glas water op een lege maag activeert je spijsvertering en helpt tegen de lichte uitdroging van de nacht.",
    themas: ["energie", "stress", "stemming"],
    prioriteit: 9,
    icoon: "🌅",
    kleur: "amber",
  },
  {
    id: "daglicht-ochtend",
    titel: "Daglicht-anker",
    actie:
      "Binnen het eerste uur na opstaan minimaal tien minuten buitenlicht op je gezicht, ook bij bewolkt weer.",
    waarom:
      "Daglicht in de ochtend zet je biologische klok scherper, wat het slaap-waakritme stabieler maakt. Het stimuleert ook natuurlijke vitamine D-aanmaak in de huid en helpt je stemming de dag in. Bewolkt weer geeft nog steeds tien tot honderd keer meer licht dan binnen.",
    themas: ["slaap", "stemming", "energie", "botten"],
    prioriteit: 9,
    icoon: "☀️",
    kleur: "amber",
  },
  {
    id: "eet-venster",
    titel: "Eet-anker",
    actie:
      "Drie maaltijden binnen een vast venster van twaalf uur (van ontbijt tot avondeten).",
    waarom:
      "In een vast venster van twaalf uur krijgt je spijsvertering rust. De andere twaalf uur heeft je lichaam tijd voor herstel en regulatie van je hormoonsignalen, in plaats van constant te verteren. Veel vrouwen voelen hun energie en slaap meeschuiven met dit ritme.",
    themas: ["energie", "spijsvertering", "hormonen", "slaap"],
    prioriteit: 8,
    icoon: "🍃",
    kleur: "emerald",
  },
  {
    id: "eiwit-per-maaltijd",
    titel: "Eiwit-anker",
    actie:
      "Zorg dat elke maaltijd een eiwit-bron heeft (ei, vis, kip, peulvrucht, kwark, plantaardige eiwitten).",
    waarom:
      "In de overgang neemt spiermassa sneller af zonder gerichte aandacht. Voldoende eiwit per maaltijd, verspreid over de dag, is de eenvoudigste manier om je spierweefsel te ondersteunen. Spieren zijn ook hormoongevoelig weefsel.",
    themas: ["spieren", "lichaam", "hormonen", "energie"],
    prioriteit: 7,
    icoon: "🥚",
    kleur: "emerald",
  },
  {
    id: "beweeg-tweetal",
    titel: "Beweeg-anker",
    actie:
      "Twee kortere wandelingen per dag van ongeveer tien minuten, één in de ochtend en één na het avondeten.",
    waarom:
      "Lopen in de ochtend met daglicht op je gezicht zet je biologische klok scherper. Lopen na het avondeten helpt je bloedsuiker geleidelijk dalen in plaats van met een piek. Geen prestatie, wel ritme.",
    themas: ["spieren", "energie", "slaap", "stemming", "lichaam"],
    prioriteit: 8,
    icoon: "🚶‍♀️",
    kleur: "sky",
  },
  {
    id: "krachttraining",
    titel: "Kracht-anker",
    actie:
      "Twee keer per week kort iets met weerstand (eigen lichaamsgewicht, weerstandsband, gewichtjes), tien tot twintig minuten.",
    waarom:
      "Krachttraining is de meest effectieve manier om botdichtheid en spiermassa op peil te houden in en na de overgang. Korte sessies, twee keer per week, zijn voldoende om effect op te bouwen. Geen sportschool nodig.",
    themas: ["botten", "spieren", "lichaam"],
    prioriteit: 7,
    icoon: "💪",
    kleur: "sky",
  },
  {
    id: "avond-zonder-scherm",
    titel: "Avond-anker",
    actie:
      "Een vast moment, een half uur voor het slapen, zonder scherm. Drie diepe ademhalingen en de dag mag aflopen.",
    waarom:
      "Blauw licht van schermen remt de aanmaak van het slaap-signaal in je hoofd. Een half uur zonder scherm en een paar diepe ademhalingen geven je zenuwstelsel het signaal dat de dag voorbij is, zodat je makkelijker in slaap valt en dieper slaapt.",
    themas: ["slaap", "stress", "hersenen"],
    prioriteit: 8,
    icoon: "🌙",
    kleur: "violet",
  },
  {
    id: "alcohol-bewustzijn",
    titel: "Alcohol-anker",
    actie:
      "Maximaal één glas alcohol per dag, en niet binnen drie uur voor bedtijd. Een paar avonden per week helemaal niet.",
    waarom:
      "Alcohol, en vooral rode wijn, verstoort de tweede slaaphelft (REM-slaap) bij vrouwen in de overgang sterker dan eerder. Het verergert opvliegers en hete flushes vaak ook. Minder alcohol geeft veel vrouwen direct merkbaar betere slaap en stabielere temperatuur.",
    themas: ["slaap", "warmte", "hormonen", "stress"],
    prioriteit: 9,
    icoon: "🍷",
    kleur: "rose",
  },
  {
    id: "suiker-bewustzijn",
    titel: "Suiker-anker",
    actie:
      "Verlaag geraffineerde suiker en witte koolhydraten in de tweede helft van de dag, kies voor volkoren en vezel.",
    waarom:
      "Bloedsuiker-pieken belasten je insuline-balans extra in de overgang. Geraffineerde suiker zorgt ook voor energie-dips en stemmings-schommelingen. Vezel uit groente, volkoren en peulvruchten houdt je glucose stabieler en voedt bovendien je darmflora.",
    themas: ["energie", "stemming", "spijsvertering", "hormonen"],
    prioriteit: 8,
    icoon: "🍯",
    kleur: "amber",
  },
  {
    id: "cafeine-grens",
    titel: "Cafeïne-anker",
    actie:
      "Geen koffie of zwarte thee meer na 14:00 uur. Cafeïne blijft acht uur of langer in je systeem actief.",
    waarom:
      "In de overgang reageert je zenuwstelsel sterker op stimulerende stoffen. Cafeïne in de namiddag kan ook bij vrouwen die er nooit last van hadden, ineens de slaapdiepte ondermijnen. Schakel over op kruidenthee of warm water met citroen.",
    themas: ["slaap", "stress", "energie"],
    prioriteit: 7,
    icoon: "☕",
    kleur: "stone",
  },
  {
    id: "verbinding-rust",
    titel: "Verbinding-anker",
    actie:
      "Eén keer per week een echt gesprek met een vrouw die deze fase ook kent of kende. Tien minuten telefoon is genoeg.",
    waarom:
      "Vrouwen die hun overgang in gesprek brengen, herstellen significant beter dan vrouwen die het alleen dragen. Niet de oplossing zoeken, wel de herkenning krijgen, is een belangrijke buffer tegen de eenzaamheid die deze fase vaak meebrengt.",
    themas: ["verbinding", "stemming", "stress"],
    prioriteit: 8,
    icoon: "💞",
    kleur: "rose",
  },
  {
    id: "ademhaling-pauze",
    titel: "Adem-anker",
    actie:
      "Drie keer per dag, op een vast moment, een minuut bewuste adem (vier seconden in, zes seconden uit).",
    waarom:
      "Verlengd uitademen activeert het parasympathisch zenuwstelsel, de rust-stand. Drie korte momenten per dag bouwen op tot een merkbaar rustiger algeheel grond-niveau. Werkt ook direct bij een opkomende warmte-flush.",
    themas: ["stress", "warmte", "slaap", "stemming"],
    prioriteit: 7,
    icoon: "🌬️",
    kleur: "sky",
  },
];

// ============================================================
// NUTRIËNTEN-BIBLIOTHEEK (EFSA-toegestane health-claims)
// ============================================================

export type Nutrient = {
  id: string;
  naam: string;
  bron: string;
  efsaClaims: string[];
  themas: Thema[];
  prioriteit: number;
  /** Emoji voor visuele herkenning. */
  icoon: string;
  /** Tailwind-kleur-suffix (zonnig geel, kalmerend groen, etc.). */
  kleur: "amber" | "emerald" | "sky" | "violet" | "rose" | "stone";
};

export const NUTRIENT_BIBLIOTHEEK: Nutrient[] = [
  {
    id: "magnesium",
    naam: "Magnesium",
    bron: "bladgroente, pitten, peulvruchten, pure chocolade",
    efsaClaims: [
      "draagt bij aan vermindering van vermoeidheid",
      "draagt bij aan een normale werking van het zenuwstelsel",
      "draagt bij aan een normale spierfunctie",
      "draagt bij aan een normale psychologische functie",
    ],
    themas: ["slaap", "stress", "energie", "spieren", "stemming"],
    prioriteit: 9,
    icoon: "🌿",
    kleur: "emerald",
  },
  {
    id: "vitamine-b6",
    naam: "Vitamine B6",
    bron: "vis, kip, banaan, volkoren, peulvruchten",
    efsaClaims: [
      "draagt bij aan de regulatie van de hormonale activiteit",
      "draagt bij aan een normale psychologische functie",
      "draagt bij aan vermindering van vermoeidheid",
    ],
    themas: ["hormonen", "stemming", "energie", "hersenen"],
    prioriteit: 9,
    icoon: "🌸",
    kleur: "rose",
  },
  {
    id: "vitamine-d",
    naam: "Vitamine D",
    bron: "daglicht (huid maakt zelf aan), vette vis, eieren",
    efsaClaims: [
      "draagt bij aan de instandhouding van normale botten",
      "draagt bij aan een normale werking van het immuunsysteem",
      "draagt bij aan een normale spierfunctie",
    ],
    themas: ["botten", "spieren", "immuun", "stemming"],
    prioriteit: 9,
    icoon: "☀️",
    kleur: "amber",
  },
  {
    id: "vitamine-k",
    naam: "Vitamine K",
    bron: "bladgroente, broccoli, gefermenteerde producten",
    efsaClaims: [
      "draagt bij aan de instandhouding van normale botten",
      "draagt bij aan een normale bloedstolling",
    ],
    themas: ["botten"],
    prioriteit: 7,
    icoon: "🥬",
    kleur: "emerald",
  },
  {
    id: "omega-3",
    naam: "Omega-3 (DHA + EPA)",
    bron: "vette vis (zalm, makreel, haring), lijnzaad, walnoot, algenolie",
    efsaClaims: [
      "DHA draagt bij aan een normale werking van de hersenen",
      "DHA draagt bij aan instandhouding van een normaal gezichtsvermogen",
      "EPA en DHA dragen bij aan een normale werking van het hart",
    ],
    themas: ["hersenen", "stemming", "lichaam"],
    prioriteit: 8,
    icoon: "🐟",
    kleur: "sky",
  },
  {
    id: "calcium",
    naam: "Calcium",
    bron: "zuivel, sesamzaad, amandel, bladgroente",
    efsaClaims: [
      "is nodig voor de instandhouding van normale botten",
      "draagt bij aan een normale werking van spieren",
      "draagt bij aan een normale signaaloverdracht tussen zenuwcellen",
    ],
    themas: ["botten", "spieren"],
    prioriteit: 7,
    icoon: "🦴",
    kleur: "stone",
  },
  {
    id: "b-complex",
    naam: "Vitamine B-complex (B2, B3, B5, B12, foliumzuur)",
    bron: "volkoren, eieren, vlees, zuivel, peulvruchten",
    efsaClaims: [
      "B12 en foliumzuur dragen bij aan vermindering van vermoeidheid",
      "B2 draagt bij aan een normaal energieleverend metabolisme",
      "B5 draagt bij aan normale mentale prestaties",
    ],
    themas: ["energie", "hersenen", "stemming"],
    prioriteit: 7,
    icoon: "⚡",
    kleur: "amber",
  },
  {
    id: "ijzer",
    naam: "IJzer",
    bron: "rood vlees, peulvruchten, bladgroente, pitten",
    efsaClaims: [
      "draagt bij aan vermindering van vermoeidheid",
      "draagt bij aan een normaal zuurstoftransport in het lichaam",
      "draagt bij aan normale cognitieve functies",
    ],
    themas: ["energie", "hersenen", "cyclus"],
    prioriteit: 7,
    icoon: "🩸",
    kleur: "rose",
  },
  {
    id: "zink",
    naam: "Zink",
    bron: "vlees, schaaldieren, peulvruchten, pitten",
    efsaClaims: [
      "draagt bij aan een normale vruchtbaarheid en voortplanting",
      "draagt bij aan een normaal hormoonniveau van testosteron in het bloed",
      "draagt bij aan een normale werking van het immuunsysteem",
    ],
    themas: ["hormonen", "immuun", "lichaam"],
    prioriteit: 6,
    icoon: "✨",
    kleur: "violet",
  },
];

// ============================================================
// BASIS-TIPS (overgang-specifiek, niet thema-gebonden, altijd nuttig)
// ============================================================

export type BasisTip = {
  id: string;
  titel: string;
  uitleg: string;
};

export const BASIS_TIPS: BasisTip[] = [
  {
    id: "voeding-tekorten",
    titel: "Onze huidige voeding heeft vaak tekorten",
    uitleg:
      "Groente en fruit van vandaag bevatten gemiddeld minder vitaminen en mineralen dan vijftig jaar geleden. Intensieve landbouw, lange transport-routes en vroegtijdig oogsten zijn de oorzaken. Veel vrouwen in deze fase merken dat een gerichte aanvulling het verschil maakt, vooral van stoffen die in de overgang extra belast worden.",
  },
  {
    id: "lichaam-belasting",
    titel: "Je lichaam is in deze fase extra belast",
    uitleg:
      "Veranderende hormonen vragen meer van je systeem. Tegelijk komen we via voeding, water, lucht en producten dagelijks in aanraking met stoffen die je lever extra werk geven (E-nummers, pesticide-residuen, micro-plastics). Je lichaam vraagt in deze periode dus zowel om extra bouwstoffen als om minder belasting.",
  },
  {
    id: "stress-overgang",
    titel: "Stress voelt anders in deze fase",
    uitleg:
      "Dezelfde gebeurtenis kan zwaarder landen dan eerder. Dat komt door schommelende oestrogeen-niveaus die je stress-respons mede regelen. Het is geen zwakte, het is biochemie. Bewustzijn helpt: niet alles is jouw schuld, sommige reactiviteit is hormoon-tijdelijk.",
  },
  {
    id: "slaap-investeren",
    titel: "Slaap is in deze fase een investering",
    uitleg:
      "De diepe slaap waarin je hersenen opruimen en herstellen, neemt natuurlijk af tussen je 40e en 60e. Wie nu actief in slaap-hygiëne investeert (vast ritme, donker, koel, geen schermen voor bed), profiteert daar tien tot twintig jaar van.",
  },
  {
    id: "spieren-bouwen",
    titel: "Spieren zijn je beste pensioen",
    uitleg:
      "Vanaf je 40e verlies je natuurlijk spiermassa als je niets doet (1-2% per jaar). In de overgang versnelt dit. Spieren zijn niet alleen voor kracht: ze regelen je stofwisseling, vangen klappen op voor je botten en houden je glucose stabiel. Krachttraining is wetenschappelijk de meest onderbouwde investering in deze fase.",
  },
  {
    id: "zon-vitamine-d",
    titel: "Vitamine D is in Nederland bijna nooit op peil",
    uitleg:
      "Tussen oktober en maart maakt onze huid niet genoeg vitamine D aan, ongeacht hoe vaak je buiten bent. In de overgang is een goede vitamine D-spiegel extra belangrijk voor botten, spieren en stemming. Veel vrouwen kiezen voor gerichte aanvulling vanaf de herfst.",
  },
  {
    id: "darm-tweede-brein",
    titel: "Je darmflora reageert mee op de overgang",
    uitleg:
      "De biljoenen bacteriën in je darmen veranderen mee met je hormonen. Een veelzijdig, vezelrijk eetpatroon (groente, fruit, peulvruchten, volkoren, gefermenteerd) ondersteunt deze tweede 'organisme'. Veel stemmings- en energiesignalen komen vanuit de darm naar de hersenen.",
  },
];

// ============================================================
// ADVIES-SELECTIE
// ============================================================

export type AdviesPakket = {
  /** Korte samenvatting van wat de vrouw heeft aangegeven. */
  jouwSituatie: string;
  /** Top-4 ankers, gerankt op antwoord-relevantie. */
  ankers: Anker[];
  /** Top-5 nutriënten, gerankt op antwoord-relevantie. */
  nutrienten: Nutrient[];
  /** Drie basis-tips voor deze fase. */
  basisTips: BasisTip[];
  /** Eventuele extra ankerpunten voor specifieke combinaties. */
  extraAandacht?: string;
};

function rangschikOpRelevantie<T extends { themas: Thema[]; prioriteit: number }>(
  items: T[],
  themaTags: Thema[],
): T[] {
  const themaSet = new Set(themaTags);
  const gerangschikt = items.map((item) => {
    const matchCount = item.themas.filter((t) => themaSet.has(t)).length;
    // Score: matches × 10 + prioriteit. Items zonder match krijgen score = prioriteit/10
    const score = matchCount > 0 ? matchCount * 10 + item.prioriteit : item.prioriteit / 10;
    return { item, score };
  });
  gerangschikt.sort((a, b) => b.score - a.score);
  return gerangschikt.map((g) => g.item);
}

function bouwJouwSituatie(a: TweedeLenteAntwoorden): string {
  const faseLabel: Record<typeof a.fase, string> = {
    "pre-overgang": "in de pre-overgang",
    "peri-overgang": "midden in de peri-overgang",
    "volle-overgang": "in de volle overgang",
    "post-overgang": "in de post-overgang",
    "weet-niet": "in een fase die je nog niet helemaal kunt plaatsen",
  };

  const themaLabels: Record<string, string> = {
    "energie-patroon": "een ander energie-patroon",
    "slaapritme": "een veranderd slaapritme",
    "stemming": "stemmings-schommelingen",
    "warmte-golven": "warmte-golven of opvliegers",
    "cyclus-veranderingen": "cyclus-veranderingen",
    "lichaamsbeleving": "een ander lichaamsgevoel",
    "mentaal-helder-zijn": "minder mentale scherpte",
  };

  const themas = a.watValtOp.map((w) => themaLabels[w]).filter(Boolean);
  let themaTekst = "";
  if (themas.length === 1) themaTekst = themas[0];
  else if (themas.length === 2) themaTekst = `${themas[0]} én ${themas[1]}`;
  else if (themas.length === 3)
    themaTekst = `${themas[0]}, ${themas[1]} én ${themas[2]}`;

  const rustLabel: Record<typeof a.rust, string> = {
    "goed-zonder-schuldgevoel": "Je kunt nog goed rusten",
    "wisselend": "Rusten gaat wisselend",
    "hoofd-staat-aan": "Je hoofd staat vaak aan",
    "draai-door": "Je merkt dat je doordraait",
  };

  const deelLabel: Record<typeof a.deel, string> = {
    "partner": "Je deelt het met je partner",
    "vriendin-of-vrouw": "Je deelt het met een vrouw uit je omgeving",
    "huisarts-of-professional": "Je hebt professional erbij gehaald",
    "met-niemand-echt": "Je draagt dit nu vooral alleen",
  };

  return `Je zit ${faseLabel[a.fase]}, met vooral ${themaTekst}. ${rustLabel[a.rust]}. ${deelLabel[a.deel]}.`;
}

function bouwExtraAandacht(a: TweedeLenteAntwoorden): string | undefined {
  // Specifieke combinaties die extra aandacht verdienen.
  if (a.rust === "draai-door" && a.deel === "met-niemand-echt") {
    return "We zien een combinatie van doordraaien en dit grotendeels alleen dragen. Dat is een belangrijk signaal. De combinatie verbinding zoeken plus actief rust-momenten inbouwen is dan vaak het meest helpend, meer dan voeding of supplement alleen.";
  }
  if (
    a.watValtOp.includes("warmte-golven") &&
    a.watValtOp.includes("slaapritme")
  ) {
    return "Warmte-golven en verstoorde slaap horen vaak bij elkaar. Aandacht voor temperatuur in de slaapkamer (koel onder de 18°C), katoenen lakens en het minderen van alcohol in de avond, geeft de meeste vrouwen direct merkbaar effect.";
  }
  if (
    a.beweging === "weinig" &&
    (a.fase === "volle-overgang" || a.fase === "post-overgang")
  ) {
    return "Beweging is in deze fase extra belangrijk geworden. Niet om af te vallen, wel om botten, spieren en stemming te ondersteunen. Begin klein: tien minuten lopen per dag is al een merkbare basis.";
  }
  if (
    a.eetRitme === "vaak-snel-tussendoor" &&
    a.watValtOp.includes("energie-patroon")
  ) {
    return "Snel eten tussendoor en wisselende energie versterken elkaar. Beginnen met een vol ontbijt met eiwit en complexe koolhydraten, geeft veel vrouwen door de hele dag stabielere energie.";
  }
  return undefined;
}

/**
 * Hoofdfunctie. Gebruik deze in de spiegel-component om het persoonlijk
 * advies-pakket samen te stellen op basis van de antwoorden.
 */
export function selecteerAdvies(a: TweedeLenteAntwoorden): AdviesPakket {
  const themaTags = themaTagsUitAntwoorden(a);

  const gerangschikteAnkers = rangschikOpRelevantie(ANKER_BIBLIOTHEEK, themaTags);
  const gerangschikteNutrienten = rangschikOpRelevantie(
    NUTRIENT_BIBLIOTHEEK,
    themaTags,
  );

  // Kies 3 basis-tips: voeding-tekorten + lichaam-belasting altijd,
  // derde wisselt op basis van rust/fase.
  const basisTips: BasisTip[] = [
    BASIS_TIPS.find((b) => b.id === "voeding-tekorten")!,
    BASIS_TIPS.find((b) => b.id === "lichaam-belasting")!,
  ];
  if (a.rust === "hoofd-staat-aan" || a.rust === "draai-door") {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "stress-overgang")!);
  } else if (a.watValtOp.includes("slaapritme")) {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "slaap-investeren")!);
  } else if (
    a.fase === "volle-overgang" ||
    a.fase === "post-overgang" ||
    a.watValtOp.includes("lichaamsbeleving")
  ) {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "spieren-bouwen")!);
  } else {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "darm-tweede-brein")!);
  }

  return {
    jouwSituatie: bouwJouwSituatie(a),
    ankers: gerangschikteAnkers.slice(0, 4),
    nutrienten: gerangschikteNutrienten.slice(0, 5),
    basisTips,
    extraAandacht: bouwExtraAandacht(a),
  };
}

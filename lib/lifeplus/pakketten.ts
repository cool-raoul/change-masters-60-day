// ============================================================
// LIFEPLUS PAKKETTEN — 6 hoofdcategorieën × 3 niveaus + 4 reset-pakketten
//
// Bron: door Raoul samengestelde pakketten op basis van Lifeplus
// prijslijst maart 2026 + Holistic Reset boekje + Darmen in Balans boekje.
// Brainstorm-akkoord: 27-04-2026.
//
// IP-targets per niveau:
//   Essential: 40-100 IP   (instap, gerichte kern)
//   Plus:      100-175 IP  (uitgebreid met basis)
//   Complete:  ~190-220 IP (optimaal, vaak met M&P 100 Gold Light als fundament)
//
// SMAAK-KEUZES: bewust GEEN smaakkeuze in de UI om het simpel te houden.
// Defaults zijn vastgelegd in de productnaam:
//   - Triple Protein Shake (vanille)   — chocolade-variant bestaat ook
//   - Be Focused (bessen)              — citrus-variant bestaat ook
//   - Be Recharged (bessen)            — citrus-variant bestaat ook
// Heroverweeg in fase 2 of we smaakkeuzes alsnog in de UI willen aanbieden.
//
// BE RECHARGED: ALTIJD DE POT, NOOIT DE SACHETS.
// Sachets worden alleen nog in 30-stuks-verpakking geleverd en zijn
// daardoor te duur. Pot = €80,25 / 43 IP, sachets niet meer aanbieden.
//
// Gebruik:
//   - Member kiest hier zijn bestellinks bij (zie member_bestellinks tabel)
//   - Productadvies-test toont juist pakket op resultaatpagina
//   - Coach/Mentor mag deze pakketten zien (op verzoek pas later inkoppelen)
//
// Wijziging van een prijs of IP? Update ook STAPPENPLAN_7DAGEN.md "Logboek".
// ============================================================

import { PRIJSLIJST_METADATA } from "./prijslijst";

// ============================================================
// TYPES
// ============================================================

export type PakketNiveau = "essential" | "plus" | "complete";

export type PakketCategorie =
  | "energie-focus"
  | "stress-slaap"
  | "afvallen-metabolisme"
  | "hormonen"
  | "sport-performance"
  | "high-performance";

export type PakketProduct = {
  naam: string;
  asapPrijs: number;
  ip: number;
};

export type LifeplusPakket = {
  categorie: PakketCategorie;
  categorieLabel: string;
  niveau: PakketNiveau;
  producten: PakketProduct[];
  totaalPrijs: number;
  totaalIP: number;
  /** True als totaal-IP ≥ 80 (gratis verzending). */
  gratisVerzending: boolean;
  /** Korte zin: waarom dit pakket past bij dit doel. */
  waarom: string;
  /** Wanneer voelt iemand resultaat (snelste merkbaar effect). */
  resultaatTijdlijn: string;
  /** Optionele aanvullende toelichting. */
  notitie?: string;
};

export type ResetPakketKey =
  | "reset-darmen-basis"
  | "reset-darmen-plus"
  | "reset-60day-opstart"
  | "reset-holistic-m12"
  | "reset-holistic-m3";

export type LifeplusResetPakket = {
  key: ResetPakketKey;
  naam: string;
  duurDagen: number;
  /** Voor welke route: 60day = 60 Day Run, regulier = reguliere productadvies. */
  route: "60day" | "regulier" | "beide";
  producten: PakketProduct[];
  totaalPrijs: number;
  totaalIP: number;
  gratisVerzending: boolean;
  waarom: string;
  /** Korte beschrijving van levensstijl-aanpassing tijdens dit programma. */
  levensstijlAanpassing: string;
  notitie?: string;
};

// ============================================================
// HERBRUIKBARE PRODUCT-DEFINITIES
// (één plek voor de juiste prijzen en IP-waarden)
// ============================================================

// Triple Protein Shake = standaard vanille (geen smaakkeuze in UI).
// Bestelnummer 3247 (vanille). Chocolade-variant (3246) bestaat ook,
// maar we tonen 'm bewust niet om de UX simpel te houden. Heroverweeg
// later of we smaakkeuzes alsnog willen aanbieden.
const TRIPLE_PROTEIN: PakketProduct = {
  naam: "Triple Protein Shake (vanille)",
  asapPrijs: 81.75,
  ip: 38,
};

const MP_100_GOLD_LIGHT: PakketProduct = {
  naam: "Maintain & Protect 100 Gold Light",
  asapPrijs: 173.5,
  ip: 122.75,
};

const DAILY_LIGHT: PakketProduct = {
  naam: "Daily BioBasics Light",
  asapPrijs: 65.25,
  ip: 44.5,
};

const PROANTHENOLS: PakketProduct = {
  naam: "Proanthenols 100",
  asapPrijs: 71.25,
  ip: 48.75,
};

const OMEGOLD: PakketProduct = {
  naam: "OmeGold",
  asapPrijs: 45.5,
  ip: 29.5,
};

// Be Focused = standaard bessen-smaak (geen smaakkeuze in UI).
// Citrus-variant bestaat ook maar tonen we niet om UX simpel te houden.
const BE_FOCUSED: PakketProduct = {
  naam: "Be Focused (bessen)",
  asapPrijs: 78.25,
  ip: 47.5,
};

// Be Recharged = standaard bessen-smaak (geen smaakkeuze in UI).
// LET OP: altijd de POT (€80,25 / 43 IP), NOOIT de sachets.
// Sachets zijn alleen nog in 30-stuks-verpakking leverbaar en daardoor
// te duur. Be Recharged Sachets zijn dus uit alle pakketten verwijderd.
const BE_RECHARGED: PakketProduct = {
  naam: "Be Recharged (bessen)",
  asapPrijs: 80.25,
  ip: 43,
};

const KEY_TONIC: PakketProduct = {
  naam: "Key-Tonic",
  asapPrijs: 75.25,
  ip: 46,
};

const MENA_PLUS: PakketProduct = {
  naam: "Mena Plus",
  asapPrijs: 83.0,
  ip: 50,
};

const SUPPORT_TABS: PakketProduct = {
  naam: "Support Tabs",
  asapPrijs: 61.25,
  ip: 40,
};

const GOLDEN_MILK: PakketProduct = {
  naam: "Golden Milk",
  asapPrijs: 47.5,
  ip: 29,
};

const CACAO_BOOST: PakketProduct = {
  naam: "Cacao Boost",
  asapPrijs: 47.0,
  ip: 26.5,
};

const VITAMINS_DK: PakketProduct = {
  naam: "Vitamins D & K",
  asapPrijs: 20.5,
  ip: 11.5,
};

const EVENING_PRIMROSE: PakketProduct = {
  naam: "Evening Primrose Oil",
  asapPrijs: 14.75,
  ip: 7,
};

const ENERXAN: PakketProduct = { naam: "Enerxan", asapPrijs: 27.0, ip: 13 };

const MSM_PLUS_TABLETTEN: PakketProduct = {
  naam: "MSM Plus tabletten",
  asapPrijs: 41.5,
  ip: 26,
};

const COGELIN: PakketProduct = { naam: "Cogelin", asapPrijs: 49.75, ip: 30.25 };
const ALOE_VERA: PakketProduct = { naam: "Aloë Vera Caps", asapPrijs: 54.25, ip: 40 };
const BIOTIC_BLAST: PakketProduct = { naam: "Biotic Blast", asapPrijs: 41.0, ip: 25.75 };
const PARABALANCE: PakketProduct = { naam: "Parabalance", asapPrijs: 49.75, ip: 27 };
const DIGESTIVE_FORMULA: PakketProduct = {
  naam: "Digestive Formula",
  asapPrijs: 45.5,
  ip: 21,
};
const PH_PLUS: PakketProduct = {
  naam: "PH Plus tabletten",
  asapPrijs: 38.75,
  ip: 23,
};

// ============================================================
// 18 CATEGORIE-PAKKETTEN (6 categorieën × 3 niveaus)
// ============================================================

export const LIFEPLUS_PAKKETTEN: LifeplusPakket[] = [
  // ================ ENERGIE & FOCUS ================
  {
    categorie: "energie-focus",
    categorieLabel: "Energie & Focus",
    niveau: "essential",
    producten: [DAILY_LIGHT, BE_FOCUSED],
    totaalPrijs: 143.5,
    totaalIP: 92,
    gratisVerzending: true,
    waarom: "Basis-voeding gecombineerd met mentale focus.",
    resultaatTijdlijn: "Helderder hoofd binnen 1-3 dagen, stabielere energie binnen 1-2 weken.",
  },
  {
    categorie: "energie-focus",
    categorieLabel: "Energie & Focus",
    niveau: "plus",
    producten: [DAILY_LIGHT, BE_FOCUSED, OMEGOLD],
    totaalPrijs: 189.0,
    totaalIP: 121.5,
    gratisVerzending: true,
    waarom: "Basis-voeding + Be Focused voor scherpte + omega-3 (DHA) als specifieke ondersteuning voor hersenfunctie.",
    resultaatTijdlijn: "Mentale scherpte binnen 1 week; brein-omega-3 effect bouwt op in 4-8 weken.",
  },
  {
    categorie: "energie-focus",
    categorieLabel: "Energie & Focus",
    niveau: "complete",
    producten: [MP_100_GOLD_LIGHT, BE_FOCUSED, CACAO_BOOST],
    totaalPrijs: 298.75,
    totaalIP: 196.75,
    gratisVerzending: true,
    waarom: "Complete ondersteuning voor hersenfunctie, doorbloeding én focus.",
    resultaatTijdlijn: "Focus en stemming binnen 1-3 dagen, energie consistenter binnen 1-2 weken.",
    notitie:
      "M&P 100 Gold Light = bundel van Daily BioBasics Light + Proanthenols 100 + OmeGold (voordelig samengesteld).",
  },

  // ============== STRESS · SLAAP · VEERKRACHT ==============
  {
    categorie: "stress-slaap",
    categorieLabel: "Stress, Slaap & Veerkracht",
    niveau: "essential",
    producten: [GOLDEN_MILK, CACAO_BOOST],
    totaalPrijs: 94.5,
    totaalIP: 55.5,
    gratisVerzending: false,
    waarom: "Avond-ontspanning (Golden Milk) en stemmings-ondersteuning overdag (Cacao Boost).",
    resultaatTijdlijn: "Dieper inslapen binnen 3-5 dagen, rustiger gevoel overdag binnen 1-2 weken.",
  },
  {
    categorie: "stress-slaap",
    categorieLabel: "Stress, Slaap & Veerkracht",
    niveau: "plus",
    producten: [DAILY_LIGHT, SUPPORT_TABS, GOLDEN_MILK, CACAO_BOOST],
    totaalPrijs: 221.5,
    totaalIP: 140,
    gratisVerzending: true,
    waarom: "Volledige stress-stack: basis + zenuwstelsel + slaap + stemming.",
    resultaatTijdlijn: "Betere slaap binnen 1 week, rustiger zenuwstelsel binnen 2-3 weken.",
  },
  {
    categorie: "stress-slaap",
    categorieLabel: "Stress, Slaap & Veerkracht",
    niveau: "complete",
    producten: [MP_100_GOLD_LIGHT, SUPPORT_TABS, GOLDEN_MILK, CACAO_BOOST],
    totaalPrijs: 329.25,
    totaalIP: 218.25,
    gratisVerzending: true,
    waarom: "Complete stress-stack: basis-bundel + zenuwstelsel-ondersteuning + slaap (Golden Milk) + stemming en anti-inflammatie (Cacao Boost).",
    resultaatTijdlijn: "Diepere slaap binnen 3-5 dagen, rustiger zenuwstelsel binnen 1-2 weken, stress-resilience binnen 2-3 weken.",
  },

  // ============== AFVALLEN & METABOLISME ==============
  {
    categorie: "afvallen-metabolisme",
    categorieLabel: "Afvallen & Metabolisme",
    niveau: "essential",
    producten: [DAILY_LIGHT, KEY_TONIC],
    totaalPrijs: 140.5,
    totaalIP: 90.5,
    gratisVerzending: true,
    waarom: "Basis-voeding gecombineerd met bloedsuiker-stabilisatie.",
    resultaatTijdlijn: "Stabielere energie en minder snaai-buien binnen 1 week.",
  },
  {
    categorie: "afvallen-metabolisme",
    categorieLabel: "Afvallen & Metabolisme",
    niveau: "plus",
    producten: [DAILY_LIGHT, KEY_TONIC, TRIPLE_PROTEIN],
    totaalPrijs: 222.25,
    totaalIP: 128.5,
    gratisVerzending: true,
    waarom: "Klassieke afvallen-stack: basis + bloedsuiker + verzadiging via eiwit.",
    resultaatTijdlijn: "Verzadiging vanaf dag 1, gewichtsverandering vanaf week 3-4.",
  },
  {
    categorie: "afvallen-metabolisme",
    categorieLabel: "Afvallen & Metabolisme",
    niveau: "complete",
    producten: [MP_100_GOLD_LIGHT, KEY_TONIC, TRIPLE_PROTEIN],
    totaalPrijs: 330.5,
    totaalIP: 206.75,
    gratisVerzending: true,
    waarom: "Compleet pakket: darmgezondheid, metabolisme én verzadiging.",
    resultaatTijdlijn: "Stabielere bloedsuiker binnen 1 week, gewichtsverandering vanaf week 3-4.",
  },

  // ================ HORMONALE BALANS ================
  {
    categorie: "hormonen",
    categorieLabel: "Hormonale Balans",
    niveau: "essential",
    producten: [MENA_PLUS, EVENING_PRIMROSE],
    totaalPrijs: 97.75,
    totaalIP: 57,
    gratisVerzending: false,
    waarom: "Gerichte hormoon-instap met Mena Plus + EPO als ondersteuning.",
    resultaatTijdlijn: "Mena Plus heeft minimaal 3 maanden nodig voor vol effect; EPO 4-6 weken.",
  },
  {
    categorie: "hormonen",
    categorieLabel: "Hormonale Balans",
    niveau: "plus",
    producten: [DAILY_LIGHT, MENA_PLUS, EVENING_PRIMROSE, VITAMINS_DK],
    totaalPrijs: 183.5,
    totaalIP: 113,
    gratisVerzending: true,
    waarom: "Compleet hormoon-pakket met basis, Mena Plus, EPO en D & K.",
    resultaatTijdlijn: "Stemming en stressbestendigheid binnen 1-2 weken; vol effect na 3+ maanden.",
  },
  {
    categorie: "hormonen",
    categorieLabel: "Hormonale Balans",
    niveau: "complete",
    producten: [MP_100_GOLD_LIGHT, MENA_PLUS, EVENING_PRIMROSE, VITAMINS_DK],
    totaalPrijs: 291.75,
    totaalIP: 191.25,
    gratisVerzending: true,
    waarom: "Natuurlijke opwaardering van Plus: basis-bundel (M&P) + Mena Plus + EPO + Vitamins D & K als compleet hormoon-fundament.",
    resultaatTijdlijn: "Stemming en stressbestendigheid binnen 1-2 weken; vol effect Mena Plus / EPO na 3+ maanden.",
  },

  // ================ SPORT & PERFORMANCE ================
  {
    categorie: "sport-performance",
    categorieLabel: "Sport & Performance",
    niveau: "essential",
    producten: [BE_RECHARGED, TRIPLE_PROTEIN],
    totaalPrijs: 162.0,
    totaalIP: 81,
    gratisVerzending: true,
    waarom: "Klassieke post-workout instap: herstel + spieropbouw via eiwit.",
    resultaatTijdlijn: "Sneller herstel en minder stijfheid binnen 1 week.",
  },
  {
    categorie: "sport-performance",
    categorieLabel: "Sport & Performance",
    niveau: "plus",
    producten: [DAILY_LIGHT, BE_RECHARGED, TRIPLE_PROTEIN],
    totaalPrijs: 227.25,
    totaalIP: 125.5,
    gratisVerzending: true,
    waarom: "Basis + herstel + eiwit voor wie regelmatig traint.",
    resultaatTijdlijn: "Sneller herstel binnen 1 week, betere uithouding binnen 2-3 weken.",
  },
  {
    categorie: "sport-performance",
    categorieLabel: "Sport & Performance",
    niveau: "complete",
    producten: [MP_100_GOLD_LIGHT, BE_RECHARGED, TRIPLE_PROTEIN],
    totaalPrijs: 335.5,
    totaalIP: 203.75,
    gratisVerzending: true,
    waarom: "Complete performance- én herstelondersteuning op stevig fundament.",
    resultaatTijdlijn: "Sneller herstel binnen 1 week, betere prestaties binnen 2-4 weken.",
  },

  // ================ HIGH PERFORMANCE ================
  {
    categorie: "high-performance",
    categorieLabel: "High Performance",
    niveau: "essential",
    producten: [DAILY_LIGHT, CACAO_BOOST],
    totaalPrijs: 112.25,
    totaalIP: 71,
    gratisVerzending: false,
    waarom: "Vitaliteits-instap met basis + lekker dagelijks ritueel (chocoladeshake).",
    resultaatTijdlijn: "Stabielere energie en stemming binnen 1-2 weken.",
  },
  {
    categorie: "high-performance",
    categorieLabel: "High Performance",
    niveau: "plus",
    producten: [DAILY_LIGHT, OMEGOLD, CACAO_BOOST, TRIPLE_PROTEIN],
    totaalPrijs: 239.5,
    totaalIP: 138.5,
    gratisVerzending: true,
    waarom: "Vitaliteits-stack met basis, omega-3, lekker ritueel en eiwit-bouwsteen.",
    resultaatTijdlijn: "Verzadiging vanaf dag 1, helderder hoofd binnen 1-2 weken.",
  },
  {
    categorie: "high-performance",
    categorieLabel: "High Performance",
    niveau: "complete",
    producten: [MP_100_GOLD_LIGHT, TRIPLE_PROTEIN, CACAO_BOOST, VITAMINS_DK],
    totaalPrijs: 322.75,
    totaalIP: 198.75,
    gratisVerzending: true,
    waarom: "Compleet dagelijks vitaliteits-pakket: basis, eiwit, mood-lift en cardiovasculaire long-term ondersteuning.",
    resultaatTijdlijn: "Verzadiging vanaf dag 1, mentale rust binnen 1-2 weken, long-term cardio-bot via D & K.",
    notitie:
      "M&P 100 Gold Light bevat al Daily BioBasics Light, Proanthenols 100 en OmeGold (voordelig samengesteld).",
  },
];

// ============================================================
// 4 RESET-PAKKETTEN
// ============================================================

export const LIFEPLUS_RESET_PAKKETTEN: LifeplusResetPakket[] = [
  {
    key: "reset-darmen-basis",
    naam: "Darmen in Balans (basis)",
    duurDagen: 16,
    route: "regulier",
    producten: [COGELIN, ALOE_VERA, MSM_PLUS_TABLETTEN, BIOTIC_BLAST, PARABALANCE],
    totaalPrijs: 236.25,
    totaalIP: 149,
    gratisVerzending: true,
    waarom: "Schone start: opruimen van binnenuit en darmflora-herstel als fundament.",
    levensstijlAanpassing:
      "16 dagen pure voeding: geen tarwe, gluten, zuivel, suiker, alcohol, bewerkte producten of geraffineerde oliën. Wel: groenten, vis, mager vlees, eieren, fermented (kimchi, zuurkool), gezonde vetten, plantaardige zuivel.",
  },
  {
    key: "reset-darmen-plus",
    naam: "Darmen in Balans + (uitgebreid)",
    duurDagen: 16,
    route: "regulier",
    producten: [
      COGELIN,
      ALOE_VERA,
      MSM_PLUS_TABLETTEN,
      BIOTIC_BLAST,
      PARABALANCE,
      BE_RECHARGED,
      DIGESTIVE_FORMULA,
      PH_PLUS,
    ],
    totaalPrijs: 400.75,
    totaalIP: 236,
    gratisVerzending: true,
    waarom:
      "Basis-darmprogramma + extra ondersteuning van spijsverteringsenzymen, basenbalans en aminozuren via Be Recharged-pot. Voor wie bij de scoringstabel 20+ scoort.",
    levensstijlAanpassing:
      "Zelfde voedingsregels als basis-versie: geen tarwe, gluten, zuivel, suiker, alcohol, bewerkte producten. Plus extra inname-frequentie van supplementen (zie inname-schema).",
    notitie:
      "Be Recharged in dit pakket is bewust de pot-variant (€80,25 / 43 IP), niet de sachets. Sachets zijn alleen nog in 30-stuks-verpakking leverbaar wat ze te duur maakt.",
  },
  {
    key: "reset-60day-opstart",
    naam: "60 Day Run Opstart (Darmprogramma + Be Recharged)",
    duurDagen: 16,
    route: "60day",
    producten: [
      COGELIN,
      ALOE_VERA,
      MSM_PLUS_TABLETTEN,
      BIOTIC_BLAST,
      PARABALANCE,
      BE_RECHARGED,
    ],
    totaalPrijs: 316.5,
    totaalIP: 192,
    gratisVerzending: true,
    waarom:
      "16 dagen darmreset als opstart van de 60 Day Run, plus losse Be Recharged voor de rest van maand 1.",
    levensstijlAanpassing:
      "16 dagen pure voeding (zie Darmen in Balans). Daarna in maand 2 doorgaan met het categorie-Complete-pakket van de 60 Day Run.",
    notitie:
      "Specifieke 60-Day-Run-opstart: na de 16 dagen darm overgang naar het categorie-Complete-pakket dat uit de zelftest kwam.",
  },
  {
    key: "reset-holistic-m12",
    naam: "Holistic Reset — Maand 1 + Maand 2",
    duurDagen: 30,
    route: "regulier",
    producten: [DAILY_LIGHT, PROANTHENOLS, OMEGOLD, MSM_PLUS_TABLETTEN, ENERXAN],
    totaalPrijs: 250.5,
    totaalIP: 161.75,
    gratisVerzending: true,
    waarom:
      "Eerste twee maanden van de Holistic Reset (laaddagen + metabolisme-omschakeling + stabilisatie).",
    levensstijlAanpassing:
      "65 dagen ingrijpend traject in 4 fasen: laaddagen (3500-5000 kcal vooral vetten) → 21d geen koolhydraten/suikers/vetten + vetvrije verzorging → 21d stabilisatie met vetten weer rustig opbouwen → 21d LOGI-leefstijl. Vereist weegschaal, meetlint, calorie-tracking via Fatsecret-app, voor- en na-foto's, voetenbaden met Keltisch zeezout, 2L water per dag.",
    notitie: "Per maand opnieuw bestellen. Maand 1 en Maand 2 zijn identiek qua inhoud.",
  },
  {
    key: "reset-holistic-m3",
    naam: "Holistic Reset — Maand 3 (= M&P 100 Gold Light)",
    duurDagen: 30,
    route: "regulier",
    producten: [MP_100_GOLD_LIGHT],
    totaalPrijs: 173.5,
    totaalIP: 122.75,
    gratisVerzending: true,
    waarom:
      "Maand 3 van de Holistic Reset (LOGI-fase): Enerxan en MSM Plus tabletten kunnen eraf, basis-fundament blijft staan.",
    levensstijlAanpassing:
      "Fase 4 van Holistic Reset: overgang naar eigen leefstijl met LOGI-principe en 80/20-regel.",
    notitie:
      "M&P 100 Gold Light is exact dezelfde combinatie als losse Daily BioBasics Light + Proanthenols 100 + OmeGold, maar als bundel €8,50 voordeliger. Aangeraden om als bundel te bestellen.",
  },
];

// ============================================================
// HELPERS — categorie-pakketten
// ============================================================

/**
 * Alle pakketten in een specifieke categorie (3 niveaus).
 */
export function getPakkettenInCategorie(categorie: PakketCategorie): LifeplusPakket[] {
  return LIFEPLUS_PAKKETTEN.filter((p) => p.categorie === categorie);
}

/**
 * Eén specifiek pakket op categorie + niveau.
 */
export function getPakket(
  categorie: PakketCategorie,
  niveau: PakketNiveau,
): LifeplusPakket | undefined {
  return LIFEPLUS_PAKKETTEN.find(
    (p) => p.categorie === categorie && p.niveau === niveau,
  );
}

/**
 * Stable key voor lookup in member_bestellinks tabel.
 * Format: "{categorie}-{niveau}", bijv. "energie-focus-essential".
 */
export function getPakketKey(categorie: PakketCategorie, niveau: PakketNiveau): string {
  return `${categorie}-${niveau}`;
}

// ============================================================
// HELPERS — reset-pakketten
// ============================================================

/**
 * Eén specifiek reset-pakket op key.
 */
export function getResetPakket(key: ResetPakketKey): LifeplusResetPakket | undefined {
  return LIFEPLUS_RESET_PAKKETTEN.find((p) => p.key === key);
}

/**
 * Reset-pakketten beschikbaar voor een specifieke route.
 * "60day" → alleen 60-Day Run-specifieke opstart
 * "regulier" → Darmen in Balans (basis/+) en Holistic Reset (m12/m3)
 */
export function getResetPakkettenVoorRoute(
  route: "60day" | "regulier",
): LifeplusResetPakket[] {
  return LIFEPLUS_RESET_PAKKETTEN.filter(
    (p) => p.route === route || p.route === "beide",
  );
}

// ============================================================
// PROMPT-SECTIE (voor toekomstig coach-gebruik)
// ============================================================

/**
 * Pakketten-prompt-sectie voor LLM (ELEVA Mentor + Product Adviser).
 * Compact, gegroepeerd per categorie, met totaal-prijs én totaal-IP.
 *
 * NB: deze functie wordt momenteel NIET ingezet in de coach-systeem-prompt.
 * Heroverwegen na de 7-dagen sprint of we deze alsnog inkoppelen.
 */
export function bouwPakkettenPromptSectie(): string {
  const niveauLabel: Record<PakketNiveau, string> = {
    essential: "Essential",
    plus: "Plus",
    complete: "Complete",
  };

  const categorieën: PakketCategorie[] = [
    "energie-focus",
    "stress-slaap",
    "afvallen-metabolisme",
    "hormonen",
    "sport-performance",
    "high-performance",
  ];

  const blokken = categorieën.map((cat) => {
    const pakketten = getPakkettenInCategorie(cat);
    if (pakketten.length === 0) return "";
    const label = pakketten[0].categorieLabel;
    const regels = pakketten.map((p) => {
      const prods = p.producten
        .map((pr) => `${pr.naam} (€${pr.asapPrijs.toFixed(2)} / ${pr.ip} IP)`)
        .join(" + ");
      const verz = p.gratisVerzending
        ? "gratis verzending"
        : `+ €${PRIJSLIJST_METADATA.verzendkostenEuro.toFixed(2)} verzending`;
      const notitie = p.notitie ? `\n     ℹ ${p.notitie}` : "";
      return `   • **${niveauLabel[p.niveau]}** — ${prods}\n     Totaal: €${p.totaalPrijs.toFixed(2)} · ${p.totaalIP} IP · ${verz}\n     Waarom: ${p.waarom}\n     Resultaat: ${p.resultaatTijdlijn}${notitie}`;
    });
    return `**${label}**\n${regels.join("\n")}`;
  });

  const resetBlokken = LIFEPLUS_RESET_PAKKETTEN.map((r) => {
    const prods = r.producten.map((pr) => `${pr.naam} (€${pr.asapPrijs.toFixed(2)} / ${pr.ip} IP)`).join(" + ");
    return `**${r.naam}** (${r.duurDagen} dagen, route: ${r.route})\n  ${prods}\n  Totaal: €${r.totaalPrijs.toFixed(2)} · ${r.totaalIP} IP\n  Waarom: ${r.waarom}\n  Levensstijl: ${r.levensstijlAanpassing}`;
  }).join("\n\n");

  return `## LIFEPLUS PAKKETTEN — 6 categorieën × 3 niveaus + 4 reset-pakketten (gevalideerd 27-04-2026)

Gebruik deze pakketten als kant-en-klare aanbeveling. Elk pakket heeft een Essential (instap, 40-100 IP), Plus (uitgebreid, 100-175 IP) en Complete (volledigste, ~200 IP) niveau. Triple Protein Shake heeft vanille als default en chocolade als smaak-optie. Prijzen zijn ASAP (auto-ship). Verzending: gratis vanaf 80 IP, anders €${PRIJSLIJST_METADATA.verzendkostenEuro.toFixed(2)}.

${blokken.join("\n\n")}

### Reset-pakketten

${resetBlokken}

**TIP:** Bij Energy Complete, Stress Complete, Hormonen Complete, Sport Complete en High Performance Complete zit Maintain & Protect 100 Gold Light verstopt — dat is dezelfde bundel als Daily BioBasics Light + Proanthenols 100 + OmeGold maar voordeliger als één pakket besteld.`;
}

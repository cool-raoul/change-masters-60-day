// ============================================================
// PRODUCTADVIES-ZELFTEST — vragen + uitslag-berekening
//
// FLOW:
//   1. Trigger-vraag bovenaan: "Wil je meedoen aan de 60 Day Run?"
//      → ja        = altijd Complete-pakket advies (~200 IP)
//      → nee       = niveau-suggestie op basis van score-intensiteit
//      → weet_niet = idem nee, plus uitleg-blok
//
//   2. Geslacht-vraag: "Ben je een vrouw / man / zeg ik liever niet?"
//      Beïnvloedt:
//       - welke gendered uitspraken zichtbaar zijn
//       - of mannen die in 'hormoonbalans' uitkomen de Mannen Hormoonbalans-
//         pakketten krijgen (Men's Formula i.p.v. Mena Plus)
//      Default bij "zeg-niet" = vrouw-pad volgen.
//
//   3. Prospect beoordeelt elke uitspraak op een 3-puntsschaal:
//      → Niet (0 punten)
//      → Soms (1 punt)
//      → Vaak (2 punten)
//      Gemixt getoond in UI (geen categorie-headers).
//
//   4. Uitslag-berekening:
//      - Tel scores per hoofdcategorie (max 8 per categorie bij 4 vragen × 2)
//      - Categorie met hoogste totaalscore = aanbevolen pakket
//      - Bij gelijkspel: prioriteits-volgorde
//      - 0-2 punten totaal = High Performance als basis-advies
//      - Geslacht-aware mapping voor hormoonbalans
//      - Niveau-suggestie op basis van intensiteit van winnende score:
//          0-8 punten in winnende cat → Essential
//          9-14 punten → Plus
//          15+ punten → Complete
//
//   5. Modifier-categorieën (geven opstart-suggestie naast pakket):
//      - reset-bereidheid (3 vragen, max 6 punten)
//      - darm-signalen (3 vragen, max 6 punten)
//      Triggers voor opstart-suggestie:
//        ≥4 punten darm-signalen → Darmen in Balans als opstart
//        ≥4 punten reset-bereidheid + winnende cat = afvallen → Holistic Reset
//        ≥4 punten reset-bereidheid (geen afvallen) → Darmen in Balans alternatief
//
// PRIVACY-BY-DESIGN:
// Individuele antwoorden worden NIET opgeslagen. Alleen de uitkomst
// (categorie + niveau + pakket_key + opstart-suggestie) gaat naar de DB.
// ============================================================

import type { PakketCategorie, PakketNiveau } from "@/lib/lifeplus/pakketten";
import { mapCategorieVoorGeslacht } from "@/lib/lifeplus/pakketten";

// ============================================================
// TYPES
// ============================================================

export type Trigger60Day = "ja" | "nee" | "weet_niet";

export type Geslacht = "vrouw" | "man" | "zeg-niet";

/** 3-puntsschaal: 0 = laag, 1 = midden, 2 = hoog. Labels variëren per schaal. */
export type Antwoord = 0 | 1 | 2;

/**
 * Schaal-type bepaalt welke labels onder de uitspraak worden getoond.
 *  - frequentie: "Niet / Soms / Vaak" — voor zinnen over hoe vaak iets gebeurt
 *  - herkenning: "Niet echt / Een beetje / Helemaal" — voor zinnen die je herkent of niet
 *  - bereidheid: "Nee / Misschien / Zeker" — voor zinnen over wensen of bereidheid
 */
export type SchaalType = "frequentie" | "herkenning" | "bereidheid";

export type SchaalLabels = {
  laag: string;
  midden: string;
  hoog: string;
};

export const SCHAAL_LABELS: Record<SchaalType, SchaalLabels> = {
  frequentie: { laag: "Niet", midden: "Soms", hoog: "Vaak" },
  herkenning: { laag: "Niet echt", midden: "Een beetje", hoog: "Helemaal" },
  bereidheid: { laag: "Nee", midden: "Misschien", hoog: "Zeker" },
};

/** Hoofdcategorieën die het primaire pakket-advies bepalen. */
export type ZelftestHoofdCategorie = Exclude<PakketCategorie, "mannen-hormoonbalans">;

/** Modifier-categorieën die de opstart-suggestie sturen (reset-programma's). */
export type ZelftestModifierCategorie = "reset-bereidheid" | "darm-signalen";

/** Tag voor uitspraken: hoofdcategorie of modifier. */
export type UitspraakCategorie = ZelftestHoofdCategorie | ZelftestModifierCategorie;

export type ZelftestUitspraak = {
  /** Stable id voor opslag in cliëntside, bijv. "energie-focus-1". */
  id: string;
  categorie: UitspraakCategorie;
  /** De zin die de prospect ziet en beoordeelt. */
  tekst: string;
  /** Welke schaal-labels onder de uitspraak. Default = frequentie. */
  schaal?: SchaalType;
  /** Optioneel: alleen tonen aan dit geslacht. Default = beide. */
  alleenVoor?: Geslacht;
};

export type ZelftestAntwoorden = {
  trigger60day: Trigger60Day;
  geslacht: Geslacht;
  avg_akkoord: boolean;
  /** Map van uitspraak-id → 3-puntsantwoord (0/1/2). */
  responses: Record<string, Antwoord>;
};

/** Mogelijke opstart-suggesties. */
export type OpstartSuggestie =
  | "geen"
  | "darmen-in-balans"
  | "holistic-reset";

export type ZelftestUitslag = {
  /** De uitkomst-categorie (na geslacht-mapping). */
  categorie: PakketCategorie;
  categorieLabel: string;
  /** Niveau-suggestie. 60day = altijd 'complete'; anders op basis van intensiteit. */
  niveau: PakketNiveau;
  /** Stable key naar pakketten.ts voor lookup. */
  pakket_key: string;
  /** Optionele opstart-suggestie (Darmen in Balans of Holistic Reset). */
  opstartSuggestie: OpstartSuggestie;
  /** True als de gebruiker erg lage scores had en automatisch naar High Performance ging. */
  fallback: boolean;
};

// ============================================================
// CATEGORIE-LABELS (voor weergave)
// ============================================================

export const CATEGORIE_LABEL: Record<PakketCategorie, string> = {
  "energie-focus": "Energie & Focus",
  "stress-slaap": "Stress, Slaap & Veerkracht",
  "afvallen-metabolisme": "Afvallen & Metabolisme",
  hormoonbalans: "Hormoonbalans",
  "mannen-hormoonbalans": "Mannen Hormoonbalans",
  "sport-performance": "Sport & Performance",
  "high-performance": "High Performance",
};

// ============================================================
// DE 32 UITSPRAKEN (gemixt getoond in UI, geen categorie-headers)
//
// Verdeling:
//   - Energie & Focus: 4
//   - Stress, Slaap & Veerkracht: 4
//   - Afvallen & Metabolisme: 4
//   - Hormoonbalans: 6 (2 neutraal + 2 vrouw + 2 man → 4 zichtbaar per geslacht)
//   - Sport & Performance: 4
//   - High Performance: 4
//   - Reset-bereidheid (modifier): 3
//   - Darm-signalen (modifier): 3
//
// Per geslacht zichtbaar: 30 uitspraken.
// ============================================================

export const ZELFTEST_UITSPRAKEN: ZelftestUitspraak[] = [
  // 1. Energie & Focus (4)
  { id: "ef-1", categorie: "energie-focus", schaal: "frequentie", tekst: "Mijn middag-energie kalft af terwijl ik nog veel wil." },
  { id: "ef-2", categorie: "energie-focus", schaal: "frequentie", tekst: "Mijn hoofd voelt vol of mistig wanneer ik scherp wil zijn." },
  { id: "ef-3", categorie: "energie-focus", schaal: "frequentie", tekst: "Ik sta op met minder energie dan ik bij mijn nachtrust zou verwachten." },
  { id: "ef-4", categorie: "energie-focus", schaal: "herkenning", tekst: "Ik mis die heldere focus waarmee ik vroeger door mijn dag ging." },

  // 2. Stress, Slaap & Veerkracht (4)
  { id: "ss-1", categorie: "stress-slaap", schaal: "frequentie", tekst: "Mijn brein wil 's avonds niet zo makkelijk uit." },
  { id: "ss-2", categorie: "stress-slaap", schaal: "frequentie", tekst: "Ik ben sneller geïrriteerd dan ik zou willen." },
  { id: "ss-3", categorie: "stress-slaap", schaal: "herkenning", tekst: "Ik zou willen dat ik dieper en aaneengesloten sliep." },
  { id: "ss-4", categorie: "stress-slaap", schaal: "frequentie", tekst: "Ik voel meer onrust van binnen dan ik zou willen." },

  // 3. Afvallen & Metabolisme (4)
  { id: "am-1", categorie: "afvallen-metabolisme", schaal: "herkenning", tekst: "Ik wil afvallen, maar mijn lichaam reageert trager dan vroeger." },
  { id: "am-2", categorie: "afvallen-metabolisme", schaal: "frequentie", tekst: "Ik heb zin in iets zoets vaker dan ik zou willen." },
  { id: "am-3", categorie: "afvallen-metabolisme", schaal: "herkenning", tekst: "Mijn middel of buikomvang gedraagt zich anders dan ik gewend was." },
  { id: "am-4", categorie: "afvallen-metabolisme", schaal: "frequentie", tekst: "Ik schommel meer in honger en verzadiging dan vroeger." },

  // 4. Hormoonbalans (6: 2 neutraal + 2 vrouw + 2 man)
  { id: "hb-1", categorie: "hormoonbalans", schaal: "frequentie", tekst: "Mijn humeur schommelt zonder dat ik er een reden voor kan plaatsen." },
  { id: "hb-2", categorie: "hormoonbalans", schaal: "frequentie", tekst: "Ik voel me huilerig of prikkelbaar zonder duidelijke aanleiding." },
  { id: "hb-3", categorie: "hormoonbalans", schaal: "herkenning", tekst: "Mijn slaap of energie loopt parallel met mijn cyclus of overgang.", alleenVoor: "vrouw" },
  { id: "hb-4", categorie: "hormoonbalans", schaal: "herkenning", tekst: "Ik herken me in PMS, opvliegers of stemmingsschommelingen rond mijn cyclus.", alleenVoor: "vrouw" },
  { id: "hb-5", categorie: "hormoonbalans", schaal: "herkenning", tekst: "Mijn levenslust of vuur is duidelijk minder dan een paar jaar geleden.", alleenVoor: "man" },
  { id: "hb-6", categorie: "hormoonbalans", schaal: "herkenning", tekst: "Ik merk dat mijn kracht of vitaliteit afneemt op een manier die ik niet kan verklaren.", alleenVoor: "man" },

  // 5. Sport & Performance (4)
  { id: "sp-1", categorie: "sport-performance", schaal: "bereidheid", tekst: "Ik wil sneller herstellen tussen trainingen of inspanning." },
  { id: "sp-2", categorie: "sport-performance", schaal: "frequentie", tekst: "Mijn spieren blijven na inspanning langer stijf dan ik zou willen." },
  { id: "sp-3", categorie: "sport-performance", schaal: "bereidheid", tekst: "Ik wil meer kracht of uithouding uit mijn workouts halen." },
  { id: "sp-4", categorie: "sport-performance", schaal: "herkenning", tekst: "Ik train regelmatig en wil dat mijn lichaam beter meebeweegt met wat ik vraag." },

  // 6. High Performance (4)
  { id: "hp-1", categorie: "high-performance", schaal: "herkenning", tekst: "Ik voel me oké, maar weet dat er meer uit te halen valt." },
  { id: "hp-2", categorie: "high-performance", schaal: "bereidheid", tekst: "Ik wil mijn lichaam goed onderhouden voor de lange termijn." },
  { id: "hp-3", categorie: "high-performance", schaal: "herkenning", tekst: "Ik investeer graag in mezelf, ook zonder dat er een specifiek probleem speelt." },
  { id: "hp-4", categorie: "high-performance", schaal: "herkenning", tekst: "Ik herken me niet sterk in andere uitspraken, maar wil mijn vitaliteit op peil houden." },

  // 7. Reset-bereidheid (modifier, 3)
  { id: "rb-1", categorie: "reset-bereidheid", schaal: "bereidheid", tekst: "Ik ben bereid om een aantal weken stevig met mijn voedingspatroon aan de slag te gaan." },
  { id: "rb-2", categorie: "reset-bereidheid", schaal: "herkenning", tekst: "Eerdere pogingen om iets te veranderen liepen vast omdat ik te halfslachtig was." },
  { id: "rb-3", categorie: "reset-bereidheid", schaal: "bereidheid", tekst: "Ik ben klaar om eens echt door te pakken, ook als het tijdelijk wat ongemakkelijk voelt." },

  // 8. Darm-signalen (modifier, 3)
  { id: "ds-1", categorie: "darm-signalen", schaal: "herkenning", tekst: "Ik voel dat mijn lichaam wel toe is aan een opfrissing van binnenuit." },
  { id: "ds-2", categorie: "darm-signalen", schaal: "frequentie", tekst: "Mijn spijsvertering verloopt niet altijd even soepel." },
  { id: "ds-3", categorie: "darm-signalen", schaal: "bereidheid", tekst: "Ik wil een schone start maken voor mijn vitaliteit." },
];

// ============================================================
// PRIORITEITS-VOLGORDE bij gelijkspel
// ============================================================

const PRIORITEIT: ZelftestHoofdCategorie[] = [
  "stress-slaap",
  "afvallen-metabolisme",
  "hormoonbalans",
  "energie-focus",
  "sport-performance",
  "high-performance",
];

// ============================================================
// HOOFD-CATEGORIE OVER ALLE UITSPRAKEN
// ============================================================

const HOOFD_CATEGORIEEN: ZelftestHoofdCategorie[] = [
  "energie-focus",
  "stress-slaap",
  "afvallen-metabolisme",
  "hormoonbalans",
  "sport-performance",
  "high-performance",
];

// ============================================================
// UITSLAG-BEREKENING
// ============================================================

/**
 * Bereken op basis van de antwoorden (0/1/2 per uitspraak):
 *  - Welke hoofdcategorie het meeste resoneert
 *  - Welk niveau (Essential/Plus/Complete) past bij de intensiteit
 *  - Of er een opstart-suggestie nodig is (Darmen in Balans of Holistic Reset)
 *
 * Bewust geen scores per categorie in de output (privacy by design).
 */
export function berekenUitslag(antwoorden: ZelftestAntwoorden): ZelftestUitslag {
  // Initialiseer scores
  const hoofdScores: Record<ZelftestHoofdCategorie, number> = {
    "energie-focus": 0,
    "stress-slaap": 0,
    "afvallen-metabolisme": 0,
    hormoonbalans: 0,
    "sport-performance": 0,
    "high-performance": 0,
  };

  const modifierScores: Record<ZelftestModifierCategorie, number> = {
    "reset-bereidheid": 0,
    "darm-signalen": 0,
  };

  // Tel scores
  for (const uitspraak of ZELFTEST_UITSPRAKEN) {
    const punt = antwoorden.responses[uitspraak.id] ?? 0;
    if (uitspraak.categorie === "reset-bereidheid" || uitspraak.categorie === "darm-signalen") {
      modifierScores[uitspraak.categorie] += punt;
    } else {
      hoofdScores[uitspraak.categorie] += punt;
    }
  }

  // Totaal hoofdscore voor fallback-detectie
  const totaalHoofdscore = Object.values(hoofdScores).reduce((s, n) => s + n, 0);

  // Bepaal niveau alvast
  // 60-day = altijd Complete; anders Plus als default, Complete bij sterke
  // herkenning. Essential is NOOIT de standaard-suggestie (zou prospects naar
  // de laagste optie sturen — wij willen dat ze bewust kiezen, en de meeste
  // mensen kiezen psychologisch voor de middelste optie).

  // Vind hoofdcategorie met hoogste score (bij gelijkspel: prioriteits-volgorde)
  let beste: ZelftestHoofdCategorie = "high-performance";
  let besteScore = -1;
  for (const cat of PRIORITEIT) {
    if (hoofdScores[cat] > besteScore) {
      besteScore = hoofdScores[cat];
      beste = cat;
    }
  }

  // Diagnostische log voor productie-debugging. Lichtgewicht — alleen
  // de getallen, geen individuele antwoorden (privacy).
  console.log("[berekenUitslag]", {
    totaalHoofdscore,
    besteScore,
    beste,
    hoofdScores,
    modifierScores,
    trigger60day: antwoorden.trigger60day,
    geslacht: antwoorden.geslacht,
  });

  // Fallback bij lage signal-sterkte:
  //  - Totaal hoofdscore zegt te weinig (gemiddeld weinig herkenning)
  //  - OF de winnende categorie heeft te weinig punten (geen duidelijke winnaar)
  // In beide gevallen: high-performance als veilige default. Voorkomt dat
  // iemand die alle 'Niet' aanklikt toch een specifiek niche-pakket krijgt.
  const FALLBACK_TOTAAL_DREMPEL = 4;
  const WINST_MIN_DREMPEL = 4;
  if (
    totaalHoofdscore <= FALLBACK_TOTAAL_DREMPEL ||
    besteScore < WINST_MIN_DREMPEL
  ) {
    const niveau: PakketNiveau = antwoorden.trigger60day === "ja" ? "complete" : "plus";
    return {
      categorie: "high-performance",
      categorieLabel: CATEGORIE_LABEL["high-performance"],
      niveau,
      pakket_key: `high-performance-${niveau}`,
      opstartSuggestie: bepaalOpstartSuggestie(modifierScores, "high-performance"),
      fallback: true,
    };
  }

  // Niveau-suggestie:
  //  - 60-day (trigger='ja') → altijd Complete
  //  - Heel sterke herkenning (≥8 van max 8 in winnende categorie, dus alle
  //    vragen op 'Vaak/Helemaal/Zeker') → Complete
  //  - Anders → Plus (default, ankereffect)
  // Essential komt nooit als suggestie, maar staat wel zichtbaar voor wie
  // bewust voor een lichtere instap kiest.
  const niveau: PakketNiveau =
    antwoorden.trigger60day === "ja" || besteScore >= 8
      ? "complete"
      : "plus";

  // Geslacht-mapping (man + hormoonbalans → mannen-hormoonbalans)
  const finaleCategorie = mapCategorieVoorGeslacht(beste, antwoorden.geslacht);

  return {
    categorie: finaleCategorie,
    categorieLabel: CATEGORIE_LABEL[finaleCategorie],
    niveau,
    pakket_key: `${finaleCategorie}-${niveau}`,
    opstartSuggestie: bepaalOpstartSuggestie(modifierScores, beste),
    fallback: false,
  };
}

/**
 * Bepaal welke opstart-suggestie past op basis van modifier-scores.
 *
 * Drempel = 4 van max 6 punten = duidelijke herkenning vereist.
 * Met de nieuwe schaal-types werkt dit zo:
 *  - 3× "Misschien" = 3 punten (geen trigger)
 *  - 2× "Misschien" + 1× "Zeker" = 4 punten (trigger)
 *  - 2× "Zeker" + 1× "Niet" = 4 punten (trigger)
 *  - 3× "Zeker" = 6 punten (volle trigger)
 *
 * Regels:
 *  - ≥4 darm-signalen punten → Darmen in Balans
 *  - ≥4 reset-bereidheid punten + winnende cat = afvallen → Holistic Reset
 *  - ≥4 reset-bereidheid (geen afvallen) → Darmen in Balans als alternatief
 *  - Anders → geen opstart-suggestie
 */
function bepaalOpstartSuggestie(
  modifierScores: Record<ZelftestModifierCategorie, number>,
  hoofdcategorie: ZelftestHoofdCategorie,
): OpstartSuggestie {
  const darmHoog = modifierScores["darm-signalen"] >= 4;
  const resetBereidHoog = modifierScores["reset-bereidheid"] >= 4;

  if (resetBereidHoog && hoofdcategorie === "afvallen-metabolisme") {
    return "holistic-reset";
  }
  if (darmHoog) {
    return "darmen-in-balans";
  }
  if (resetBereidHoog) {
    return "darmen-in-balans";
  }
  return "geen";
}

// ============================================================
// HELPERS — uitspraken filteren / shufflen
// ============================================================

/**
 * Geeft de uitspraken die getoond moeten worden aan een prospect met
 * dit geslacht. Vrouw-specifieke vragen worden niet aan mannen getoond,
 * en vice versa. Bij "zeg-niet" tonen we de gender-neutrale set + de
 * vrouw-specifieke vragen (default vrouw-pad).
 */
export function getZichtbareUitspraken(geslacht: Geslacht): ZelftestUitspraak[] {
  return ZELFTEST_UITSPRAKEN.filter((u) => {
    if (!u.alleenVoor) return true;
    if (geslacht === "zeg-niet") return u.alleenVoor === "vrouw";
    return u.alleenVoor === geslacht;
  });
}

/**
 * Schud de uitspraken in een vaste deterministische volgorde door elkaar
 * (op basis van token zodat iedere prospect dezelfde volgorde ziet voor
 * dezelfde test). Vermijdt categorie-headers in de UI.
 */
export function shuffleUitspraken(
  uitspraken: ZelftestUitspraak[],
  seed: string,
): ZelftestUitspraak[] {
  const result = [...uitspraken];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  let state = Math.abs(hash) || 1;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

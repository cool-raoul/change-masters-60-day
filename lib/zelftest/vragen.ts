// ============================================================
// PRODUCTADVIES-ZELFTEST — vragen + uitslag-berekening
//
// Flow:
//   1. Trigger-vraag bovenaan: "Wil je meedoen aan de 60 Day Run?"
//      → ja        = Complete-pakket advies (~200 IP)
//      → nee       = Essential / Plus / Complete keuze
//      → weet_niet = Essential / Plus / Complete keuze (+ uitleg-blok)
//
//   2. Geslacht-vraag: "Ben je een vrouw / man / zeg ik liever niet?"
//      Beïnvloedt:
//       - welke gendered uitspraken zichtbaar zijn
//       - of mannen die in 'hormoonbalans' uitkomen de Mannen Hormoonbalans-
//         pakketten krijgen (Men's Formula i.p.v. Mena Plus)
//
//   3. Prospect vinkt aan welke uitspraken voor hem/haar gelden.
//      Vragen worden gemixt getoond (geen categorie-headers in UI).
//
//   4. Uitslag-berekening:
//      - Tel vinkjes per categorie
//      - Categorie met meeste vinkjes = aanbevolen pakket
//      - Bij gelijkspel: hoogste prioriteit (zie volgorde hieronder)
//      - 0-1 vinkjes totaal = High Performance als basis-advies
//      - Geslacht-aware mapping voor hormoonbalans
// ============================================================

import type { PakketCategorie, PakketNiveau } from "@/lib/lifeplus/pakketten";
import { mapCategorieVoorGeslacht } from "@/lib/lifeplus/pakketten";

// ============================================================
// TYPES
// ============================================================

export type Trigger60Day = "ja" | "nee" | "weet_niet";

export type Geslacht = "vrouw" | "man" | "zeg-niet";

/** Subset van PakketCategorie voor zelftest-tagging (zonder mannen-hormoonbalans
 *  want dat is een uitkomst-mapping, geen vraag-tag). */
export type ZelftestCategorie = Exclude<PakketCategorie, "mannen-hormoonbalans">;

export type ZelftestUitspraak = {
  /** Stable id voor opslag, bijv. "energie-focus-1" */
  id: string;
  categorie: ZelftestCategorie;
  /** De zin die de prospect ziet en aanvinkt. */
  tekst: string;
  /** Optioneel: alleen tonen aan dit geslacht. Default = beide. */
  alleenVoor?: Geslacht;
};

export type ZelftestAntwoorden = {
  trigger60day: Trigger60Day;
  geslacht: Geslacht;
  avg_akkoord: boolean;
  /** Map van uitspraak-id → aangevinkt (true / false). */
  aangevinkt: Record<string, boolean>;
};

export type ZelftestUitslag = {
  /** De uitkomst-categorie (na geslacht-mapping voor hormoonbalans). */
  categorie: PakketCategorie;
  categorieLabel: string;
  /** Niveau dat we adviseren: 60 day = altijd 'complete', anders default 'plus'. */
  niveau: PakketNiveau;
  /** Stable key naar pakketten.ts voor lookup. */
  pakket_key: string;
  /** Tellingen per categorie voor transparantie. */
  scores: Record<ZelftestCategorie, number>;
  /** True als de gebruiker 0-1 vinkjes had en automatisch naar High Performance ging. */
  fallback: boolean;
};

// ============================================================
// DE 18 UITSPRAKEN (3 per categorie, gemixt getoond in UI)
//
// LET OP: deze vragen worden in een volgende iteratie herontworpen om
// minder voorspelbaar te zijn. Voor nu blijft de structuur staan.
// ============================================================

export const ZELFTEST_UITSPRAKEN: ZelftestUitspraak[] = [
  // 1. Energie & Focus
  {
    id: "energie-focus-1",
    categorie: "energie-focus",
    tekst: "Ik val 's middags compleet stil rond een uur of drie",
  },
  {
    id: "energie-focus-2",
    categorie: "energie-focus",
    tekst: "Ik kan me steeds slechter concentreren, mijn hoofd voelt mistig",
  },
  {
    id: "energie-focus-3",
    categorie: "energie-focus",
    tekst: "Ik sta al moe op, terwijl ik wel heb geslapen",
  },

  // 2. Stress, Slaap & Veerkracht
  {
    id: "stress-slaap-1",
    categorie: "stress-slaap",
    tekst: "Ik tob 's nachts en val moeilijk in slaap",
  },
  {
    id: "stress-slaap-2",
    categorie: "stress-slaap",
    tekst: "Ik voel me vaak gespannen of overprikkeld",
  },
  {
    id: "stress-slaap-3",
    categorie: "stress-slaap",
    tekst: "Ik word vroeg wakker en kom niet meer in slaap",
  },

  // 3. Afvallen & Metabolisme
  {
    id: "afvallen-metabolisme-1",
    categorie: "afvallen-metabolisme",
    tekst: "Ik wil afvallen maar het lukt niet meer zoals vroeger",
  },
  {
    id: "afvallen-metabolisme-2",
    categorie: "afvallen-metabolisme",
    tekst: "Ik heb steeds zin in zoet of snaai-buien tussendoor",
  },
  {
    id: "afvallen-metabolisme-3",
    categorie: "afvallen-metabolisme",
    tekst: "Mijn buikomvang neemt toe terwijl ik niet anders eet dan vroeger",
  },

  // 4. Hormoonbalans
  {
    id: "hormoonbalans-1",
    categorie: "hormoonbalans",
    tekst:
      "Mijn cyclus of overgang speelt me parten (PMS, opvliegers, stemmingsschommelingen)",
    alleenVoor: "vrouw",
  },
  {
    id: "hormoonbalans-2",
    categorie: "hormoonbalans",
    tekst: "Ik voel me vaker prikkelbaar of huilerig zonder duidelijke reden",
  },
  {
    id: "hormoonbalans-3",
    categorie: "hormoonbalans",
    tekst: "Mijn slaap of energie zit gekoppeld aan mijn cyclus of overgang",
    alleenVoor: "vrouw",
  },

  // 5. Sport & Performance
  {
    id: "sport-performance-1",
    categorie: "sport-performance",
    tekst: "Ik train regelmatig en wil sneller herstellen tussen sessies",
  },
  {
    id: "sport-performance-2",
    categorie: "sport-performance",
    tekst: "Mijn spieren blijven na trainingen lang stijf of pijnlijk",
  },
  {
    id: "sport-performance-3",
    categorie: "sport-performance",
    tekst: "Ik wil meer uithouding of kracht halen uit mijn workouts",
  },

  // 6. High Performance
  {
    id: "high-performance-1",
    categorie: "high-performance",
    tekst: "Ik voel me oké, maar wil meer uit mezelf halen",
  },
  {
    id: "high-performance-2",
    categorie: "high-performance",
    tekst: "Ik wil mijn lichaam goed onderhouden voor de lange termijn",
  },
  {
    id: "high-performance-3",
    categorie: "high-performance",
    tekst:
      "Ik herken mezelf niet sterk in de andere uitspraken, maar wil wel investeren in mijn vitaliteit",
  },
];

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
// PRIORITEITS-VOLGORDE bij gelijkspel
// ============================================================

const PRIORITEIT: ZelftestCategorie[] = [
  "stress-slaap",
  "afvallen-metabolisme",
  "hormoonbalans",
  "energie-focus",
  "sport-performance",
  "high-performance",
];

// ============================================================
// UITSLAG-BEREKENING
// ============================================================

/**
 * Bereken op basis van de antwoorden welke categorie + niveau het advies wordt.
 *
 * Regels:
 * - Tel vinkjes per categorie
 * - Categorie met meeste vinkjes wint
 * - Bij gelijkspel: prioriteits-volgorde (stress > afvallen > hormoon > energie > sport > high-perf)
 * - 0-1 vinkjes totaal: fallback naar High Performance
 * - Niveau-keuze: trigger_60day = 'ja' → 'complete'; anders → 'plus' (default)
 * - Geslacht-mapping: man + hormoonbalans → mannen-hormoonbalans
 */
export function berekenUitslag(antwoorden: ZelftestAntwoorden): ZelftestUitslag {
  // Tel vinkjes per categorie
  const scores: Record<ZelftestCategorie, number> = {
    "energie-focus": 0,
    "stress-slaap": 0,
    "afvallen-metabolisme": 0,
    hormoonbalans: 0,
    "sport-performance": 0,
    "high-performance": 0,
  };

  for (const uitspraak of ZELFTEST_UITSPRAKEN) {
    if (antwoorden.aangevinkt[uitspraak.id]) {
      scores[uitspraak.categorie] += 1;
    }
  }

  const totaalVinkjes = Object.values(scores).reduce((s, n) => s + n, 0);

  const niveau: PakketNiveau =
    antwoorden.trigger60day === "ja" ? "complete" : "plus";

  // Fallback bij weinig vinkjes
  if (totaalVinkjes <= 1) {
    return {
      categorie: "high-performance",
      categorieLabel: CATEGORIE_LABEL["high-performance"],
      niveau,
      pakket_key: `high-performance-${niveau}`,
      scores,
      fallback: true,
    };
  }

  // Vind de categorie met de hoogste score; bij gelijkspel: prioriteits-volgorde
  let beste: ZelftestCategorie = "high-performance";
  let besteScore = -1;

  for (const cat of PRIORITEIT) {
    if (scores[cat] > besteScore) {
      besteScore = scores[cat];
      beste = cat;
    }
  }

  // Geslacht-mapping voor hormoonbalans (man → mannen-hormoonbalans)
  const finaleCategorie = mapCategorieVoorGeslacht(beste, antwoorden.geslacht);

  return {
    categorie: finaleCategorie,
    categorieLabel: CATEGORIE_LABEL[finaleCategorie],
    niveau,
    pakket_key: `${finaleCategorie}-${niveau}`,
    scores,
    fallback: false,
  };
}

// ============================================================
// HELPERS — uitspraken filteren / groeperen
// ============================================================

/**
 * Geeft de uitspraken die getoond moeten worden aan een prospect met
 * dit geslacht. Vrouw-specifieke vragen worden niet aan mannen getoond,
 * en vice versa. Bij "zeg-niet" tonen we de gender-neutrale set + de
 * vrouw-specifieke vragen (statistisch gezien grootste groep).
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
  // Fisher-Yates shuffle met seeded random
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

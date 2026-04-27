// ============================================================
// PRODUCTADVIES-ZELFTEST — vragen + uitslag-berekening
//
// Flow:
//   1. Trigger-vraag bovenaan: "Wil je meedoen aan de 60 Day Run?"
//      → ja        = Complete-pakket advies (~200 IP)
//      → nee       = Essential / Plus / Complete keuze
//      → weet_niet = Essential / Plus / Complete keuze (+ uitleg-blok)
//
//   2. Prospect vinkt aan welke uitspraken voor hem/haar gelden.
//      Per categorie 3 uitspraken; in totaal 18 uitspraken.
//
//   3. Uitslag-berekening:
//      - Tel vinkjes per categorie
//      - Categorie met meeste vinkjes = aanbevolen pakket
//      - Bij gelijkspel: hoogste prioriteit (zie volgorde hieronder)
//      - 0-1 vinkjes totaal = High Performance als basis-advies
// ============================================================

import type { PakketCategorie, PakketNiveau } from "@/lib/lifeplus/pakketten";

// ============================================================
// TYPES
// ============================================================

export type Trigger60Day = "ja" | "nee" | "weet_niet";

export type ZelftestUitspraak = {
  /** Stable id voor opslag, bijv. "energie-focus-1" */
  id: string;
  categorie: PakketCategorie;
  /** De zin die de prospect ziet en aanvinkt. */
  tekst: string;
};

export type ZelftestAntwoorden = {
  trigger60day: Trigger60Day;
  avg_akkoord: boolean;
  /** Map van uitspraak-id → aangevinkt (true / false). */
  aangevinkt: Record<string, boolean>;
};

export type ZelftestUitslag = {
  /** De uitkomst-categorie waar de meeste vinkjes vielen. */
  categorie: PakketCategorie;
  categorieLabel: string;
  /** Niveau dat we adviseren: 60 day = altijd 'complete', anders default 'plus'. */
  niveau: PakketNiveau;
  /** Stable key naar pakketten.ts voor lookup. */
  pakket_key: string;
  /** Tellingen per categorie voor transparantie. */
  scores: Record<PakketCategorie, number>;
  /** True als de gebruiker 0-1 vinkjes had en automatisch naar High Performance ging. */
  fallback: boolean;
};

// ============================================================
// DE 18 UITSPRAKEN (3 per categorie)
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

  // 4. Hormonale Balans
  {
    id: "hormonen-1",
    categorie: "hormonen",
    tekst:
      "Mijn cyclus of overgang speelt me parten (PMS, opvliegers, stemmingsschommelingen)",
  },
  {
    id: "hormonen-2",
    categorie: "hormonen",
    tekst: "Ik voel me vaker prikkelbaar of huilerig zonder duidelijke reden",
  },
  {
    id: "hormonen-3",
    categorie: "hormonen",
    tekst: "Mijn slaap of energie zit gekoppeld aan mijn cyclus of overgang",
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
  hormonen: "Hormonale Balans",
  "sport-performance": "Sport & Performance",
  "high-performance": "High Performance",
};

// ============================================================
// PRIORITEITS-VOLGORDE bij gelijkspel
//
// Logica: bij gelijke score kiezen we de categorie met de meest urgente
// klacht. Iemand met evenveel vinkjes bij Stress en High Performance
// krijgt een Stress-advies, want stress-klachten vragen sneller om
// concrete actie.
// ============================================================

const PRIORITEIT: PakketCategorie[] = [
  "stress-slaap", // urgentste signaal (slaap, burn-out preventie)
  "afvallen-metabolisme",
  "hormonen",
  "energie-focus",
  "sport-performance",
  "high-performance", // laatste want = "ik doe het al goed"
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
 * - Bij gelijkspel: prioriteits-volgorde (stress > afvallen > hormonen > energie > sport > high-perf)
 * - 0-1 vinkjes totaal: fallback naar High Performance
 * - Niveau-keuze: trigger_60day = 'ja' → 'complete'; anders → 'plus' (default)
 */
export function berekenUitslag(antwoorden: ZelftestAntwoorden): ZelftestUitslag {
  // Tel vinkjes per categorie
  const scores: Record<PakketCategorie, number> = {
    "energie-focus": 0,
    "stress-slaap": 0,
    "afvallen-metabolisme": 0,
    hormonen: 0,
    "sport-performance": 0,
    "high-performance": 0,
  };

  for (const uitspraak of ZELFTEST_UITSPRAKEN) {
    if (antwoorden.aangevinkt[uitspraak.id]) {
      scores[uitspraak.categorie] += 1;
    }
  }

  const totaalVinkjes = Object.values(scores).reduce((s, n) => s + n, 0);

  // Fallback bij weinig vinkjes
  if (totaalVinkjes <= 1) {
    return {
      categorie: "high-performance",
      categorieLabel: CATEGORIE_LABEL["high-performance"],
      niveau: antwoorden.trigger60day === "ja" ? "complete" : "plus",
      pakket_key: `high-performance-${antwoorden.trigger60day === "ja" ? "complete" : "plus"}`,
      scores,
      fallback: true,
    };
  }

  // Vind de categorie met de hoogste score; bij gelijkspel: prioriteits-volgorde
  let beste: PakketCategorie = "high-performance";
  let besteScore = -1;

  for (const cat of PRIORITEIT) {
    if (scores[cat] > besteScore) {
      besteScore = scores[cat];
      beste = cat;
    }
  }

  const niveau: PakketNiveau =
    antwoorden.trigger60day === "ja" ? "complete" : "plus";

  return {
    categorie: beste,
    categorieLabel: CATEGORIE_LABEL[beste],
    niveau,
    pakket_key: `${beste}-${niveau}`,
    scores,
    fallback: false,
  };
}

// ============================================================
// HELPERS — uitspraken groeperen voor weergave
// ============================================================

/**
 * Geeft uitspraken gegroepeerd per categorie terug, zodat de UI ze
 * netjes per categorie kan renderen.
 */
export function groepeerUitsprakenPerCategorie(): Array<{
  categorie: PakketCategorie;
  label: string;
  uitspraken: ZelftestUitspraak[];
}> {
  const categorieën: PakketCategorie[] = [
    "energie-focus",
    "stress-slaap",
    "afvallen-metabolisme",
    "hormonen",
    "sport-performance",
    "high-performance",
  ];

  return categorieën.map((cat) => ({
    categorie: cat,
    label: CATEGORIE_LABEL[cat],
    uitspraken: ZELFTEST_UITSPRAKEN.filter((u) => u.categorie === cat),
  }));
}

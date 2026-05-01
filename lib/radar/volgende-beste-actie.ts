import { differenceInDays } from "date-fns";

// ============================================================
// volgende-beste-actie.ts, scoring-engine voor de dashboard-radar.
//
// Doel: bepaal de top-3 prospects waar de member vandaag het meest
// momentum kan oogsten. Geen random shuffle, geen alfabetisch:
// concrete signalen + funnel-gewicht.
//
// Scoring-componenten (alle in punten):
//
//  1. PIPELINE-FASE
//     - prospect:    +0   (onbenaderd, lage urgentie)
//     - uitgenodigd: +15  (wacht op reactie, na 2 dagen oppakken)
//     - one_pager:   +30  (heeft test gedaan, hoog warm)
//     - presentatie: +35  (vlak voor closing)
//     - followup:    +40  (klaar voor sluiting)
//     - not_yet:     +5   (later opnieuw, lage urgentie nu)
//     - shopper:     +10  (productherbestelling-trigger)
//     - member:      +5   (relatie-onderhoud)
//
//  2. RECENT SIGNAAL (laatste 7 dagen)
//     - Film afgekeken:        +25 (super-warm, onmiddellijk!)
//     - Productadvies-test ingevuld: +20
//     - Open herinnering vandaag/gisteren: +15
//     - Open herinnering deze week:        +8
//
//  3. STILTE-TIJD (re-engagement-trigger)
//     - 5-9 dagen stil:   +5
//     - 10-20 dagen stil: +10 (sweet spot voor re-engagement)
//     - 21+ dagen stil:   +3 (kouder, lager)
//     - 0-4 dagen stil:   +0 (recent contact, niet pushen)
//
// Top-3 = hoogste scores. Bij gelijkstand: meest recente signaal wint.
// ============================================================

export type ProspectInput = {
  id: string;
  volledige_naam: string;
  telefoon: string | null;
  pipeline_fase: string;
  laatste_contact: string | null;
  /** Heeft een open herinnering, oudste vervaldatum (ISO of null). */
  oudsteHerinneringDatum: string | null;
  /** Aantal dagen sinds laatste film-afkijken (null = nooit/niet recent). */
  dagenSindsFilmAfgekeken: number | null;
  /** Aantal dagen sinds productadvies-test ingevuld (null = nooit). */
  dagenSindsTestIngevuld: number | null;
};

export type RadarItem = {
  prospect: ProspectInput;
  score: number;
  redenen: string[]; // human-readable, max 2 voor UI
};

const FASE_GEWICHT: Record<string, number> = {
  prospect: 0,
  uitgenodigd: 15,
  one_pager: 30,
  presentatie: 35,
  followup: 40,
  not_yet: 5,
  shopper: 10,
  member: 5,
};

function dagenStil(laatsteContact: string | null): number {
  if (!laatsteContact) return 999;
  return Math.max(0, differenceInDays(new Date(), new Date(laatsteContact)));
}

function dagenSindsHerinnering(datum: string | null): number | null {
  if (!datum) return null;
  return differenceInDays(new Date(), new Date(datum));
}

export function scoorProspect(p: ProspectInput): RadarItem {
  let score = 0;
  const redenen: string[] = [];

  // 1. Fase-gewicht
  const faseScore = FASE_GEWICHT[p.pipeline_fase] ?? 0;
  score += faseScore;
  if (faseScore >= 30) {
    redenen.push(`In fase: ${p.pipeline_fase.replace("_", " ")}`);
  }

  // 2. Recent signaal
  if (p.dagenSindsFilmAfgekeken !== null && p.dagenSindsFilmAfgekeken <= 7) {
    score += 25;
    redenen.push(
      p.dagenSindsFilmAfgekeken === 0
        ? "Heeft je film vandaag afgekeken"
        : `Film afgekeken ${p.dagenSindsFilmAfgekeken}d geleden`,
    );
  }
  if (p.dagenSindsTestIngevuld !== null && p.dagenSindsTestIngevuld <= 7) {
    score += 20;
    redenen.push(
      p.dagenSindsTestIngevuld === 0
        ? "Heeft vandaag de productadvies-test ingevuld"
        : `Test ingevuld ${p.dagenSindsTestIngevuld}d geleden`,
    );
  }

  // Open herinnering
  const herinneringDagen = dagenSindsHerinnering(p.oudsteHerinneringDatum);
  if (herinneringDagen !== null) {
    if (herinneringDagen >= -1) {
      // vandaag of gisteren al verlopen
      score += 15;
      redenen.push(
        herinneringDagen <= 0
          ? "Open herinnering staat vandaag"
          : `Herinnering ${herinneringDagen}d te laat`,
      );
    } else if (herinneringDagen >= -7) {
      score += 8;
      redenen.push("Open herinnering deze week");
    }
  }

  // 3. Stilte-tijd, re-engagement-trigger
  const stil = dagenStil(p.laatste_contact);
  if (stil >= 10 && stil <= 20) {
    score += 10;
    redenen.push(`${stil} dagen stil — re-engagement-tijd`);
  } else if (stil >= 5 && stil <= 9) {
    score += 5;
  } else if (stil >= 21 && stil < 60) {
    score += 3;
  }

  return { prospect: p, score, redenen: redenen.slice(0, 2) };
}

/**
 * Geeft de top-N prospects, gesorteerd op hoogste score.
 * Filtert items met score < 5 (te weinig signaal om aan te bevelen).
 */
export function pakTopRadar(
  prospects: ProspectInput[],
  topN: number = 3,
): RadarItem[] {
  return prospects
    .map(scoorProspect)
    .filter((item) => item.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

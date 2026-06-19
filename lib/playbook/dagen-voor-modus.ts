import type { Modus } from "@/lib/onboarding/voltooiingen";
import { DAGEN } from "./dagen";
import {
  genereerVerankeringsDag,
  genereerLifetimeDag,
} from "./core-dagen";
import { CORE_V9_STAPPEN } from "./core-dagen-v9";
import type { Dag } from "./types";

// ============================================================
// dagen-voor-modus.ts, één bron voor modus-bewuste dag-info.
//
// Vier helpers:
//   - dagVoorModusEnNummer: geef het Dag-object voor (modus, nummer)
//   - maxDagVoorModus: maximaal zinvol dag-nummer
//   - topbarLabelVoorModus: tekst voor de Topbar-cirkel
//   - voortgangPercentageVoorModus: voor de voortgangsbalk (0-100)
//
// Pro heeft geen dag-flow in deze pilot, alleen een 14-stappen
// leerpad. Helpers retourneren null/0/passende string voor Pro.
// ============================================================

/** Geeft het juiste Dag-object voor (modus, dag-nummer). */
export function dagVoorModusEnNummer(
  modus: Modus,
  dagNummer: number,
): Dag | null {
  if (modus === "core") {
    if (dagNummer <= 21) {
      // V9-stappen: dezelfde array die /vandaag toont (consistent met de
      // voortgang-berekening in bereken-dag.ts).
      return CORE_V9_STAPPEN.find((d) => d.nummer === dagNummer) ?? null;
    }
    if (dagNummer <= 40) return genereerVerankeringsDag(dagNummer);
    return genereerLifetimeDag(dagNummer);
  }
  if (modus === "sprint") {
    return DAGEN.find((d) => d.nummer === dagNummer) ?? null;
  }
  return null; // Pro heeft geen dag-flow
}

/** Maximum zinvol dag-nummer voor de modus. */
export function maxDagVoorModus(modus: Modus): number {
  if (modus === "core") return 999; // lifetime gaat door
  if (modus === "sprint") return 60;
  return 0; // Pro doet niet mee in dag-flow
}

/** Tekst voor de Topbar-cirkel-tooltip / desktop-label. */
export function topbarLabelVoorModus(
  modus: Modus,
  dagNummer: number,
  proStap?: number,
): string {
  if (modus === "core") {
    if (dagNummer <= 40) return `Dag ${dagNummer} opstart`;
    return `Lifetime dag ${dagNummer}`;
  }
  if (modus === "sprint") return `Dag ${dagNummer} van 60`;
  if (modus === "pro") {
    const stap = proStap ?? 1;
    return `Stap ${stap} van 14`;
  }
  return `Dag ${dagNummer}`;
}

/** Voortgangs-percentage voor de Topbar-balk (0-100). */
export function voortgangPercentageVoorModus(
  modus: Modus,
  dagNummer: number,
  proStap?: number,
): number {
  if (modus === "core") {
    if (dagNummer <= 40) return Math.round((dagNummer / 40) * 100);
    return 100; // opstart voltooid, lifetime actief
  }
  if (modus === "sprint") return Math.round((dagNummer / 60) * 100);
  if (modus === "pro") {
    const stap = proStap ?? 1;
    return Math.round((stap / 14) * 100);
  }
  return 0;
}

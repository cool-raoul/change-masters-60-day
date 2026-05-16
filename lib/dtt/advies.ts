import { type Bracket, BRACKETS } from "./brackets";

// ============================================================
// DTT-input naar bracket-bepaling. Op basis van uren_per_week.
// ============================================================

export type DTTInput = {
  doel_per_maand: number;
  uren_per_week: number;
  termijn_maanden: number;
};

export function bracketVoorUren(urenPerWeek: number): Bracket {
  if (urenPerWeek < 3) return "minimaal";
  if (urenPerWeek < 6) return "rustig";
  if (urenPerWeek < 10) return "gestaag";
  if (urenPerWeek < 16) return "serieus";
  return "doorpakken";
}

export function bracketVoorDTT(dtt: DTTInput | null): Bracket {
  if (!dtt) return "rustig"; // veilige default
  return bracketVoorUren(dtt.uren_per_week);
}

export function dmoMinimumsVoorDTT(dtt: DTTInput | null) {
  return BRACKETS[bracketVoorDTT(dtt)].dmoMinimums;
}

// ============================================================
// lib/radar/kennis-niveau.ts
//
// Bepaalt welke pipeline-fases boven het kennis-niveau van een
// specifieke dag liggen. Wordt gebruikt door RadarBalk om items
// een amber rand + 'leer dit eerst' tekst + Mentor-knop te geven.
//
// Tabel:
//   Dag 1-4   bekend: prospect, in_gesprek
//                     boven-kennis: uitgenodigd, one_pager, followup,
//                                   presentatie
//   Dag 5     + uitgenodigd
//   Dag 6     + one_pager, followup
//   Dag 7-9   + presentatie
//   Dag 10+   alles bekend
//
// Code-only (geen CMS-veld) — founder past 'm aan via PR.
// ============================================================

const FASES_BEKEND_PER_DAG: Record<number, string[]> = {
  1: ["prospect", "in_gesprek"],
  2: ["prospect", "in_gesprek"],
  3: ["prospect", "in_gesprek"],
  4: ["prospect", "in_gesprek"],
  5: ["prospect", "in_gesprek", "uitgenodigd"],
  6: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup"],
  7: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup", "presentatie"],
  8: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup", "presentatie"],
  9: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup", "presentatie"],
};

const ALLE_FASES = [
  "prospect",
  "in_gesprek",
  "uitgenodigd",
  "one_pager",
  "followup",
  "presentatie",
  "not_yet",
  "shopper",
  "member",
];

const LEER_DAG_VOOR_FASE: Record<string, number> = {
  uitgenodigd: 5,
  one_pager: 6,
  followup: 6,
  presentatie: 7,
};

export function isBovenKennisNiveau(fase: string, dagNummer: number): boolean {
  if (dagNummer >= 10) return false;
  const bekend = FASES_BEKEND_PER_DAG[dagNummer] ?? ALLE_FASES;
  return !bekend.includes(fase);
}

export function leerDagVoorFase(fase: string): number | null {
  return LEER_DAG_VOOR_FASE[fase] ?? null;
}

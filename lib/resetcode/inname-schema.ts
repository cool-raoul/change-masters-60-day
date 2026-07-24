// ============================================================
// Dagelijks innameschema Darmen in Balans (rood = basis, blauw
// = plus). Idee Raoul 23 juli 2026: de Mentor toont elke dag
// precies wat je die dag neemt, zodat niemand een papieren
// lijst naast de app nodig heeft.
//
// DATA: letterlijk overgenomen van de twee schema-pagina's uit
// het programmaboekje, door Raoul aangeleverd op 23 juli 2026
// (foto's van beide tabellen, dag 1 t/m 16). Cogelin = 3x per
// dag 1 theelepel, bij beide programma's. Niets hierin is
// afgeleid of gegokt; wijzigingen alleen met een nieuwe bron.
// ============================================================

export type DagInname = {
  nuchter?: string[];
  ochtend?: string[];
  lunch?: string[];
  avond?: string[];
  slapen?: string[];
};

const NUCHTER = ["2 Aloë vera caps", "2 Biotic blast"];

// ---- Basis (rode schema, 5 producten) ----
// Opbouw per dag: (MSM plus, Parabalance). Ochtend en lunch zijn
// gelijk; de avond heeft altijd 1 Aloë vera caps extra.
const BASIS_OPBOUW: Record<number, [number, number]> = {
  1: [1, 1],
  2: [1, 2],
  3: [1, 3],
  4: [2, 4],
  5: [2, 4],
  6: [2, 4],
  7: [3, 4],
  8: [3, 4],
  9: [3, 4],
  10: [3, 4],
  11: [5, 4],
  12: [5, 4],
  13: [5, 4],
  14: [5, 4],
  15: [5, 4],
  16: [5, 4],
};

function basisDag(msm: number, para: number): DagInname {
  const moment = [
    "1 tl Cogelin",
    `${msm} MSM plus`,
    `${para} Parabalance`,
  ];
  return {
    nuchter: NUCHTER,
    ochtend: moment,
    lunch: moment,
    avond: ["1 tl Cogelin", "1 Aloë vera caps", `${msm} MSM plus`, `${para} Parabalance`],
  };
}

// ---- Plus (blauwe schema, 8 producten) ----
// Opbouw per dag: (MSM plus, Digestive formula, Parabalance).
// PH plus is altijd 3 per moment (1-2 uur na de maaltijd) en voor
// het slapen altijd 1 Be Recharged (2 scoops).
const PLUS_OPBOUW: Record<number, [number, number, number]> = {
  1: [1, 1, 1],
  2: [1, 1, 2],
  3: [1, 1, 3],
  4: [2, 1, 4],
  5: [2, 1, 4],
  6: [2, 1, 4],
  7: [3, 2, 4],
  8: [3, 2, 4],
  9: [3, 2, 4],
  10: [3, 2, 4],
  11: [5, 2, 4],
  12: [5, 2, 4],
  13: [5, 3, 4],
  14: [5, 3, 4],
  15: [5, 3, 4],
  16: [5, 3, 4],
};

function plusDag(msm: number, dig: number, para: number): DagInname {
  const moment = [
    "1 tl Cogelin",
    `${msm} MSM plus`,
    `${dig} Digestive formula`,
    `${para} Parabalance`,
    "3 PH plus (1-2 uur na de maaltijd)",
  ];
  return {
    nuchter: NUCHTER,
    ochtend: moment,
    lunch: moment,
    avond: [
      "1 tl Cogelin",
      "1 Aloë vera caps",
      `${msm} MSM plus`,
      `${dig} Digestive formula`,
      `${para} Parabalance`,
      "3 PH plus (1-2 uur na de maaltijd)",
    ],
    slapen: ["1 Be Recharged (2 scoops)"],
  };
}

function bouwSchema(): Record<"basis" | "plus", Record<number, DagInname>> {
  const basis: Record<number, DagInname> = {};
  const plus: Record<number, DagInname> = {};
  for (let d = 1; d <= 16; d++) {
    const [bMsm, bPara] = BASIS_OPBOUW[d];
    basis[d] = basisDag(bMsm, bPara);
    const [pMsm, pDig, pPara] = PLUS_OPBOUW[d];
    plus[d] = plusDag(pMsm, pDig, pPara);
  }
  return { basis, plus };
}

export const INNAME_SCHEMA = bouwSchema();

/** Schema voor een specifieke dag, of null zolang die dag niet is ingevuld. */
export function innameVoorDag(
  pakket: string | null | undefined,
  dag: number | null | undefined,
): DagInname | null {
  if (!pakket || !dag) return null;
  const schema = INNAME_SCHEMA[pakket === "plus" ? "plus" : "basis"];
  return schema[dag] ?? null;
}

/** Compacte chat-weergave van een dag-schema. */
export function formatInname(d: DagInname): string {
  const blok = (label: string, items?: string[]) =>
    items && items.length > 0 ? `${label}: ${items.join(" + ")}` : null;
  return [
    blok("🌅 Nuchter", d.nuchter),
    blok("☀️ Ochtend", d.ochtend),
    blok("🥗 Lunch", d.lunch),
    blok("🌙 Avond", d.avond),
    blok("😴 Voor het slapen", d.slapen),
  ]
    .filter(Boolean)
    // Witregel tussen de momenten: leesbaarder dan één blok tekst
    // (feedback Raoul 24 juli).
    .join("\n\n");
}

/**
 * Het volledige schema als kennis-tekst voor de Mentor-prompt én de
 * waakhond (anders zou de waakhond correcte schema-antwoorden als
 * verzinsel melden). Compact: alleen de opbouw-verschillen per dag.
 */
export function innameSchemaAlsKennis(): string {
  const basisRegels = Object.entries(BASIS_OPBOUW)
    .map(([d, [msm, para]]) => `dag ${d}: ${msm} MSM plus, ${para} Parabalance`)
    .join(" · ");
  const plusRegels = Object.entries(PLUS_OPBOUW)
    .map(
      ([d, [msm, dig, para]]) =>
        `dag ${d}: ${msm} MSM plus, ${dig} Digestive formula, ${para} Parabalance`,
    )
    .join(" · ");
  return `
=== DAGELIJKS INNAMESCHEMA DARMEN IN BALANS (letterlijk uit het boekje) ===
Geldt voor alle 16 dagen, beide pakketten:
- Nuchtere maag: 2 Aloë vera caps + 2 Biotic blast.
- Ochtend, lunch en avond: telkens 1 theelepel Cogelin (dus 3x per dag 1 tl).
- De avond heeft altijd 1 Aloë vera caps extra.
BASIS (rode schema), per moment (ochtend/lunch/avond) komt daarbij:
${basisRegels}
PLUS (blauwe schema), per moment komt daarbij (plus altijd 3 PH plus per moment, 1-2 uur na de maaltijd, en voor het slapen 1 Be Recharged van 2 scoops):
${plusRegels}
Vragen over "wat neem ik vandaag" beantwoord je hieruit, met de dag waarop de klant zit.`;
}

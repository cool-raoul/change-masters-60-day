// Warmte-bepaling voor "Jouw gezonde start": warm / lauw / koud.
//
// Zelfde gedachte als de reset-check heat-score, maar lichter. De
// investerings-bereidheid is het sterkste signaal; darm-signalen (behoefte) en
// betrokkenheid (meerdere doelen, afval-reset-wens) sturen bij. "Nee, nu nog
// niet" houdt iemand bewust koud (rustig in de nurture).

import type { InvesteringId } from "./vragen";

export type WarmteCategorie = "warm" | "lauw" | "koud";

export interface GezondeStartHeat {
  score: number; // 0-10
  categorie: WarmteCategorie;
  label: string; // member-facing, met emoji
}

export function bouwGezondeStartHeat(opts: {
  darmTotaal: number;
  darmMax: number;
  doelenCount: number;
  afvalReset: boolean;
  investering: InvesteringId | null;
}): GezondeStartHeat {
  const { darmTotaal, darmMax, doelenCount, afvalReset, investering } = opts;

  let score = 5;

  // Investerings-bereidheid weegt het zwaarst.
  if (investering === "altijd") score += 3.5;
  else if (investering === "misschien") score += 0.5;
  else if (investering === "nee") score -= 4;

  // Meer darm-signalen = meer behoefte/urgentie.
  const darmDeel = darmMax > 0 ? darmTotaal / darmMax : 0; // 0-1
  score += darmDeel * 1.5;

  // Betrokkenheid: meerdere doelen + een grotere afval-wens (reset).
  if (doelenCount >= 3) score += 0.5;
  if (afvalReset) score += 0.5;

  score = Math.max(0, Math.min(10, score));

  // "Nee, nu nog niet" → bewust koud houden, niet hard pushen.
  if (investering === "nee") score = Math.min(score, 3.5);

  const afgerond = Math.round(score * 10) / 10;

  let categorie: WarmteCategorie;
  let label: string;
  if (afgerond >= 7) {
    categorie = "warm";
    label = "🔥 Warm, snel persoonlijk opvolgen";
  } else if (afgerond >= 4.5) {
    categorie = "lauw";
    label = "🌤 Lauw, warm houden en opvolgen";
  } else {
    categorie = "koud";
    label = "❄️ Koud, rustig in de nurture houden";
  }

  return { score: afgerond, categorie, label };
}

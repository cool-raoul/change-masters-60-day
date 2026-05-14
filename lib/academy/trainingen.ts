// ============================================================
// lib/academy/trainingen.ts
//
// Centrale registry van alle trainingen binnen ELEVA Academy.
// Voeg hier nieuwe trainingen toe (bv. 'leiderschap', 'mindset',
// 'productkennis') zodra ze worden geschreven. De rest van de
// codebase (routes, dashboard-tegels, Mentor-koppeling) gebruikt
// deze registry als single source of truth.
// ============================================================

import type { AcademyTraining } from "./types";
import { SOCIAL_MEDIA_TRAINING } from "./social-media-content";
import { DAGELIJKS_RITME_TRAINING } from "./dmo-content";
import { CLAIM_VRIJ_TRAINING } from "./claim-vrij-content";
import { AUDIO_ONDERWEG_TRAINING } from "./audio-onderweg-content";

/**
 * Alle beschikbare trainingen in de Academy, in volgorde van
 * verschijnen op de hoofdpagina /academy.
 */
export const ACADEMY_TRAININGEN: AcademyTraining[] = [
  SOCIAL_MEDIA_TRAINING,
  DAGELIJKS_RITME_TRAINING,
  CLAIM_VRIJ_TRAINING,
  AUDIO_ONDERWEG_TRAINING,
  // Later: LEIDERSCHAP_TRAINING, MINDSET_TRAINING, etc.
];

/**
 * Zoek een training op slug. Retourneert null als de slug niet
 * bestaat. Gebruikt door /academy/[slug]-route en door de Mentor
 * wanneer 'ie wil verwijzen naar een specifieke training.
 */
export function geefTraining(slug: string): AcademyTraining | null {
  return ACADEMY_TRAININGEN.find((t) => t.slug === slug) ?? null;
}

/**
 * Zoek een specifieke les binnen een training. Retourneert null
 * als training of les niet bestaat.
 */
export function geefLes(
  trainingSlug: string,
  lesSleutel: string,
): { training: AcademyTraining; module: AcademyTraining["modules"][number]; les: AcademyTraining["modules"][number]["lessen"][number] } | null {
  const training = geefTraining(trainingSlug);
  if (!training) return null;
  for (const module of training.modules) {
    const les = module.lessen.find((l) => l.sleutel === lesSleutel);
    if (les) return { training, module, les };
  }
  return null;
}

/**
 * Totaal aantal lessen in een training (over alle modules).
 * Wordt gebruikt voor de voortgang-percentage berekening.
 */
export function totaalAantalLessen(training: AcademyTraining): number {
  return training.modules.reduce((sum, m) => sum + m.lessen.length, 0);
}

/**
 * Platte lijst van alle les-sleutels in een training, in
 * verschijning-volgorde. Handig voor "volgende les"-navigatie.
 */
export function alleLessleutels(training: AcademyTraining): string[] {
  return training.modules.flatMap((m) => m.lessen.map((l) => l.sleutel));
}

/**
 * Geeft de sleutel van de eerstvolgende niet-voltooide les terug,
 * of null als alles voltooid is. Wordt gebruikt voor de "Doorgaan"-
 * knop op het Academy-overzicht.
 */
export function eerstvolgendeLes(
  training: AcademyTraining,
  voltooide: Set<string>,
): string | null {
  for (const sleutel of alleLessleutels(training)) {
    if (!voltooide.has(sleutel)) return sleutel;
  }
  return null;
}

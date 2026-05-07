"use client";

import { useEffect } from "react";
import { celebrateMilestone } from "@/lib/celebrate-milestone";

// ============================================================
// MijlpaalDetector, onzichtbare client-component die bij mount checkt
// of een mijlpaal voor het EERST is bereikt en zo ja een celebration
// afvuurt. localStorage-flag voorkomt dubbele vieringen bij refresh.
//
// In te bouwen op het Sprint-dashboard met de relevante props.
// Renders niets visueels (return null), alleen side-effect.
// ============================================================

type Props = {
  /** Sprint week 1 (dag 1-7) volledig voltooid? */
  week1Klaar?: boolean;
  /** Sprint week 2 (dag 1-14) volledig voltooid? */
  week2Klaar?: boolean;
  /** Sprint week 3 (dag 1-21) volledig voltooid? */
  week3Klaar?: boolean;
  /** Huidige streak in dagen, 0 of meer. */
  streak?: number;
};

export function MijlpaalDetector({
  week1Klaar,
  week2Klaar,
  week3Klaar,
  streak,
}: Props) {
  useEffect(() => {
    // Week-mijlpalen: bij eerste keer voltooid, groot vuurwerk.
    // Volgorde: hoogste eerst zodat als iemand 21d in 1 keer voltooit
    // (bv. tester) hij niet 3x kort na elkaar confetti krijgt.
    if (week3Klaar) {
      celebrateMilestone("week-3", "groot");
    } else if (week2Klaar) {
      celebrateMilestone("week-2", "groot");
    } else if (week1Klaar) {
      celebrateMilestone("week-1", "groot");
    }

    // Streak-mijlpalen: hoogste eerst om dezelfde reden.
    if (streak !== undefined) {
      if (streak >= 30) {
        celebrateMilestone("streak-30", "groot");
      } else if (streak >= 14) {
        celebrateMilestone("streak-14", "groot");
      } else if (streak >= 7) {
        celebrateMilestone("streak-7", "klein");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week1Klaar, week2Klaar, week3Klaar, streak]);

  return null;
}

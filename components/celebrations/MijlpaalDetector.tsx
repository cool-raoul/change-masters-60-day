"use client";

import { useEffect } from "react";
import { celebrateMilestone } from "@/lib/celebrate-milestone";

// ============================================================
// MijlpaalDetector, onzichtbare client-component die bij mount checkt
// of een Sprint week-mijlpaal voor het EERST is bereikt en zo ja een
// groot vuurwerk afvuurt. localStorage-flag voorkomt dubbele vieringen
// bij refresh.
//
// Op verzoek Raoul: alleen Sprint dag 7/14/21 mijlpalen. Streak en
// andere triggers zijn weggehaald om celebrations spaarzaam te houden,
// alleen op echte mijlpalen.
// ============================================================

type Props = {
  /** Sprint week 1 (dag 1-7) volledig voltooid? */
  week1Klaar?: boolean;
  /** Sprint week 2 (dag 1-14) volledig voltooid? */
  week2Klaar?: boolean;
  /** Sprint week 3 (dag 1-21) volledig voltooid? */
  week3Klaar?: boolean;
};

export function MijlpaalDetector({
  week1Klaar,
  week2Klaar,
  week3Klaar,
}: Props) {
  useEffect(() => {
    // Volgorde: hoogste eerst zodat als iemand 21d in 1 keer voltooit
    // (bv. tester) hij niet 3x kort na elkaar confetti krijgt.
    if (week3Klaar) {
      celebrateMilestone("week-3", "groot");
    } else if (week2Klaar) {
      celebrateMilestone("week-2", "groot");
    } else if (week1Klaar) {
      celebrateMilestone("week-1", "groot");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week1Klaar, week2Klaar, week3Klaar]);

  return null;
}

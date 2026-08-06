"use client";

import { DTTFormulier } from "@/components/dtt/DTTFormulier";

// ============================================================
// DTT-onboarding-embed voor Core dag 0.
//
// De inhoud zit sinds 2026-08-06 in components/dtt/DTTFormulier.tsx,
// zodat /instellingen exact hetzelfde scherm toont. Wie hier hoort
// "aanpassen kan altijd via Instellingen" komt daar dus niet meer op
// een kaal drie-velden-formuliertje uit.
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function DTTOnboardingEmbed({ alVoltooid, opVoltooid }: Props) {
  return (
    <DTTFormulier
      modus="start"
      alVoltooid={alVoltooid}
      opVoltooid={opVoltooid}
    />
  );
}

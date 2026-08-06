"use client";

import { DTTFormulier } from "@/components/dtt/DTTFormulier";

// ============================================================
// Core Doel-Tijd-Termijn op /instellingen.
//
// Was tot 2026-08-06 een eigen formuliertje met drie kale nummervelden.
// Dat botste met wat je op dag 0 te zien kreeg (je WHY erbij, de
// eerlijkheidscheck, de status-richting), terwijl daar juist beloofd
// wordt dat je het hier kunt bijstellen. Nu draaien beide plekken op
// dezelfde component; hier alleen in "bijstellen"-stand, met je huidige
// antwoorden er al in.
// ============================================================

type Props = {
  initieelDoel: number | null;
  initieleUren: number | null;
  initieleTermijn: number | null;
};

export function CoreTempoSectie({
  initieelDoel,
  initieleUren,
  initieleTermijn,
}: Props) {
  // Alleen voorvullen als het compleet is. Half ingevulde waarden zouden
  // de tempo-berekening op een half getal baseren.
  const beginwaarden =
    initieelDoel !== null && initieleUren !== null && initieleTermijn !== null
      ? {
          doel_per_maand: initieelDoel,
          uren_per_week: initieleUren,
          termijn_maanden: initieleTermijn,
        }
      : null;

  return <DTTFormulier modus="bijstellen" beginwaarden={beginwaarden} />;
}

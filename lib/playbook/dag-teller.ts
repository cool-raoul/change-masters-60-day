import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// Per-modus dag-teller. Leest het modus-specifieke startdatum-veld
// uit profiles en berekent het dag-nummer. Geen startdatum = dag 1.
// ============================================================

type ProfielDateVelden = {
  sprint_startdatum: string | null;
  core_startdatum: string | null;
  run_startdatum: string | null; // legacy, fallback
  created_at: string | null;
};

export function startdatumVoorModus(
  profiel: ProfielDateVelden,
  modus: Modus,
): Date | null {
  if (modus === "sprint") {
    return parseDatum(profiel.sprint_startdatum) ?? parseDatum(profiel.run_startdatum);
  }
  if (modus === "core") {
    return parseDatum(profiel.core_startdatum) ?? parseDatum(profiel.run_startdatum);
  }
  // Pro: geen aparte per-modus startdatum, fallback op run_startdatum/created_at
  return parseDatum(profiel.run_startdatum) ?? parseDatum(profiel.created_at);
}

export function dagVoorModus(profiel: ProfielDateVelden, modus: Modus): number {
  const start = startdatumVoorModus(profiel, modus);
  if (!start) return 1;
  const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function parseDatum(v: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

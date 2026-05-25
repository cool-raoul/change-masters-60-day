// File: lib/freebie-bots/tweede-wind/bewaker.ts
//
// Bewaakt de AI-output van Tweede Wind. Drie lagen, zelfde patroon
// als Tweede Lente.

import type { SpiegelOutput } from "../types";
import {
  TEMPLATE_AANPASSINGEN,
  VERBODEN_WOORDEN,
} from "./system-prompt";

const FALLBACK_OPENING =
  "Wat fijn dat je dit hebt ingevuld. Het patroon dat je beschrijft hoort bij veel mensen die we spreken, je staat er niet alleen in.";

const FALLBACK_PATROON =
  "We zien een combinatie van dingen die we vaker horen bij mensen met een drukke kop en wisselende energie. Het is geen toeval dat die signalen samen oplopen. Veel mensen voelen herkenning als ze zien dat het een patroon is, niet een losse klacht.";

const FALLBACK_AFSLUITING =
  "Veel mensen kiezen op dit punt voor een paar avonden mail om verder te verkennen. Daaronder kun je je inschrijven als dat goed voelt.";

const FALLBACK_DRI_AANPASSINGEN: [string, string, string] = [
  TEMPLATE_AANPASSINGEN[0], // Bewuste adem
  TEMPLATE_AANPASSINGEN[3], // Diepe focus-blokken
  TEMPLATE_AANPASSINGEN[1], // Wandeling in de ochtendzon
];

export function bevatVerbodenWoord(zin: string): boolean {
  const lowered = zin.toLowerCase();
  return VERBODEN_WOORDEN.some((w) => lowered.includes(w));
}

export function bewaakSpiegelOutput(raw: string): SpiegelOutput {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (_e) {
    console.warn("[tweede-wind-bewaker] JSON-parse fout, volledige fallback");
    return {
      opening: FALLBACK_OPENING,
      patroon: FALLBACK_PATROON,
      driAanpassingen: FALLBACK_DRI_AANPASSINGEN,
      afsluiting: FALLBACK_AFSLUITING,
    };
  }

  const opening =
    typeof parsed.opening === "string" && !bevatVerbodenWoord(parsed.opening)
      ? parsed.opening
      : FALLBACK_OPENING;

  const patroon =
    typeof parsed.patroon === "string" && !bevatVerbodenWoord(parsed.patroon)
      ? parsed.patroon
      : FALLBACK_PATROON;

  const afsluiting =
    typeof parsed.afsluiting === "string" &&
    !bevatVerbodenWoord(parsed.afsluiting)
      ? parsed.afsluiting
      : FALLBACK_AFSLUITING;

  let driAanpassingen: [string, string, string] = FALLBACK_DRI_AANPASSINGEN;
  if (
    Array.isArray(parsed.driAanpassingen) &&
    parsed.driAanpassingen.length === 3 &&
    parsed.driAanpassingen.every(
      (z): z is string =>
        typeof z === "string" && TEMPLATE_AANPASSINGEN.includes(z),
    )
  ) {
    driAanpassingen = parsed.driAanpassingen as [string, string, string];
  } else {
    console.warn(
      "[tweede-wind-bewaker] driAanpassingen niet uit whitelist, fallback",
    );
  }

  return { opening, patroon, driAanpassingen, afsluiting };
}

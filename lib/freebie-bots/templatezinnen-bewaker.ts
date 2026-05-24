// File: lib/freebie-bots/templatezinnen-bewaker.ts
//
// Bewaakt de AI-output. Drie lagen:
//   1. JSON-parse: faalt als output geen valide JSON is.
//   2. Whitelist-check op driAanpassingen: elke zin moet exact in
//      TEMPLATE_AANPASSINGEN voorkomen, anders vervangen door fallback.
//   3. Verboden-vocabulaire-scan op opening + patroon + afsluiting:
//      bij match wordt de zin vervangen door een veilige fallback.

import type { SpiegelOutput } from "./types";
import {
  TEMPLATE_AANPASSINGEN,
  VERBODEN_WOORDEN,
} from "./tweede-lente-system-prompt";

const FALLBACK_OPENING =
  "Wat fijn dat je dit hebt ingevuld. Dit is een fase die veel vrouwen herkennen, en je staat er niet alleen in.";

const FALLBACK_PATROON =
  "We zien een combinatie van dingen die we vaker horen bij vrouwen in deze tijd. Het is geen toeval dat die signalen samen oplopen. Veel vrouwen voelen herkenning als ze zien dat het een patroon is, niet een losse klacht.";

const FALLBACK_AFSLUITING =
  "Veel vrouwen kiezen op dit punt voor een paar avonden mail om verder te verkennen. Daaronder kun je je inschrijven als dat goed voelt.";

const FALLBACK_DRI_AANPASSINGEN: [string, string, string] = [
  TEMPLATE_AANPASSINGEN[1], // Een vast moment per dag voor stilte
  TEMPLATE_AANPASSINGEN[3], // Een eet-ritme dat meeschuift
  TEMPLATE_AANPASSINGEN[2], // Een wandeling als afsluiter
];

/**
 * Scant een zin op verboden vocabulaire. Returnt true als de zin verdacht is.
 */
export function bevatVerbodenWoord(zin: string): boolean {
  const lowered = zin.toLowerCase();
  return VERBODEN_WOORDEN.some((w) => lowered.includes(w));
}

/**
 * Parse + valideer de AI-output. Bij twijfel: fallback. Returnt altijd
 * een veilige SpiegelOutput. Logging via console.warn voor debugging.
 */
export function bewaakSpiegelOutput(raw: string): SpiegelOutput {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (_e) {
    console.warn("[tweede-lente-bewaker] JSON-parse fout, volledige fallback");
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
      "[tweede-lente-bewaker] driAanpassingen niet uit whitelist, fallback",
    );
  }

  return { opening, patroon, driAanpassingen, afsluiting };
}

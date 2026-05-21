// File: lib/mentor/laag-2-router.ts
//
// Laag 2 van drie-laags Mentor-architectuur. AI-laag met model-tier-keuze
// op basis van complexiteit-inschatting. Roept geen Anthropic SDK aan
// (dat doet de bestaande /api/coach route), wel: geeft model-aanbeveling.

export type ModelTier = "haiku" | "sonnet" | "opus";

export type ComplexiteitSignalen = {
  /** Lengte van de vraag in karakters. */
  vraagLengte: number;
  /** True als de vraag emotionele woorden bevat (crisis, hopeloos, ...). */
  emotioneel: boolean;
  /** True als de vraag claim-gevoelig taalgebruik bevat (medisch, diagnose). */
  claimGevoelig: boolean;
  /** True als de vraag een keuze-tussen-meerdere-paden vergt. */
  nuanceVereist: boolean;
};

/** Detecteert signalen die het model-tier-besluit beïnvloeden. */
export function analyseerSignalen(vraag: string): ComplexiteitSignalen {
  const lowered = vraag.toLowerCase();
  const emotioneelWoorden = [
    "crisis",
    "hopeloos",
    "ik weet het niet meer",
    "kan niet meer",
    "depressie",
    "burnout",
  ];
  const claimWoorden = [
    "genezen",
    "diagnose",
    "behandeling",
    "ziek",
    "medicijn",
    "arts",
    "dokter",
  ];
  const nuanceWoorden = ["of", "versus", "tussen", "welke moet ik", "beter is"];
  return {
    vraagLengte: vraag.length,
    emotioneel: emotioneelWoorden.some((w) => lowered.includes(w)),
    claimGevoelig: claimWoorden.some((w) => lowered.includes(w)),
    nuanceVereist: nuanceWoorden.some((w) => lowered.includes(w)),
  };
}

/**
 * Kies het model-tier op basis van signalen. Defaults richting goedkoper
 * tenzij complexiteit of risico het rechtvaardigt. Veiligheid eerst:
 * claim-gevoelig en emotioneel gaan altijd minimaal naar Sonnet.
 */
export function kiesModelTier(signalen: ComplexiteitSignalen): ModelTier {
  if (signalen.claimGevoelig || signalen.emotioneel) return "sonnet";
  if (signalen.nuanceVereist || signalen.vraagLengte > 400) return "sonnet";
  return "haiku";
}

/** Mapping van tier naar Anthropic model ID (te gebruiken door /api/coach). */
export function modelIdVoorTier(tier: ModelTier): string {
  if (tier === "haiku") return "claude-haiku-4-5-20251001";
  if (tier === "sonnet") return "claude-sonnet-4-6";
  return "claude-opus-4-7";
}

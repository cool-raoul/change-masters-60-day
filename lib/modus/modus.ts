// ============================================================
// modus, ELEVA's drie wegen (sprint / core / pro)
//
// Helpers om de modus van een gebruiker op te halen en consistent
// door de app te gebruiken. Modus bepaalt welk dashboard de gebruiker
// ziet, welke content beschikbaar is, en welke knoppen verschijnen.
//
// Sprint  = 60-day Run, intensieve werving-campagne
// Core    = Webshop-strategie, eigen tempo, social + content + freebies
// Pro     = Professional pad, voor coaches/diëtisten met cliënten
// null    = Nog niet gekozen, gebruiker moet eerst kiezen
// ============================================================

export type Modus = "sprint" | "core" | "pro";

/** Geeft het label dat we in de UI tonen voor een modus. */
export function modusLabel(modus: Modus): string {
  if (modus === "sprint") return "60-day Run";
  if (modus === "core") return "Webshop-strategie";
  return "Professional";
}

/** Geeft een korte uitleg-zin per modus, geschikt voor onboarding-tegels. */
export function modusUitleg(modus: Modus): string {
  if (modus === "sprint") {
    return "Intensieve campagne van 60 dagen waarin je actief mensen aanbrengt.";
  }
  if (modus === "core") {
    return "Bouw je eigen webshop op je eigen tempo via social media, content en gratis weggevers.";
  }
  return "Voor professionals met eigen cliënten. Webshop met standaardpakketten, productadvies-test als kerninstrument.";
}

/** Geeft het emoji-icoon per modus voor in de UI. */
export function modusIcoon(modus: Modus): string {
  if (modus === "sprint") return "🏃";
  if (modus === "core") return "🚶";
  return "💼";
}

/** Bepaalt de modus op basis van een ruwe waarde uit de database. */
export function parseModus(raw: unknown): Modus | null {
  if (raw === "sprint" || raw === "core" || raw === "pro") return raw;
  return null;
}

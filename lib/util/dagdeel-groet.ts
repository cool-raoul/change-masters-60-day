// ============================================================
// dagdeel-groet.ts
// Tijd-bewuste begroeting (Goedemorgen/middag/avond/nacht).
// Werkt in zowel server- als client-context: rekent altijd in
// Europe/Amsterdam-tijdzone, dus de Vercel-server (UTC) en de
// browser geven hetzelfde resultaat. Geen hydration-mismatch.
//
// 5-12 = Goedemorgen
// 12-18 = Goedemiddag
// 18-23 = Goedenavond
// 23-5  = Goedenacht
// ============================================================

function uurNL(): number {
  const uurStr = new Intl.DateTimeFormat("nl-NL", {
    hour: "numeric",
    timeZone: "Europe/Amsterdam",
    hour12: false,
  }).format(new Date());
  return parseInt(uurStr, 10);
}

/** "☀️ Goedemorgen" / "☀️ Goedemiddag" / "🌙 Goedenavond" / "🌃 Goedenacht". */
export function pakDagdeelGroet(): string {
  const uur = uurNL();
  if (uur >= 18 && uur < 23) return "🌙 Goedenavond";
  if (uur >= 12 && uur < 18) return "☀️ Goedemiddag";
  if (uur >= 23 || uur < 5) return "🌃 Goedenacht";
  return "☀️ Goedemorgen";
}

/** Met optioneel voornaam erachter, bv. "☀️ Goedemiddag Raoul!". */
export function pakDagdeelGroetMetNaam(voornaam: string): string {
  const groet = pakDagdeelGroet();
  return `${groet}${voornaam ? ` ${voornaam}` : ""}!`;
}

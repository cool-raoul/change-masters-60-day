// Eén bron voor "vandaag" als YYYY-MM-DD in Europe/Amsterdam.
//
// new Date().toISOString() is UTC: tussen 00:00 en ~02:00 NL-tijd zou
// "vandaag" dan nog gisteren zijn, waardoor stats, besteldatums en
// taak-defaults op de verkeerde dag landen.
export function vandaagNL(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Amsterdam",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

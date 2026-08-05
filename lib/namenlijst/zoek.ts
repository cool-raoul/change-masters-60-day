/**
 * Zoeken in de namenlijst. Eén bron voor zowel de lijst- als de
 * pijplijn-weergave, zodat je in beide weergaven hetzelfde vindt.
 */

/** Kleine letters, zonder accenten, zodat "José" ook op "jose" matcht. */
export function normaliseerZoek(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

type ZoekbaarProspect = {
  volledige_naam?: string | null;
  email?: string | null;
  telefoon?: string | null;
};

/**
 * Zoek-score van één prospect. Hoger is een betere match, 0 = geen match.
 * Meetypen moet meteen wat opleveren: typ je "co", dan verschijnen alle
 * Corry's, Cor's en Coenraads. Woorden tellen los mee, dus je kunt ook
 * op een achternaam beginnen zonder de voornaam te typen.
 */
export function zoekScore(prospect: ZoekbaarProspect, term: string): number {
  const t = normaliseerZoek(term.trim());
  if (!t) return 1;
  const naam = normaliseerZoek(prospect.volledige_naam ?? "");
  const woorden = naam.split(/[\s-]+/).filter(Boolean);
  if (woorden.some((w) => w.startsWith(t))) return 3; // naam begint ermee
  if (naam.includes(t)) return 2; // staat ergens in de naam
  const overig = normaliseerZoek(
    `${prospect.email ?? ""} ${prospect.telefoon ?? ""}`,
  );
  if (overig.includes(t)) return 1; // e-mail of telefoonnummer
  return 0;
}

/** Filtert en sorteert op relevantie; lege zoekterm laat alles staan. */
export function filterOpZoek<T extends ZoekbaarProspect>(
  prospects: T[],
  term: string,
): T[] {
  if (!term.trim()) return prospects;
  return prospects
    .map((p) => ({ p, score: zoekScore(p, term) }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.p.volledige_naam ?? "").localeCompare(
          b.p.volledige_naam ?? "",
          "nl",
        ),
    )
    .map((x) => x.p);
}

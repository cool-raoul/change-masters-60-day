// ============================================================
// Dagelijks innameschema Darmen in Balans (rood = basis, blauw
// = plus). Idee Raoul 23 juli 2026: de Mentor toont elke dag
// precies wat je die dag neemt, zodat niemand een papieren
// lijst naast de app nodig heeft.
//
// LET OP, DATA BEWUST NOG LEEG: de PDF-extractie van de twee
// schema-pagina's uit het boekje heeft de tabel-kolommen
// platgeslagen, waardoor de dag-grenzen niet betrouwbaar te
// reconstrueren zijn. Doseringen gokken we NOOIT. Zodra Raoul
// de twee schema-pagina's aanlevert (foto is genoeg) worden de
// dagen hier ingevuld en verschijnt het schema vanzelf in de
// klant-chat; tot die tijd toont de app níets en verwijst de
// Mentor naar het geprinte schema uit het boekje.
// ============================================================

export type DagInname = {
  nuchter?: string[];
  ochtend?: string[];
  lunch?: string[];
  avond?: string[];
};

export const INNAME_SCHEMA: Record<
  "basis" | "plus",
  Record<number, DagInname>
> = {
  basis: {},
  plus: {},
};

/** Schema voor een specifieke dag, of null zolang die dag niet is ingevuld. */
export function innameVoorDag(
  pakket: string | null | undefined,
  dag: number | null | undefined,
): DagInname | null {
  if (!pakket || !dag) return null;
  const schema = INNAME_SCHEMA[pakket === "plus" ? "plus" : "basis"];
  return schema[dag] ?? null;
}

/** Compacte chat-weergave van een dag-schema. */
export function formatInname(d: DagInname): string {
  const blok = (label: string, items?: string[]) =>
    items && items.length > 0 ? `${label}: ${items.join(" + ")}` : null;
  return [
    blok("🌅 Nuchter", d.nuchter),
    blok("☀️ Ochtend", d.ochtend),
    blok("🥗 Lunch", d.lunch),
    blok("🌙 Avond", d.avond),
  ]
    .filter(Boolean)
    .join("\n");
}

// ============================================================
// Freebie-uitslag op de klantenkaart: wat deze persoon in een
// freebie-bot invulde, welk advies eruit kwam en hoe ver de
// informatiefilm bekeken is. Voorheen stond dit alleen als
// vrije tekst in de notities; nu direct leesbaar (11 juli).
// Server-safe presentational component.
// ============================================================

type OptInRij = {
  titel: string;
  created_at: string;
  bot_antwoorden: Record<string, unknown> | null;
  spiegel_tekst: string | null;
};

const VELD_LABELS: Record<string, string> = {
  darmTotaal: "Score",
  darmBucket: "Uitkomst-bucket",
  doelen: "Wil graag",
  afvalWens: "Afval-wens",
  investering: "Investering",
  warmte: "Warmte",
  warmteScore: "Warmte-score",
};

function leesbaar(waarde: unknown): string {
  if (Array.isArray(waarde)) return waarde.map(String).join(", ");
  if (typeof waarde === "boolean") return waarde ? "ja" : "nee";
  return String(waarde ?? "");
}

function adviesUit(rij: OptInRij): string | null {
  const m = rij.spiegel_tekst?.match(/advies:\s*([^\n]+)/i);
  if (m) return m[1].trim();
  const bucket = rij.bot_antwoorden?.darmBucket;
  return typeof bucket === "string" ? bucket : null;
}

export function FreebieUitslag({ optIns }: { optIns: OptInRij[] }) {
  if (!optIns.length) return null;
  return (
    <div className="card">
      <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
        🌷 Freebie-uitslag
      </h3>
      <div className="space-y-4">
        {optIns.map((rij, idx) => {
          const advies = adviesUit(rij);
          const antwoorden = Object.entries(rij.bot_antwoorden ?? {}).filter(
            ([k, v]) =>
              k !== "filmKijk" &&
              v !== null &&
              v !== undefined &&
              leesbaar(v).length > 0,
          );
          const film = (rij.bot_antwoorden?.filmKijk ?? null) as {
            seconden?: number;
            duur?: number;
            afgekeken?: boolean;
          } | null;
          return (
            <div key={idx}>
              <p className="text-cm-white text-sm font-semibold">
                {rij.titel}
                <span className="text-cm-muted text-xs font-normal ml-2">
                  {new Date(rij.created_at).toLocaleDateString("nl-NL")}
                </span>
              </p>
              {advies && (
                <p className="mt-1 inline-block rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2.5 py-1">
                  Advies: {advies}
                </p>
              )}
              {antwoorden.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {antwoorden.map(([k, v]) => (
                    <p key={k} className="text-xs text-cm-white/75">
                      <span className="text-cm-muted">
                        {VELD_LABELS[k] ?? k}:
                      </span>{" "}
                      {leesbaar(v)}
                    </p>
                  ))}
                </div>
              )}
              {film && (film.seconden ?? 0) > 0 && (
                <p className="mt-1.5 text-xs text-cm-white/80">
                  🎬 Info-film: {Math.max(1, Math.round((film.seconden ?? 0) / 60))}
                  {film.duur
                    ? ` van ±${Math.max(1, Math.round(film.duur / 60))}`
                    : ""}{" "}
                  min bekeken{" "}
                  {film.afgekeken ? (
                    <span className="text-emerald-400 font-semibold">
                      · afgekeken ✓
                    </span>
                  ) : (
                    <span className="text-amber-400">· nog niet uit</span>
                  )}
                </p>
              )}
              {rij.spiegel_tekst && (
                <details className="mt-1.5">
                  <summary className="text-xs text-cm-gold/80 cursor-pointer">
                    Wat zij als uitslag zag
                  </summary>
                  <p className="mt-1 text-xs text-cm-white/70 whitespace-pre-wrap leading-relaxed">
                    {rij.spiegel_tekst}
                  </p>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

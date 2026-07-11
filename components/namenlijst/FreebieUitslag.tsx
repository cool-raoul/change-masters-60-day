// ============================================================
// Freebie-uitslag op de klantenkaart, in mensentaal (feedback
// Raoul 11 juli: geen systeemtaal zoals "bucket" of losse
// scores). Vertaalt de opgeslagen bot-antwoorden naar heldere
// regels met de labels uit de bot-logica zelf.
// Server-safe presentational component.
// ============================================================

import {
  DOEL_OPTIES,
  AFVAL_OPTIES,
  INVESTERING_LABEL,
  type InvesteringId,
} from "@/lib/freebie-bots/jouw-gezonde-start/vragen";
import { DARM_MAX_SCORE } from "@/lib/zelftest/darm-vragen";

type OptInRij = {
  titel: string;
  created_at: string;
  bot_antwoorden: Record<string, unknown> | null;
  spiegel_tekst: string | null;
};

function adviesUit(rij: OptInRij): string | null {
  const m = rij.spiegel_tekst?.match(/advies:\s*([^\n]+)/i);
  if (m) return m[1].trim();
  const bucket = rij.bot_antwoorden?.darmBucket;
  if (bucket === "plus") return "het uitgebreidere plus-programma";
  if (bucket === "basis") return "de laagdrempelige basis-start";
  return null;
}

/** Vertaal de bekende antwoord-velden naar leesbare regels. */
function menselijkeRegels(antwoorden: Record<string, unknown>): string[] {
  const regels: string[] = [];
  const gebruikt = new Set<string>();

  // Doelen: ids → labels ("energie" → "Meer energie").
  if (Array.isArray(antwoorden.doelen) && antwoorden.doelen.length) {
    const labels = antwoorden.doelen
      .map(
        (id) =>
          DOEL_OPTIES.find((o) => o.id === id)?.label ?? String(id),
      )
      .join(", ");
    regels.push(`Wil graag: ${labels}`);
    gebruikt.add("doelen");
  }

  // Afval-wens: id → label ("tien_plus" → "Meer dan 10 kilo").
  if (typeof antwoorden.afvalWens === "string" && antwoorden.afvalWens) {
    const label =
      AFVAL_OPTIES.find((o) => o.id === antwoorden.afvalWens)?.label ??
      String(antwoorden.afvalWens);
    regels.push(`Wil afvallen: ${label}`);
    gebruikt.add("afvalWens");
  }

  // Darm-score + wat die betekent (drempel 20 van de 45 → plus-advies).
  if (typeof antwoorden.darmTotaal === "number") {
    const totaal = antwoorden.darmTotaal;
    const bucket = antwoorden.darmBucket;
    const duiding =
      bucket === "plus"
        ? "veel lichaamssignalen, vandaar het uitgebreidere plus-advies"
        : "milde lichaamssignalen, vandaar de laagdrempelige basis-start";
    regels.push(
      `Vragenlijst-score: ${totaal} van de ${DARM_MAX_SCORE} punten (${duiding})`,
    );
    gebruikt.add("darmTotaal");
    gebruikt.add("darmBucket");
  }

  // Investerings-bereidheid: id → label.
  if (typeof antwoorden.investering === "string" && antwoorden.investering) {
    const label =
      INVESTERING_LABEL[antwoorden.investering as InvesteringId] ??
      String(antwoorden.investering);
    regels.push(`Wil investeren in gezondheid: ${label}`);
    gebruikt.add("investering");
  }

  // Warmte: categorie + score in één begrijpelijke regel.
  const warmte = antwoorden.warmte;
  const warmteScore = antwoorden.warmteScore;
  if (typeof warmte === "string" || typeof warmteScore === "number") {
    const uitlegPerCategorie: Record<string, string> = {
      warm: "🔥 warme lead, snel persoonlijk opvolgen",
      lauw: "🌤 lauwe lead, warm houden en rustig opvolgen",
      koud: "❄️ koude lead, rustig in de mailreeks laten",
    };
    const basis =
      typeof warmte === "string"
        ? (uitlegPerCategorie[warmte] ?? warmte)
        : "warmte-inschatting";
    const score =
      typeof warmteScore === "number" ? ` (${String(warmteScore).replace(".", ",")} van 10)` : "";
    regels.push(`Hoe warm is deze lead: ${basis}${score}`);
    gebruikt.add("warmte");
    gebruikt.add("warmteScore");
  }

  // Overige (onbekende) velden netjes tonen, zodat nieuwe bots niks
  // kwijtraken. Contactgegevens slaan we over (staan al op de kaart) en
  // geneste objecten worden leesbaar uitgeschreven i.p.v. [object Object].
  const STIL = new Set([
    "filmKijk",
    "email",
    "voornaam",
    "achternaam",
    "naam",
    "telefoon",
  ]);
  for (const [k, v] of Object.entries(antwoorden)) {
    if (gebruikt.has(k) || STIL.has(k)) continue;
    if (v === null || v === undefined) continue;
    const waarde = leesbareWaarde(v);
    if (!waarde) continue;
    regels.push(`${k}: ${waarde}`);
  }

  return regels;
}

/** Maak elke waarde leesbaar: arrays met komma's, objecten als "a: 1 · b: 2". */
function leesbareWaarde(v: unknown): string {
  if (Array.isArray(v)) return v.map((x) => leesbareWaarde(x)).filter(Boolean).join(", ");
  if (typeof v === "object" && v !== null) {
    return Object.entries(v as Record<string, unknown>)
      .map(([k2, v2]) => {
        const w =
          typeof v2 === "object" && v2 !== null ? "" : String(v2 ?? "");
        return w ? `${k2}: ${w}` : "";
      })
      .filter(Boolean)
      .join(" · ");
  }
  if (typeof v === "boolean") return v ? "ja" : "nee";
  return String(v);
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
          const regels = menselijkeRegels(rij.bot_antwoorden ?? {});
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
                  Advies uit de vragenlijst: {advies}
                </p>
              )}
              {regels.length > 0 && (
                <div className="mt-2 space-y-1">
                  {regels.map((regel, i) => (
                    <p
                      key={i}
                      className="text-xs text-cm-white/80 leading-relaxed"
                    >
                      {regel}
                    </p>
                  ))}
                </div>
              )}
              {film && (film.seconden ?? 0) > 0 && (
                <p className="mt-1.5 text-xs text-cm-white/80">
                  🎬 Info-film:{" "}
                  {Math.max(1, Math.round((film.seconden ?? 0) / 60))}
                  {film.duur
                    ? ` van ±${Math.max(1, Math.round(film.duur / 60))}`
                    : ""}{" "}
                  min bekeken{" "}
                  {film.afgekeken ? (
                    <span className="text-emerald-400 font-semibold">
                      · helemaal afgekeken ✓
                    </span>
                  ) : (
                    <span className="text-amber-400">· nog niet uitgekeken</span>
                  )}
                </p>
              )}
              {rij.spiegel_tekst && (
                <details className="mt-1.5">
                  <summary className="text-xs text-cm-gold/80 cursor-pointer">
                    De uitslag zoals zij die zelf zag
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

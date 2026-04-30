"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";
import type { ScriptMetMeta } from "@/lib/scripts/overrides";

// ============================================================
// ScriptsOverview — client component voor de /scripts pagina.
//
// Krijgt scripts-met-overrides als prop binnen (server-prefetched),
// rendert zoek/filter/UI, en voor founders een ✏️-knop per kaart om
// de tekst aan te passen — direct live voor alle members.
// ============================================================

export function ScriptsOverview({
  scripts,
  isFounder,
}: {
  scripts: ScriptMetMeta[];
  isFounder: boolean;
}) {
  const { v } = useTaal();
  const [actieveCategorie, setActieveCategorie] = useState("alle");
  const [zoekterm, setZoekterm] = useState("");

  const CATEGORIE_LABELS: Record<string, string> = {
    alle: v("scripts.alle"),
    uitnodiging: v("scripts.uitnodiging"),
    edification: v("scripts.edification"),
    bezwaar: v("scripts.bezwaar"),
    followup: v("scripts.followup"),
    sluiting: v("scripts.sluiting"),
    presentatie: v("scripts.presentatie"),
  };

  const gefilterd = scripts.filter((s) => {
    const categorieMatch =
      actieveCategorie === "alle" || s.categorie === actieveCategorie;
    const zoekMatch =
      !zoekterm ||
      s.titel.toLowerCase().includes(zoekterm.toLowerCase()) ||
      s.inhoud.toLowerCase().includes(zoekterm.toLowerCase()) ||
      s.tags.some((t) => t.includes(zoekterm.toLowerCase()));
    return categorieMatch && zoekMatch;
  });

  function kopieer(tekst: string, titel: string) {
    navigator.clipboard.writeText(tekst);
    toast.success(`"${titel}" ${v("scripts.gekopieerd")}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4"
      >
        {v("algemeen.terug")}
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("scripts.titel")}
        </h1>
        <p className="text-cm-white mt-1">{v("scripts.subtitel")}</p>
      </div>

      {isFounder && (
        <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/5 px-4 py-3">
          <p className="text-sm text-cm-white">
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold mr-2">
              ✍️ Founder
            </span>
            Klik op{" "}
            <span className="text-cm-gold">✍️ Bewerk voor iedereen</span> bij
            een script om de tekst aan te passen — direct live voor alle
            members.
          </p>
        </div>
      )}

      {/* Zoekbalk */}
      <input
        type="text"
        value={zoekterm}
        onChange={(e) => setZoekterm(e.target.value)}
        placeholder={v("scripts.zoeken")}
        className="input-cm"
      />

      {/* Categorie filters */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CATEGORIE_LABELS).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => setActieveCategorie(cat)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              actieveCategorie === cat
                ? "bg-cm-gold text-cm-black font-semibold"
                : "border border-cm-border text-cm-white hover:text-cm-white hover:border-cm-gold-dim"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scripts */}
      <div className="space-y-4">
        {gefilterd.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-cm-white">{v("scripts.niet_gevonden")}</p>
          </div>
        ) : (
          gefilterd.map((script) => (
            <ScriptKaart
              key={script.scriptId}
              script={script}
              onKopieer={() => kopieer(script.inhoud, script.titel)}
              vMeer={v("scripts.meer")}
              vMinder={v("scripts.minder")}
              vKopieer={v("scripts.kopieer")}
              isFounder={isFounder}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ScriptKaart({
  script,
  onKopieer,
  vMeer,
  vMinder,
  vKopieer,
  isFounder,
}: {
  script: ScriptMetMeta;
  onKopieer: () => void;
  vMeer: string;
  vMinder: string;
  vKopieer: string;
  isFounder: boolean;
}) {
  const router = useRouter();
  const [uitgeklapt, setUitgeklapt] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [bewerkTitel, setBewerkTitel] = useState(script.titel);
  const [bewerkInhoud, setBewerkInhoud] = useState(script.inhoud);
  const [bezig, setBezig] = useState(false);

  const CATEGORIE_BADGE: Record<string, string> = {
    uitnodiging: "bg-[#1A2A3A] text-[#4A9EDB]",
    edification: "bg-[#2A2438] text-[#C9A84C]",
    bezwaar: "bg-[#2A1A1A] text-[#DB6A4A]",
    followup: "bg-[#2A2A1A] text-[#C9A84C]",
    sluiting: "bg-[#1A2A1A] text-[#4ACB6A]",
    presentatie: "bg-[#2A1A3A] text-[#9A6ADB]",
  };

  const titelLower = script.titel.toLowerCase();
  const cat = script.categorie;
  const zichtbareTags = script.tags
    .filter((t) => {
      const tl = t.toLowerCase();
      if (tl === cat) return false;
      if (titelLower.includes(tl)) return false;
      return true;
    })
    .slice(0, 2);

  function startBewerken() {
    setBewerken(true);
    setBewerkTitel(script.titel);
    setBewerkInhoud(script.inhoud);
    setUitgeklapt(true);
  }

  async function bewaar() {
    setBezig(true);
    try {
      const res = await fetch("/api/scripts/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptId: script.scriptId,
          titel: bewerkTitel,
          inhoud: bewerkInhoud,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      toast.success("✍️ Bewaard — direct zichtbaar voor alle members");
      setBewerken(false);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function reset() {
    if (
      !confirm(
        `Dit script terugzetten naar de standaardtekst? Aanpassingen gaan verloren.`,
      )
    )
      return;
    setBezig(true);
    try {
      const res = await fetch("/api/scripts/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId: script.scriptId, reset: true }),
      });
      if (!res.ok) {
        toast.error("Reset mislukt");
        return;
      }
      toast.success("Terug naar standaard");
      setBewerken(false);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-cm-white font-semibold text-sm">
              {script.titel}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                CATEGORIE_BADGE[script.categorie] ??
                "bg-cm-surface-2 text-cm-white"
              }`}
            >
              {script.categorie}
            </span>
            {zichtbareTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-cm-surface-2 text-cm-white opacity-70"
              >
                {tag}
              </span>
            ))}
            {script.isAangepast && (
              <span className="text-xs text-emerald-400 font-medium">
                ● Aangepast
              </span>
            )}
          </div>

          {bewerken ? (
            <div className="rounded-lg border-2 border-cm-gold/60 bg-cm-gold/[0.04] p-3 space-y-2 mt-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
                  ✍️ Founder-modus
                </span>
                <span className="text-xs text-cm-white opacity-70">
                  Wijziging is direct zichtbaar voor{" "}
                  <strong>alle members</strong>
                </span>
              </div>
              <div>
                <label className="block text-xs text-cm-white opacity-70 mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  value={bewerkTitel}
                  onChange={(e) => setBewerkTitel(e.target.value)}
                  className="input-cm w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-cm-white opacity-70 mb-1">
                  Inhoud
                </label>
                <textarea
                  value={bewerkInhoud}
                  onChange={(e) => setBewerkInhoud(e.target.value)}
                  className="textarea-cm w-full text-xs leading-relaxed font-mono"
                  rows={12}
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={bewaar}
                  disabled={bezig}
                  className="btn-gold text-xs disabled:opacity-50"
                >
                  {bezig ? "Bewaren..." : "Bewaar voor alle members"}
                </button>
                <button
                  type="button"
                  onClick={() => setBewerken(false)}
                  disabled={bezig}
                  className="text-xs text-cm-white opacity-70 hover:opacity-100"
                >
                  Annuleer
                </button>
                {script.isAangepast && (
                  <button
                    type="button"
                    onClick={reset}
                    disabled={bezig}
                    className="text-xs text-red-400 hover:text-red-300 underline-offset-2 ml-auto"
                  >
                    Terug naar standaard
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <p
                className={`text-cm-white text-xs leading-relaxed whitespace-pre-wrap ${
                  uitgeklapt ? "" : "line-clamp-3"
                }`}
              >
                {script.inhoud}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <button
                  onClick={() => setUitgeklapt(!uitgeklapt)}
                  className="text-cm-gold text-xs hover:text-cm-gold-light"
                >
                  {uitgeklapt ? vMinder : vMeer}
                </button>
                {isFounder && (
                  <button
                    type="button"
                    onClick={startBewerken}
                    title="Founder-bewerken — wijzigingen gaan LIVE voor alle members"
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-cm-gold/60 text-cm-gold bg-cm-gold/5 hover:bg-cm-gold/15 hover:border-cm-gold transition-colors font-semibold whitespace-nowrap"
                  >
                    ✍️ Bewerk voor iedereen
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!bewerken && (
          <button
            onClick={onKopieer}
            className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap flex-shrink-0"
          >
            {vKopieer}
          </button>
        )}
      </div>
    </div>
  );
}

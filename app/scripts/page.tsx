"use client";

import { useState } from "react";
import { SCRIPTS_DATA } from "@/lib/scripts-data";
import { toast } from "sonner";

const CATEGORIE_LABELS: Record<string, string> = {
  alle: "Alle scripts",
  uitnodiging: "📤 Uitnodigingen",
  bezwaar: "🛡️ Bezwaren",
  followup: "🔄 Follow-up",
  sluiting: "🎯 Sluiting",
  presentatie: "🎤 Presentatie",
};

export default function ScriptsPagina() {
  const [actieveCategorie, setActieveCategorie] = useState("alle");
  const [zoekterm, setZoekterm] = useState("");

  const gefilterd = SCRIPTS_DATA.filter((s) => {
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
    toast.success(`"${titel}" gekopieerd!`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Scriptbibliotheek
        </h1>
        <p className="text-cm-muted mt-1">
          Alle uitnodigingen, bezwaren en follow-up scripts op één plek
        </p>
      </div>

      {/* Zoekbalk */}
      <input
        type="text"
        value={zoekterm}
        onChange={(e) => setZoekterm(e.target.value)}
        placeholder="Zoek in scripts..."
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
                : "border border-cm-border text-cm-muted hover:text-cm-white hover:border-cm-gold-dim"
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
            <p className="text-cm-muted">Geen scripts gevonden voor deze zoekopdracht.</p>
          </div>
        ) : (
          gefilterd.map((script) => (
            <ScriptKaart
              key={script.titel}
              script={script}
              onKopieer={() => kopieer(script.inhoud, script.titel)}
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
}: {
  script: (typeof SCRIPTS_DATA)[0];
  onKopieer: () => void;
}) {
  const [uitgeklapt, setUitgeklapt] = useState(false);

  const CATEGORIE_BADGE: Record<string, string> = {
    uitnodiging: "bg-[#1A2A3A] text-[#4A9EDB]",
    bezwaar: "bg-[#2A1A1A] text-[#DB6A4A]",
    followup: "bg-[#2A2A1A] text-[#C9A84C]",
    sluiting: "bg-[#1A2A1A] text-[#4ACB6A]",
    presentatie: "bg-[#2A1A3A] text-[#9A6ADB]",
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-cm-white font-semibold text-sm">{script.titel}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                CATEGORIE_BADGE[script.categorie]
              }`}
            >
              {script.categorie}
            </span>
            {script.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-cm-surface-2 text-cm-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Preview of de volledige tekst */}
          <p
            className={`text-cm-muted text-xs leading-relaxed whitespace-pre-wrap ${
              uitgeklapt ? "" : "line-clamp-3"
            }`}
          >
            {script.inhoud}
          </p>

          <button
            onClick={() => setUitgeklapt(!uitgeklapt)}
            className="text-cm-gold text-xs mt-1 hover:text-cm-gold-light"
          >
            {uitgeklapt ? "Minder tonen ↑" : "Volledig tonen ↓"}
          </button>
        </div>

        <button
          onClick={onKopieer}
          className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
        >
          📋 Kopieer
        </button>
      </div>
    </div>
  );
}

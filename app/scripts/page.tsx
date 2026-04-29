"use client";

import { useState } from "react";
import { SCRIPTS_DATA } from "@/lib/scripts-data";
import { toast } from "sonner";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";

export default function ScriptsPagina() {
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
    toast.success(`"${titel}" ${v("scripts.gekopieerd")}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4">
        {v("algemeen.terug")}
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("scripts.titel")}
        </h1>
        <p className="text-cm-white mt-1">
          {v("scripts.subtitel")}
        </p>
      </div>

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
              key={script.titel}
              script={script}
              onKopieer={() => kopieer(script.inhoud, script.titel)}
              vMeer={v("scripts.meer")}
              vMinder={v("scripts.minder")}
              vKopieer={v("scripts.kopieer")}
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
}: {
  script: (typeof SCRIPTS_DATA)[0];
  onKopieer: () => void;
  vMeer: string;
  vMinder: string;
  vKopieer: string;
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
                className="text-xs px-2 py-0.5 rounded-full bg-cm-surface-2 text-cm-white"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Preview of de volledige tekst */}
          <p
            className={`text-cm-white text-xs leading-relaxed whitespace-pre-wrap ${
              uitgeklapt ? "" : "line-clamp-3"
            }`}
          >
            {script.inhoud}
          </p>

          <button
            onClick={() => setUitgeklapt(!uitgeklapt)}
            className="text-cm-gold text-xs mt-1 hover:text-cm-gold-light"
          >
            {uitgeklapt ? vMinder : vMeer}
          </button>
        </div>

        <button
          onClick={onKopieer}
          className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
        >
          {vKopieer}
        </button>
      </div>
    </div>
  );
}

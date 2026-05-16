"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BRACKETS } from "@/lib/dtt/brackets";
import { bracketVoorUren } from "@/lib/dtt/advies";

// ============================================================
// Core Tempo-sectie op /instellingen.
// Member kan op elk moment z'n DTT (Doel-Tijd-Termijn) aanpassen.
// Wijziging is direct van kracht op de aantal-richtlijnen in de DMO-blok.
// ============================================================

type Props = {
  initieelDoel: number | null;
  initieleUren: number | null;
  initieleTermijn: number | null;
};

export function CoreTempoSectie({
  initieelDoel,
  initieleUren,
  initieleTermijn,
}: Props) {
  const [doel, setDoel] = useState(initieelDoel?.toString() ?? "");
  const [uren, setUren] = useState(initieleUren?.toString() ?? "");
  const [termijn, setTermijn] = useState(initieleTermijn?.toString() ?? "");
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  const urenNum = parseFloat(uren);
  const bracket = !isNaN(urenNum) ? bracketVoorUren(urenNum) : null;
  const def = bracket ? BRACKETS[bracket] : null;

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);

    const res = await fetch("/api/dtt/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doel_per_maand: parseFloat(doel),
        uren_per_week: parseFloat(uren),
        termijn_maanden: parseFloat(termijn),
      }),
    });

    if (res.ok) {
      toast.success("Tempo bijgewerkt");
      router.refresh();
    } else {
      toast.error("Opslaan mislukt");
    }
    setBezig(false);
  }

  return (
    <form onSubmit={opslaan} className="card space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          🎯 Core Doel-Tijd-Termijn
        </h2>
        <p className="text-cm-white opacity-70 text-sm mt-1">
          Pas je doel, uren of termijn aan. De dagelijkse aantallen in je DMO-blok schuiven mee.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Doel (euro/maand)</label>
          <input
            type="number"
            value={doel}
            onChange={(e) => setDoel(e.target.value)}
            className="input-cm"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Uren/week</label>
          <input
            type="number"
            value={uren}
            onChange={(e) => setUren(e.target.value)}
            className="input-cm"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Termijn (maanden)</label>
          <input
            type="number"
            value={termijn}
            onChange={(e) => setTermijn(e.target.value)}
            className="input-cm"
            min="1"
          />
        </div>
      </div>
      {def && (
        <p className="text-cm-white/85 text-xs">
          Tempo: <strong className="text-cm-white">{def.label}</strong> ({def.urenPerWeekRange}/week)
          <br />
          <span className="text-cm-white/60">{def.verwachting}</span>
        </p>
      )}
      <button type="submit" disabled={bezig} className="btn-gold">
        {bezig ? "Bezig..." : "Tempo bijwerken"}
      </button>
    </form>
  );
}

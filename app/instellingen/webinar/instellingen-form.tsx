"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ============================================================
// Founder-only: de masterclass zelf instellen. Eén opname voor het
// hele team, dus wat hier staat geldt voor iedereen die deelt.
// ============================================================

type Config = {
  titel: string;
  ondertitel: string;
  video_url: string;
  duur_minuten: number;
  intro_tekst: string;
  actie_label: string;
  actie_uitleg: string;
  actief: boolean;
};

export function WebinarInstellingenForm({ config }: { config: Config }) {
  const [waarden, setWaarden] = useState<Config>(config);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  function zet<K extends keyof Config>(sleutel: K, waarde: Config[K]) {
    setWaarden((v) => ({ ...v, [sleutel]: waarde }));
  }

  async function bewaar() {
    setBezig(true);
    try {
      const res = await fetch("/api/webinar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waarden),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        toast.error(d?.error ?? "Opslaan mislukt");
      } else {
        toast.success("Opgeslagen");
        router.refresh();
      }
    } catch {
      toast.error("Geen verbinding");
    }
    setBezig(false);
  }

  return (
    <div className="card border-l-4 border-purple-500/60 bg-purple-950/20 space-y-4">
      <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">
        👑 Founder, de masterclass instellen
      </p>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">Titel</label>
        <input
          className="input-cm w-full"
          value={waarden.titel}
          onChange={(e) => zet("titel", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">
          Ondertitel (staat direct onder de titel)
        </label>
        <input
          className="input-cm w-full"
          value={waarden.ondertitel}
          onChange={(e) => zet("ondertitel", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">
          Video-URL (Vimeo of YouTube)
        </label>
        <input
          className="input-cm w-full"
          value={waarden.video_url}
          onChange={(e) => zet("video_url", e.target.value)}
          placeholder="https://vimeo.com/..."
        />
        <p className="text-cm-white/45 text-xs">
          Plak de gewone link, die zetten we zelf om naar een speler.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">Duur in minuten</label>
        <input
          type="number"
          min={5}
          max={180}
          className="input-cm w-full"
          value={waarden.duur_minuten}
          onChange={(e) => zet("duur_minuten", Number(e.target.value))}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">
          Intro-tekst op de aanmeldpagina (mag leeg)
        </label>
        <textarea
          className="input-cm w-full"
          rows={5}
          value={waarden.intro_tekst}
          onChange={(e) => zet("intro_tekst", e.target.value)}
          placeholder="Waar gaat het over, en voor wie is het."
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">
          Tekst op de actie-knop (onder de video)
        </label>
        <input
          className="input-cm w-full"
          value={waarden.actie_label}
          onChange={(e) => zet("actie_label", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cm-white/85">
          Zinnetje boven die knop
        </label>
        <textarea
          className="input-cm w-full"
          rows={3}
          value={waarden.actie_uitleg}
          onChange={(e) => zet("actie_uitleg", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-cm-white/85">
        <input
          type="checkbox"
          checked={waarden.actief}
          onChange={(e) => zet("actief", e.target.checked)}
          className="w-4 h-4"
        />
        Masterclass staat aan (uit = aanmeldpagina niet bereikbaar)
      </label>

      <button
        onClick={bewaar}
        disabled={bezig}
        className="btn-gold w-full py-3 font-semibold disabled:opacity-50"
      >
        {bezig ? "Bezig..." : "Opslaan"}
      </button>
    </div>
  );
}

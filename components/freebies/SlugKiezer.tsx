"use client";

import { useState } from "react";
import { toast } from "sonner";

// Lid kiest een leesbaar woord voor zijn freebie-link:
// my-eleva.com/gezonde-start/<woord>. Uniek over alle leden.

export function SlugKiezer({
  huidigeSlug,
  origin,
}: {
  huidigeSlug: string | null;
  origin: string;
}) {
  const [slug, setSlug] = useState(huidigeSlug ?? "");
  const [opgeslagen, setOpgeslagen] = useState<string | null>(
    huidigeSlug ?? null,
  );
  const [bezig, setBezig] = useState(false);

  const host = origin.replace(/^https?:\/\//, "");
  const link = opgeslagen ? `${origin}/gezonde-start/${opgeslagen}` : "";

  async function opslaan() {
    setBezig(true);
    try {
      const res = await fetch("/api/freebie/slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Opslaan mislukt.");
        return;
      }
      setOpgeslagen(data.slug ?? null);
      setSlug(data.slug ?? "");
      toast.success(
        data.slug ? "Je leesbare link staat klaar." : "Leesbare link verwijderd.",
      );
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setBezig(false);
    }
  }

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link gekopieerd.");
    } catch {
      /* negeer */
    }
  }

  return (
    <div className="space-y-2">
      {link && (
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-xs text-emerald-300 break-all">
            {link}
          </div>
          <button
            onClick={kopieer}
            className="shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Kopieer
          </button>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="whitespace-nowrap text-xs text-slate-400">
          {host}/gezonde-start/
        </span>
        <input
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          placeholder="jouwwoord"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-400"
        />
        <button
          onClick={opslaan}
          disabled={bezig}
          className="btn-gold text-sm disabled:opacity-50"
        >
          {bezig ? "..." : "Opslaan"}
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Kleine letters, cijfers en koppeltekens (3 tot 30 tekens). Leeg laten en
        opslaan = geen leesbare link.
      </p>
    </div>
  );
}

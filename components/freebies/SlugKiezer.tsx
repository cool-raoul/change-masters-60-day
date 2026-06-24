"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Lid kiest een leesbaar woord voor zijn freebie-link:
// my-eleva.com/gezonde-start/<woord>. Uniek over alle leden. Dit veldje toont
// GEEN tweede link; de link hierboven in de kaart past zich er na opslaan op aan.

export function SlugKiezer({
  huidigeSlug,
  origin,
}: {
  huidigeSlug: string | null;
  origin: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(huidigeSlug ?? "");
  const [bezig, setBezig] = useState(false);

  const host = origin.replace(/^https?:\/\//, "");

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
      setSlug(data.slug ?? "");
      toast.success(
        data.slug ? "Je leesbare link staat klaar." : "Leesbare link verwijderd.",
      );
      // Herlaad de server-render zodat de link bovenaan de kaart meteen klopt.
      router.refresh();
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="space-y-1.5">
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// ResetDagButton, founder-only knop om playbook_overrides-rij(en)
// te verwijderen. Daarna valt de pagina terug op de hardcoded
// tekst uit lib/playbook/dagen.ts.
//
// Twee modi:
// - Eén dag resetten (dagNummer prop)
// - Alle 21 dagen in één klik resetten (gebruikt loop intern)
//
// Gebruikt het bestaande POST /api/playbook/override endpoint met
// { dagNummer, reset: true } body. Endpoint heeft eigen founder-check
// en RLS-policy als tweede laag.
// ============================================================

export function ResetDagButton({ dagNummer }: { dagNummer: number }) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [bezigAlles, setBezigAlles] = useState(false);

  async function resetEenDag(dag: number) {
    const res = await fetch("/api/playbook/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dagNummer: dag, reset: true }),
    });
    return res.ok;
  }

  async function reset() {
    if (
      !confirm(
        `Reset dag ${dagNummer} naar de standaard tekst uit de code? Eventuele founder-aanpassingen voor deze dag worden verwijderd. Dit kan niet ongedaan worden.`,
      )
    ) {
      return;
    }
    setBezig(true);
    try {
      const ok = await resetEenDag(dagNummer);
      if (!ok) {
        toast.error("Reset mislukt");
        return;
      }
      toast.success(`Dag ${dagNummer} teruggezet op standaard tekst`);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function resetAlles() {
    if (
      !confirm(
        "Reset ALLE 21 dagen naar de standaard tekst uit de code? Eventuele founder-aanpassingen voor elke dag worden verwijderd. Dit kan niet ongedaan worden.",
      )
    ) {
      return;
    }
    setBezigAlles(true);
    let mislukt = 0;
    for (let dag = 1; dag <= 21; dag++) {
      try {
        const ok = await resetEenDag(dag);
        if (!ok) mislukt++;
      } catch {
        mislukt++;
      }
    }
    if (mislukt === 0) {
      toast.success("Alle 21 dagen teruggezet op standaard tekst");
    } else if (mislukt < 21) {
      toast.warning(`${21 - mislukt} dagen gereset, ${mislukt} mislukt`);
    } else {
      toast.error("Reset mislukt");
    }
    setBezigAlles(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <button
        type="button"
        onClick={reset}
        disabled={bezig || bezigAlles}
        className="text-xs px-3 py-1.5 rounded-full border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        title="Verwijder eventuele founder-aanpassingen voor deze dag"
      >
        {bezig ? "Bezig..." : `🔄 Reset dag ${dagNummer} naar standaard`}
      </button>
      <button
        type="button"
        onClick={resetAlles}
        disabled={bezig || bezigAlles}
        className="text-xs px-3 py-1.5 rounded-full border border-red-600/60 bg-red-900/20 text-red-200 hover:bg-red-900/40 disabled:opacity-50 transition-colors"
        title="Verwijder alle founder-aanpassingen voor dag 1 t/m 21"
      >
        {bezigAlles ? "Bezig..." : "🔥 Reset ALLE 21 dagen naar standaard"}
      </button>
    </div>
  );
}

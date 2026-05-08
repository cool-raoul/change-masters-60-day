"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// ResetDagButton, founder-only knop om de playbook_overrides-rij
// voor één specifieke dag te verwijderen. Daarna valt de pagina
// terug op de hardcoded tekst uit lib/playbook/dagen.ts.
//
// Gebruikt het bestaande POST /api/playbook/override endpoint met
// { dagNummer, reset: true } body. Endpoint heeft eigen founder-check
// en RLS-policy als tweede laag.
// ============================================================

export function ResetDagButton({ dagNummer }: { dagNummer: number }) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);

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
      const res = await fetch("/api/playbook/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dagNummer, reset: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Reset mislukt");
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

  return (
    <button
      type="button"
      onClick={reset}
      disabled={bezig}
      className="text-xs px-3 py-1.5 rounded-full border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
      title="Verwijder eventuele founder-aanpassingen voor deze dag"
    >
      {bezig ? "Bezig..." : `🔄 Reset dag ${dagNummer} naar standaard`}
    </button>
  );
}

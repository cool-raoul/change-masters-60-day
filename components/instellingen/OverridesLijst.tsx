"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// OverridesLijst, client-component voor /instellingen/tekst-overrides.
//
// Groepeert overrides per namespace, toont per item een korte preview
// (sleutel + eerste regel van de waarde) plus knoppen:
//   - Toon: klap volledige tekst uit
//   - Terug naar standaard: reset de override (= row deleten via API)
//
// Geen edit-functie hier; dat doe je op de plek waar de tekst zelf
// staat (✍️ Bewerk knop via EditableTekst). Deze pagina is voor
// OVERZICHT + RESET.
// ============================================================

export type OverrideRij = {
  namespace: string;
  sleutel: string;
  waarde: string;
  updated_at: string;
};

export function OverridesLijst({
  groepen,
}: {
  groepen: Array<[string, OverrideRij[]]>;
}) {
  const router = useRouter();
  const [openOverride, setOpenOverride] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  async function reset(namespace: string, sleutel: string) {
    if (
      !confirm(
        `Override "${namespace}.${sleutel}" terugzetten naar standaard? De code-tekst wordt weer zichtbaar, jouw aanpassing gaat verloren.`,
      )
    )
      return;
    const key = `${namespace}.${sleutel}`;
    setBezig(key);
    try {
      const r = await fetch("/api/tekst/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, sleutel, reset: true }),
      });
      if (!r.ok) {
        toast.error("Reset mislukt");
        return;
      }
      toast.success("Override gereset, standaard tekst zichtbaar");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="space-y-3">
      {groepen.map(([namespace, items]) => (
        <details
          key={namespace}
          open
          className="card border-l-4 border-cm-gold"
        >
          <summary className="cursor-pointer flex items-center justify-between gap-3 list-none">
            <h2 className="text-base font-semibold text-cm-gold">
              {namespace}
            </h2>
            <span className="text-xs text-cm-white opacity-60">
              {items.length} override{items.length === 1 ? "" : "s"}
            </span>
          </summary>
          <div className="mt-3 space-y-2">
            {items.map((item) => {
              const key = `${item.namespace}.${item.sleutel}`;
              const open = openOverride === key;
              const datumLabel = new Date(item.updated_at).toLocaleDateString(
                "nl-NL",
                { day: "numeric", month: "short", year: "numeric" },
              );
              const firstLine =
                item.waarde.split("\n").find((l) => l.trim().length > 0) ??
                item.waarde;
              return (
                <div
                  key={key}
                  className="rounded-lg border border-cm-border bg-cm-surface p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-cm-white text-sm font-medium break-words">
                        {item.sleutel}
                      </p>
                      <p className="text-cm-white text-xs opacity-60 mt-0.5 line-clamp-1">
                        {firstLine}
                      </p>
                      <p className="text-cm-white text-[10px] opacity-50 mt-1">
                        Aangepast: {datumLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenOverride(open ? null : key)}
                        className="text-xs text-cm-white opacity-70 hover:opacity-100 px-2 py-1"
                      >
                        {open ? "Inklappen" : "Toon"}
                      </button>
                      <button
                        type="button"
                        onClick={() => reset(item.namespace, item.sleutel)}
                        disabled={bezig === key}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 whitespace-nowrap"
                      >
                        {bezig === key
                          ? "Bezig..."
                          : "↺ Terug naar standaard"}
                      </button>
                    </div>
                  </div>
                  {open && (
                    <pre className="text-xs text-cm-white whitespace-pre-wrap break-words bg-cm-surface-2 p-3 rounded border border-cm-border font-sans">
                      {item.waarde}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}

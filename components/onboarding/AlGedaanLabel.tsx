"use client";

import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// Klein groen label dat verschijnt bij een pre-day-1-stap die al
// cross-modus is afgevinkt. Member kan 'm alsnog bekijken/aanpassen
// via de bekijkRoute, maar hoeft niets opnieuw.
// ============================================================

type Props = {
  modus: Modus;
  datum: string | null;
  bekijkRoute?: string;
};

function modusLabel(m: Modus): string {
  if (m === "sprint") return "Sprint";
  if (m === "core") return "Core";
  return "Pro";
}

function datumKort(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function AlGedaanLabel({ modus, datum, bekijkRoute }: Props) {
  const datumTekst = datumKort(datum);
  return (
    <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Al gedaan tijdens {modusLabel(modus)}
          {datumTekst ? ` (${datumTekst})` : ""}
        </p>
        <p className="text-cm-white text-xs opacity-70 mt-0.5">
          Je hoeft 'm niet opnieuw te doen. Bekijken of bijschaven mag wel.
        </p>
      </div>
      {bekijkRoute && (
        <a
          href={bekijkRoute}
          className="text-xs bg-cm-surface border border-cm-border text-cm-white px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          Bekijk opnieuw
        </a>
      )}
    </div>
  );
}

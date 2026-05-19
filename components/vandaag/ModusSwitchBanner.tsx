"use client";

import { useRouter } from "next/navigation";
import { EditableTekst } from "@/components/cms/EditableTekst";

// ============================================================
// ModusSwitchBanner, verschijnt op /vandaag wanneer de huidige modus
// nog geen modus-specifieke keuze heeft (tempo voor Sprint, DTT voor
// Core). Bij her-activatie van een eerder gebruikte modus toont 'ie
// ook de oppakken/opnieuw-keuze.
// ============================================================

type Props = {
  modus: "sprint" | "core";
  hadEerderDezeModus: boolean;
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function ModusSwitchBanner({
  modus,
  hadEerderDezeModus,
  isFounder,
  overrides,
}: Props) {
  const router = useRouter();
  const sleutelPrefix = modus === "core" ? "naar-core" : "naar-sprint";

  async function kies(keuze: "opnieuw" | "oppakken") {
    await fetch("/api/modus/her-activatie-keuze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modus, keuze }),
    });
    router.refresh();
  }

  return (
    <div className="border-l-4 border-cm-gold bg-cm-gold/5 px-3 py-2 my-2 rounded-r-md">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <EditableTekst
            namespace="modus-switch"
            sleutel={`${sleutelPrefix}.titel`}
            standaard={
              modus === "core"
                ? "Welkom terug bij Core"
                : "Welkom terug bij Sprint"
            }
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold text-sm font-semibold"
          />
          <p className="text-cm-white text-xs opacity-80 mt-0.5">
            Je had deze modus eerder al actief. Oppakken of opnieuw beginnen?
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => kies("oppakken")}
            className="text-xs bg-cm-gold text-cm-on-gold px-3 py-1.5 rounded font-semibold"
          >
            Oppakken
          </button>
          <button
            onClick={() => kies("opnieuw")}
            className="text-xs border border-cm-border text-cm-white px-3 py-1.5 rounded"
          >
            Opnieuw beginnen
          </button>
        </div>
      </div>
    </div>
  );
}

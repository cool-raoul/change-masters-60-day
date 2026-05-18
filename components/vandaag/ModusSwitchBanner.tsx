"use client";

import { useRouter } from "next/navigation";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

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
    <div className="card border-2 border-cm-gold bg-cm-gold/10 my-3">
      <EditableTekst
        namespace="modus-switch"
        sleutel={`${sleutelPrefix}.titel`}
        standaard={
          modus === "core"
            ? "Je bent overgestapt naar Core"
            : "Je bent overgestapt naar Sprint"
        }
        overrides={overrides}
        isFounder={isFounder}
        as="h3"
        className="text-cm-gold font-semibold mb-1"
      />
      <EditableBlok
        namespace="modus-switch"
        sleutel={`${sleutelPrefix}.uitleg`}
        standaard={
          modus === "core"
            ? "Vul nog even je Doel-Tijd-Termijn in, dan kunnen we je dag 1 op maat maken."
            : "Vul nog even je tempo in (2, 4 of 6 uur per dag), dan kunnen we je dag 1 op maat maken."
        }
        overrides={overrides}
        isFounder={isFounder}
        as="p"
        className="text-cm-white text-sm opacity-90 mb-3"
        rows={2}
      />

      {hadEerderDezeModus && (
        <div className="space-y-2 mb-3">
          <p className="text-cm-white text-xs opacity-70">
            Je had deze modus eerder al actief. Wil je:
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => kies("oppakken")}
              className="btn-gold text-sm px-3 py-2"
            >
              Oppakken waar je was
            </button>
            <button
              onClick={() => kies("opnieuw")}
              className="text-sm px-3 py-2 border border-cm-border text-cm-white rounded-lg"
            >
              Opnieuw beginnen op dag 1
            </button>
          </div>
        </div>
      )}

      <a
        href={modus === "core" ? "/onboarding?stap=4" : "/onboarding?stap=4"}
        className="btn-gold inline-block px-4 py-2 text-sm font-semibold"
      >
        <EditableTekst
          namespace="modus-switch"
          sleutel={`${sleutelPrefix}.cta`}
          standaard={modus === "core" ? "Vul DTT in" : "Kies je tempo"}
          overrides={overrides}
          isFounder={isFounder}
          as="span"
        />
      </a>
    </div>
  );
}

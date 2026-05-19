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
  /** Dag-nummer waarop de gebruiker stond in deze modus voordat 'ie
   *  switchte. Wordt in de oppakken-knop getoond. Null = onbekend. */
  laatsteDagInDezeModus: number | null;
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function ModusSwitchBanner({
  modus,
  hadEerderDezeModus,
  laatsteDagInDezeModus,
  isFounder,
  overrides,
}: Props) {
  const router = useRouter();
  const sleutelPrefix = modus === "core" ? "naar-core" : "naar-sprint";
  const modusNaam = modus === "core" ? "Core" : "Sprint";

  async function kies(keuze: "opnieuw" | "oppakken") {
    await fetch("/api/modus/her-activatie-keuze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modus, keuze }),
    });
    // Na her-activatie-keuze óók de modus-keuze-stap doorlopen (tempo
    // voor Sprint, DTT voor Core), anders blijft de banner staan omdat
    // commitment_uren of core_dtt nog leeg is.
    router.push("/onboarding?stap=4");
    router.refresh();
  }

  // Twee varianten:
  // 1. Her-activatie (hadEerderDezeModus = true): toon oppakken vs opnieuw-keuze.
  // 2. Eerste activatie zonder pre-day-1-keuze (bestaande pilot-leden): toon
  //    'vul je tempo / DTT in'-link.
  if (hadEerderDezeModus) {
    const oppakkenLabel =
      laatsteDagInDezeModus && laatsteDagInDezeModus > 1
        ? `Oppakken bij dag ${laatsteDagInDezeModus}`
        : "Oppakken waar je was";
    return (
      <div className="border-l-4 border-cm-gold bg-cm-gold/5 px-4 py-3 my-2 rounded-r-md space-y-3">
        <div>
          <EditableTekst
            namespace="modus-switch"
            sleutel={`${sleutelPrefix}.titel`}
            standaard={`Welkom terug bij ${modusNaam}`}
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold font-semibold text-sm"
          />
          <p className="text-cm-white text-sm opacity-90 mt-1 leading-relaxed">
            Je was hier eerder actief
            {laatsteDagInDezeModus && laatsteDagInDezeModus > 1
              ? ` (laatst op dag ${laatsteDagInDezeModus})`
              : ""}
            . Wil je het oppakken waar je was, of helemaal opnieuw beginnen bij dag 1?
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => kies("oppakken")}
            className="text-sm bg-cm-gold text-cm-on-gold px-3 py-2 rounded font-semibold"
          >
            {oppakkenLabel}
          </button>
          <button
            onClick={() => kies("opnieuw")}
            className="text-sm border border-cm-border text-cm-white px-3 py-2 rounded"
          >
            Opnieuw beginnen bij dag 1
          </button>
        </div>
      </div>
    );
  }

  // Eerste-keer banner, voor bestaande pilot-leden die nog geen pre-day-1
  // hebben gedaan (commitment_uren of core_dtt mist).
  return (
    <div className="border-l-4 border-cm-gold bg-cm-gold/5 px-3 py-2 my-2 rounded-r-md flex items-center justify-between gap-3 flex-wrap">
      <p className="text-cm-white text-sm flex-1 min-w-0">
        <EditableTekst
          namespace="modus-switch"
          sleutel={`${sleutelPrefix}.eerste-titel`}
          standaard={
            modus === "core"
              ? "Vul je Doel-Tijd-Termijn in om je dag op maat te maken."
              : "Kies je tempo (2/4/6 uur per dag) om je dag op maat te maken."
          }
          overrides={overrides}
          isFounder={isFounder}
          as="span"
        />
      </p>
      <a
        href="/instellingen"
        className="text-xs bg-cm-gold text-cm-on-gold px-3 py-1.5 rounded font-semibold whitespace-nowrap"
      >
        {modus === "core" ? "Vul DTT in" : "Kies tempo"}
      </a>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// DailyFocusModal — focus-scherm bij eerste bezoek van een dag.
//
// User-feedback: 'na onboarding hebben mensen een duidelijke pagina-flow.
// Bij de 21 dagen moet hetzelfde — bij eerste bezoek van de dag eerst een
// focus-veld met wat er die dag te doen is, voordat de rest opent.'
//
// Werkt zo:
// - Bij elke dag-load checkt 'ie localStorage of dit scherm vandaag al
//   gesloten was. Zo nee → modal opent.
// - Member ziet titel + dagdoel + checklist + 1 prominente 'aan de slag'-
//   knop die naar de detail-tegel/playbook brengt.
// - Bij sluiten: localStorage flag → vandaag niet meer tonen.
// - Tester/founder die dag-springt = nieuwe key → modal opent opnieuw.
// ============================================================

type Props = {
  dag: Dag;
  /** Hoeveelheid taken die al zijn afgevinkt (voor "x van y" status). */
  voltooidAantal: number;
};

function vandaagDatum(): string {
  return new Date().toISOString().split("T")[0];
}

function localStorageKey(dagNummer: number): string {
  return `eleva-focus-dag${dagNummer}-${vandaagDatum()}`;
}

export function DailyFocusModal({ dag, voltooidAantal }: Props) {
  const [open, setOpen] = useState(false);
  const totaal = dag.vandaagDoen.length;

  useEffect(() => {
    // Niet meer tonen als al gesloten vandaag (per dag-nummer + datum)
    try {
      const k = localStorageKey(dag.nummer);
      if (window.localStorage.getItem(k) !== "gesloten") {
        setOpen(true);
      }
    } catch {
      // localStorage geblokkeerd? Dan gewoon openen.
      setOpen(true);
    }
  }, [dag.nummer]);

  function sluit() {
    try {
      window.localStorage.setItem(localStorageKey(dag.nummer), "gesloten");
    } catch {
      // negeer
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-cm-bg-2 rounded-2xl max-w-lg w-full my-8 shadow-2xl border border-cm-gold/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header met gouden accent */}
        <div className="bg-gradient-to-br from-cm-gold/15 to-transparent px-6 py-5 border-b border-cm-gold/20">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Dag {dag.nummer} · Fase {dag.fase}
          </p>
          <h2 className="text-cm-white font-display font-bold text-2xl mt-1">
            Goedemorgen! 🌅
          </h2>
          <p className="text-cm-white opacity-80 text-sm mt-2 leading-relaxed">
            Klaar voor vandaag? Hier is je focus voor{" "}
            <strong className="text-cm-gold">dag {dag.nummer}</strong>.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-cm-white opacity-60 text-xs uppercase tracking-wider font-semibold mb-1">
              Vandaag staat in het teken van
            </p>
            <h3 className="text-cm-white font-display font-semibold text-lg leading-snug">
              {dag.titel}
            </h3>
          </div>

          {/* Checklist */}
          <div>
            <p className="text-cm-white opacity-60 text-xs uppercase tracking-wider font-semibold mb-2">
              Wat ga je vandaag doen?
            </p>
            <ul className="space-y-2">
              {dag.vandaagDoen.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-2.5 text-sm text-cm-white"
                >
                  <span className="text-cm-gold mt-0.5">✦</span>
                  <span>{t.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Status als al begonnen */}
          {voltooidAantal > 0 && (
            <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg px-3 py-2 text-sm text-emerald-300">
              💪 Je hebt al {voltooidAantal} van de {totaal} stappen gedaan
              vandaag — top, ga vooral door!
            </div>
          )}

          <div className="bg-cm-gold/10 border border-cm-gold/30 rounded-lg px-3 py-2.5 text-sm text-cm-white">
            <strong className="text-cm-gold">🎯 Tip:</strong> open elke dag
            eerst dit lijstje. Klein begin = grote vooruitgang.
          </div>
        </div>

        {/* Footer met knoppen */}
        <div className="px-6 py-4 bg-cm-surface flex items-center gap-3 flex-wrap border-t border-cm-border">
          <button
            type="button"
            onClick={sluit}
            className="btn-gold flex-1 py-3 text-sm font-bold"
          >
            Aan de slag! →
          </button>
          <Link
            href={`/playbook?dag=${dag.nummer}`}
            onClick={sluit}
            className="btn-secondary flex-1 py-3 text-center text-sm font-semibold"
          >
            Lees meer
          </Link>
        </div>
        <button
          type="button"
          onClick={sluit}
          className="w-full text-cm-white opacity-50 hover:opacity-80 text-xs py-2 border-t border-cm-border"
        >
          Sluiten — niet meer tonen vandaag
        </button>
      </div>
    </div>
  );
}

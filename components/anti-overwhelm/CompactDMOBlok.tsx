// File: components/anti-overwhelm/CompactDMOBlok.tsx
//
// K1 van anti-overwhelm-kompas: /vandaag toont één ankerstap bovenaan,
// DMO eronder COMPACT ingeklapt. Default ingeklapt, één regel hoog,
// uitklappen op klik.

"use client";

import { useState } from "react";

export type DMOTaak = {
  id: string;
  label: string;
  voltooid: boolean;
  /** Optioneel: korte uitleg-zin onder de taak in uitgeklapte staat. */
  uitleg?: string;
};

export type CompactDMOBlokProps = {
  taken: DMOTaak[];
  /** Standaard ingeklapt (true) of uitgeklapt (false). Default true (K1). */
  standaardIngeklapt?: boolean;
  /** Optionele klik-handler per taak om af te vinken. */
  opTaakKlik?: (taakId: string) => void;
};

export function CompactDMOBlok({
  taken,
  standaardIngeklapt = true,
  opTaakKlik,
}: CompactDMOBlokProps) {
  const [ingeklapt, setIngeklapt] = useState(standaardIngeklapt);
  const aantalVoltooid = taken.filter((t) => t.voltooid).length;
  const aantalTotaal = taken.length;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-sm">
      <button
        type="button"
        onClick={() => setIngeklapt(!ingeklapt)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={!ingeklapt}
      >
        <span className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-slate-200">
            Je dagelijkse ritme{" "}
            <span className="text-slate-400">
              ({aantalVoltooid} van {aantalTotaal} vandaag)
            </span>
          </span>
        </span>
        <span className="text-slate-400">{ingeklapt ? "▼" : "▲"}</span>
      </button>

      {!ingeklapt && (
        <ul className="mt-3 space-y-2">
          {taken.map((t) => (
            <li key={t.id} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => opTaakKlik?.(t.id)}
                className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border ${
                  t.voltooid
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-500"
                }`}
                aria-label={t.voltooid ? "Voltooid" : "Markeer als voltooid"}
              >
                {t.voltooid ? "✓" : ""}
              </button>
              <div>
                <div className={t.voltooid ? "text-slate-400 line-through" : "text-slate-100"}>
                  {t.label}
                </div>
                {t.uitleg && (
                  <div className="mt-0.5 text-xs text-slate-400">{t.uitleg}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

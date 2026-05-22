// File: components/anti-overwhelm/GeadviseerdPad.tsx
//
// K3 van anti-overwhelm-kompas: bij een prospect TOONT de prospect-kaart
// één geadviseerd pad als duidelijke knop, alternatieven in dropdown.

"use client";

import { useState } from "react";

export type PadKeuze = {
  id: string;
  label: string;
  motivatie?: string;
};

export type GeadviseerdPadProps = {
  geadviseerd: PadKeuze;
  alternatieven: PadKeuze[];
  /** Klik op de hoofd-knop of een alternatief. */
  opKies: (padId: string) => void;
};

export function GeadviseerdPad({
  geadviseerd,
  alternatieven,
  opKies,
}: GeadviseerdPadProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => opKies(geadviseerd.id)}
        className="block w-full rounded-md bg-amber-600 px-4 py-2 text-left text-sm font-medium text-amber-50 hover:bg-amber-500"
      >
        <span className="block text-xs uppercase tracking-wider text-amber-200">
          Geadviseerd door de Mentor
        </span>
        <span className="mt-0.5 block">{geadviseerd.label}</span>
        {geadviseerd.motivatie && (
          <span className="mt-1 block text-xs font-normal text-amber-100/90">
            {geadviseerd.motivatie}
          </span>
        )}
      </button>

      {alternatieven.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-xs text-slate-400 underline hover:text-slate-300"
            aria-expanded={dropdownOpen}
          >
            of kies een ander pad
          </button>
          {dropdownOpen && (
            <ul className="mt-2 space-y-1">
              {alternatieven.map((alt) => (
                <li key={alt.id}>
                  <button
                    type="button"
                    onClick={() => opKies(alt.id)}
                    className="block w-full rounded-md border border-slate-700 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800"
                  >
                    {alt.label}
                    {alt.motivatie && (
                      <span className="mt-0.5 block text-slate-400">{alt.motivatie}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

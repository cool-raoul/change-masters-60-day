"use client";

import { useState } from "react";

// ============================================================
// PakketAccordionCard — uitklapbare pakket-kaart op de resultaatpagina
// voor de prospect.
//
// - Default ingeklapt: toont alleen niveau + pakket-naam + totaalprijs
// - Klik op de hele kaart om uit te klappen → producten lijst zichtbaar
// - IP's worden verborgen voor de prospect (member-jargon)
// - Aanbevolen niveau krijgt accent-rand + badge, blijft ingeklapt-default
//
// Reden voor accordion: de resultaatpagina werd anders te druk met cijfers.
// De prospect wil eerst beslissen WELK niveau, daarna ZIEN wat erin zit.
// ============================================================

export type PakketAccordionData = {
  niveau: "essential" | "plus" | "complete";
  niveauLabel: string;
  categorieLabel: string;
  producten: { naam: string; asapPrijs: number }[];
  totaalPrijs: number;
  gratisVerzending: boolean;
  waarom: string;
  notitie?: string;
};

export function PakketAccordionCard({
  pakket,
  isAanbevolen,
  bestellink,
  memberNaam,
  defaultOpen = false,
}: {
  pakket: PakketAccordionData;
  isAanbevolen: boolean;
  bestellink: { url: string } | undefined;
  memberNaam: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-colors ${
        isAanbevolen
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-black/[0.02]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              {pakket.niveauLabel}
            </span>
            {isAanbevolen && (
              <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-medium">
                Aanbevolen voor jou
              </span>
            )}
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate">
            {pakket.categorieLabel}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-gray-900 text-base">
              €{pakket.totaalPrijs.toFixed(2)}
            </div>
            <div className="text-[11px] text-gray-500">
              {pakket.gratisVerzending ? "gratis verzending" : "+ verzending"}
            </div>
          </div>
          <span
            className={`text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-black/5">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mt-4 mb-2">
            Wat zit erin?
          </div>
          <div className="space-y-1.5 mb-4">
            {pakket.producten.map((pr, i) => (
              <div key={i} className="flex justify-between text-sm gap-3">
                <span className="text-gray-700">{pr.naam}</span>
                <span className="text-gray-500 whitespace-nowrap">
                  €{pr.asapPrijs.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 italic mb-3">{pakket.waarom}</p>

          {pakket.notitie && (
            <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
              {pakket.notitie}
            </p>
          )}

          {bestellink ? (
            <a
              href={bestellink.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-3 rounded-lg font-semibold ${
                isAanbevolen
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              Bestel via {memberNaam}
            </a>
          ) : (
            <div className="text-center py-3 rounded-lg bg-gray-100 text-gray-500 text-sm">
              Vraag {memberNaam} om je persoonlijke bestellink
            </div>
          )}
        </div>
      )}
    </div>
  );
}

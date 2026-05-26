// File: components/freebies/InstagramLinkBuilder.tsx
//
// Hulpje voor members om snel een tracking-link met Instagram-handle
// te maken. Plak je in je DM, prospect klikt erop, ELEVA pakt de
// Instagram-handle op en zet 'm op de prospect-kaart.

"use client";

import { useState } from "react";

export function InstagramLinkBuilder({ basisUrl }: { basisUrl: string }) {
  const [handle, setHandle] = useState("");
  const [gekopieerd, setGekopieerd] = useState(false);

  const schoneHandle = handle.trim().replace(/^@/, "").trim();
  const link = schoneHandle
    ? `${basisUrl}?ig=${encodeURIComponent(schoneHandle)}&via=instagram`
    : basisUrl;

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(link);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch {
      window.prompt("Kopieer deze link:", link);
    }
  }

  return (
    <details className="mt-4 rounded-xl border border-pink-300/40 bg-pink-500/5 p-4">
      <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-pink-200 hover:text-pink-100">
        <span>📸</span>
        <span>Maak een link met Instagram-handle erin</span>
      </summary>

      <div className="mt-3 space-y-3 text-sm">
        <p className="text-xs text-pink-200/80 leading-relaxed">
          Stuur je deze link via Instagram-DM naar iemand? Vul hier haar
          of zijn Instagram-naam in. ELEVA pakt die op en koppelt de
          intekening aan de juiste Instagram-account op de prospect-kaart.
          Handig als ze geen telefoonnummer willen geven.
        </p>

        <label className="block">
          <span className="text-xs text-pink-200/80 uppercase tracking-wider">
            Instagram-handle (zonder @)
          </span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="bv. marleen_lifestyle"
            className="mt-1 w-full rounded-lg border border-pink-300/30 bg-slate-900/40 px-3 py-2 text-sm text-pink-100 placeholder:text-slate-500 outline-none focus:border-pink-400"
          />
        </label>

        <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-xs text-slate-300 break-all border border-pink-300/20">
          {link}
        </div>

        <button
          type="button"
          onClick={kopieer}
          disabled={!schoneHandle}
          className="rounded-full bg-pink-600 px-4 py-1.5 text-white text-xs font-medium hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {gekopieerd ? "✓ Gekopieerd" : "📋 Kopieer aangepaste link"}
        </button>

        {!schoneHandle && (
          <p className="text-[11px] text-pink-200/60 italic">
            Vul eerst een handle in om de aangepaste link te kunnen kopiëren.
          </p>
        )}
      </div>
    </details>
  );
}

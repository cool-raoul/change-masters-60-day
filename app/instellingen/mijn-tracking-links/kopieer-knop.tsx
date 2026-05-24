// File: app/instellingen/mijn-tracking-links/kopieer-knop.tsx
//
// Kleine client-component voor kopiëer-naar-clipboard met visuele
// bevestiging. Geen externe lib nodig.

"use client";

import { useState } from "react";

export function KopieerKnop({ tekst }: { tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch (_e) {
      // Fallback: selecteer-fragment in een prompt
      window.prompt("Kopieer deze link:", tekst);
    }
  }

  return (
    <button
      type="button"
      onClick={kopieer}
      className="mt-2 rounded-full bg-rose-600 px-4 py-1.5 text-white text-xs font-medium hover:bg-rose-700"
    >
      {gekopieerd ? "✓ Gekopieerd" : "📋 Kopieer link"}
    </button>
  );
}

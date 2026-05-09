"use client";

import Link from "next/link";

// ============================================================
// UitnodigHelpKnoppen, drie laagdrempelige paden voor uitnodig-taken.
//
// Renderd onder de taak-uitleg in vandaag-flow.tsx als de taak
// `uitnodigHelpKnoppen: true` heeft (zie lib/playbook/types.ts).
//
// Drie knoppen:
//   1. Voorbeelden bekijken (naar /scripts uitnodiging-sectie)
//   2. Maak met sponsor (WhatsApp/app naar sponsor om samen op te stellen)
//   3. Maak met Mentor (naar /coach met prefill-prompt)
//
// Voor starters in week 1-2 die elke dag opnieuw moeten bedenken hoe
// een uitnodiging eruitziet. Drie paden, altijd zichtbaar, geen
// menu-zoekwerk.
// ============================================================

export function UitnodigHelpKnoppen() {
  return (
    <div className="rounded-lg border border-cm-gold/30 bg-cm-gold/5 px-4 py-3 space-y-3">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        ✨ Hulp nodig bij je uitnodiging?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link
          href="/scripts"
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">📝</span>
          <span className="font-semibold">Voorbeelden bekijken</span>
          <span className="opacity-60 text-[11px]">Snelle inspiratie</span>
        </Link>
        <Link
          href="/team"
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">💬</span>
          <span className="font-semibold">Met je sponsor</span>
          <span className="opacity-60 text-[11px]">Samen opstellen</span>
        </Link>
        <Link
          href="/coach?onderwerp=uitnodiging"
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">🤖</span>
          <span className="font-semibold">Met de Mentor</span>
          <span className="opacity-60 text-[11px]">AI-hulp op maat</span>
        </Link>
      </div>
    </div>
  );
}

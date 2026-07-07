"use client";

import { useState } from "react";

// De schakelaar oud <-> nieuw. Eén klik, hele account wisselt van schil.
// Bewust een HARDE navigatie (window.location) in plaats van router.push:
// de Next-router cachet server-redirects (dashboard <-> /nieuw) tot 30s
// client-side, waardoor je na het wisselen terug kon stuiteren naar de
// verkeerde schil.
export function NieuweLayoutToggle({ aan }: { aan: boolean }) {
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function wissel() {
    if (bezig) return;
    setBezig(true);
    setFout(null);
    try {
      const res = await fetch("/api/layout-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aan: !aan }),
      });
      if (res.ok) {
        window.location.assign(aan ? "/dashboard" : "/nieuw");
        return; // knop blijft op "even wisselen..." tot de harde navigatie
      }
      setFout("Wisselen lukte niet, probeer het nog een keer.");
      setBezig(false);
    } catch {
      setFout("Wisselen lukte niet, probeer het nog een keer.");
      setBezig(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={wissel}
        disabled={bezig}
        className={aan ? "btn-secondary text-sm" : "btn-gold text-sm font-bold"}
      >
        {bezig
          ? "Even wisselen..."
          : aan
            ? "↩️ Terug naar de oude layout"
            : "✨ Zet de nieuwe layout aan"}
      </button>
      {fout && <p className="text-xs text-red-400">{fout}</p>}
    </div>
  );
}

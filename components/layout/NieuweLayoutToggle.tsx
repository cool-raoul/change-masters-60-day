"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// De schakelaar oud <-> nieuw. Eén klik, hele account wisselt van schil.
export function NieuweLayoutToggle({ aan }: { aan: boolean }) {
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  async function wissel() {
    if (bezig) return;
    setBezig(true);
    try {
      const res = await fetch("/api/layout-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aan: !aan }),
      });
      if (res.ok) {
        router.push(aan ? "/dashboard" : "/nieuw");
        router.refresh();
      }
    } finally {
      setBezig(false);
    }
  }

  return (
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
  );
}

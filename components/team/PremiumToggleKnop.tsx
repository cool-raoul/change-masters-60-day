"use client";
import { useState } from "react";

export function PremiumToggleKnop({
  lidId,
  isPremium,
}: {
  lidId: string;
  isPremium: boolean;
}) {
  const [bezig, setBezig] = useState(false);
  const [actief, setActief] = useState(isPremium);

  async function toggle() {
    setBezig(true);
    const r = await fetch("/api/admin/premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: lidId, maanden: actief ? 0 : 1 }),
    });
    if (r.ok) setActief(!actief);
    setBezig(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={bezig}
      className={`text-xs px-2 py-1 rounded-full border transition-all ${
        actief
          ? "border-cm-gold/60 text-cm-gold bg-cm-gold/10"
          : "border-cm-border text-cm-white opacity-40 hover:opacity-70"
      }`}
    >
      {bezig ? "..." : actief ? "⭐ Premium" : "Geef premium"}
    </button>
  );
}

"use client";

import { useState } from "react";

export function VerseShareKnop() {
  const [status, setStatus] = useState<"idle" | "kopieerd" | "fout">("idle");

  async function maakVerseLinkEnKopieer() {
    try {
      const versie = `v${Date.now().toString(36)}`;
      const basis = typeof window !== "undefined"
        ? `${window.location.origin}/ontdek-eleva`
        : "https://change-masters-60-day-q25o.vercel.app/ontdek-eleva";
      const verseLink = `${basis}?${versie}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(verseLink);
        setStatus("kopieerd");
        setTimeout(() => setStatus("idle"), 2400);
      } else {
        window.prompt("Kopieer deze verse link:", verseLink);
      }
    } catch {
      setStatus("fout");
      setTimeout(() => setStatus("idle"), 2400);
    }
  }

  return (
    <button
      onClick={maakVerseLinkEnKopieer}
      className="text-[11px] font-semibold uppercase tracking-wider bg-purple-700/60 hover:bg-purple-600/80 text-purple-100 border border-purple-400/40 rounded-full px-3 py-1.5 transition-colors"
      title="Maakt een unieke share-URL waardoor WhatsApp opnieuw moet fetchen, zodat de allerlaatste aanpassingen meekomen"
    >
      {status === "kopieerd" && "✓ Verse link gekopieerd"}
      {status === "fout" && "✕ Kopiëren mislukt"}
      {status === "idle" && "📋 Verse share-link"}
    </button>
  );
}

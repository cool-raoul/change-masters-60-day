"use client";

import { useState } from "react";
import { toast } from "sonner";

// ============================================================
// Je eigen deel-link, met een kant-en-klaar berichtje erbij.
// Claimvrij gehouden: we nodigen uit om te kijken, we beloven niets.
// ============================================================

export function WebinarLinkBlok({ url, titel }: { url: string; titel: string }) {
  const [gekopieerd, setGekopieerd] = useState<"link" | "bericht" | null>(null);

  const bericht = `Ik zag een masterclass over ${titel} en moest aan je denken. Het is een opname van ongeveer drie kwartier, dus je kiest zelf wanneer je kijkt. Helemaal vrijblijvend, als het niets voor je is is dat ook prima: ${url}`;

  async function kopieer(tekst: string, wat: "link" | "bericht") {
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(wat);
      toast.success(wat === "link" ? "Link gekopieerd" : "Bericht gekopieerd");
      setTimeout(() => setGekopieerd(null), 2000);
    } catch {
      toast.error("Kopiëren lukte niet, selecteer 'm handmatig");
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-cm-gold font-semibold">Jouw persoonlijke link</h2>
      <p className="text-cm-white/70 text-sm leading-relaxed">
        Iedereen die zich via deze link aanmeldt, komt bij jou in de
        namenlijst en krijgt de mails van jou.
      </p>
      <div className="bg-cm-surface-2 rounded-lg px-3 py-2 break-all text-cm-white text-sm">
        {url}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => kopieer(url, "link")}
          className="btn-gold px-4 py-2 text-sm font-semibold"
        >
          {gekopieerd === "link" ? "✓ Gekopieerd" : "Kopieer link"}
        </button>
        <button
          onClick={() => kopieer(bericht, "bericht")}
          className="btn-secondary px-4 py-2 text-sm font-semibold"
        >
          {gekopieerd === "bericht" ? "✓ Gekopieerd" : "Kopieer uitnodiging"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(bericht)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-4 py-2 text-sm font-semibold"
        >
          💬 Delen via WhatsApp
        </a>
      </div>
      <p className="text-cm-white/50 text-xs leading-relaxed">
        Tip: stuur 'm 1-op-1, met een eigen eerste zin erbij over waarom je
        aan diegene dacht. Dat werkt beter dan een rondstuur-bericht.
      </p>
    </div>
  );
}

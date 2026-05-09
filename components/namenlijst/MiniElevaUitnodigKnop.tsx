"use client";

import { useState } from "react";
import { toast } from "sonner";

// ============================================================
// MiniElevaUitnodigKnop, op de prospect-kaart in /namenlijst/[id].
//
// Maakt via POST /api/mini-eleva/uitnodiging een nieuwe magic-link
// (14 dagen geldig) en toont de deelbare URL aan de member, zodat 'ie
// 'm kan kopieren en doorsturen via WhatsApp/SMS/email.
//
// Vervangt op termijn het klassieke 3-weg-gesprek voor business-prospects.
// Zie docs/superpowers/specs/2026-05-06-mini-eleva-design.md
// ============================================================

type Props = {
  prospectId: string;
  prospectNaam: string;
};

export function MiniElevaUitnodigKnop({ prospectId, prospectNaam }: Props) {
  const [bezig, setBezig] = useState(false);
  const [resultaat, setResultaat] = useState<{
    deelLink: string;
    expiresAt: string;
  } | null>(null);

  async function maakUitnodiging() {
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/uitnodiging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Aanmaken mislukt");
        return;
      }
      setResultaat({
        deelLink: data.deelLink,
        expiresAt: data.expires_at,
      });
      toast.success("Mini-ELEVA-uitnodiging aangemaakt");
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function kopieerLink() {
    if (!resultaat) return;
    navigator.clipboard.writeText(resultaat.deelLink);
    toast.success("Link gekopieerd naar klembord");
  }

  function deelViaWhatsApp() {
    if (!resultaat) return;
    const bericht = `Hé ${prospectNaam.split(" ")[0]}! Ik heb een eigen kijk-omgeving voor je klaargezet binnen ELEVA. Daar staan welkomstvideo's van mij, een AI-mentor die 24/7 al je vragen beantwoordt over Lifeplus, en een chat-lijntje met mij + mijn sponsor voor als je iemand wilt spreken. Geen pitch, geen druk, op je eigen tempo. 14 dagen geldig, geen account nodig.\n\n${resultaat.deelLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(bericht)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (resultaat) {
    return (
      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <div>
          <h3 className="text-cm-gold font-semibold text-sm">
            ✨ Mini-ELEVA aangemaakt voor {prospectNaam.split(" ")[0]}
          </h3>
          <p className="text-cm-white/70 text-xs leading-relaxed mt-1">
            Stuur de link via WhatsApp of kopieer 'm. {prospectNaam.split(" ")[0]}{" "}
            heeft 14 dagen om door de pagina's te kijken. Daarna kun je 'm
            verlengen op deze pagina als nodig, of een nieuwe maken.
          </p>
        </div>
        <div className="bg-cm-surface-2 rounded-lg p-3 break-all text-xs text-cm-white font-mono">
          {resultaat.deelLink}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={deelViaWhatsApp}
            className="btn-gold text-sm"
          >
            💬 Stuur via WhatsApp
          </button>
          <button
            type="button"
            onClick={kopieerLink}
            className="btn-secondary text-sm"
          >
            📋 Kopieer link
          </button>
          <button
            type="button"
            onClick={() => setResultaat(null)}
            className="btn-secondary text-sm"
          >
            Sluit
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={maakUitnodiging}
      disabled={bezig}
      className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors w-full text-left disabled:opacity-50"
    >
      <span className="text-2xl">✨</span>
      <div className="flex-1">
        <h3 className="text-cm-white font-semibold text-sm">
          {bezig
            ? "Bezig..."
            : `Mini-ELEVA-uitnodiging maken voor ${prospectNaam.split(" ")[0]}`}
        </h3>
        <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
          Geeft {prospectNaam.split(" ")[0]} 14 dagen eigen toegang tot een
          mini-versie van ELEVA. Vervangt het 3-weg-gesprek voor wie eerst
          rustig zelf wil kijken.
        </p>
      </div>
      <span className="text-cm-gold">→</span>
    </button>
  );
}

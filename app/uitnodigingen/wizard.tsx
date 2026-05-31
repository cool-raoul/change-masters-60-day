"use client";

import { useState } from "react";
import { toast } from "sonner";

type Prospect = {
  id: string;
  naam: string;
  fase: string;
};

type Props = {
  prospects: Prospect[];
};

// ============================================================
// UitnodigingenWizard, twee stappen-flow voor een nieuwe Mini-ELEVA-
// uitnodiging vanaf de hub-pagina /uitnodigingen.
//
// Stap 1: kies de kant (product / business)
// Stap 2: kies de prospect uit je namenlijst
// Daarna: POST + toon resultaat met link + WhatsApp-knop
// ============================================================

export function UitnodigingenWizard({ prospects }: Props) {
  const [soort, setSoort] = useState<"product" | "business">("product");
  const [zoek, setZoek] = useState("");
  const [bezig, setBezig] = useState(false);
  const [resultaat, setResultaat] = useState<{
    deelLink: string;
    prospectNaam: string;
  } | null>(null);

  const gefilterd = zoek.trim()
    ? prospects.filter((p) =>
        p.naam.toLowerCase().includes(zoek.toLowerCase().trim()),
      )
    : prospects;

  async function maakUitnodiging(prospect: Prospect) {
    if (bezig) return;
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/uitnodiging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
          soort,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Aanmaken mislukt");
        return;
      }
      setResultaat({
        deelLink: data.deelLink,
        prospectNaam: prospect.naam,
      });
      toast.success("Mini-ELEVA-uitnodiging aangemaakt");
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function kopieer() {
    if (!resultaat) return;
    navigator.clipboard.writeText(resultaat.deelLink);
    toast.success("Link gekopieerd");
  }

  function whatsapp() {
    if (!resultaat) return;
    const eerstenaam = resultaat.prospectNaam.split(" ")[0];
    const bericht = `Hé ${eerstenaam}! Ik heb een eigen kijk-omgeving voor je klaargezet binnen ELEVA. Daar staan welkomstvideo's van mij, een AI-mentor die 24/7 al je vragen beantwoordt over Lifeplus, en een chat-lijntje met mij voor als je iemand wilt spreken. Geen pitch, geen druk, op je eigen tempo. 14 dagen geldig, geen account nodig.\n\n${resultaat.deelLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(bericht)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function nieuw() {
    setResultaat(null);
    setZoek("");
  }

  if (resultaat) {
    return (
      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <div>
          <h2 className="text-cm-gold font-semibold text-base">
            ✨ Uitnodiging aangemaakt voor {resultaat.prospectNaam}
          </h2>
          <p className="text-cm-white/70 text-xs leading-relaxed mt-1">
            Stuur de link via WhatsApp of kopieer 'm. 14 dagen geldig,
            daarna kun je 'm verlengen vanaf de klantenkaart of een
            nieuwe maken.
          </p>
        </div>
        <div className="bg-cm-surface-2 rounded-lg p-3 break-all text-xs text-cm-white font-mono">
          {resultaat.deelLink}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={whatsapp} className="btn-gold text-sm">
            💬 Stuur via WhatsApp
          </button>
          <button
            type="button"
            onClick={kopieer}
            className="btn-secondary text-sm"
          >
            📋 Kopieer link
          </button>
          <button type="button" onClick={nieuw} className="btn-secondary text-sm">
            + Nieuwe uitnodiging
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-cm-white font-semibold text-base">
          Nieuwe Mini-ELEVA-uitnodiging
        </h2>
        <p className="text-cm-white/60 text-xs leading-relaxed mt-1">
          Twee stappen: eerst kies je voor welke kant je iemand uitnodigt,
          daarna kies je wie.
        </p>
      </div>

      {/* Stap 1: kant */}
      <div className="space-y-2">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          1. Voor welke kant?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSoort("product")}
            className={`text-left rounded-md border px-3 py-2 transition-colors ${
              soort === "product"
                ? "border-cm-gold bg-cm-gold/10"
                : "border-cm-border bg-cm-bg/40 hover:bg-cm-bg/60"
            }`}
          >
            <p className="text-cm-white font-semibold text-sm">
              🌿 Product-kant
            </p>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Voor wie nieuwsgierig is naar de producten of programma's.
              Geen verdienmodel zichtbaar.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setSoort("business")}
            className={`text-left rounded-md border px-3 py-2 transition-colors ${
              soort === "business"
                ? "border-cm-gold bg-cm-gold/10"
                : "border-cm-border bg-cm-bg/40 hover:bg-cm-bg/60"
            }`}
          >
            <p className="text-cm-white font-semibold text-sm">
              💼 Business + product
            </p>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Voor wie ook nieuwsgierig is naar de opportunity-kant.
              Beide kanten zichtbaar.
            </p>
          </button>
        </div>
      </div>

      {/* Stap 2: prospect */}
      <div className="space-y-2">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          2. Naar wie stuur je 'm?
        </p>
        {prospects.length === 0 ? (
          <p className="text-cm-white/60 text-sm italic">
            Je hebt nog geen prospects in je namenlijst. Voeg eerst iemand
            toe via /namenlijst.
          </p>
        ) : (
          <>
            <input
              type="text"
              value={zoek}
              onChange={(e) => setZoek(e.target.value)}
              placeholder={`Zoek in je ${prospects.length} prospects...`}
              className="w-full bg-cm-surface border border-cm-white/10 rounded px-3 py-2 text-sm text-cm-white placeholder:text-cm-white/40 focus:outline-none focus:border-cm-gold/40"
            />
            <div className="max-h-72 overflow-y-auto space-y-1 border border-cm-border rounded-md p-1">
              {gefilterd.length === 0 ? (
                <p className="text-cm-white/50 text-sm italic p-2">
                  Geen prospects gevonden met "{zoek}".
                </p>
              ) : (
                gefilterd.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => maakUitnodiging(p)}
                    disabled={bezig}
                    className="w-full text-left px-3 py-2 rounded hover:bg-cm-gold/10 transition-colors flex items-center justify-between gap-3 disabled:opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-cm-white text-sm font-medium truncate">
                        {p.naam}
                      </p>
                      <p className="text-cm-white/45 text-[10px] uppercase tracking-wider">
                        {p.fase || "prospect"}
                      </p>
                    </div>
                    <span className="text-cm-gold text-sm flex-shrink-0">
                      Stuur →
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

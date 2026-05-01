"use client";

import { useState } from "react";
import { toast } from "sonner";
import { gebruikSpraak } from "@/components/voice/gebruikSpraak";
import { DeelKnoppen } from "@/components/shared/DeelKnoppen";

// ============================================================
// VoiceUitnodigingKnop, op de prospect-kaart.
//
// Member tikt 🎙️, spreekt 30s vrij over deze prospect ('Henk ken ik
// van voetbal, ondernemer, denkt na over meer vrijheid...'). ELEVA:
//   1. Whisper transcribeert (via gebruikSpraak hook + bestaande
//      /api/voice-transcribe).
//   2. /api/voice-uitnodiging zet de ruwe context om in een persoonlijke
//      WhatsApp-uitnodiging volgens de 4-stappen-formule, in eigen toon.
//   3. Member ziet de tekst, kan bewerken, deelt via DeelKnoppen.
//
// Veel sneller dan tikken, veel persoonlijker dan een sjabloon.
// ============================================================

const MAX_SECONDEN = 60;

type Props = {
  prospectId: string;
  prospectNaam: string;
};

export function VoiceUitnodigingKnop({ prospectId, prospectNaam }: Props) {
  const [open, setOpen] = useState(false);
  const [transcriptie, setTranscriptie] = useState("");
  const [uitnodiging, setUitnodiging] = useState("");
  const [bezigAi, setBezigAi] = useState(false);
  const [aiFout, setAiFout] = useState<string | null>(null);

  const spraak = gebruikSpraak({
    taal: "nl",
    maxSeconden: MAX_SECONDEN,
    onMaxBereikt: async () => {
      // Bij max-bereik automatisch stop + transcribeer
      const res = await spraak.stop();
      if (res.tekst) {
        setTranscriptie(res.tekst);
        await genereerUitnodiging(res.tekst);
      } else if (res.fout) {
        toast.error(res.fout);
      }
    },
  });

  async function startOpname() {
    setTranscriptie("");
    setUitnodiging("");
    setAiFout(null);
    const ok = await spraak.start();
    if (!ok) {
      toast.error("Microfoon-toegang nodig om te starten");
    }
  }

  async function stopOpname() {
    const res = await spraak.stop();
    if (res.fout) {
      toast.error(res.fout);
      return;
    }
    if (!res.tekst) return;
    setTranscriptie(res.tekst);
    await genereerUitnodiging(res.tekst);
  }

  async function genereerUitnodiging(tekst: string) {
    setBezigAi(true);
    setAiFout(null);
    try {
      const res = await fetch("/api/voice-uitnodiging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptie: tekst, prospectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiFout(data.fout || "AI gaf geen antwoord");
        return;
      }
      setUitnodiging(data.uitnodiging || "");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verbindingsfout";
      setAiFout(msg);
    } finally {
      setBezigAi(false);
    }
  }

  function sluit() {
    spraak.reset();
    setTranscriptie("");
    setUitnodiging("");
    setAiFout(null);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm flex items-center gap-1.5"
        title="Spreek 30s in, AI maakt een persoonlijke uitnodiging"
      >
        🎙️ Voice-uitnodiging
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={sluit}
        >
          <div
            className="bg-cm-bg border-2 border-cm-gold/60 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                    Voice-uitnodiging
                  </p>
                  <p className="text-lg font-display font-bold text-cm-white mt-0.5">
                    Voor {prospectNaam}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sluit}
                  className="text-cm-white opacity-50 hover:opacity-100 text-2xl leading-none"
                  aria-label="Sluit"
                >
                  ×
                </button>
              </div>

              {!uitnodiging && (
                <p className="text-cm-white opacity-80 text-sm leading-relaxed">
                  Spreek vrij over {prospectNaam}: hoe je 'm kent, wat 'ie
                  doet, waarom je aan 'm denkt. Hoeft niet perfect, ELEVA
                  maakt er een persoonlijke uitnodiging van in jouw toon.
                </p>
              )}

              {/* OPNAME-KNOP / TRANSCRIPTIE / UITNODIGING */}
              {!uitnodiging && !bezigAi && !spraak.actief && !transcriptie && (
                <button
                  type="button"
                  onClick={startOpname}
                  disabled={!spraak.ondersteund}
                  className="btn-gold w-full py-4 text-base font-bold disabled:opacity-50"
                >
                  {spraak.ondersteund
                    ? "🎙️ Start opname (max 60s)"
                    : "Voice niet ondersteund in deze browser"}
                </button>
              )}

              {spraak.actief && (
                <div className="space-y-2">
                  <div className="rounded-lg border-2 border-red-500/60 bg-red-900/20 px-4 py-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-cm-white font-semibold text-sm">
                      Aan het opnemen, {spraak.seconden}s / {MAX_SECONDEN}s
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={stopOpname}
                    className="btn-gold w-full py-3 text-sm font-semibold"
                  >
                    ⏹️ Stop & maak uitnodiging
                  </button>
                </div>
              )}

              {bezigAi && (
                <div className="rounded-lg border border-cm-border bg-cm-surface px-4 py-6 text-center">
                  <p className="text-cm-white text-sm">
                    ELEVA Mentor schrijft je uitnodiging…
                  </p>
                </div>
              )}

              {transcriptie && !bezigAi && (
                <div className="rounded-md bg-cm-surface border border-cm-border px-3 py-2 text-xs text-cm-white opacity-70 italic">
                  Wat je zei: "{transcriptie}"
                </div>
              )}

              {aiFout && (
                <div className="rounded-md bg-red-900/20 border border-red-500/40 px-3 py-2 text-xs text-red-300">
                  {aiFout}
                </div>
              )}

              {uitnodiging && (
                <div className="space-y-3">
                  <div>
                    <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-1">
                      Voorgestelde uitnodiging
                    </p>
                    <textarea
                      value={uitnodiging}
                      onChange={(e) => setUitnodiging(e.target.value)}
                      rows={6}
                      className="textarea-cm w-full text-sm leading-relaxed"
                    />
                    <p className="text-cm-white opacity-50 text-[11px] mt-1">
                      Pas 'm aan zoals je wilt voordat je 'm verstuurt.
                    </p>
                  </div>
                  <DeelKnoppen
                    url=""
                    tekst={uitnodiging}
                    onderwerp={`Bericht voor ${prospectNaam}`}
                    variant="donker"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUitnodiging("");
                      setTranscriptie("");
                      spraak.reset();
                    }}
                    className="text-cm-white opacity-60 hover:opacity-100 text-xs underline-offset-2 hover:underline"
                  >
                    ↻ Opnieuw inspreken
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

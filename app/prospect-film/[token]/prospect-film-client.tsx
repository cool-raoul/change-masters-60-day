"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// ProspectFilmClient, client-side render van de share-pagina.
//
// Doet de tracking-aanroepen naar /api/prospect-film/markeer:
//   - Bij iframe-onLoad: 'gestart' (best-effort, kan dubbelen, server is idempotent)
//   - Bij CTA-klik: 'afgekeken' + bedankt-state
// ============================================================

type Props = {
  token: string;
  memberVoornaam: string;
  filmTitel: string;
  filmBeschrijving: string | null;
  embedUrl: string | null;
  voorbeeldIntro: string;
  callToAction: string;
  reedsAfgekeken: boolean;
  filmBeschikbaar: boolean;
};

export function ProspectFilmClient({
  token,
  memberVoornaam,
  filmTitel,
  filmBeschrijving,
  embedUrl,
  voorbeeldIntro,
  callToAction,
  reedsAfgekeken,
  filmBeschikbaar,
}: Props) {
  const [bedankt, setBedankt] = useState(reedsAfgekeken);
  const [bezig, setBezig] = useState(false);
  const startVerstuurdRef = useRef(false);

  async function markeerGestart() {
    if (startVerstuurdRef.current) return;
    startVerstuurdRef.current = true;
    try {
      await fetch("/api/prospect-film/markeer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, actie: "gestart" }),
      });
    } catch {
      // negeer, tracking mag niet de gebruiker storen
    }
  }

  async function markeerAfgekeken() {
    setBezig(true);
    try {
      await fetch("/api/prospect-film/markeer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, actie: "afgekeken" }),
      });
      setBedankt(true);
    } catch {
      // ook bij fout: lokaal bedankt-state, voorkomt dat user opnieuw klikt
      setBedankt(true);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="min-h-screen bg-cm-bg text-cm-white px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {memberVoornaam && (
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Een persoonlijke film van {memberVoornaam}
            </p>
          )}
          <h1 className="text-3xl font-display font-bold leading-tight">
            {filmTitel}
          </h1>
        </div>

        {/* Intro-tekst */}
        <p className="text-cm-white opacity-80 text-base leading-relaxed text-center">
          {voorbeeldIntro}
        </p>

        {/* Film-embed */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-cm-border">
          {filmBeschikbaar && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={filmTitel}
              onLoad={markeerGestart}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <p className="text-cm-white opacity-60 text-sm italic text-center">
                De film is op dit moment niet beschikbaar. Vraag{" "}
                {memberVoornaam || "de afzender"} of er een nieuwe link
                gestuurd kan worden.
              </p>
            </div>
          )}
        </div>

        {filmBeschrijving && (
          <p className="text-cm-white opacity-70 text-sm italic text-center">
            {filmBeschrijving}
          </p>
        )}

        {/* CTA: Ik heb 'm bekeken */}
        <div className="space-y-3 pt-2">
          {bedankt ? (
            <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-900/20 px-5 py-4 text-center space-y-1.5">
              <p className="text-emerald-300 font-semibold text-base">
                ✓ Bedankt dat je 'm gekeken hebt
              </p>
              <p className="text-cm-white opacity-80 text-sm">
                {memberVoornaam
                  ? `${memberVoornaam} ziet dat je 'm hebt bekeken en neemt binnenkort contact op om je vragen te beantwoorden.`
                  : "We laten je weten dat je 'm hebt bekeken — er wordt binnenkort contact opgenomen voor je vragen."}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={markeerAfgekeken}
              disabled={bezig || !filmBeschikbaar}
              className="btn-gold w-full py-4 text-base font-bold disabled:opacity-50"
            >
              {bezig ? "Bezig..." : `✓ ${callToAction}`}
            </button>
          )}
          <p className="text-cm-white opacity-50 text-xs text-center leading-relaxed">
            Je gegevens worden niet gedeeld of bewaard, alleen dat je de film
            hebt bekeken zodat {memberVoornaam || "de afzender"} weet dat 'ie
            kan opvolgen.
          </p>
        </div>
      </div>
    </div>
  );
}

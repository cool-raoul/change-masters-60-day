"use client";

import { useState } from "react";

// ============================================================
// MiniElevaFilm — video-blok voor binnen de prospect-omgeving (/m/[token]).
//
// Prospect heeft geen account, dus de tracking gaat token-gebaseerd (niet
// via film_views, dat vereist auth). Als de prospect op "Klaar met kijken"
// klikt, melden we dat aan de member via /api/mini-eleva/film-afgekeken.
// Dat event verschuift de prospect automatisch naar Opvolgen + maakt een
// opvolg-herinnering (de warm-trigger). Herbruikbaar voor élke video die
// in mini-ELEVA staat.
// ============================================================

export function MiniElevaFilm({
  token,
  embedUrl,
  titel,
  beschrijving,
  kopje = "🎬 Een goed begin: deze korte film",
}: {
  token: string;
  embedUrl: string;
  titel: string;
  beschrijving?: string | null;
  kopje?: string;
}) {
  const [afgekeken, setAfgekeken] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function markeerAfgekeken() {
    if (afgekeken || bezig) return;
    setBezig(true);
    try {
      await fetch("/api/mini-eleva/film-afgekeken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, filmTitel: titel }),
        keepalive: true,
      });
    } catch {
      // Stil falen: de prospect mag hier nooit een fout zien.
    }
    setAfgekeken(true);
    setBezig(false);
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
        {kopje}
      </h2>
      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-cm-border">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={titel}
        />
      </div>
      {beschrijving && (
        <p className="text-cm-white/60 text-xs leading-relaxed">{beschrijving}</p>
      )}
      {afgekeken ? (
        <p className="text-emerald-400 text-sm font-medium">
          ✓ Fijn dat je hebt gekeken
        </p>
      ) : (
        <button
          onClick={markeerAfgekeken}
          disabled={bezig}
          className="btn-secondary text-sm"
        >
          {bezig ? "Bezig..." : "Klaar met kijken ✓"}
        </button>
      )}
    </div>
  );
}

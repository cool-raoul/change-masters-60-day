// File: app/bot/tweede-lente/[token]/blok-spiegel.tsx
//
// Blok 3, AI-spiegel. Roept /api/freebie-bot/spiegel aan met token +
// antwoorden, toont opening + patroon + driAanpassingen + afsluiting,
// en biedt de "Ga verder" knop richting opt-in.
//
// Loading-state: schaduw-skelet van 3-4 grijze lijntjes terwijl
// OpenAI bezig is. Fout-state: vriendelijke melding met retry-knop.

"use client";

import { useEffect, useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";

export function BlokSpiegel({
  token,
  antwoorden,
  onVolgende,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  onVolgende: (s: SpiegelOutput) => void;
}) {
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    let actief = true;
    setFout(null);
    setSpiegel(null);
    fetch("/api/freebie-bot/spiegel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, antwoorden }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!actief) return;
        if (!r.ok) {
          setFout(data.error ?? "Spiegel-generatie mislukt");
          return;
        }
        setSpiegel(data as SpiegelOutput);
      })
      .catch((e) => {
        if (!actief) return;
        setFout(String(e));
      });
    return () => {
      actief = false;
    };
  }, [token, antwoorden]);

  if (fout) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Het lukte even niet om je spiegel op te halen
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Wil je het opnieuw proberen? Soms is de verbinding traag.
        </p>
        <button
          type="button"
          onClick={() => {
            setFout(null);
            setSpiegel(null);
            // forceer re-effect door state-reset
            window.location.reload();
          }}
          className="mt-4 rounded-full bg-rose-600 px-6 py-2 text-white text-sm font-medium"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!spiegel) {
    return (
      <div>
        <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
          Een moment, je spiegel komt eraan
        </div>
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 bg-rose-100 rounded w-3/4" />
          <div className="h-4 bg-rose-100 rounded w-5/6" />
          <div className="h-4 bg-rose-100 rounded w-2/3" />
          <div className="mt-4 h-4 bg-rose-100 rounded w-4/5" />
          <div className="h-4 bg-rose-100 rounded w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Jouw spiegel
      </div>

      <p className="mt-4 text-lg text-gray-800 leading-relaxed">
        {spiegel.opening}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">
        {spiegel.patroon}
      </p>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-900">
          Drie kleine aanpassingen die veel vrouwen in jouw fase kiezen
        </h3>
        <ul className="mt-3 space-y-2">
          {spiegel.driAanpassingen.map((aanpassing, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3"
            >
              <span className="text-rose-500 font-semibold">{i + 1}</span>
              <span className="text-gray-800">{aanpassing}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">
        {spiegel.afsluiting}
      </p>

      <button
        type="button"
        onClick={() => onVolgende(spiegel)}
        className="mt-8 w-full rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium"
      >
        Ja, ik wil verder kijken
      </button>
    </div>
  );
}

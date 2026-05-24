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
  memberVoornaam,
  onVolgende,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  memberVoornaam: string;
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
        Jouw spiegel, klaargezet door {memberVoornaam}
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

      {/* Extra-waardeblok: vier rust-handvatten die elke vrouw direct mag
          meenemen, ook als ze niet intekent op de mailreeks. Anti-overwhelm
          K1 (één thema per kaart, makkelijk te scannen). */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-gray-900">
          Vier ankers die je vandaag al kunt pakken
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Klein, concreet, zonder belofte. Probeer er één deze week.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <strong className="text-gray-900">Ochtend-anker.</strong>{" "}
            <span className="text-gray-700">
              Eerste kwartier na het wakker worden: geen scherm, één glas
              water, kort de dag in jezelf doorlopen.
            </span>
          </li>
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <strong className="text-gray-900">Eet-anker.</strong>{" "}
            <span className="text-gray-700">
              Drie maaltijden met een vast venster van twaalf uur (van
              ontbijt tot avondeten). Veel vrouwen voelen dat hun energie
              en slaap meeschuiven met dit ritme.
            </span>
          </li>
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <strong className="text-gray-900">Beweeg-anker.</strong>{" "}
            <span className="text-gray-700">
              Twee kortere wandelingen per dag van ongeveer tien minuten,
              één in de ochtend en één na het avondeten. Geen prestatie,
              wel ritme.
            </span>
          </li>
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <strong className="text-gray-900">Avond-anker.</strong>{" "}
            <span className="text-gray-700">
              Een vast moment, een half uur voor het slapen, zonder
              scherm. Drie diepe ademhalingen en de dag mag aflopen.
            </span>
          </li>
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

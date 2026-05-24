// File: app/bot/tweede-lente/[token]/blok-spiegel.tsx
//
// Blok 3, gepersonaliseerde spiegel. Combineert AI-gegenereerde opening +
// patroon met een deterministisch advies-pakket dat varieert op basis van
// de antwoorden (zie lib/freebie-bots/tweede-lente-persoonlijk-advies).
//
// Volgorde:
//   1. AI-spiegel: opening + patroon-paragraaf
//   2. Jouw situatie samengevat (deterministisch op antwoorden)
//   3. Extra aandacht (alleen als specifieke combi)
//   4. Vier ankers (gerankt op antwoorden)
//   5. Drie basis-tips over overgang (algemeen, deels conditioneel)
//   6. Vijf voedingsstoffen met EFSA-claims (gerankt op antwoorden)
//   7. Afsluiting + knop naar opt-in

"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";
import {
  selecteerAdvies,
  type AdviesPakket,
} from "@/lib/freebie-bots/tweede-lente-persoonlijk-advies";

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

  // Persoonlijk advies-pakket berekenen op de antwoorden. Deterministisch
  // (zelfde antwoorden = zelfde advies), maar VARIEERT bij andere antwoorden.
  const advies: AdviesPakket = useMemo(
    () => selecteerAdvies(antwoorden),
    [antwoorden],
  );

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
          onClick={() => window.location.reload()}
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

      {/* 1. AI-opening + patroon */}
      <p className="mt-4 text-lg text-gray-800 leading-relaxed">
        {spiegel.opening}
      </p>
      <p className="mt-4 text-gray-700 leading-relaxed">
        {spiegel.patroon}
      </p>

      {/* 2. Jouw situatie samengevat */}
      <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">
          Wat jij hebt aangegeven
        </div>
        <p className="mt-2 text-gray-800 leading-relaxed">
          {advies.jouwSituatie}
        </p>
      </div>

      {/* 3. Extra aandacht (alleen als specifieke combi gedetecteerd) */}
      {advies.extraAandacht && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Wat hier extra opvalt
          </div>
          <p className="mt-2 text-gray-800 leading-relaxed">
            {advies.extraAandacht}
          </p>
        </div>
      )}

      {/* 4. Ankers (gerankt op antwoorden) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">
          Vier handvatten die bij jouw situatie passen
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Concreet, biologisch onderbouwd, geen belofte. Begin met wat
          aanspreekt.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {advies.ankers.map((anker) => (
            <li
              key={anker.id}
              className="rounded-xl border border-rose-100 bg-white px-4 py-3"
            >
              <div>
                <strong className="text-gray-900">{anker.titel}.</strong>{" "}
                <span className="text-gray-700">{anker.actie}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 italic leading-relaxed">
                Waarom: {anker.waarom}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Basis-tips over deze fase (deels conditioneel) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">
          Wat we vaak vertellen aan vrouwen in deze fase
        </h3>
        <ul className="mt-3 space-y-3 text-sm">
          {advies.basisTips.map((tip) => (
            <li
              key={tip.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="font-semibold text-gray-900">{tip.titel}</div>
              <p className="mt-1 text-gray-700 leading-relaxed">{tip.uitleg}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Voedingsstoffen (gerankt op antwoorden) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">
          Voedingsstoffen die in jouw situatie vaak belangrijk worden
        </h3>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Onder elke stof staat de wetenschappelijk-bevestigde rol die ze
          in je lichaam spelen. Aanvullen kan via voeding (zie bron) of
          gerichte supplementen. In de overgang hebben veel vrouwen ondanks
          gezond eten toch tekorten, doordat onze huidige voeding gemiddeld
          minder dichtheid heeft en je lichaam meer vraagt.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {advies.nutrienten.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <strong className="text-gray-900">{n.naam}</strong>
                <span className="text-xs text-gray-500">{n.bron}</span>
              </div>
              <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
                {n.efsaClaims.map((claim, i) => (
                  <li key={i}>{claim}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-500 italic">
          Bronvermelding: de claims hierboven zijn EFSA-goedgekeurde
          health-claims (EU Verordening 1924/2006), juridisch toegestaan
          in marketing wanneer het product de minimale werkzame
          hoeveelheid bevat.
        </p>
      </div>

      {/* 7. Afsluiting + door */}
      <p className="mt-8 text-gray-700 leading-relaxed">
        {spiegel.afsluiting}
      </p>

      <button
        type="button"
        onClick={() => onVolgende(spiegel)}
        className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium"
      >
        Ga verder naar de pakket-richting →
      </button>
    </div>
  );
}

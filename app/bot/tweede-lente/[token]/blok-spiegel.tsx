// File: app/bot/tweede-lente/[token]/blok-spiegel.tsx
//
// Blok 3, gepersonaliseerde spiegel. Combineert AI-gegenereerde opening +
// patroon met een deterministisch advies-pakket dat varieert op basis van
// de antwoorden (zie lib/freebie-bots/tweede-lente-persoonlijk-advies).
//
// Visueel verzorgd: per anker een gekleurde card met icoon, per nutriënt
// een gekleurde card met icoon. Spiegel begint met opvallende hero-quote.

"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";
import {
  selecteerAdvies,
  type AdviesPakket,
  type Anker,
  type Nutrient,
} from "@/lib/freebie-bots/tweede-lente-persoonlijk-advies";

// Tailwind-class mapping per kleur. We hardcoderen omdat Tailwind alleen
// classes detecteert die letterlijk in de bron staan (purge-mechanisme).
const KLEUR_CLASSES: Record<
  Anker["kleur"],
  { bg: string; border: string; iconBg: string; text: string }
> = {
  rose: {
    bg: "bg-rose-50/70",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    text: "text-rose-900",
  },
  amber: {
    bg: "bg-amber-50/70",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    text: "text-amber-900",
  },
  emerald: {
    bg: "bg-emerald-50/70",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    text: "text-emerald-900",
  },
  sky: {
    bg: "bg-sky-50/70",
    border: "border-sky-200",
    iconBg: "bg-sky-100",
    text: "text-sky-900",
  },
  violet: {
    bg: "bg-violet-50/70",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    text: "text-violet-900",
  },
  stone: {
    bg: "bg-stone-50/70",
    border: "border-stone-200",
    iconBg: "bg-stone-100",
    text: "text-stone-900",
  },
};

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
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">
          🙏
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Het lukte even niet om je spiegel op te halen
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Wil je het opnieuw proberen? Soms is de verbinding traag.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2 text-white text-sm font-semibold shadow-md"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!spiegel) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-5 h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center text-3xl">
          🪞
        </div>
        <div className="text-rose-500 text-sm font-semibold uppercase tracking-widest">
          Een moment, {memberVoornaam} stelt je spiegel samen
        </div>
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 bg-rose-100 rounded-full w-3/4 mx-auto" />
          <div className="h-4 bg-rose-100 rounded-full w-5/6 mx-auto" />
          <div className="h-4 bg-rose-100 rounded-full w-2/3 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero-block met spiegel-icoon + opening */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-3xl shadow-sm ring-4 ring-white/60">
          🪞
        </div>
        <div className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
          Jouw spiegel
        </div>
      </div>

      {/* 1. AI-opening als opvallende quote */}
      <div className="mt-5 relative rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-6 shadow-sm">
        <div className="absolute -top-3 left-6 text-5xl text-rose-200 leading-none select-none">
          &ldquo;
        </div>
        <p className="text-lg text-gray-800 leading-relaxed italic pl-2">
          {spiegel.opening}
        </p>
      </div>

      <p className="mt-5 text-gray-700 leading-relaxed">
        {spiegel.patroon}
      </p>

      {/* 2. Jouw situatie samengevat */}
      <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
          <span>📝</span>
          <span>Wat jij hebt aangegeven</span>
        </div>
        <p className="mt-2 text-gray-800 leading-relaxed">
          {advies.jouwSituatie}
        </p>
      </div>

      {/* 3. Extra aandacht (conditioneel) */}
      {advies.extraAandacht && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <span>✨</span>
            <span>Wat hier extra opvalt</span>
          </div>
          <p className="mt-2 text-gray-800 leading-relaxed">
            {advies.extraAandacht}
          </p>
        </div>
      )}

      {/* 4. Ankers, gekleurd per kleur-tag */}
      <div className="mt-8">
        <div className="text-center mb-5">
          <div className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
            Jouw vier handvatten
          </div>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            Concreet, biologisch onderbouwd
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Geselecteerd op basis van wat jij hebt aangegeven.
          </p>
        </div>
        <ul className="space-y-3">
          {advies.ankers.map((anker) => {
            const c = KLEUR_CLASSES[anker.kleur];
            return (
              <li
                key={anker.id}
                className={`rounded-2xl border ${c.border} ${c.bg} px-4 py-4 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${c.iconBg} text-2xl shadow-sm`}
                  >
                    {anker.icoon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${c.text}`}>
                      {anker.titel}
                    </div>
                    <p className="mt-1 text-sm text-gray-700 leading-snug">
                      {anker.actie}
                    </p>
                    <details className="mt-2 group">
                      <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 list-none flex items-center gap-1">
                        <span className="inline-block transition-transform group-open:rotate-90">
                          ▸
                        </span>
                        Waarom dit werkt
                      </summary>
                      <p className="mt-2 text-xs text-gray-600 leading-relaxed italic">
                        {anker.waarom}
                      </p>
                    </details>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 5. Basis-tips over deze fase */}
      <div className="mt-10">
        <div className="text-center mb-5">
          <div className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
            Achtergrond
          </div>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            Wat we vaak vertellen aan vrouwen in deze fase
          </h3>
        </div>
        <ul className="space-y-3">
          {advies.basisTips.map((tip) => (
            <li
              key={tip.id}
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <span className="text-rose-400">◆</span>
                <span>{tip.titel}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {tip.uitleg}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Voedingsstoffen, gekleurd per nutriënt */}
      <div className="mt-10">
        <div className="text-center mb-5">
          <div className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
            Voedingsstoffen
          </div>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            Wat in jouw situatie vaak belangrijk wordt
          </h3>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            Onder elke stof staat de wetenschappelijk-bevestigde rol die
            ze in je lichaam speelt. In de overgang hebben veel vrouwen
            ondanks gezond eten toch tekorten, doordat onze huidige
            voeding gemiddeld minder dichtheid heeft en je lichaam meer
            vraagt.
          </p>
        </div>
        <ul className="space-y-3">
          {advies.nutrienten.map((n: Nutrient) => {
            const c = KLEUR_CLASSES[n.kleur];
            return (
              <li
                key={n.id}
                className={`rounded-2xl border ${c.border} ${c.bg} px-4 py-4 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${c.iconBg} text-2xl shadow-sm`}
                  >
                    {n.icoon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <strong className={`text-base font-bold ${c.text}`}>
                        {n.naam}
                      </strong>
                      <span className="text-[11px] text-gray-500 italic">
                        bron: {n.bron}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {n.efsaClaims.map((claim, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-700 leading-snug"
                        >
                          <span className="text-emerald-600 flex-shrink-0">✓</span>
                          <span>{claim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[11px] text-gray-500 italic text-center">
          De claims hierboven zijn EFSA-goedgekeurde health-claims
          (EU Verordening 1924/2006).
        </p>
      </div>

      {/* 7. Afsluiting + door */}
      <p className="mt-10 text-gray-700 leading-relaxed text-center italic">
        {spiegel.afsluiting}
      </p>

      <button
        type="button"
        onClick={() => onVolgende(spiegel)}
        className="mt-6 group w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-4 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-rose-700 hover:to-pink-700 transition-all"
      >
        Ga verder naar de pakket-richting
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}

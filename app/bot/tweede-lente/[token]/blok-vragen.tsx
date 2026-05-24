// File: app/bot/tweede-lente/[token]/blok-vragen.tsx
//
// Blok 2, 7 multi-choice vragen één per scherm met voortgangsbalk.
// Vraag 2 (watValtOp) is multi-select 1-3, rest is single-select.

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  TweedeLenteFase,
  TweedeLenteWatValtOp,
  TweedeLenteEetRitme,
  TweedeLenteBeweging,
  TweedeLenteRust,
  TweedeLenteDeel,
  TweedeLenteZoek,
} from "@/lib/freebie-bots/types";
import {
  VRAAG_FASE,
  VRAAG_WAT_VALT_OP,
  VRAAG_EET_RITME,
  VRAAG_BEWEGING,
  VRAAG_RUST,
  VRAAG_DEEL,
  VRAAG_ZOEK,
} from "@/lib/freebie-bots/tweede-lente-vragen";

type Stap = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function BlokVragen({
  memberVoornaam,
  onKlaar,
}: {
  memberVoornaam: string;
  onKlaar: (a: TweedeLenteAntwoorden) => void;
}) {
  // memberVoornaam tonen we hier nog niet (vragen-flow zelf is neutraal),
  // maar we accepteren de prop zodat de container hem consistent doorgeeft.
  void memberVoornaam;
  const [stap, setStap] = useState<Stap>(1);
  const [fase, setFase] = useState<TweedeLenteFase | null>(null);
  const [watValtOp, setWatValtOp] = useState<TweedeLenteWatValtOp[]>([]);
  const [eetRitme, setEetRitme] = useState<TweedeLenteEetRitme | null>(null);
  const [beweging, setBeweging] = useState<TweedeLenteBeweging | null>(null);
  const [rust, setRust] = useState<TweedeLenteRust | null>(null);
  const [deel, setDeel] = useState<TweedeLenteDeel | null>(null);
  const [zoek, setZoek] = useState<TweedeLenteZoek | null>(null);

  function next() {
    if (stap === 7) {
      if (fase && eetRitme && beweging && rust && deel && zoek) {
        onKlaar({
          fase,
          watValtOp,
          eetRitme,
          beweging,
          rust,
          deel,
          zoek,
        });
      }
      return;
    }
    setStap((s) => (s + 1) as Stap);
  }

  function back() {
    if (stap === 1) return;
    setStap((s) => (s - 1) as Stap);
  }

  function toggleWatValtOp(w: TweedeLenteWatValtOp) {
    setWatValtOp((arr) => {
      if (arr.includes(w)) return arr.filter((x) => x !== w);
      if (arr.length >= 3) return arr; // max 3
      return [...arr, w];
    });
  }

  const huidigeStapKlaar =
    (stap === 1 && fase !== null) ||
    (stap === 2 && watValtOp.length >= 1) ||
    (stap === 3 && eetRitme !== null) ||
    (stap === 4 && beweging !== null) ||
    (stap === 5 && rust !== null) ||
    (stap === 6 && deel !== null) ||
    (stap === 7 && zoek !== null);

  // Per stap een passend icoon voor visuele verankering
  const stapIcoon: Record<Stap, string> = {
    1: "🌷",
    2: "💗",
    3: "🥗",
    4: "🚶‍♀️",
    5: "🌿",
    6: "💞",
    7: "🪞",
  };

  return (
    <div>
      <ProgressBar stap={stap} totaal={7} />

      <div className="mt-7">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl shadow-sm">
            {stapIcoon[stap]}
          </div>
        </div>

        {stap === 1 && (
          <SingleChoice
            titel="In welke fase voel je je nu?"
            opties={VRAAG_FASE}
            gekozen={fase}
            onKies={setFase}
          />
        )}
        {stap === 2 && (
          <MultiChoice
            titel="Wat valt je het meest op in je lichaam de laatste maanden?"
            ondertitel="Kies één tot drie keuzes die het sterkst voor jou gelden."
            opties={VRAAG_WAT_VALT_OP}
            gekozen={watValtOp}
            onToggle={toggleWatValtOp}
          />
        )}
        {stap === 3 && (
          <SingleChoice
            titel="Hoe loopt eten op een gewone dag?"
            opties={VRAAG_EET_RITME}
            gekozen={eetRitme}
            onKies={setEetRitme}
          />
        )}
        {stap === 4 && (
          <SingleChoice
            titel="Hoeveel beweeg je op een gewone week?"
            opties={VRAAG_BEWEGING}
            gekozen={beweging}
            onKies={setBeweging}
          />
        )}
        {stap === 5 && (
          <SingleChoice
            titel="Hoe makkelijk kun je echt rusten?"
            opties={VRAAG_RUST}
            gekozen={rust}
            onKies={setRust}
          />
        )}
        {stap === 6 && (
          <SingleChoice
            titel="Met wie deel je wat je in deze fase ervaart?"
            opties={VRAAG_DEEL}
            gekozen={deel}
            onKies={setDeel}
          />
        )}
        {stap === 7 && (
          <SingleChoice
            titel="Wat zou jij vandaag het liefst willen?"
            opties={VRAAG_ZOEK}
            gekozen={zoek}
            onKies={setZoek}
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={stap === 1}
          className="text-sm text-gray-500 disabled:opacity-30 hover:text-gray-700"
        >
          ← Vorige
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!huidigeStapKlaar}
          className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none transition"
        >
          {stap === 7 ? "Toon mijn spiegel ✨" : "Volgende →"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ stap, totaal }: { stap: number; totaal: number }) {
  const pct = (stap / totaal) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-rose-700 font-medium mb-1.5">
        <span>Vraag {stap} van {totaal}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-rose-100">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type Optie<T extends string> = { waarde: T; label: string };

function SingleChoice<T extends string>({
  titel,
  opties,
  gekozen,
  onKies,
}: {
  titel: string;
  opties: Optie<T>[];
  gekozen: T | null;
  onKies: (v: T) => void;
}) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{titel}</h2>
      <div className="mt-5 space-y-2.5">
        {opties.map((o) => {
          const actief = gekozen === o.waarde;
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onKies(o.waarde)}
              className={`group w-full text-left rounded-2xl px-4 py-3.5 border-2 transition-all flex items-center gap-3 ${
                actief
                  ? "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-400 text-rose-900 shadow-md scale-[1.01]"
                  : "bg-white/80 border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  actief
                    ? "border-rose-500 bg-rose-500"
                    : "border-gray-300 group-hover:border-rose-300"
                }`}
              >
                {actief && (
                  <span className="block h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <span className="flex-1 text-sm leading-snug">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiChoice<T extends string>({
  titel,
  ondertitel,
  opties,
  gekozen,
  onToggle,
}: {
  titel: string;
  ondertitel?: string;
  opties: Optie<T>[];
  gekozen: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{titel}</h2>
      {ondertitel && (
        <p className="mt-2 text-sm text-gray-500 text-center">{ondertitel}</p>
      )}
      <div className="mt-5 space-y-2.5">
        {opties.map((o) => {
          const actief = gekozen.includes(o.waarde);
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onToggle(o.waarde)}
              className={`group w-full text-left rounded-2xl px-4 py-3.5 border-2 transition-all flex items-center gap-3 ${
                actief
                  ? "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-400 text-rose-900 shadow-md scale-[1.01]"
                  : "bg-white/80 border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                  actief
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-gray-300 group-hover:border-rose-300"
                }`}
              >
                {actief && <span className="text-xs">✓</span>}
              </span>
              <span className="flex-1 text-sm leading-snug">{o.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-rose-700">
        {gekozen.length}/3 gekozen
      </p>
    </div>
  );
}

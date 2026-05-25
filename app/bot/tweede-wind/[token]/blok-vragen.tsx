// File: app/bot/tweede-wind/[token]/blok-vragen.tsx
//
// Blok 2, 7 multi-choice vragen voor Tweede Wind. Sky/blauw thema.

"use client";

import { useState } from "react";
import type {
  TweedeWindAntwoorden,
  TweedeWindEnergie,
  TweedeWindFocusBreker,
  TweedeWindSlaap,
  TweedeWindEetRitme,
  TweedeWindBeweging,
  TweedeWindHerstel,
  TweedeWindDoel,
} from "@/lib/freebie-bots/types";
import {
  VRAAG_ENERGIE,
  VRAAG_FOCUS_BREKERS,
  VRAAG_SLAAP,
  VRAAG_EET_RITME,
  VRAAG_BEWEGING,
  VRAAG_HERSTEL,
  VRAAG_DOEL,
} from "@/lib/freebie-bots/tweede-wind";

type Stap = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function BlokVragen({
  memberVoornaam,
  onKlaar,
}: {
  memberVoornaam: string;
  onKlaar: (a: TweedeWindAntwoorden) => void;
}) {
  void memberVoornaam;

  const [stap, setStap] = useState<Stap>(1);
  const [energie, setEnergie] = useState<TweedeWindEnergie | null>(null);
  const [focusBrekers, setFocusBrekers] = useState<TweedeWindFocusBreker[]>([]);
  const [slaap, setSlaap] = useState<TweedeWindSlaap | null>(null);
  const [eetRitme, setEetRitme] = useState<TweedeWindEetRitme | null>(null);
  const [beweging, setBeweging] = useState<TweedeWindBeweging | null>(null);
  const [herstel, setHerstel] = useState<TweedeWindHerstel | null>(null);
  const [doel, setDoel] = useState<TweedeWindDoel | null>(null);

  function next() {
    if (stap === 7) {
      if (energie && slaap && eetRitme && beweging && herstel && doel) {
        onKlaar({
          energie,
          focusBrekers,
          slaap,
          eetRitme,
          beweging,
          herstel,
          doel,
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

  function toggleFocusBreker(w: TweedeWindFocusBreker) {
    setFocusBrekers((arr) => {
      if (arr.includes(w)) return arr.filter((x) => x !== w);
      if (arr.length >= 3) return arr;
      return [...arr, w];
    });
  }

  const huidigeStapKlaar =
    (stap === 1 && energie !== null) ||
    (stap === 2 && focusBrekers.length >= 1) ||
    (stap === 3 && slaap !== null) ||
    (stap === 4 && eetRitme !== null) ||
    (stap === 5 && beweging !== null) ||
    (stap === 6 && herstel !== null) ||
    (stap === 7 && doel !== null);

  const stapIcoon: Record<Stap, string> = {
    1: "⚡",
    2: "🎯",
    3: "🌙",
    4: "🥗",
    5: "🚶",
    6: "🌬️",
    7: "🪞",
  };

  return (
    <div>
      <ProgressBar stap={stap} totaal={7} />

      <div className="mt-7">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-2xl shadow-sm">
            {stapIcoon[stap]}
          </div>
        </div>

        {stap === 1 && (
          <SingleChoice
            titel="Hoe voelt je energie-niveau de laatste maanden?"
            opties={VRAAG_ENERGIE}
            gekozen={energie}
            onKies={setEnergie}
          />
        )}
        {stap === 2 && (
          <MultiChoice
            titel="Wat breekt jouw focus het meest?"
            ondertitel="Kies één tot drie keuzes die het sterkst voor jou gelden."
            opties={VRAAG_FOCUS_BREKERS}
            gekozen={focusBrekers}
            onToggle={toggleFocusBreker}
          />
        )}
        {stap === 3 && (
          <SingleChoice
            titel="Hoe slaap je doorgaans?"
            opties={VRAAG_SLAAP}
            gekozen={slaap}
            onKies={setSlaap}
          />
        )}
        {stap === 4 && (
          <SingleChoice
            titel="Hoe ziet je eet-ritme er gemiddeld uit?"
            opties={VRAAG_EET_RITME}
            gekozen={eetRitme}
            onKies={setEetRitme}
          />
        )}
        {stap === 5 && (
          <SingleChoice
            titel="Hoe vaak beweeg je op een gemiddelde week?"
            opties={VRAAG_BEWEGING}
            gekozen={beweging}
            onKies={setBeweging}
          />
        )}
        {stap === 6 && (
          <SingleChoice
            titel="Hoe kun je echt herstellen en uitschakelen?"
            opties={VRAAG_HERSTEL}
            gekozen={herstel}
            onKies={setHerstel}
          />
        )}
        {stap === 7 && (
          <SingleChoice
            titel="Wat zou jij vandaag het liefst willen?"
            opties={VRAAG_DOEL}
            gekozen={doel}
            onKies={setDoel}
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
          className="rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none transition"
        >
          {stap === 7 ? "Toon mijn overzicht ✨" : "Volgende →"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ stap, totaal }: { stap: number; totaal: number }) {
  const pct = (stap / totaal) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-sky-700 font-medium mb-1.5">
        <span>Vraag {stap} van {totaal}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-sky-100">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500 ease-out"
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
                  ? "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-400 text-sky-900 shadow-md scale-[1.01]"
                  : "bg-white/80 border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  actief
                    ? "border-sky-500 bg-sky-500"
                    : "border-gray-300 group-hover:border-sky-300"
                }`}
              >
                {actief && <span className="block h-2 w-2 rounded-full bg-white" />}
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
                  ? "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-400 text-sky-900 shadow-md scale-[1.01]"
                  : "bg-white/80 border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                  actief
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-gray-300 group-hover:border-sky-300"
                }`}
              >
                {actief && <span className="text-xs">✓</span>}
              </span>
              <span className="flex-1 text-sm leading-snug">{o.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-sky-700">
        {gekozen.length}/3 gekozen
      </p>
    </div>
  );
}

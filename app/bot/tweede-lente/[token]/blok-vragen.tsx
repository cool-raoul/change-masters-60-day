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

  return (
    <div>
      <ProgressBar stap={stap} totaal={7} />

      <div className="mt-6">
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
            ondertitel="Kies één tot drie."
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
          className="text-sm text-gray-500 disabled:opacity-30"
        >
          ← Vorige
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!huidigeStapKlaar}
          className="rounded-full bg-rose-600 px-6 py-2 text-white text-sm font-medium disabled:opacity-40"
        >
          {stap === 7 ? "Spiegel tonen" : "Volgende →"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ stap, totaal }: { stap: number; totaal: number }) {
  const pct = (stap / totaal) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Vraag {stap} van {totaal}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-rose-500 transition-all"
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
      <h2 className="text-xl font-semibold text-gray-900">{titel}</h2>
      <div className="mt-4 space-y-2">
        {opties.map((o) => {
          const actief = gekozen === o.waarde;
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onKies(o.waarde)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition ${
                actief
                  ? "bg-rose-50 border-rose-400 text-rose-900"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-300"
              }`}
            >
              {o.label}
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
      <h2 className="text-xl font-semibold text-gray-900">{titel}</h2>
      {ondertitel && (
        <p className="mt-1 text-sm text-gray-500">{ondertitel}</p>
      )}
      <div className="mt-4 space-y-2">
        {opties.map((o) => {
          const actief = gekozen.includes(o.waarde);
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onToggle(o.waarde)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition ${
                actief
                  ? "bg-rose-50 border-rose-400 text-rose-900"
                  : "bg-white border-gray-200 text-gray-700 hover:border-rose-300"
              }`}
            >
              {actief ? "✓ " : ""}
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {gekozen.length}/3 gekozen
      </p>
    </div>
  );
}

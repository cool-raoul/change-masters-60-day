"use client";

import { useMemo, useState } from "react";
import {
  ZELFTEST_UITSPRAKEN,
  getZichtbareUitspraken,
  berekenUitslag,
  CATEGORIE_LABEL,
  SCHAAL_LABELS,
  type Antwoord,
  type Geslacht,
  type ZelftestHoofdCategorie,
  type ZelftestModifierCategorie,
} from "@/lib/zelftest/vragen";

// ============================================================
// Sandbox — debug-tool voor de zelftest scoring
// URL: /sandbox
//
// Niet aan een token gekoppeld, geen DB-interactie.
// Live scores per categorie + uitslag terwijl je vinkt.
// Voor debug en validatie van het algoritme.
// ============================================================

export default function SandboxPage() {
  const [geslacht, setGeslacht] = useState<Geslacht>("vrouw");
  const [responses, setResponses] = useState<Record<string, Antwoord>>({});

  const zichtbareUitspraken = useMemo(
    () => getZichtbareUitspraken(geslacht),
    [geslacht],
  );

  // Bereken scores per categorie (alleen zichtbare uitspraken meetellen)
  const hoofdScores: Record<ZelftestHoofdCategorie, number> = {
    "energie-focus": 0,
    "stress-slaap": 0,
    "afvallen-metabolisme": 0,
    hormoonbalans: 0,
    "sport-performance": 0,
    "high-performance": 0,
  };
  const modifierScores: Record<ZelftestModifierCategorie, number> = {
    "reset-bereidheid": 0,
    "darm-signalen": 0,
  };

  for (const u of ZELFTEST_UITSPRAKEN) {
    const punt = responses[u.id] ?? 0;
    if (u.categorie === "reset-bereidheid" || u.categorie === "darm-signalen") {
      modifierScores[u.categorie] += punt;
    } else {
      hoofdScores[u.categorie] += punt;
    }
  }

  const uitslag = berekenUitslag({
    trigger60day: "nee",
    geslacht,
    avg_akkoord: true,
    responses,
  });

  function zetAlle(waarde: Antwoord) {
    const nieuw: Record<string, Antwoord> = {};
    for (const u of zichtbareUitspraken) {
      nieuw[u.id] = waarde;
    }
    setResponses(nieuw);
  }

  function zetCategorie(
    categorie: string,
    waarde: Antwoord,
  ) {
    const nieuw = { ...responses };
    for (const u of zichtbareUitspraken) {
      if (u.categorie === categorie) {
        nieuw[u.id] = waarde;
      }
    }
    setResponses(nieuw);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Zelftest Sandbox
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Debug-pagina. Geen DB. Live scores en uitslag terwijl je vinkt.
        </p>

        {/* Geslacht-keuze */}
        <div className="mb-4 flex gap-2 items-center">
          <span className="text-sm text-gray-700">Geslacht:</span>
          {(["vrouw", "man", "zeg-niet"] as Geslacht[]).map((g) => (
            <button
              key={g}
              onClick={() => {
                setGeslacht(g);
                setResponses({});
              }}
              className={`px-3 py-1 rounded text-sm ${
                geslacht === g
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Quick-fill knoppen */}
        <div className="mb-4 flex gap-2 items-center flex-wrap">
          <span className="text-sm text-gray-700">Vul alles met:</span>
          <button onClick={() => zetAlle(0)} className="px-3 py-1 bg-gray-200 rounded text-sm">0</button>
          <button onClick={() => zetAlle(1)} className="px-3 py-1 bg-gray-200 rounded text-sm">1</button>
          <button onClick={() => zetAlle(2)} className="px-3 py-1 bg-gray-200 rounded text-sm">2</button>
          <button onClick={() => setResponses({})} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">Reset</button>
        </div>

        {/* Quick-fill per categorie */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Object.keys(hoofdScores).map((cat) => (
            <div key={cat} className="bg-white border border-gray-200 p-2 rounded">
              <div className="text-gray-700 font-medium mb-1 truncate">{cat}</div>
              <div className="flex gap-1">
                <button onClick={() => zetCategorie(cat, 0)} className="px-2 py-0.5 bg-gray-100 rounded">0</button>
                <button onClick={() => zetCategorie(cat, 1)} className="px-2 py-0.5 bg-gray-100 rounded">1</button>
                <button onClick={() => zetCategorie(cat, 2)} className="px-2 py-0.5 bg-emerald-100 rounded">2</button>
              </div>
            </div>
          ))}
          {(["reset-bereidheid", "darm-signalen"] as const).map((cat) => (
            <div key={cat} className="bg-white border border-amber-200 p-2 rounded">
              <div className="text-amber-700 font-medium mb-1 truncate">{cat}</div>
              <div className="flex gap-1">
                <button onClick={() => zetCategorie(cat, 0)} className="px-2 py-0.5 bg-gray-100 rounded">0</button>
                <button onClick={() => zetCategorie(cat, 1)} className="px-2 py-0.5 bg-gray-100 rounded">1</button>
                <button onClick={() => zetCategorie(cat, 2)} className="px-2 py-0.5 bg-amber-100 rounded">2</button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Vragen */}
          <div>
            <h2 className="font-bold mb-2">Uitspraken (zichtbaar voor {geslacht})</h2>
            <div className="space-y-2">
              {zichtbareUitspraken.map((u) => {
                const labels = SCHAAL_LABELS[u.schaal ?? "frequentie"];
                const isModifier =
                  u.categorie === "reset-bereidheid" ||
                  u.categorie === "darm-signalen";
                return (
                  <div
                    key={u.id}
                    className={`p-2 rounded text-xs border ${
                      isModifier
                        ? "bg-amber-50 border-amber-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-gray-800 flex-1">{u.tekst}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {u.id} · {u.categorie}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((v) => {
                        const label =
                          v === 0
                            ? labels.laag
                            : v === 1
                              ? labels.midden
                              : labels.hoog;
                        return (
                          <button
                            key={v}
                            onClick={() =>
                              setResponses({
                                ...responses,
                                [u.id]: v as Antwoord,
                              })
                            }
                            className={`flex-1 py-1 rounded text-xs ${
                              responses[u.id] === v
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {label} ({v})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live scores + uitslag */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <h2 className="font-bold mb-2">Live scores</h2>
            <div className="bg-white border border-gray-200 rounded p-3 mb-3">
              <div className="text-xs text-gray-500 mb-1">
                Hoofdcategorieën (max 8 per cat)
              </div>
              {(Object.keys(hoofdScores) as ZelftestHoofdCategorie[]).map((c) => (
                <div
                  key={c}
                  className="flex justify-between text-sm py-0.5"
                >
                  <span>{CATEGORIE_LABEL[c]}</span>
                  <span className="font-mono font-bold">{hoofdScores[c]}</span>
                </div>
              ))}
              <div className="mt-3 text-xs text-gray-500 mb-1">
                Modifier-scores (max 6 per cat)
              </div>
              {(Object.keys(modifierScores) as ZelftestModifierCategorie[]).map(
                (c) => (
                  <div
                    key={c}
                    className="flex justify-between text-sm py-0.5"
                  >
                    <span>{c}</span>
                    <span className="font-mono font-bold">
                      {modifierScores[c]}
                    </span>
                  </div>
                ),
              )}
            </div>

            <h2 className="font-bold mb-2">Uitslag</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm">
              <div>
                <strong>Categorie:</strong> {uitslag.categorieLabel}
              </div>
              <div>
                <strong>Niveau:</strong> {uitslag.niveau}
              </div>
              <div>
                <strong>Pakket key:</strong>{" "}
                <code className="text-xs">{uitslag.pakket_key}</code>
              </div>
              <div>
                <strong>Opstart-suggestie:</strong>{" "}
                {uitslag.opstartSuggestie}
              </div>
              <div>
                <strong>Fallback:</strong> {uitslag.fallback ? "ja" : "nee"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

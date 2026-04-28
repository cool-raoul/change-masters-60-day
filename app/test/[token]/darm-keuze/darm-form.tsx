"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DARM_VRAGEN,
  DARM_SCHAAL_LABELS,
  type DarmAntwoord,
} from "@/lib/zelftest/darm-vragen";

// ============================================================
// DarmForm — client form voor de 15-vragen darmvragenlijst.
// 4-puntsschaal per vraag: Niet / Soms / Regelmatig / Vaak
//
// We tonen alle 15 vragen op één pagina (geen multi-step). De vragen
// zijn kort, dat scheelt scrollen tussen stappen en voelt sneller.
// Submit verzendt naam-loze antwoorden naar de server. Server berekent
// bucket en slaat alleen die op.
// ============================================================

const SCHAAL: { waarde: DarmAntwoord; label: string }[] = [
  { waarde: 0, label: DARM_SCHAAL_LABELS[0] },
  { waarde: 1, label: DARM_SCHAAL_LABELS[1] },
  { waarde: 2, label: DARM_SCHAAL_LABELS[2] },
  { waarde: 3, label: DARM_SCHAAL_LABELS[3] },
];

export function DarmForm({
  token,
  memberNaam,
}: {
  token: string;
  memberNaam: string;
}) {
  const router = useRouter();
  const [antwoorden, setAntwoorden] = useState<Record<string, DarmAntwoord>>({});
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const beantwoord = Object.keys(antwoorden).length;
  const totaal = DARM_VRAGEN.length;
  const compleet = beantwoord === totaal;
  const voortgang = Math.round((beantwoord / totaal) * 100);

  function setAntwoord(id: string, waarde: DarmAntwoord) {
    setAntwoorden((prev) => ({ ...prev, [id]: waarde }));
  }

  async function verstuur() {
    if (!compleet) return;
    setBezig(true);
    setFout(null);
    try {
      const res = await fetch("/api/productadvies-test/darm-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, antwoorden }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.error ?? "Er ging iets mis");
        setBezig(false);
        return;
      }
      // Refresh server component zodat uitslag-weergave geladen wordt
      router.refresh();
    } catch (e) {
      setFout("Verbindingsfout. Probeer het zo opnieuw.");
      setBezig(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <p className="text-sm text-gray-700">
          <strong>Hoe vul je dit in?</strong> Per zin kies je hoe vaak het op
          jou van toepassing is in een gemiddelde week. Niet bij twijfel — kies
          op gevoel.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {memberNaam} ziet alléén je uitkomst (geen, basis of plus). Je
          individuele antwoorden worden nooit opgeslagen.
        </p>
      </div>

      {/* Voortgangs-balk */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 sticky top-2 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-700">
            {beantwoord} / {totaal} beantwoord
          </span>
          <span className="text-xs text-gray-500">{voortgang}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${voortgang}%` }}
          />
        </div>
      </div>

      {/* Vragen */}
      <div className="space-y-3">
        {DARM_VRAGEN.map((v, i) => {
          const huidig = antwoorden[v.id];
          return (
            <div
              key={v.id}
              className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5"
            >
              <p className="text-sm sm:text-base text-gray-900 mb-3">
                <span className="text-emerald-600 font-semibold mr-1.5">
                  {i + 1}.
                </span>
                {v.tekst}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SCHAAL.map((s) => {
                  const actief = huidig === s.waarde;
                  return (
                    <button
                      key={s.waarde}
                      type="button"
                      onClick={() => setAntwoord(v.id, s.waarde)}
                      className={`px-2 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        actief
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {fout && (
        <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          {fout}
        </div>
      )}

      <button
        onClick={verstuur}
        disabled={!compleet || bezig}
        className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {bezig
          ? "Bezig..."
          : compleet
            ? "Bekijk mijn uitkomst"
            : `Beantwoord nog ${totaal - beantwoord} ${
                totaal - beantwoord === 1 ? "vraag" : "vragen"
              }`}
      </button>
    </div>
  );
}

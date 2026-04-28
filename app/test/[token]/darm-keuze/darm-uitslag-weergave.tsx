import Link from "next/link";
import type { DarmUitslag } from "@/lib/zelftest/darm-vragen";

// ============================================================
// Toont de uitslag van de darmvragenlijst nadat de prospect die heeft
// ingevuld. Twee varianten:
//  - "basis": Darmen in Balans (16 dagen) als aanbevolen reset
//  - "plus": Darmen in Balans + (uitgebreid) als aanbevolen reset
// Iedereen krijgt een advies — er is geen "geen darmprogramma"-uitkomst.
// ============================================================

export function DarmUitslagWeergave({
  uitslag,
  adviesPakket,
  memberNaam,
  token,
}: {
  uitslag: DarmUitslag;
  adviesPakket: any;
  memberNaam: string;
  token: string;
}) {
  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
          Jouw uitkomst
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {uitslag.bucket_label}
        </h2>
        <div className="text-sm text-gray-500 mb-4">
          Score: {uitslag.totaal} van {uitslag.max} mogelijk
        </div>
        <p className="text-gray-700 leading-relaxed">{uitslag.korte_tekst}</p>
      </section>

      {adviesPakket && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-amber-900 mb-2">
                Aanbevolen voor jou
              </h2>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="font-semibold text-gray-900">
                  {adviesPakket.naam}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  €{adviesPakket.totaalPrijs.toFixed(2)} ASAP ·{" "}
                  {adviesPakket.totaalIP} IP · {adviesPakket.duurDagen} dagen
                </div>
                {adviesPakket.levensstijlAanpassing && (
                  <div className="text-xs text-gray-500 mt-2 italic">
                    {adviesPakket.levensstijlAanpassing.split(".")[0]}.
                  </div>
                )}
              </div>
              <p className="text-xs text-amber-800 mt-3 italic">
                Vraag {memberNaam} om mee te kijken hoe je dit programma kunt
                combineren met je pakket-advies, of welke startdatum praktisch
                handig is.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <Link
          href={`/test/${token}/resultaat`}
          className="block w-full text-center py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
        >
          Terug naar mijn pakket-advies
        </Link>
        <p className="text-xs text-gray-500 mt-3 text-center">
          De uitkomst van deze vragenlijst is opgeslagen op je advies-kaart, zodat
          {" "}{memberNaam} hem ook kan zien.
        </p>
      </section>
    </div>
  );
}

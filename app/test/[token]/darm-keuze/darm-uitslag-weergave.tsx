"use client";

import Link from "next/link";
import type { DarmUitslag } from "@/lib/zelftest/darm-vragen";

// ============================================================
// Toont de uitslag van de darmvragenlijst nadat de prospect die heeft
// ingevuld. Twee varianten:
//  - "basis": Darmen in Balans (16 dagen) als aanbevolen reset
//  - "plus": Darmen in Balans + (uitgebreid) als aanbevolen reset
// Iedereen krijgt een advies — er is geen "geen darmprogramma"-uitkomst.
//
// Geen verzend-knop voor de prospect. De member krijgt automatisch een
// herinnering bij submit (via /api/productadvies-test/darm-submit) — dat
// verlaagt de drempel voor de prospect en voorkomt dat ze 'in beraad'
// blijven hangen omdat ze nog moeten delen.
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
  /** hoofdAdviesTekst was nodig voor het oude share-bericht; sinds er geen
   *  verzend-knop meer is, gebruiken we 'm niet. Prop blijft voor backwards
   *  compatibility met de aanroep, niet langer nodig. */
  hoofdAdviesTekst?: string;
}) {
  const memberVoornaam = memberNaam.split(" ")[0];

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
                  €{adviesPakket.totaalPrijs.toFixed(2)} · {adviesPakket.duurDagen} dagen
                </div>
                {adviesPakket.levensstijlAanpassing && (
                  <div className="text-xs text-gray-500 mt-2 italic">
                    {adviesPakket.levensstijlAanpassing.split(".")[0]}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Member krijgt automatisch een herinnering bij submit. Geen
          verzend-knop voor de prospect — verlaagt de drempel. */}
      <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <h2 className="text-base font-semibold text-emerald-900 mb-1">
              {memberVoornaam} ziet je volledige advies automatisch
            </h2>
            <p className="text-sm text-emerald-900">
              Je hoeft niets meer te doen. {memberVoornaam} krijgt direct een
              melding van beide uitkomsten (pakket-advies en darm-advies) en
              neemt zelf contact met je op.
            </p>
          </div>
        </div>
      </section>

      {/* Terug-knop als secundaire actie — sommige prospects willen
          hun pakket-advies nog eens nalezen. */}
      <section className="text-center">
        <Link
          href={`/test/${token}/resultaat`}
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
        >
          ← Terug naar mijn pakket-advies
        </Link>
      </section>
    </div>
  );
}

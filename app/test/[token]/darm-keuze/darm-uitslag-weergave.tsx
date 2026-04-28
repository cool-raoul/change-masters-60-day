"use client";

import Link from "next/link";
import type { DarmUitslag } from "@/lib/zelftest/darm-vragen";
import { DeelKnoppen } from "@/components/shared/DeelKnoppen";

// ============================================================
// Toont de uitslag van de darmvragenlijst nadat de prospect die heeft
// ingevuld. Twee varianten:
//  - "basis": Darmen in Balans (16 dagen) als aanbevolen reset
//  - "plus": Darmen in Balans + (uitgebreid) als aanbevolen reset
// Iedereen krijgt een advies — er is geen "geen darmprogramma"-uitkomst.
//
// Onderaan staat een "Verstuur dit naar member"-blok. Daar staat het
// volledige advies in: hoofdcategorie + niveau + darmprogramma. Prospect
// kan met één tik delen via WhatsApp/SMS/email/kopieer.
// ============================================================

export function DarmUitslagWeergave({
  uitslag,
  adviesPakket,
  memberNaam,
  token,
  hoofdAdviesTekst,
}: {
  uitslag: DarmUitslag;
  adviesPakket: any;
  memberNaam: string;
  token: string;
  hoofdAdviesTekst: string;
}) {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const advies_url = `${baseUrl}/test/${token}/resultaat`;

  // Bericht-tekst voor de share-knop. Combineert hoofdadvies + darmuitslag
  // zodat de member in één bericht alles ziet.
  const memberVoornaam = memberNaam.split(" ")[0];
  const tekst = `Hé ${memberVoornaam}, ik heb beide vragenlijsten ingevuld.

Mijn pakket-advies: ${hoofdAdviesTekst}
Mijn darm-advies: ${uitslag.bucket_label}

Kunnen we hier samen even naar kijken?

Mijn advies-pagina: ${advies_url}`;

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

      {/* Stuur-naar-member: alleen op deze pagina (na 2e vragenlijst) */}
      <section className="bg-white rounded-2xl shadow-sm border-2 border-emerald-300 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Verstuur dit advies naar {memberVoornaam}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {memberVoornaam} kijkt graag samen met je naar wat hier uitkomt.
          Stuur in één tik je beide uitkomsten.
        </p>
        <DeelKnoppen
          url={advies_url}
          tekst={tekst}
          onderwerp={`Mijn advies — graag samen bespreken`}
          variant="licht"
        />
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <Link
          href={`/test/${token}/resultaat`}
          className="block w-full text-center py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
        >
          Terug naar mijn pakket-advies
        </Link>
      </section>
    </div>
  );
}

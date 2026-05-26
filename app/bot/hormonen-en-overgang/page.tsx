// File: app/bot/hormonen-en-overgang/page.tsx

import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Hormonen & Overgang",
  description:
    "Een korte vragenlijst met persoonlijke score en uitgebreid leefstijl-advies voor hormonen en overgang.",
  openGraph: {
    title: "Hormonen & Overgang",
    description:
      "Persoonlijke score en uitgebreid leefstijl-advies voor hormonen en overgang.",
    images: [],
  },
};

export default function HormonenEnOvergangLandingPagina() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/50">
      <div
        aria-hidden
        className="pointer-events-none fixed top-20 -left-10 text-9xl opacity-[0.04] rotate-12 select-none"
      >
        🌸
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-32 -right-12 text-9xl opacity-[0.04] -rotate-12 select-none"
      >
        🌷
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-16">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 blur-xl opacity-70" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50 text-4xl shadow-md ring-4 ring-white/60">
              🌸
            </div>
          </div>
          <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
            Hormonen & Overgang
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Deze link heeft een persoonlijk adres nodig
          </h1>
          <p className="mt-5 text-gray-700 leading-relaxed">
            Hormonen & Overgang is een korte vragenlijst met persoonlijke
            score en uitgebreid leefstijl-advies. Je opent hem via een
            persoonlijke link van iemand uit ons team.
          </p>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-500">
          Geen medisch advies. Voor specifieke klachten of vragen over
          je gezondheid: raadpleeg altijd je huisarts of professional.
        </footer>
      </div>
    </div>
  );
}

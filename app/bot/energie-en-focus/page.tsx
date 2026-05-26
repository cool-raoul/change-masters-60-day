// File: app/bot/energie-en-focus/page.tsx

import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Energie & Focus",
  description:
    "Een korte vragenlijst met persoonlijke score en uitgebreid leefstijl-advies. Toegang via een persoonlijke link.",
  openGraph: {
    title: "Energie & Focus",
    description:
      "Een korte vragenlijst met persoonlijke score en uitgebreid leefstijl-advies.",
    images: [],
  },
};

export default function EnergieEnFocusLandingPagina() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-sky-50/50">
      <div
        aria-hidden
        className="pointer-events-none fixed top-20 -left-10 text-9xl opacity-[0.04] rotate-12 select-none"
      >
        ⚡
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-32 -right-12 text-9xl opacity-[0.04] -rotate-12 select-none"
      >
        🎯
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-16">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 blur-xl opacity-70" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-50 text-4xl shadow-md ring-4 ring-white/60">
              ⚡
            </div>
          </div>
          <div className="text-orange-600 text-xs font-semibold uppercase tracking-widest">
            Energie & Focus
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Deze link heeft een persoonlijk adres nodig
          </h1>
          <p className="mt-5 text-gray-700 leading-relaxed">
            Energie & Focus is een korte vragenlijst met persoonlijke
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

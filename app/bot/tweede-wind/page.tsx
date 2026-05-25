// File: app/bot/tweede-wind/page.tsx
//
// Landingspagina als iemand de bot opent zonder geldige token.

import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tweede Wind",
  description:
    "Een persoonlijk overzicht voor energie en focus. Toegang via een persoonlijke link.",
  openGraph: {
    title: "Tweede Wind",
    description: "Een persoonlijk overzicht voor energie en focus.",
    images: [],
  },
};

export default function TweedeWindLandingPagina() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50/50">
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
        🌬️
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-16">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 blur-xl opacity-70" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-50 text-4xl shadow-md ring-4 ring-white/60">
              ⚡
            </div>
          </div>

          <div className="text-sky-600 text-xs font-semibold uppercase tracking-widest">
            Tweede Wind
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Deze link heeft een persoonlijk adres nodig
          </h1>
          <p className="mt-5 text-gray-700 leading-relaxed">
            Tweede Wind is een persoonlijk overzicht voor energie en focus.
            Je opent hem via een persoonlijke link van iemand uit ons team.
          </p>
          <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-sky-100 px-5 py-4 shadow-sm text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Heb je iemand uit ons team in gedachten?</strong>
              {" "}Vraag haar of hem gerust om een persoonlijke link.
            </p>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Geen contact?</strong>
              {" "}Reageer op een social-post met het trigger-woord dat erbij stond.
            </p>
          </div>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-500">
          Tweede Wind deelt herkenning en richting, geen medisch advies.
          Voor specifieke klachten of vragen over je gezondheid:
          raadpleeg altijd je huisarts.
        </footer>
      </div>
    </div>
  );
}

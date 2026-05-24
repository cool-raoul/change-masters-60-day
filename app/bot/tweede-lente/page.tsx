// File: app/bot/tweede-lente/page.tsx
//
// Landingspagina als iemand de bot opent zonder geldige token.
// Boodschap: "vraag een team-vrouw om haar persoonlijke link".

import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tweede Lente",
  description:
    "Een persoonlijk overzicht voor wat speelt in en rond de overgang. Toegang via een persoonlijke link.",
  openGraph: {
    title: "Tweede Lente",
    description:
      "Een persoonlijk overzicht voor wat speelt in en rond de overgang.",
    images: [],
  },
};

export default function TweedeLenteLandingPagina() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/50">
      {/* Decoratieve achtergrond-blossoms */}
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
          {/* Hero-graphic */}
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 blur-xl opacity-70" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50 text-4xl shadow-md ring-4 ring-white/60">
              🌷
            </div>
          </div>

          <div className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
            Tweede Lente
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Deze link heeft een persoonlijk adres nodig
          </h1>
          <p className="mt-5 text-gray-700 leading-relaxed">
            Tweede Lente is een persoonlijk overzicht voor wat speelt in en rond de overgang.
            Je opent hem via een persoonlijke link van iemand uit ons team.
          </p>
          <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 px-5 py-4 shadow-sm text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Heb je iemand uit ons team in gedachten?</strong>
              {" "}Vraag haar gerust om haar persoonlijke link.
            </p>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Geen contact?</strong>
              {" "}Reageer op haar social-post met het trigger-woord dat
              zij heeft gedeeld.
            </p>
          </div>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-500">
          Tweede Lente deelt herkenning en richting, geen medisch advies.
          Voor specifieke klachten of vragen over je gezondheid:
          raadpleeg altijd je huisarts.
        </footer>
      </div>
    </div>
  );
}

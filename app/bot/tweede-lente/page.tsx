// File: app/bot/tweede-lente/page.tsx
//
// Landingspagina als iemand de bot opent zonder geldige token.
// Boodschap: "vraag een team-vrouw om haar persoonlijke link".
// Geen formulier, geen omweg.

import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tweede Lente",
  description:
    "Een korte spiegel voor vrouwen in peri-, volle of post-overgang. Toegang via een persoonlijke link.",
  openGraph: {
    title: "Tweede Lente",
    description:
      "Een korte spiegel voor vrouwen in peri-, volle of post-overgang.",
    images: [],
  },
};

export default function TweedeLenteLandingPagina() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="text-center">
          <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
            Tweede Lente
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Deze link heeft een persoonlijk adres nodig
          </h1>
          <p className="mt-4 text-gray-700">
            Tweede Lente is een korte spiegel voor vrouwen in de overgang. Je
            opent hem via een persoonlijke link van iemand uit ons team.
          </p>
          <p className="mt-3 text-gray-700">
            Heb je een vrouw uit ons team in gedachten? Vraag haar gerust om
            haar persoonlijke link. Heb je nog geen contact? Reageer op haar
            social-post met het trigger-woord dat zij heeft gedeeld.
          </p>
        </div>
        <footer className="mt-12 text-center text-xs text-gray-400">
          Tweede Lente deelt herkenning en richting, geen medisch advies. Voor
          specifieke klachten of vragen over je gezondheid: raadpleeg altijd
          je huisarts.
        </footer>
      </div>
    </div>
  );
}

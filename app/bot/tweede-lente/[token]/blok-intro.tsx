// File: app/bot/tweede-lente/[token]/blok-intro.tsx
//
// Blok 1, warme intro in ELEVA-team-stem (niet Gaby-specifiek).
// Geen member-naam zichtbaar voor prospect, om twee redenen:
//   1. Naam-mismatch tussen social en systeem (Raoul, 2026-05-24)
//   2. De vrouw moet zich op zichzelf richten, niet op de afzender
//
// TODO-GABY: definitieve openings-tekst aanleveren. Onder staat
// een placeholder die claim-vrij is en in jullie stem klinkt.

"use client";

export function BlokIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Tweede Lente
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
        Welkom 💟
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        Fijn dat je hier bent. Wij zijn vrouwen die door deze fase zijn
        gegaan, en wij hebben deze ruimte voor jou gemaakt.
      </p>
      <p className="mt-4 text-gray-700 leading-relaxed">
        Vijf minuten, zeven vragen. Aan het eind een rustige spiegel en
        een paar concrete ideeën waar veel vrouwen in jouw fase voor
        kiezen.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 rounded-full bg-rose-600 px-8 py-3 text-white text-base font-medium shadow-sm hover:bg-rose-700 transition"
      >
        Ja, start de vragen
      </button>
      <p className="mt-6 text-xs text-gray-400">
        Tweede Lente deelt herkenning en richting, geen medisch advies.
      </p>
    </div>
  );
}

// File: app/bot/tweede-lente/[token]/blok-intro.tsx
//
// Blok 1, warme intro met hero-graphic. Decoratieve bloesems + gradient
// + duidelijke USP-iconen. Toont de naam van de member die de link
// heeft gedeeld, persoonlijk gevoel.

"use client";

export function BlokIntro({
  memberVoornaam,
  onStart,
}: {
  memberVoornaam: string;
  onStart: () => void;
}) {
  return (
    <div className="text-center">
      {/* Hero-graphic */}
      <div className="relative mx-auto mb-2 h-24 w-24 sm:h-28 sm:w-28">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200 via-pink-200 to-amber-100 blur-xl opacity-70" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50 text-5xl sm:text-6xl shadow-md ring-4 ring-white/60">
          🌷
        </div>
      </div>

      <div className="mt-4 text-rose-500 text-sm font-semibold uppercase tracking-widest">
        Tweede Lente
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
        Welkom bij {memberVoornaam}
        <span className="ml-1 inline-block">💟</span>
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        Fijn dat je hier bent. {memberVoornaam} heeft deze ruimte met haar team
        voor jou klaargezet, vrouwen die zelf door deze fase zijn gegaan.
      </p>

      {/* Drie USP-pillen */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-rose-700 font-medium shadow-sm border border-rose-100">
          ⏱ 5 minuten
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-rose-700 font-medium shadow-sm border border-rose-100">
          📝 7 vragen
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-rose-700 font-medium shadow-sm border border-rose-100">
          🪞 Persoonlijke spiegel
        </span>
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">
        Aan het eind krijg je een rustige spiegel die past bij jouw situatie,
        concrete handvatten en de voedingsstoffen die in jouw fase vaak
        belangrijk worden. Je ontvangt het ook in je mail.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 group rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-10 py-4 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-rose-700 hover:to-pink-700 transition-all"
      >
        Ja, ik start
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>

      <p className="mt-6 text-xs text-gray-500">
        Tweede Lente deelt herkenning en richting, geen medisch advies.
      </p>
    </div>
  );
}

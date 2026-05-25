// File: app/bot/tweede-wind/[token]/blok-intro.tsx
//
// Blok 1, warme intro. Sky/blauw thema. Gender-neutraal. Voor mensen
// die hun energie en focus willen terugvinden.

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
      <div className="relative mx-auto mb-2 h-24 w-24 sm:h-28 sm:w-28">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200 via-blue-200 to-amber-100 blur-xl opacity-70" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-50 text-5xl sm:text-6xl shadow-md ring-4 ring-white/60">
          ⚡
        </div>
      </div>

      <div className="mt-4 text-sky-600 text-sm font-semibold uppercase tracking-widest">
        Tweede Wind
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Een rustige plek voor energie en focus
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
        Hey, leuk dat je deze stap nam
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        {memberVoornaam} heeft deze plek voor je klaargezet. Vijf minuten
        voor jezelf, zonder druk.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-sky-700 font-medium shadow-sm border border-sky-100">
          ⏱ 5 minuten
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-sky-700 font-medium shadow-sm border border-sky-100">
          📝 7 vragen
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-sky-700 font-medium shadow-sm border border-sky-100">
          ⚡ Voor jou alleen
        </span>
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">
        Aan het eind krijg je een persoonlijk overzicht voor jou, plus
        handvatten en de voedingsstoffen die helpend zijn bij wat je nu
        ervaart. We sturen het ook door in je mail zodat je er later
        rustig op terug kunt komen.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 group rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-10 py-4 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-sky-700 hover:to-blue-700 transition-all"
      >
        Ja, ik start
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>

      <p className="mt-6 text-xs text-gray-500">
        Tweede Wind deelt herkenning en richting, geen medisch advies.
      </p>
    </div>
  );
}

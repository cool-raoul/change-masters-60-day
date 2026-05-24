// File: app/bot/tweede-lente/[token]/blok-intro.tsx
//
// Blok 1, warme intro. Variant 2-stijl (warm + persoonlijker + open).
// Gender-neutraal: 'iemand uit het team' werkt voor zowel mannelijke
// als vrouwelijke verzenders. Geen 'welkom' (te ouderwets), geen
// 'spiegel' (te vaag), geen 'fase' (te robotachtig). Wel expliciet
// 'overgang' zodat thema direct duidelijk is.

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
      <p className="mt-1 text-sm text-gray-500">
        Een rustige plek voor wat speelt in en rond de overgang
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
        Hey, leuk dat je deze stap nam
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        {memberVoornaam} heeft deze plek voor je klaargezet. Vijf minuten
        voor jezelf, zonder druk.
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
          🌷 Voor jou alleen
        </span>
      </div>

      <p className="mt-6 text-gray-700 leading-relaxed">
        Aan het eind krijg je een persoonlijk overzicht voor jou, plus
        vier handvatten en de voedingsstoffen die helpend zijn bij wat
        je nu ervaart. We sturen het ook door in je mail zodat je er
        later rustig op terug kunt komen.
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

// File: app/bot/tweede-wind/[token]/bot-header.tsx
//
// Visuele header voor Tweede Wind. Sky/blauw thema (vs rose voor
// Tweede Lente). Zelfde structuur, andere kleuren + icoon.

"use client";

export function BotHeader({
  stap,
  totaalStappen,
  memberVoornaam,
}: {
  stap?: number;
  totaalStappen?: number;
  memberVoornaam: string;
}) {
  const showVoortgang =
    stap !== undefined && totaalStappen !== undefined && totaalStappen > 0;
  const pct = showVoortgang ? (stap! / totaalStappen!) * 100 : 0;

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200 via-blue-100 to-amber-50 px-6 py-7 sm:px-8 sm:py-8 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 -right-6 text-7xl opacity-40 rotate-12"
      >
        ⚡
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-3 text-3xl opacity-25"
      >
        🌬️
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 text-2xl opacity-20"
      >
        🎯
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-xl shadow-sm">
            ⚡
          </div>
          <div>
            <div className="text-sky-700 text-xs font-semibold uppercase tracking-widest">
              Tweede Wind
            </div>
            <div className="text-gray-700 text-sm">
              Klaargezet door <strong>{memberVoornaam}</strong> en het team
            </div>
          </div>
        </div>

        {showVoortgang && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-sky-700 font-medium mb-1.5">
              <span>
                Stap {stap} van {totaalStappen}
              </span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

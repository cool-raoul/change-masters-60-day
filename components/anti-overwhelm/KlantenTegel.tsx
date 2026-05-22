// File: components/anti-overwhelm/KlantenTegel.tsx
//
// K2 van anti-overwhelm-kompas: klantomgevingen zijn één tegel "Mijn klanten"
// op het dashboard. Geen tweede navigatie-hub. Eén regel-helder voor wie
// alleen wil weten of er iets nieuws is. Doorklikken opent de lijst.

import Link from "next/link";

export type KlantenTegelProps = {
  aantalKlanten: number;
  aantalNieuweSignalen: number;
  /** Optionele samenvatting: "1 enthousiast, 1 stil". */
  signaalSamenvatting?: string;
  /** Route waar de lijst opent. */
  lijstRoute?: string;
};

export function KlantenTegel({
  aantalKlanten,
  aantalNieuweSignalen,
  signaalSamenvatting,
  lijstRoute = "/klant",
}: KlantenTegelProps) {
  const heeftNieuweSignalen = aantalNieuweSignalen > 0;

  return (
    <Link
      href={lijstRoute}
      className={`block rounded-lg border p-4 transition-colors ${
        heeftNieuweSignalen
          ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15"
          : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👥</span>
          <div>
            <div className="font-medium text-slate-100">Mijn klanten</div>
            <div className="text-xs text-slate-400">
              {aantalKlanten === 0
                ? "Nog geen klanten in beeld"
                : `${aantalKlanten} klant${aantalKlanten === 1 ? "" : "en"}`}
            </div>
          </div>
        </div>
        {heeftNieuweSignalen && (
          <div className="text-right">
            <div className="text-sm font-medium text-amber-200">
              {aantalNieuweSignalen} nieuw{aantalNieuweSignalen === 1 ? "" : "e"} signaal
              {aantalNieuweSignalen === 1 ? "" : "en"}
            </div>
            {signaalSamenvatting && (
              <div className="text-xs text-amber-300/80">{signaalSamenvatting}</div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

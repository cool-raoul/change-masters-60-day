import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Leerpad } from "@/lib/leerpaden/types";

// ============================================================
// StappenDashboard, simpel overzicht voor Core en Pro.
//
// Toont alleen:
// - Hero met huidige stap-nummer + datum
// - Voortgang-balk (stap X van totaal)
// - Eén grote tegel met de huidige stap, klikt door naar /welkom-X/stap/N
// - Voorvertoning komende 3 stappen (klikbaar)
// - Niet meer alle content op één pagina, dat staat op de stap-detail
//
// Sidebar werkt via /welkom-X/layout.tsx (AppShell).
// ============================================================

type Props = {
  leerpad: Leerpad;
  huidigeStap: number;
  naam: string;
  /** Basis-URL voor stap-detail-pagina's, bijv. "/welkom-pro/stap" of "/welkom-core/stap". */
  stapBasisRoute: string;
};

export function StappenDashboard({
  leerpad,
  huidigeStap,
  naam,
  stapBasisRoute,
}: Props) {
  const stap = leerpad.stappen.find((s) => s.nummer === huidigeStap);
  const volgende = leerpad.stappen.filter(
    (s) => s.nummer > huidigeStap && s.nummer <= huidigeStap + 3,
  );
  const procent = Math.min(100, Math.round((huidigeStap / leerpad.totaal) * 100));
  const vandaag = format(new Date(), "EEEE d MMMM yyyy", { locale: nl });

  if (!stap) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {naam ? `Welkom, ${naam}!` : "Welkom!"} Stap{" "}
          <span className="text-cm-gold">{huidigeStap}</span> van {leerpad.totaal}
        </h1>
        <p className="text-cm-white opacity-70 mt-1 text-sm">{vandaag}</p>
      </div>

      {/* Voortgang */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-cm-white uppercase tracking-wider opacity-80">
            Voortgang {leerpad.naam}
          </h2>
          <span className="text-cm-gold text-xs font-semibold">{procent}%</span>
        </div>
        <div className="h-2 bg-cm-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
            style={{ width: `${procent}%` }}
          />
        </div>
        <p className="text-cm-white text-xs mt-2 opacity-60">
          {leerpad.totaal - huidigeStap} stap
          {leerpad.totaal - huidigeStap === 1 ? "" : "pen"} te gaan
        </p>
      </div>

      {/* Huidige stap, gouden tegel die doorklikt */}
      <Link
        href={`${stapBasisRoute}/${stap.nummer}`}
        className="block card border-gold-subtle hover:border-cm-gold transition-colors group"
      >
        <div className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-2">
          Vandaag, stap {stap.nummer}
        </div>
        <h2 className="text-cm-white font-display font-bold text-xl mb-2">
          {stap.titel}
        </h2>
        <p className="text-cm-white text-sm opacity-80 leading-relaxed">
          {stap.doel}
        </p>
        <div className="mt-4 text-cm-gold text-sm font-semibold group-hover:translate-x-1 inline-block transition-transform">
          Open deze stap →
        </div>
      </Link>

      {/* Komende stappen, voorvertoning, klikbaar maar lichter */}
      {volgende.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-cm-white uppercase tracking-wider opacity-80 mt-2">
            Volgende stappen
          </h3>
          {volgende.map((s) => (
            <Link
              key={s.nummer}
              href={`${stapBasisRoute}/${s.nummer}`}
              className="block card opacity-70 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-start gap-3">
                <div className="text-cm-gold font-bold text-lg flex-shrink-0">
                  {s.nummer}
                </div>
                <div className="flex-1">
                  <div className="text-cm-white text-sm font-medium">
                    {s.titel}
                  </div>
                  <p className="text-cm-white text-xs opacity-70 mt-0.5">
                    {s.doel}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

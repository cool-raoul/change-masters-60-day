import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Leerpad } from "@/lib/leerpaden/types";
import { TijdslijnStrip } from "@/components/layout/TijdslijnStrip";

// ============================================================
// StappenDashboard, simpel overzicht voor Core en Pro.
//
// Mockup-4-stijl (akkoord 7 mei 2026):
// - Persoonlijke welkomstoon (serif heading + italic groet)
// - TijdslijnStrip met cirkels (groen voltooid, goud vandaag, leeg toekomst)
// - Focus-card met label "Vandaag jouw focus" + glow
// - Voorvertoning komende 3 stappen, kalmer en lichter
// ============================================================

type Props = {
  leerpad: Leerpad;
  huidigeStap: number;
  naam: string;
  /** Basis-URL voor stap-detail-pagina's, bijv. "/welkom-pro/stap" of "/welkom-core/stap". */
  stapBasisRoute: string;
  /** Optioneel: naam van de sponsor voor de mens-eerst-strip. Verbergt zich als leeg. */
  sponsorNaam?: string;
};

export function StappenDashboard({
  leerpad,
  huidigeStap,
  naam,
  stapBasisRoute,
  sponsorNaam,
}: Props) {
  const stap = leerpad.stappen.find((s) => s.nummer === huidigeStap);
  const volgende = leerpad.stappen.filter(
    (s) => s.nummer > huidigeStap && s.nummer <= huidigeStap + 3,
  );
  const procent = Math.min(100, Math.round((huidigeStap / leerpad.totaal) * 100));
  const vandaag = format(new Date(), "EEEE d MMMM yyyy", { locale: nl });
  const voornaam = naam ? naam.split(" ")[0] : "";

  if (!stap) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Persoonlijke welkom in mens-eerst-stijl */}
      <div>
        <p className="text-cm-white/60 text-sm italic">
          {voornaam ? `Mooi dat je er bent vandaag, ${voornaam},` : "Mooi dat je er bent vandaag,"}
        </p>
        <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white mt-1 leading-tight">
          stap <span className="text-cm-gold">{huidigeStap}</span> van je{" "}
          <span className="text-cm-gold">{leerpad.naam.toLowerCase()}</span>.
        </h1>
        <p className="text-cm-white/50 text-xs mt-2">{vandaag}</p>
      </div>

      {/* Sponsor-info-strip, neutraal */}
      {sponsorNaam && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-cm-border bg-cm-surface-2/40 glow-gold-soft">
          <div className="w-9 h-9 rounded-full border-2 border-cm-gold-dim bg-cm-surface-2 flex items-center justify-center text-cm-gold text-sm font-semibold flex-shrink-0">
            {sponsorNaam
              .split(/\s|\//)
              .filter(Boolean)
              .map((s) => s[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-cm-white/80 text-sm leading-snug">
            <span className="text-cm-white font-medium">{sponsorNaam}</span>{" "}
            <span className="text-cm-white/60">is je sponsor.</span>
          </div>
        </div>
      )}

      {/* Tijdslijn-strip met cirkels */}
      <TijdslijnStrip
        totaal={leerpad.totaal}
        huidig={huidigeStap}
        label={`Voortgang door je ${leerpad.totaal} stappen`}
      />

      {/* Voortgang als compacte regel */}
      <div className="flex items-center justify-between text-xs text-cm-white/50">
        <span>{procent}% voltooid</span>
        <span>
          {leerpad.totaal - huidigeStap} stap
          {leerpad.totaal - huidigeStap === 1 ? "" : "pen"} te gaan
        </span>
      </div>

      {/* Focus-card, één hoofdactie van vandaag */}
      <Link
        href={`${stapBasisRoute}/${stap.nummer}`}
        className="block card border-cm-gold/40 hover:border-cm-gold transition-colors group glow-gold-soft"
      >
        <div className="text-cm-gold text-[11px] font-semibold uppercase tracking-wider mb-2">
          Vandaag jouw focus
        </div>
        <h2 className="font-serif-warm text-cm-white text-xl mb-2 leading-snug">
          {stap.titel}
        </h2>
        <p className="text-cm-white/75 text-sm leading-relaxed">
          {stap.doel}
        </p>
        <div className="mt-4 text-cm-gold text-sm font-medium group-hover:translate-x-1 inline-block transition-transform">
          Hier ga ik mee aan de slag →
        </div>
      </Link>

      {/* Komende stappen, voorvertoning */}
      {volgende.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold text-cm-white/50 uppercase tracking-wider mt-2">
            Volgende stappen
          </h3>
          {volgende.map((s) => (
            <Link
              key={s.nummer}
              href={`${stapBasisRoute}/${s.nummer}`}
              className="block card opacity-70 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-start gap-3">
                <div className="text-cm-gold/80 font-semibold text-base flex-shrink-0 w-6 text-center">
                  {s.nummer}
                </div>
                <div className="flex-1">
                  <div className="text-cm-white text-sm font-medium">
                    {s.titel}
                  </div>
                  <p className="text-cm-white/60 text-xs mt-0.5">
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

import Link from "next/link";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import type { Leerpad, LeerpadStap } from "@/lib/leerpaden/types";

// ============================================================
// StapDetail, herbruikbaar component voor stap-detail-pagina's.
//
// Mockup-4-stijl (akkoord 7 mei 2026):
// - Subtieler terug-knop
// - Serif heading voor titel
// - Taken met checkbox-cirkels (groen voltooid in latere fase, nu nog 'open')
// - Mentor-help-strip onderaan ("vraag het in mensentaal")
// - Cards met subtiele goud-glow
// ============================================================

type Props = {
  leerpad: Leerpad;
  stap: LeerpadStap;
  /** Basis-URL voor terug naar dashboard, bijv. "/welkom-pro" of "/welkom-core". */
  dashboardRoute: string;
  /** Slug-prefix voor de stap-films, bijv. "core-stap" of "pro-stap". */
  stapFilmSlugPrefix: string;
};

export function StapDetail({
  leerpad,
  stap,
  dashboardRoute,
  stapFilmSlugPrefix,
}: Props) {
  const vorige = leerpad.stappen.find((s) => s.nummer === stap.nummer - 1);
  const volgende = leerpad.stappen.find((s) => s.nummer === stap.nummer + 1);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Terug-knop, subtiel */}
      <Link
        href={dashboardRoute}
        className="text-cm-white/50 hover:text-cm-white text-sm flex items-center gap-1 transition-colors"
      >
        ← Terug naar overzicht
      </Link>

      {/* Welkomstfilm voor deze stap (alleen als founder 'm heeft gezet) */}
      <FilmInBlok
        slug={`${stapFilmSlugPrefix}-${stap.nummer}`}
        verbergZonderFilm
      />

      {/* Header */}
      <div>
        <div className="text-cm-gold text-[11px] font-semibold uppercase tracking-wider mb-2">
          {leerpad.naam}, stap {stap.nummer} van {leerpad.totaal}
        </div>
        <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white leading-tight">
          {stap.titel}
        </h1>
        <p className="text-cm-white/60 text-sm mt-3 italic leading-relaxed">
          {stap.doel}
        </p>
      </div>

      {/* Wat je leert, met subtiele goud-glow */}
      <div className="card glow-gold-soft">
        <h2 className="text-cm-gold font-semibold text-xs uppercase tracking-wider mb-3">
          📖 Wat je vandaag leert
        </h2>
        <p className="text-cm-white/85 text-sm leading-relaxed whitespace-pre-line">
          {stap.watJeLeert}
        </p>
      </div>

      {/* Wat je doet, taken met checkbox-cirkels */}
      <div className="card">
        <h2 className="text-cm-gold font-semibold text-xs uppercase tracking-wider mb-3">
          ✅ Wat je vandaag doet ({stap.vandaagDoen.length} stap
          {stap.vandaagDoen.length === 1 ? "" : "pen"})
        </h2>
        <ul className="space-y-2.5">
          {stap.vandaagDoen.map((taak) => (
            <li
              key={taak.id}
              className="flex items-start gap-3 p-3 bg-cm-surface-2 border border-cm-border rounded-lg hover:border-cm-gold-dim transition-colors"
            >
              {/* Checkbox-cirkel, mockup-stijl */}
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-cm-gold-dim" />
              </div>
              <div className="flex-1">
                <div className="text-cm-white text-sm font-medium leading-relaxed">
                  {taak.label}
                  {taak.verplicht && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold/15 text-cm-gold font-bold align-middle border border-cm-gold/30">
                      Verplicht
                    </span>
                  )}
                </div>
                {taak.uitleg && (
                  <p className="text-cm-white/65 text-xs mt-1 leading-relaxed">
                    {taak.uitleg}
                  </p>
                )}
                {taak.actieRoute && (
                  <Link
                    href={taak.actieRoute}
                    className="text-cm-gold text-xs mt-2 inline-block hover:underline"
                  >
                    Open →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Waar in ELEVA */}
      {stap.waarInEleva && stap.waarInEleva.length > 0 && (
        <div className="card">
          <h2 className="text-cm-gold font-semibold text-xs uppercase tracking-wider mb-3">
            📍 Waar vind je dit in ELEVA
          </h2>
          <div className="flex flex-wrap gap-2">
            {stap.waarInEleva.map((w, i) => (
              <Link
                key={i}
                href={w.route}
                className="text-xs bg-cm-surface-2 text-cm-white px-3 py-2 rounded-full border border-cm-border hover:border-cm-gold transition-colors"
              >
                {w.actie} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mentor-help-strip, mens-eerst gevoel */}
      <Link
        href="/coach"
        className="flex items-center gap-3 p-4 bg-cm-surface-2/60 border border-dashed border-cm-border rounded-xl hover:border-cm-gold-dim transition-colors"
      >
        <span className="text-2xl">🤖</span>
        <div className="flex-1 text-cm-white/75 text-sm">
          Niet zeker hoe? De Mentor legt het uit in mensentaal.
        </div>
        <span className="text-xs px-3 py-1.5 rounded-lg bg-cm-gold text-cm-black font-semibold">
          Vraag
        </span>
      </Link>

      {/* Vorige / volgende navigatie */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {vorige ? (
          <Link
            href={`${dashboardRoute}/stap/${vorige.nummer}`}
            className="btn-secondary text-sm flex-1 text-center"
          >
            ← Stap {vorige.nummer}
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        <Link
          href={dashboardRoute}
          className="text-cm-white/60 hover:text-cm-white text-xs transition-colors"
        >
          Overzicht
        </Link>
        {volgende ? (
          <Link
            href={`${dashboardRoute}/stap/${volgende.nummer}`}
            className="btn-gold text-sm flex-1 text-center"
          >
            Stap {volgende.nummer} →
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}

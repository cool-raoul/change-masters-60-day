import Link from "next/link";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import type { Leerpad, LeerpadStap } from "@/lib/leerpaden/types";

// ============================================================
// StapDetail, herbruikbaar component voor stap-detail-pagina's.
//
// Toont één stap volledig:
// - Terug-knop naar dashboard
// - Welkomstfilm bovenaan (als founder een film heeft geplakt)
// - Titel + doel + "wat je leert" + "wat je doet" + "waar in ELEVA"
// - Vorige/volgende-stap-navigatie onderaan
//
// Werkt voor Core en Pro. Render binnen layout.tsx → AppShell zodat
// de sidebar zichtbaar blijft.
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
      {/* Terug-knop */}
      <Link
        href={dashboardRoute}
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
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
        <div className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-1">
          {leerpad.naam}, stap {stap.nummer} van {leerpad.totaal}
        </div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {stap.titel}
        </h1>
        <p className="text-cm-gold text-sm mt-2 italic leading-relaxed">
          {stap.doel}
        </p>
      </div>

      {/* Wat je leert */}
      <div className="card">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          📖 Wat je vandaag leert
        </h2>
        <p className="text-cm-white text-sm leading-relaxed opacity-90 whitespace-pre-line">
          {stap.watJeLeert}
        </p>
      </div>

      {/* Wat je doet */}
      <div className="card">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          ✅ Wat je vandaag doet ({stap.vandaagDoen.length} stap
          {stap.vandaagDoen.length === 1 ? "" : "pen"})
        </h2>
        <ul className="space-y-3">
          {stap.vandaagDoen.map((taak) => (
            <li
              key={taak.id}
              className="flex items-start gap-3 p-3 bg-cm-surface-2 rounded-lg"
            >
              <div className="text-cm-gold flex-shrink-0 text-lg leading-none mt-0.5">
                ○
              </div>
              <div className="flex-1">
                <div className="text-cm-white text-sm font-medium leading-relaxed">
                  {taak.label}
                  {taak.verplicht && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold/20 text-cm-gold font-bold align-middle">
                      Verplicht
                    </span>
                  )}
                </div>
                {taak.uitleg && (
                  <p className="text-cm-white text-xs opacity-70 mt-1 leading-relaxed">
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
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            📍 Waar vind je dit in ELEVA
          </h2>
          <div className="flex flex-wrap gap-2">
            {stap.waarInEleva.map((w, i) => (
              <Link
                key={i}
                href={w.route}
                className="text-xs bg-cm-surface-2 text-cm-white px-3 py-2 rounded-full hover:bg-cm-surface-3 transition-colors"
              >
                {w.actie} →
              </Link>
            ))}
          </div>
        </div>
      )}

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
          className="text-cm-white opacity-70 hover:opacity-100 text-xs"
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

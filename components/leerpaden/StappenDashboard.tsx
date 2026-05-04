import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { EditableTekst } from "@/components/cms/EditableTekst";
import type { Leerpad } from "@/lib/leerpaden/types";

// ============================================================
// StappenDashboard, herbruikbaar dashboard voor Core en Pro.
//
// Toont per modus:
// - Hero met huidige stap-nummer + titel
// - Welkomstfilm bovenaan (als founder een film heeft geplakt)
// - Voortgang-balk (stap X van totaal)
// - Lijst van komende 3 stappen als preview
// - Snelle toegang tot de andere tools (sidebar werkt al)
//
// Werkt voor beide modi door het Leerpad door te geven en de juiste
// film-slug + namespace mee te geven.
// ============================================================

type Props = {
  leerpad: Leerpad;
  huidigeStap: number;
  naam: string;
  isFounder: boolean;
  /** Film-slug bovenaan, bijv. MODUS_WELKOMSTFILM_SLUGS.CORE. */
  welkomstFilmSlug: string;
  /** Slug-prefix voor de stap-films, bijv. "core-stap" of "pro-stap". */
  stapFilmSlugPrefix: string;
  /** Tekst-namespace voor EditableTekst, bijv. "welkom-core" of "welkom-pro". */
  tekstNamespace: string;
  overrides: Record<string, string>;
};

export function StappenDashboard({
  leerpad,
  huidigeStap,
  naam,
  isFounder,
  welkomstFilmSlug,
  stapFilmSlugPrefix,
  tekstNamespace,
  overrides,
}: Props) {
  const stap = leerpad.stappen.find((s) => s.nummer === huidigeStap);
  const volgende = leerpad.stappen.filter(
    (s) => s.nummer > huidigeStap && s.nummer <= huidigeStap + 3,
  );
  const procent = Math.min(100, Math.round((huidigeStap / leerpad.totaal) * 100));
  const vandaag = format(new Date(), "EEEE d MMMM yyyy", { locale: nl });

  if (!stap) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welkomstfilm bovenaan (alleen zichtbaar als founder een film heeft geplakt) */}
      <FilmInBlok slug={welkomstFilmSlug} verbergZonderFilm />

      {/* Header, warme groet + stap-nummer prominent */}
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          <EditableTekst
            namespace={tekstNamespace}
            sleutel="header-groet"
            standaard={`Welkom${naam ? `, ${naam}` : ""}!`}
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint={`Welkomstgroet bovenaan het ${leerpad.naam}-dashboard.`}
          />
          {", Stap "}
          <span className="text-cm-gold">{huidigeStap}</span>
          {` van ${leerpad.totaal}`}
        </h1>
        <p className="text-cm-white mt-1 opacity-80">{vandaag}</p>
      </div>

      {/* Voortgang */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            Voortgang {leerpad.naam}
          </h2>
          <span className="text-cm-gold text-sm font-semibold">{procent}%</span>
        </div>
        <div className="h-3 bg-cm-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
            style={{ width: `${procent}%` }}
          />
        </div>
        <p className="text-cm-white text-xs mt-2">
          {leerpad.totaal - huidigeStap} stap
          {leerpad.totaal - huidigeStap === 1 ? "" : "pen"} te gaan
        </p>
      </div>

      {/* Huidige stap, gouden tegel */}
      <div className="card border-gold-subtle space-y-4">
        <FilmInBlok
          slug={`${stapFilmSlugPrefix}-${stap.nummer}`}
          verbergZonderFilm
        />
        <div>
          <div className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-1">
            Vandaag, stap {stap.nummer}
          </div>
          <h2 className="text-cm-white font-display font-bold text-xl">
            {stap.titel}
          </h2>
          <p className="text-cm-gold text-sm mt-2 italic">{stap.doel}</p>
        </div>

        {/* Wat je leert */}
        <div className="space-y-2">
          <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
            📖 Wat je vandaag leert
          </h3>
          <p className="text-cm-white text-sm leading-relaxed opacity-90 whitespace-pre-line">
            {stap.watJeLeert}
          </p>
        </div>

        {/* Wat je doet */}
        <div className="space-y-2">
          <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
            ✅ Wat je vandaag doet ({stap.vandaagDoen.length} stap
            {stap.vandaagDoen.length === 1 ? "" : "pen"})
          </h3>
          <ul className="space-y-2">
            {stap.vandaagDoen.map((taak) => (
              <li
                key={taak.id}
                className="flex items-start gap-3 p-3 bg-cm-surface-2 rounded-lg"
              >
                <div className="text-cm-gold flex-shrink-0 text-lg">○</div>
                <div className="flex-1">
                  <div className="text-cm-white text-sm font-medium">
                    {taak.label}
                    {taak.verplicht && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold/20 text-cm-gold font-bold">
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
          <div className="space-y-2">
            <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
              📍 Waar vind je dit in ELEVA
            </h3>
            <div className="flex flex-wrap gap-2">
              {stap.waarInEleva.map((w, i) => (
                <Link
                  key={i}
                  href={w.route}
                  className="text-xs bg-cm-surface-2 text-cm-white px-3 py-1.5 rounded-full hover:bg-cm-surface-3 transition-colors"
                >
                  {w.actie} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Komende stappen, voorvertoning */}
      {volgende.length > 0 && (
        <div className="card">
          <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            Volgende stappen
          </h3>
          <div className="space-y-2">
            {volgende.map((s) => (
              <div
                key={s.nummer}
                className="flex items-start gap-3 p-3 bg-cm-surface-2 rounded-lg opacity-70"
              >
                <div className="text-cm-gold font-bold flex-shrink-0">
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
            ))}
          </div>
        </div>
      )}

      {/* Snelle toegang tot tools */}
      <div className="card">
        <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          🛠️ Jouw tools (altijd beschikbaar)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link
            href="/coach"
            className="text-center p-3 bg-cm-surface-2 rounded-lg hover:bg-cm-surface-3 transition-colors"
          >
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-cm-white text-xs">Mentor</div>
          </Link>
          <Link
            href="/namenlijst"
            className="text-center p-3 bg-cm-surface-2 rounded-lg hover:bg-cm-surface-3 transition-colors"
          >
            <div className="text-2xl mb-1">👥</div>
            <div className="text-cm-white text-xs">
              {leerpad.modus === "pro" ? "Cliënten" : "Klanten"}
            </div>
          </Link>
          <Link
            href="/test-pakket-bouwer"
            className="text-center p-3 bg-cm-surface-2 rounded-lg hover:bg-cm-surface-3 transition-colors"
          >
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-cm-white text-xs">Productadvies</div>
          </Link>
          <Link
            href="/scripts"
            className="text-center p-3 bg-cm-surface-2 rounded-lg hover:bg-cm-surface-3 transition-colors"
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="text-cm-white text-xs">Scripts</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

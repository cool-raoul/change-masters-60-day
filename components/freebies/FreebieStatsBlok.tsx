// File: components/freebies/FreebieStatsBlok.tsx
//
// Herbruikbaar mini-stats-blok per freebie. Gebruikt op:
// - /instellingen/mijn-tracking-links (per freebie, naast deelopties)
// - /statistieken (volledig overzicht, alle freebies bij elkaar)

import type {
  ProductadviesStats,
  TweedeLenteStats,
} from "@/lib/freebie-bots/stats";

type TegelKleur = "slate" | "emerald" | "rose" | "amber";

const KLEUR_CLASSES: Record<
  TegelKleur,
  { bg: string; border: string; tekst: string; label: string }
> = {
  slate: {
    bg: "bg-slate-800/60",
    border: "border-slate-700",
    tekst: "text-slate-100",
    label: "text-slate-400",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    tekst: "text-emerald-300",
    label: "text-emerald-400/80",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    tekst: "text-rose-200",
    label: "text-rose-300/80",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    tekst: "text-amber-200",
    label: "text-amber-300/80",
  },
};

export function StatTegel({
  label,
  waarde,
  kleur = "slate",
}: {
  label: string;
  waarde: string | number;
  kleur?: TegelKleur;
}) {
  const c = KLEUR_CLASSES[kleur];
  return (
    <div
      className={`rounded-lg border ${c.border} ${c.bg} px-3 py-2 text-center`}
    >
      <div className={`text-xs ${c.label} uppercase tracking-wider font-medium`}>
        {label}
      </div>
      <div className={`mt-1 text-xl font-bold ${c.tekst}`}>{waarde}</div>
    </div>
  );
}

/**
 * Volledig stats-blok voor de Productadvies-vragenlijst freebie.
 * Gebruikt op /statistieken.
 */
export function ProductadviesStatsBlok({
  stats,
}: {
  stats: ProductadviesStats;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl">
          📋
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Productadvies-vragenlijst
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Drie-minuten vragenlijst met pakket-advies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatTegel
          label="Verzonden"
          waarde={stats.totaalVerzonden}
          kleur="slate"
        />
        <StatTegel label="Ingevuld" waarde={stats.ingevuld} kleur="emerald" />
        <StatTegel
          label="Conversie"
          waarde={`${stats.conversie}%`}
          kleur="emerald"
        />
      </div>
    </div>
  );
}

/**
 * Volledig stats-blok voor de Tweede Lente bot freebie.
 * Gebruikt op /statistieken.
 */
export function TweedeLenteStatsBlok({
  stats,
}: {
  stats: TweedeLenteStats;
}) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xl">
          🌷
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Tweede Lente
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Vijf-minuten persoonlijk overzicht voor in en rond de overgang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTegel
          label="Ingetekend"
          waarde={stats.totaalIngetekend}
          kleur="slate"
        />
        <StatTegel
          label="Afgemaakt"
          waarde={stats.vragenlijstAfgemaakt}
          kleur="emerald"
        />
        <StatTegel
          label="Contact"
          waarde={stats.contactGevraagd}
          kleur="rose"
        />
        <StatTegel
          label="Conversie"
          waarde={`${stats.conversie}%`}
          kleur="emerald"
        />
      </div>
    </div>
  );
}

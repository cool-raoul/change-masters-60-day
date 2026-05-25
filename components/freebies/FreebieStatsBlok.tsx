// File: components/freebies/FreebieStatsBlok.tsx
//
// Herbruikbare stats-blokken per freebie. Toont funnel-cijfers
// (ingetekend → afgemaakt → klant) plus pipeline-spreiding (waar
// staan de leads NU in je pijplijn).
//
// Belangrijke nuance (Raoul, 2026-05-25): de échte conversie is
// 'klant geworden', niet 'ingevuld'. Daarom twee percentages naast
// elkaar: 'ingevuld %' (operationeel) en 'klant %' (echte conversie).

import {
  pipelineSpreidingZichtbaar,
  type ProductadviesStats,
  type TweedeLenteStats,
} from "@/lib/freebie-bots/stats";

type TegelKleur = "slate" | "emerald" | "rose" | "amber" | "gold";

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
  gold: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/40",
    tekst: "text-yellow-200",
    label: "text-yellow-300/80",
  },
};

export function StatTegel({
  label,
  waarde,
  kleur = "slate",
  hint,
}: {
  label: string;
  waarde: string | number;
  kleur?: TegelKleur;
  hint?: string;
}) {
  const c = KLEUR_CLASSES[kleur];
  return (
    <div
      className={`rounded-lg border ${c.border} ${c.bg} px-3 py-2 text-center`}
      title={hint}
    >
      <div className={`text-[10px] ${c.label} uppercase tracking-wider font-medium`}>
        {label}
      </div>
      <div className={`mt-1 text-xl font-bold ${c.tekst}`}>{waarde}</div>
    </div>
  );
}

/**
 * Funnel-balk: visueel laat zien hoeveel leads in elke stap zitten.
 * Ingetekend → Afgemaakt → Klant.
 */
function FunnelBalk({
  ingetekend,
  afgemaakt,
  klanten,
  ingetekendLabel = "Ingetekend",
}: {
  ingetekend: number;
  afgemaakt: number;
  klanten: number;
  ingetekendLabel?: string;
}) {
  if (ingetekend === 0) {
    return (
      <p className="text-xs text-slate-500 italic">
        Nog geen funnel-data, deel je link en check terug.
      </p>
    );
  }
  const afgemaaktPct = Math.round((afgemaakt / ingetekend) * 100);
  const klantPct = Math.round((klanten / ingetekend) * 100);

  return (
    <div className="space-y-2">
      <FunnelRij
        label={ingetekendLabel}
        aantal={ingetekend}
        breedtePct={100}
        kleur="slate"
      />
      <FunnelRij
        label="Vragenlijst afgemaakt"
        aantal={afgemaakt}
        breedtePct={afgemaaktPct}
        kleur="emerald"
      />
      <FunnelRij
        label="Klant (shopper of member)"
        aantal={klanten}
        breedtePct={klantPct}
        kleur="gold"
      />
    </div>
  );
}

function FunnelRij({
  label,
  aantal,
  breedtePct,
  kleur,
}: {
  label: string;
  aantal: number;
  breedtePct: number;
  kleur: "slate" | "emerald" | "gold";
}) {
  const balkKleuren = {
    slate: "bg-slate-600",
    emerald: "bg-emerald-500",
    gold: "bg-yellow-500",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
        <span>{label}</span>
        <span className="font-semibold">
          {aantal} <span className="text-slate-500">· {breedtePct}%</span>
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${balkKleuren[kleur]} transition-all`}
          style={{ width: `${breedtePct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Pipeline-spreiding: kleine staaf-tegels per fase waar leads zitten.
 */
function PipelineSpreiding({
  spreiding,
  totaal,
}: {
  spreiding: import("@/lib/freebie-bots/stats").PipelineSpreiding;
  totaal: number;
}) {
  const zichtbaar = pipelineSpreidingZichtbaar(spreiding);
  if (zichtbaar.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">
        Nog geen prospects via deze freebie in je pijplijn.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {zichtbaar.map((r) => {
        const pct = totaal > 0 ? Math.round((r.aantal / totaal) * 100) : 0;
        return (
          <div key={r.fase}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span style={{ color: r.kleur }}>{r.label}</span>
              <span className="text-slate-400">
                {r.aantal} <span className="text-slate-600">· {pct}%</span>
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: r.kleur }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Volledig stats-blok voor de Productadvies-vragenlijst freebie.
 */
export function ProductadviesStatsBlok({
  stats,
}: {
  stats: ProductadviesStats;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl">
          📋
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-100">
            Productadvies-vragenlijst
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Drie-minuten vragenlijst met pakket-advies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTegel
          label="Verzonden"
          waarde={stats.totaalVerzonden}
          kleur="slate"
        />
        <StatTegel label="Ingevuld" waarde={stats.ingevuld} kleur="emerald" />
        <StatTegel
          label="Klant"
          waarde={stats.klanten}
          kleur="gold"
          hint="Prospects via deze freebie die nu shopper of member zijn"
        />
        <StatTegel
          label="Klant %"
          waarde={`${stats.klantPct}%`}
          kleur="gold"
          hint="Echte conversie, niet alleen 'ingevuld'"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Funnel
        </p>
        <FunnelBalk
          ingetekend={stats.totaalVerzonden}
          afgemaakt={stats.ingevuld}
          klanten={stats.klanten}
          ingetekendLabel="Verzonden"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Pipeline-spreiding · {stats.totaalProspectsViaFreebie} via deze freebie
        </p>
        <PipelineSpreiding
          spreiding={stats.pipelineSpreiding}
          totaal={stats.totaalProspectsViaFreebie}
        />
      </div>
    </div>
  );
}

/**
 * Volledig stats-blok voor de Tweede Lente bot freebie.
 */
export function TweedeLenteStatsBlok({
  stats,
}: {
  stats: TweedeLenteStats;
}) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xl">
          🌷
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-100">
            Tweede Lente
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Vijf-minuten persoonlijk overzicht voor in en rond de overgang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
          hint="Vroeg om persoonlijk gesprek"
        />
        <StatTegel
          label="Klant"
          waarde={stats.klanten}
          kleur="gold"
          hint="Prospects via deze freebie die nu shopper of member zijn"
        />
        <StatTegel
          label="Klant %"
          waarde={`${stats.klantPct}%`}
          kleur="gold"
          hint="Echte conversie, niet alleen 'afgemaakt'"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Funnel
        </p>
        <FunnelBalk
          ingetekend={stats.totaalIngetekend}
          afgemaakt={stats.vragenlijstAfgemaakt}
          klanten={stats.klanten}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Pipeline-spreiding · {stats.totaalProspectsViaFreebie} via deze freebie
        </p>
        <PipelineSpreiding
          spreiding={stats.pipelineSpreiding}
          totaal={stats.totaalProspectsViaFreebie}
        />
      </div>
    </div>
  );
}

// File: components/anti-overwhelm/PulseSignaalBox.tsx
//
// K4 van anti-overwhelm-kompas: ELEVA stuurt het juiste pulse-moment naar
// boven. Max één tot drie signalen per dag. Member krijgt nooit een lijst
// van vijftig openstaande items.

import Link from "next/link";

export type PulseSignaal = {
  id: string;
  klantNaam: string;
  pulseNaam: string;
  actie: string;
  klantRoute: string;
  prioriteit: "hoog" | "midden" | "laag";
};

export type PulseSignaalBoxProps = {
  signalen: PulseSignaal[];
  /** Maximaal tonen. Default 3 (K4-richtlijn). */
  maxAantal?: number;
};

export function PulseSignaalBox({ signalen, maxAantal = 3 }: PulseSignaalBoxProps) {
  if (signalen.length === 0) return null;

  // K4: max één tot drie. Gerangschikt op prioriteit.
  const sortPrio = { hoog: 0, midden: 1, laag: 2 } as const;
  const getoonde = [...signalen]
    .sort((a, b) => sortPrio[a.prioriteit] - sortPrio[b.prioriteit])
    .slice(0, maxAantal);

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">🔔</span>
        <span className="text-sm font-medium text-emerald-200">
          {getoonde.length === 1 ? "Vandaag één signaal" : `Vandaag ${getoonde.length} signalen`}
        </span>
      </div>
      <ul className="space-y-2">
        {getoonde.map((s) => (
          <li key={s.id}>
            <Link
              href={s.klantRoute}
              className="block rounded-md border border-emerald-500/20 bg-slate-900/40 p-3 hover:bg-slate-900/60"
            >
              <div className="text-sm text-slate-100">
                <span className="font-medium">{s.klantNaam}</span>
                <span className="text-slate-400"> · {s.pulseNaam}</span>
              </div>
              <div className="mt-1 text-xs text-emerald-200/90">{s.actie}</div>
            </Link>
          </li>
        ))}
      </ul>
      {signalen.length > getoonde.length && (
        <div className="mt-2 text-xs text-slate-500">
          {signalen.length - getoonde.length} ander
          {signalen.length - getoonde.length === 1 ? "" : "e"} pulse{signalen.length - getoonde.length === 1 ? "" : "s"} loopt rustig door op de achtergrond.
        </div>
      )}
    </div>
  );
}

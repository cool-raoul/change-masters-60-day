import Link from "next/link";
import type { RadarItem } from "@/lib/radar/volgende-beste-actie";

// ============================================================
// VolgendeBesteActie, dashboard-radar.
//
// Toont top-3 prospects om vandaag op te volgen, gesorteerd op score
// (recent signaal + funnel-gewicht + stilte-tijd). Per prospect:
//   - Naam + fase
//   - 1-2 redenen waarom 'ie boven kwam ('Film afgekeken 2d geleden')
//   - Knop naar prospect-kaart of direct naar Mentor met context
//
// Verbergt zich automatisch als er geen sterke kandidaten zijn (geen
// score >= 5 in de hele lijst, dan is er gewoon niks urgents vandaag).
// ============================================================

type Props = {
  items: RadarItem[];
};

export function VolgendeBesteActie({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-cm-gold/40 bg-gradient-to-br from-cm-gold/10 to-cm-gold/5 px-5 py-4 space-y-3">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          🎯 Volgende beste acties
        </p>
        <p className="text-cm-white text-base font-display font-semibold mt-0.5">
          {items.length === 1
            ? "1 prospect waar je nu het meeste momentum kan oogsten"
            : `${items.length} prospects waar je nu het meeste momentum kan oogsten`}
        </p>
        <p className="text-cm-white opacity-60 text-xs mt-0.5">
          Gerangschikt op recente signalen, fase en stilte-tijd. Pak 'r 1, je
          gaat sneller dan je denkt.
        </p>
      </div>

      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={item.prospect.id}
            className="rounded-lg border border-cm-border bg-cm-surface px-3 py-2.5 flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cm-gold/20 text-cm-gold flex items-center justify-center text-sm font-bold">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cm-white text-sm font-semibold truncate">
                {item.prospect.volledige_naam}
              </p>
              <p className="text-cm-white opacity-70 text-[11px] leading-tight mt-0.5">
                {item.redenen.length > 0
                  ? item.redenen.join(" · ")
                  : `Fase: ${item.prospect.pipeline_fase.replace("_", " ")}`}
              </p>
            </div>
            <Link
              href={`/namenlijst/${item.prospect.id}`}
              className="flex-shrink-0 text-cm-gold text-xs hover:text-cm-gold-light font-semibold whitespace-nowrap"
              aria-label={`Open ${item.prospect.volledige_naam}`}
            >
              Open →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

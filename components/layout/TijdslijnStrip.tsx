// ============================================================
// TijdslijnStrip, subtiele cirkel-rij voor voortgang.
//
// Toont een rij van N cirkels (één per dag of stap):
// - Groen + transparant: voltooide dag/stap
// - Goud + zachte pulse: vandaag
// - Leeg met dunne border: toekomst
//
// Geen XP-balk, geen levels, geen gamification-ruis. Wel onmiddellijk
// zichtbare voortgang. Werkt voor Sprint (60), Core (21), Pro (15).
// ============================================================

type Props = {
  /** Totaal aantal cirkels (60 voor Sprint, 21 voor Core, 15 voor Pro). */
  totaal: number;
  /** Huidige dag/stap (1-based). */
  huidig: number;
  /** Optioneel label boven de strip. Default: "Voortgang". */
  label?: string;
  /** Optionele extra className voor de wrapper. */
  className?: string;
};

export function TijdslijnStrip({
  totaal,
  huidig,
  label = "Voortgang",
  className = "",
}: Props) {
  const items = Array.from({ length: totaal }, (_, i) => i + 1);

  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wider text-cm-white/45 mb-2 font-medium">
        {label}
      </div>
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${totaal}, minmax(0, 1fr))`,
        }}
      >
        {items.map((nummer) => {
          const isGedaan = nummer < huidig;
          const isVandaag = nummer === huidig;
          return (
            <div
              key={nummer}
              className={`aspect-square rounded-full border ${
                isVandaag
                  ? "bg-cm-gold border-cm-gold animate-pulse-gold"
                  : isGedaan
                    ? "bg-emerald-700/70 border-emerald-700/70"
                    : "bg-transparent border-cm-border"
              }`}
              title={
                isVandaag
                  ? `Vandaag, ${nummer} van ${totaal}`
                  : isGedaan
                    ? `Voltooid, dag/stap ${nummer}`
                    : `Komend, dag/stap ${nummer}`
              }
            />
          );
        })}
      </div>
    </div>
  );
}

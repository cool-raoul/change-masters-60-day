import Link from "next/link";

// ============================================================
// RadarTeaser, compacte regel op /dashboard die naar de volle
// radar-balk in /vandaag linkt. Vervangt de oude volle tegel.
// ============================================================

type Props = {
  aantalOpen: number;
};

export function RadarTeaser({ aantalOpen }: Props) {
  if (aantalOpen === 0) return null;

  return (
    <Link
      href="/vandaag"
      className="block rounded-xl border-2 border-cm-gold/40 bg-gradient-to-r from-cm-gold/10 to-cm-gold/5 px-4 py-3 hover:from-cm-gold/15 hover:to-cm-gold/10 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-cm-white text-sm">
            Je hebt{" "}
            <span className="text-cm-gold font-semibold">
              {aantalOpen} nog niet opgepakte {aantalOpen === 1 ? "actie" : "acties"}
            </span>{" "}
            voor vandaag
          </span>
        </div>
        <span className="text-cm-gold text-sm">→</span>
      </div>
    </Link>
  );
}

// Leren: dag-lessen terugkijken + Academy achter één deur. Scripts en
// eigen zinnen verhuizen naar de Mentor (daar gebruik je ze).

import Link from "next/link";

export default function NieuwLeren() {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3 border-b border-cm-gold/20 pb-4">
        <h1 className="font-serif-warm text-2xl text-cm-white">📚 Leren</h1>
        <span className="ml-auto text-xs text-cm-white/50">
          terugkijken en verdiepen
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/lessen" className="card hover:border-cm-gold/50 transition-colors">
          <p className="text-lg mb-1">
            📖 <span className="font-semibold text-cm-white">Mijn dag-lessen</span>
          </p>
          <p className="text-sm text-cm-white/55">
            Alles wat je al gehad hebt, rustig terug te lezen.
          </p>
        </Link>
        <Link href="/academy" className="card hover:border-cm-gold/50 transition-colors">
          <p className="text-lg mb-1">
            🎓 <span className="font-semibold text-cm-white">Academy</span>
          </p>
          <p className="text-sm text-cm-white/55">
            De verdiepings-trainingen: social media, claim-vrij spreken, DMO.
          </p>
        </Link>
      </div>
      <p className="text-xs text-cm-white/35 text-center">
        Je scripts en eigen zinnen verhuizen naar de Mentor: daar gebruik je ze,
        dus daar horen ze.{" "}
        <Link href="/scripts" className="text-cm-gold/70 hover:text-cm-gold">
          Scripts
        </Link>{" "}
        ·{" "}
        <Link href="/mijn-zinnen" className="text-cm-gold/70 hover:text-cm-gold">
          Mijn zinnen
        </Link>
      </p>
    </div>
  );
}

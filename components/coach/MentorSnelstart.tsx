import Link from "next/link";

// Snelstart-raster voor de Mentor: klikbare onderwerpen die meteen het juiste
// gesprek openen (met de vraag voorgevuld). Zo ziet de member waar de Mentor
// mee kan helpen, in plaats van een leeg "algemeen gesprek". De Mentor herkent
// het onderwerp uit de voorgevulde vraag en gebruikt je profiel (stem + niche).

type Onderwerp = {
  emoji: string;
  label: string;
  prefill: string;
  alleenProductadvies?: boolean;
};

const ONDERWERPEN: Onderwerp[] = [
  { emoji: "✍️", label: "Een post schrijven", prefill: "Schrijf een social post voor me, in mijn eigen stem." },
  { emoji: "🎬", label: "Een reel op maat", prefill: "Maak een reel op maat voor mij, in mijn stem en mijn niche." },
  { emoji: "📨", label: "Een uitnodiging schrijven", prefill: "Help me een uitnodiging schrijven in mijn stem." },
  { emoji: "🛡️", label: "Een bezwaar oefenen", prefill: "Speel een prospect met een bezwaar en oefen mijn antwoord met me." },
  { emoji: "💬", label: "Een 3-weg voorbereiden", prefill: "Help me een 3-weg-gesprek voorbereiden." },
  { emoji: "🔁", label: "Een follow-up aanscherpen", prefill: "Help me mijn follow-up aanscherpen." },
  { emoji: "🎯", label: "Productadvies", prefill: "Ik wil productadvies, help me het juiste kiezen.", alleenProductadvies: true },
  { emoji: "💪", label: "Even sparren", prefill: "Ik wil even sparren over waar ik nu sta en wat mijn volgende stap is." },
];

export function MentorSnelstart({
  toonProductadvies,
}: {
  toonProductadvies: boolean;
}) {
  const items = ONDERWERPEN.filter(
    (o) => !o.alleenProductadvies || toonProductadvies,
  );

  return (
    <div className="card border-gold-subtle">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🎓</span>
        <h2 className="text-cm-white font-semibold">Waar kan ik je mee helpen?</h2>
      </div>
      <p className="text-cm-white/70 text-sm mb-4">
        Kies een onderwerp, of typ gewoon je eigen vraag. De Mentor kent je en
        schrijft in jouw stem.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((o) => (
          <Link
            key={o.label}
            href={`/coach?prefill=${encodeURIComponent(o.prefill)}`}
            className="flex items-center gap-2.5 rounded-xl border border-cm-border bg-cm-surface-2/40 px-3 py-2.5 text-left hover:border-cm-gold/50 hover:bg-cm-surface-2 transition-colors"
          >
            <span className="text-xl flex-shrink-0">{o.emoji}</span>
            <span className="text-cm-white text-sm leading-snug">{o.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

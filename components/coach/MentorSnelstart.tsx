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
  { emoji: "✍️", label: "Een post schrijven", prefill: "Ik wil een social post schrijven in mijn eigen stem. Vraag me eerst waar 'ie over moet gaan." },
  { emoji: "🎬", label: "Een reel op maat", prefill: "Ik wil een reel maken in mijn stem en mijn niche. Vraag me eerst wat het onderwerp wordt." },
  { emoji: "📨", label: "Een uitnodiging schrijven", prefill: "Ik wil een uitnodiging schrijven in mijn stem. Vraag me eerst voor wie en hoe ik die persoon ken." },
  { emoji: "🛡️", label: "Een bezwaar oefenen", prefill: "Ik wil een bezwaar oefenen. Vraag me welk bezwaar ik krijg en speel dan de prospect zodat ik kan oefenen." },
  { emoji: "💬", label: "Een 3-weg voorbereiden", prefill: "Ik wil een 3-weg-gesprek voorbereiden. Vraag me wie de prospect is en wat ik nog nodig heb." },
  { emoji: "🔁", label: "Een follow-up aanscherpen", prefill: "Ik wil mijn follow-up aanscherpen. Vraag me om wie het gaat en wat ons laatste contact was." },
  { emoji: "🎯", label: "Productadvies", prefill: "Ik wil productadvies. Vraag me voor wie het is en wat hun doel of klacht is.", alleenProductadvies: true },
  { emoji: "💪", label: "Even sparren", prefill: "Ik wil even sparren over waar ik nu sta. Stel me een paar vragen om me op weg te helpen." },
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
            href={`/coach?prefill=${encodeURIComponent(o.prefill)}&submit=1`}
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

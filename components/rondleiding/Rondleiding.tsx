"use client";

import { useEffect, useState } from "react";

type Stap = {
  emoji: string;
  titel: string;
  lead: string;
  bullets: string[];
  wow: string;
};

const STAPPEN: Stap[] = [
  {
    emoji: "🏠",
    titel: "Dashboard — jouw command center",
    lead: "Elke dag begint hier. In 30 seconden weet je wat vandaag telt.",
    bullets: [
      "Dag-teller (dag X van 60) en voortgangsbalk",
      "Dagelijkse activiteiten loggen (contacten, uitnodigingen, presentaties)",
      "Snelle pijplijn-blik: hoeveel prospects zitten in welke fase",
      "Openstaande herinneringen en jouw WHY altijd in zicht",
    ],
    wow: "Open 's ochtends ELEVA. Klaar = je weet precies wat vandaag je focus is.",
  },
  {
    emoji: "👥",
    titel: "Namenlijst — je pijplijn als Kanban",
    lead: "Al je prospects visueel, van eerste contact tot member.",
    bullets: [
      "Sleep prospects tussen fases: prospect → uitgenodigd → presentatie → follow-up → shopper → member",
      "Elke kaart toont prioriteit, laatste contact, volgende stap",
      "Klik op een naam voor alle details, notities en contact-historie",
      "Sorteer zelf binnen een fase — belangrijkste bovenaan",
    ],
    wow: "Nooit meer iemand vergeten die aan het rijpen is.",
  },
  {
    emoji: "🎙️",
    titel: "Spraak-knop — DE killer-feature",
    lead: "De ronde goudknop rechtsonder. Dit is waar ELEVA magisch wordt.",
    bullets: [
      "Druk in, spreek natuurlijk wat je net hebt gedaan",
      "ELEVA begrijpt wie, wat, wanneer en voert het UIT in de app",
      "Werkt voor: nieuwe prospects, fase wijzigen, notities, herinneringen plannen, contact loggen, stats bijwerken",
      "Je kan blijven bijspreken en corrigeren voordat je opslaat",
    ],
    wow: "\"Sprak Maria bij de sportschool, wil zaterdag een presentatie, herinner me donderdag om haar te appen.\" → prospect aangemaakt, fase op 'uitgenodigd', follow-up voor donderdag ingepland, contact gelogd. Zonder één klik. Dit scheelt 20 minuten admin per dag.",
  },
  {
    emoji: "🤖",
    titel: "ELEVA Mentor — 24/7 coach in je broekzak",
    lead: "Een AI-mentor die jouw methodiek kent en altijd tijd heeft.",
    bullets: [
      "Vraag alles: bezwaren pareren, uitnodigings-tekst, 3-wegen gesprek voorbereiden, closing, mindset",
      "Stel je vraag over een specifieke prospect — de mentor kent de context",
      "Premium: productadvies met medische disclaimer, onbeperkte gesprekken, voorrang",
      "Eerdere gesprekken terug te vinden, zodat je nooit iets kwijt bent",
    ],
    wow: "\"Maria zegt: ik heb er geen geld voor — wat zeg ik?\" → binnen 3 seconden een antwoord op maat, getraind op jouw aanpak.",
  },
  {
    emoji: "🔔",
    titel: "Herinneringen — je brein hoeft niks te onthouden",
    lead: "Alle follow-ups automatisch op de juiste stapel.",
    bullets: [
      "Verlopen (rood), vandaag (goud), komende 7 dagen (blauw), later (grijs)",
      "Voltooi met één klik of schuif naar een nieuwe datum",
      "Verschijnt automatisch wanneer je via spraak zegt \"herinner me...\"",
      "Telling in de topbar rechts, zodat je nooit iets mist",
    ],
    wow: "Jij focust op gesprekken. ELEVA houdt de lijsten bij.",
  },
  {
    emoji: "🌟",
    titel: "Premium — €2/mnd, onbeperkt alles",
    lead: "De kracht van ELEVA volledig ontketend voor de prijs van een koffie.",
    bullets: [
      "Onbeperkt chatten met de ELEVA Mentor",
      "Onbeperkte spraak-opnames (geen limieten)",
      "Voorrang bij drukte + early-access nieuwe features",
      "Een deel van je bijdrage gaat naar de Lifeplus Foundation",
      "Betaal met iDEAL, kaart of Apple/Google Pay — maandelijks opzegbaar",
    ],
    wow: "Als je serieus bent met je 60-day run, is €2/mnd het snelste rendement dat je kan boeken.",
  },
];

export function Rondleiding() {
  const [open, setOpen] = useState(false);
  const [stap, setStap] = useState(0);

  useEffect(() => {
    function handler() {
      setStap(0);
      setOpen(true);
    }
    window.addEventListener("rondleiding:open", handler);
    return () => window.removeEventListener("rondleiding:open", handler);
  }, []);

  if (!open) return null;

  const huidig = STAPPEN[stap];
  const isLaatste = stap === STAPPEN.length - 1;
  const isEerste = stap === 0;

  function sluit() {
    setOpen(false);
    try {
      localStorage.setItem("rondleiding_gezien", "1");
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={sluit}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-cm-surface border border-cm-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sluit knop */}
        <button
          onClick={sluit}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cm-surface-2 text-cm-white text-lg hover:opacity-80 flex items-center justify-center"
          aria-label="Sluit rondleiding"
        >
          ✕
        </button>

        {/* Stap-indicator */}
        <div className="px-6 pt-6">
          <div className="flex gap-1.5 mb-6">
            {STAPPEN.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= stap ? "bg-cm-gold" : "bg-cm-surface-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4 text-center">
          <div className="text-6xl">{huidig.emoji}</div>
          <h2 className="text-xl font-display font-bold text-cm-white">
            {huidig.titel}
          </h2>
          <p className="text-cm-white text-sm opacity-80 max-w-md mx-auto">
            {huidig.lead}
          </p>

          <ul className="text-left space-y-2 max-w-md mx-auto pt-2">
            {huidig.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-cm-white text-sm">
                <span className="text-cm-gold mt-0.5">✓</span>
                <span className="opacity-90">{b}</span>
              </li>
            ))}
          </ul>

          <div className="card bg-gradient-to-br from-cm-gold/15 to-cm-gold/5 border border-cm-gold/30 text-left mt-4">
            <p className="text-cm-gold text-xs font-semibold mb-1 uppercase tracking-wide">
              ✨ Waarom dit telt
            </p>
            <p className="text-cm-white text-sm">{huidig.wow}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-cm-border">
          <span className="text-cm-white text-xs opacity-60">
            {stap + 1} / {STAPPEN.length}
          </span>
          <div className="flex gap-2">
            {!isEerste && (
              <button
                onClick={() => setStap((s) => Math.max(0, s - 1))}
                className="btn-secondary text-sm"
              >
                Vorige
              </button>
            )}
            {!isLaatste ? (
              <button
                onClick={() => setStap((s) => Math.min(STAPPEN.length - 1, s + 1))}
                className="btn-gold text-sm"
              >
                Volgende →
              </button>
            ) : (
              <button onClick={sluit} className="btn-gold text-sm">
                Aan de slag! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function openRondleiding() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rondleiding:open"));
  }
}

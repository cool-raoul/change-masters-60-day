"use client";

interface Props {
  gebruik: number;
  onSluit: () => void;
}

export function UpgradeModal({ gebruik, onSluit }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onSluit}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-md bg-cm-surface border border-cm-gold/30 rounded-t-2xl sm:rounded-2xl p-6 z-10 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-cm-gold font-bold text-xl">Daglimiet bereikt</h2>
          <p className="text-cm-white opacity-70 text-sm mt-1">
            Je hebt vandaag {gebruik} van je 20 gratis berichten gebruikt
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-cm-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-cm-gold rounded-full" style={{ width: "100%" }} />
        </div>

        {/* Premium voordelen */}
        <div className="bg-cm-gold/10 border border-cm-gold/30 rounded-xl p-4 space-y-2">
          <p className="text-cm-gold font-semibold text-sm">
            🌟 ELEVA Mentor Premium — €1 per maand
          </p>
          <ul className="space-y-1.5">
            {[
              "Onbeperkt berichten per dag",
              "Prioriteit bij drukke momenten",
              "Toegang tot nieuwe functies als eerste",
            ].map((voordeel, i) => (
              <li key={i} className="flex gap-2 text-cm-white text-sm">
                <span className="text-cm-gold flex-shrink-0">✓</span>
                {voordeel}
              </li>
            ))}
          </ul>
        </div>

        {/* Lifeplus Foundation */}
        <div className="bg-cm-surface-2 rounded-xl p-3 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0">❤️</span>
          <div>
            <p className="text-cm-white text-xs font-semibold">Kostendekkend + goed doel</p>
            <p className="text-cm-white text-xs opacity-60 mt-0.5 leading-relaxed">
              De €1/maand dekt de serverkosten. Alles wat overblijft gaat naar de{" "}
              <span className="text-cm-gold">Lifeplus Foundation</span>.
            </p>
          </div>
        </div>

        {/* Knoppen */}
        <div className="space-y-2">
          <a
            href="mailto:raoul@eleva.nl?subject=Premium upgrade aanvraag&body=Hoi Raoul, ik wil graag upgraden naar ELEVA Mentor Premium (€1/maand). Mijn account: "
            className="btn-gold w-full py-3 text-center block font-bold"
          >
            Upgrade naar Premium →
          </a>
          <button
            onClick={onSluit}
            className="w-full py-2.5 text-cm-white opacity-60 hover:opacity-100 text-sm transition-opacity"
          >
            Morgen verdergaan (limiet reset middernacht)
          </button>
        </div>
      </div>
    </div>
  );
}

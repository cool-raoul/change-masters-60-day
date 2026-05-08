import Link from "next/link";

// ============================================================
// /instellingen/wat-ziet-mijn-sponsor
//
// Transparantie-pagina: laat de member EXACT zien wat sponsor en
// downline van hem kunnen zien. Verlaagt de drempel ('het voelt als
// surveillance') door duidelijkheid: je weet precies wat er gedeeld
// wordt en wat niet.
// ============================================================

export const dynamic = "force-static";

const ZICHTBAAR = [
  {
    icoon: "📊",
    label: "Voortgang door de 21-daagse",
    uitleg:
      "Welke dag je op zit, welke stappen je hebt afgerond. Sponsor ziet of je in beweging bent en waar het schuurt, zodat 'ie precies daar kan helpen.",
  },
  {
    icoon: "👥",
    label: "Pipeline-fases van je prospects",
    uitleg:
      "Sponsor ziet hoeveel mensen je in 'prospect', 'uitgenodigd', 'one-pager', 'presentatie', 'follow-up' hebt staan. Niet de namen of details, wel de getallen, om te coachen waar je vastloopt.",
  },
  {
    icoon: "🟢",
    label: "Online-status (als jij dat aanstaat)",
    uitleg:
      "Een groene stip naast je naam in /team als je nu in ELEVA werkt. Default aan. Uit te zetten via 'Online-status zichtbaar voor team'-toggle in /instellingen, dan verdwijn je uit alle overzichten.",
  },
  {
    icoon: "🎬",
    label: "Verzonden films naar prospects",
    uitleg:
      "Welke films je hebt gestuurd, of de prospect ze heeft afgekeken. Niet om je te beoordelen, om sponsor te helpen jouw funnel te begrijpen als je een vraag stelt.",
  },
];

const PRIVE = [
  {
    icoon: "📝",
    label: "Je WHY en persoonlijke notities",
    uitleg:
      "Wat je in WHY-gesprekken met de Mentor hebt gedeeld is volledig privé. Sponsor ziet alleen DAT je 'm hebt gemaakt, niet WAT erin staat.",
  },
  {
    icoon: "💭",
    label: "Mentor-gesprekken",
    uitleg:
      "Alles wat je met de ELEVA Mentor bespreekt blijft tussen jou en het systeem. Sponsor heeft geen inzage in chats, voice-uitnodigingen of vraag-antwoord-historie.",
  },
  {
    icoon: "📞",
    label: "Telefoonnummers en contact-details van prospects",
    uitleg:
      "Je namenlijst zelf is voor jou. Sponsor ziet aantallen per fase, niet de specifieke namen of contactgegevens. Tenzij je 'm zelf vraagt om mee te kijken via /coach.",
  },
  {
    icoon: "📋",
    label: "Aantekeningen op prospect-kaarten",
    uitleg:
      "Wat je over een prospect noteert blijft op jouw kaart. Sponsor kan dat niet inzien, alleen als jij 'm expliciet de prospect-kaart deelt.",
  },
];

export default function WatZietMijnSponsorPagina() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/instellingen"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4"
      >
        ← Terug naar instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Wat ziet mijn sponsor van mij?
        </h1>
        <p className="text-cm-white opacity-80 text-sm mt-2 leading-relaxed">
          Eerlijke uitleg, geen kleine lettertjes. Hieronder staat exact wat
          gedeeld wordt en wat privé blijft. Doel van wat-wel: jouw sponsor
          kan je helpen op de plek waar het schuurt. Doel van wat-niet:
          jouw werk en gedachten blijven van jou.
        </p>
      </div>

      <div className="card border-l-4 border-emerald-500/60 space-y-3">
        <h2 className="text-emerald-300 font-semibold text-sm uppercase tracking-wider">
          ✓ Wel zichtbaar voor je sponsor
        </h2>
        <ul className="space-y-3">
          {ZICHTBAAR.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{item.icoon}</span>
              <div>
                <p className="text-cm-white text-sm font-medium">
                  {item.label}
                </p>
                <p className="text-cm-white opacity-70 text-xs mt-0.5 leading-relaxed">
                  {item.uitleg}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          🔒 Privé, alleen voor jou
        </h2>
        <ul className="space-y-3">
          {PRIVE.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{item.icoon}</span>
              <div>
                <p className="text-cm-white text-sm font-medium">
                  {item.label}
                </p>
                <p className="text-cm-white opacity-70 text-xs mt-0.5 leading-relaxed">
                  {item.uitleg}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <h2 className="text-cm-white font-semibold text-sm uppercase tracking-wider">
          💡 Filosofie
        </h2>
        <p className="text-cm-white opacity-80 text-sm leading-relaxed">
          Een sponsor-relatie werkt het beste als beide kanten elkaar zien
          waar het werk gebeurt. Niet om te beoordelen, om bij te springen.
          Daarom delen we werk-data (waar je staat, hoe je funnel loopt) en
          niet persoonlijke data (wat je denkt, wat je in privé-notities
          schrijft, met wie je 1-op-1 hebt gepraat). Voelt iets niet goed?
          Bespreek het met je sponsor of stuur ons een bericht.
        </p>
      </div>
    </div>
  );
}

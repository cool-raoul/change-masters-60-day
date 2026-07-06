// Mensen-hub: alle relatie-schermen achter één deur. In de preview zijn
// het vier duidelijke tegels naar de bestaande pagina's; in de echte bouw
// worden dit tabbladen binnen één scherm.

import Link from "next/link";

const TABS = [
  {
    emoji: "👥",
    titel: "Namenlijst",
    sub: "Je prospects en klanten, met kaart en notitieboekje",
    href: "/namenlijst",
  },
  {
    emoji: "💬",
    titel: "Chats",
    sub: "Je lopende Mini-ELEVA-gesprekken",
    href: "/mijn-chats",
  },
  {
    emoji: "✨",
    titel: "Uitnodigingen",
    sub: "Mini-ELEVA-uitnodigingen sturen en volgen",
    href: "/uitnodigingen",
  },
  {
    emoji: "🏆",
    titel: "Team",
    sub: "Je teamleden en hun voortgang",
    href: "/team",
  },
];

export default function NieuwMensen() {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3 border-b border-cm-gold/20 pb-4">
        <h1 className="font-serif-warm text-2xl text-cm-white">👥 Mensen</h1>
        <span className="ml-auto text-xs text-cm-white/50">
          alles over je relaties, één deur
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card hover:border-cm-gold/50 transition-colors"
          >
            <p className="text-lg mb-1">
              {t.emoji}{" "}
              <span className="font-semibold text-cm-white">{t.titel}</span>
            </p>
            <p className="text-sm text-cm-white/55">{t.sub}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-cm-white/35 text-center">
        In de definitieve bouw worden dit tabbladen binnen één scherm, zodat je
        nooit meer hoeft te zoeken waar iets van een persoon staat.
      </p>
    </div>
  );
}

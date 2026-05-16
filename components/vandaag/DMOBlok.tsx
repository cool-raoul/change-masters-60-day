"use client";

import { useState } from "react";
import Link from "next/link";
import { BRACKETS, type Bracket } from "@/lib/dtt/brackets";

// ============================================================
// DMO-blok onder elke Core-stap. 6 onderdelen, uitklapbaar.
// Aantallen op basis van DTT-bracket. Reactief social vanaf dag 7.
// Sponsor-checkin/momentum-radar/partner-check zijn aparte vaste
// afsluit-stappen in de Core-dag, niet in dit blok.
// ============================================================

type Props = {
  bracket: Bracket;
  dagNummer: number;
  bestellinksGekoppeld: boolean;
  eersteKlantenStapVoorbij: boolean;
};

export function DMOBlok({
  bracket,
  dagNummer,
  bestellinksGekoppeld,
  eersteKlantenStapVoorbij,
}: Props) {
  const [open, setOpen] = useState(false);
  const def = BRACKETS[bracket];

  const reactiefActief = dagNummer >= 7;
  const webshopActief = dagNummer >= 4 && bestellinksGekoppeld;
  const followUpActief = eersteKlantenStapVoorbij || dagNummer >= 12;
  const socialPostActief = dagNummer >= 7;

  const onderdelen = [
    {
      sleutel: "webshop",
      icon: "🛒",
      titel: "Webshop-actie",
      uitleg: "Deelbaar winkelmandje sturen, freebie-link delen, productadvies-test versturen",
      richtlijn: webshopActief ? "1 actie per dag" : "Activeert na bestellinks (dag 4)",
      actief: webshopActief,
    },
    {
      sleutel: "actief-contact",
      icon: "💬",
      titel: "Actief contact",
      uitleg: "Bericht aan warme markt of lauwe markt (opener)",
      richtlijn:
        def.dmoMinimums.contactenPerDag === 0
          ? "1 tot 2 per week"
          : `Minimum ${def.dmoMinimums.contactenPerDag} per dag`,
      actief: true,
    },
    {
      sleutel: "reactief-social",
      icon: "💎",
      titel: "Reactief social-contact",
      uitleg: "Reageer op likes en comments, voer DM-gesprek, deel info",
      richtlijn: reactiefActief
        ? "Reageer op alle nieuwe interacties vandaag"
        : "Activeert na je eerste post (dag 7)",
      actief: reactiefActief,
    },
    {
      sleutel: "follow-up",
      icon: "🔄",
      titel: "Follow-up",
      uitleg: "Bestaande prospect of klant opvolgen",
      richtlijn: followUpActief
        ? `Minimum ${def.dmoMinimums.followUpsPerDag} per dag`
        : "Activeert na je eerste klanten-stap (dag 12)",
      actief: followUpActief,
    },
    {
      sleutel: "social-post",
      icon: "📱",
      titel: "Social-post",
      uitleg: "Lifestyle, waarde, of testimonial-post",
      richtlijn: socialPostActief
        ? `Minimum ${def.dmoMinimums.socialPostsPerWeek} per week`
        : "Activeert na je eerste post (dag 7)",
      actief: socialPostActief,
    },
    {
      sleutel: "pijplijn-update",
      icon: "🎯",
      titel: "Pijplijn-update",
      uitleg: "Via spraak-functie: 'gesprek gestart met X', 'X heeft besteld'",
      richtlijn: "Direct na elke prospect-interactie",
      actief: true,
    },
  ];

  const aantalOpen = onderdelen.filter((o) => o.actief).length;

  return (
    <div className="rounded-xl border-2 border-cm-gold/40 bg-cm-gold/5 mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-cm-gold text-sm font-semibold">
            Je dagelijkse ritme ({aantalOpen} acties open)
          </span>
        </div>
        <span className={`text-cm-gold text-sm transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-cm-border/50 pt-3 space-y-3">
          <p className="text-cm-white/60 text-xs">
            Tempo: <strong className="text-cm-white">{def.label}</strong> ({def.urenPerWeekRange}/week)
            <br />
            Aantallen zijn <strong>minimum</strong>, je mag altijd meer doen.
          </p>
          <Link
            href="/instellingen"
            className="text-cm-gold text-xs underline-offset-2 hover:underline inline-block"
          >
            Tempo aanpassen →
          </Link>
          <div className="space-y-1.5 mt-3">
            {onderdelen.map((o) => (
              <div
                key={o.sleutel}
                className={`rounded-md border px-3 py-2 ${
                  o.actief
                    ? "border-cm-border bg-cm-bg/40"
                    : "border-cm-border/50 bg-cm-bg/20 opacity-50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="text-cm-white text-sm font-semibold">
                    {o.icon} {o.titel}
                  </p>
                  <span className="text-cm-gold/80 text-xs">{o.richtlijn}</span>
                </div>
                <p className="text-cm-white/65 text-xs mt-0.5">{o.uitleg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

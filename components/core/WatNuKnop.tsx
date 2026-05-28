"use client";

// File: components/core/WatNuKnop.tsx
//
// De "wat nu?"-knop: de gereedschapskist-laag uit het tempo-spec
// (docs/superpowers/specs/2026-05-28-core-tempo-en-twee-lagen-design.md).
//
// Vaste knop rechtsonder, altijd zichtbaar. Bij tikken: een kort menu
// met herkenbare situaties die naar de juiste skill / script / Mentor
// leiden. Doel: de member ontdekt dat de skills bestaan op het moment
// dat het telt, zonder vooraf alles te hoeven lezen.
//
// PROTOTYPE-status: situaties linken nu naar bestaande routes. De
// uiteindelijke koppeling (Mentor-prompt per situatie, films-deeplink)
// volgt zodra Raoul de vorm heeft goedgekeurd.

import { useState } from "react";
import Link from "next/link";

type Situatie = {
  emoji: string;
  label: string;
  route: string;
  hint: string;
};

type Groep = {
  kop: string;
  situaties: Situatie[];
};

const GROEPEN: Groep[] = [
  {
    kop: "📣 Er komt iets binnen op je post",
    situaties: [
      {
        emoji: "💬",
        label: "Iemand reageerde",
        route: "/scripts?cat=opener",
        hint: "Opener + 3-soorten-mensen-DM",
      },
      {
        emoji: "👍",
        label: "Iemand liket alleen",
        route: "/scripts?cat=opener",
        hint: "Like-DM, vrijblijvend en warm",
      },
      {
        emoji: "🔥",
        label: "Iemand wil meer weten",
        route: "/coach",
        hint: "Filmpje delen + Mentor denkt mee",
      },
      {
        emoji: "🌙",
        label: "Iemand reageert niet meer",
        route: "/scripts?cat=followup",
        hint: "Warm hercontact-bericht",
      },
    ],
  },
  {
    kop: "💬 Een gesprek of uitnodiging",
    situaties: [
      {
        emoji: "✉️",
        label: "Ik wil iemand uitnodigen",
        route: "/scripts?cat=uitnodiging",
        hint: "Uitnodig-scripts + webshop-frame",
      },
      {
        emoji: "🤷",
        label: "Ik weet niet wat ik moet zeggen",
        route: "/coach",
        hint: "Mentor schrijft op maat in jouw stem",
      },
      {
        emoji: "🤔",
        label: "Iemand twijfelt of zegt nee",
        route: "/scripts?cat=bezwaar",
        hint: "Bezwaren wegnemen, Feel-Felt-Found",
      },
      {
        emoji: "🤝",
        label: "Ik wil een 3-weg inplannen",
        route: "/scripts?cat=uitnodiging",
        hint: "3-weg-script + je sponsor introduceren",
      },
    ],
  },
  {
    kop: "🎬 Iets tonen of delen",
    situaties: [
      {
        emoji: "🎬",
        label: "Hoe deel ik een filmpje?",
        route: "/coach",
        hint: "Mentor zoekt het juiste prospect-filmpje",
      },
      {
        emoji: "🎁",
        label: "Hoe deel ik een freebie?",
        route: "/instellingen/mijn-tracking-links",
        hint: "Jouw persoonlijke tracking-link",
      },
      {
        emoji: "🛍️",
        label: "Hoe deel ik mijn webshop?",
        route: "/instellingen/bestellinks",
        hint: "Je bestellinks",
      },
      {
        emoji: "📋",
        label: "Welk advies past bij iemand?",
        route: "/instellingen/mijn-tracking-links",
        hint: "Productadvies-vragenlijst of score-bot",
      },
    ],
  },
  {
    kop: "🛒 Iemand heeft gekocht",
    situaties: [
      {
        emoji: "📦",
        label: "Net besteld, wat nu?",
        route: "/klant",
        hint: "ASAP-uitleg + welkom in klantomgeving",
      },
      {
        emoji: "💞",
        label: "Hoe volg ik een klant op?",
        route: "/klant",
        hint: "Klantomgeving-tijdlijn",
      },
      {
        emoji: "🌟",
        label: "Klant is enthousiast",
        route: "/coach",
        hint: "Gun je anderen ook zo'n resultaat?",
      },
    ],
  },
  {
    kop: "🌙 Het loopt even niet",
    situaties: [
      {
        emoji: "🫂",
        label: "Ik zie het even niet zitten",
        route: "/coach",
        hint: "Even praten, en je sponsor erbij",
      },
      {
        emoji: "🧭",
        label: "Wat moet ik nu doen?",
        route: "/core-v9",
        hint: "Terug naar je huidige stap",
      },
      {
        emoji: "❤️",
        label: "Waarom doe ik dit ook alweer",
        route: "/mijn-why",
        hint: "Je WHY terugzien",
      },
    ],
  },
  {
    kop: "👥 Mijn team",
    situaties: [
      {
        emoji: "🙋",
        label: "Mijn teamlid heeft een vraag",
        route: "/team",
        hint: "Partner-check of 3-weg voor hen",
      },
      {
        emoji: "🎉",
        label: "Iemand is bij mij gestart",
        route: "/team",
        hint: "Welkom-flow voor je nieuwe member",
      },
    ],
  },
];

export function WatNuKnop() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop sluit het menu bij klik elders */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Het menu, opent linksonder boven de knop. Spraakknop (VoiceFab)
          zit rechtsonder, dus de "wat nu?"-knop staat links zodat ze
          elkaar niet in de weg zitten, ook op mobiel. */}
      {open && (
        <div className="fixed bottom-36 lg:bottom-20 left-4 z-50 w-[min(92vw,380px)] max-h-[70vh] flex flex-col rounded-2xl border border-cm-gold/40 bg-cm-surface-2 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-cm-border flex-shrink-0">
            <p className="text-cm-white font-semibold text-sm">
              🧰 Wat is er aan de hand?
            </p>
            <p className="text-cm-white/60 text-xs mt-0.5">
              Kies wat er nu speelt, dan pak ik de hulp erbij.
            </p>
          </div>
          <div className="overflow-y-auto p-2 space-y-3">
            {GROEPEN.map((groep) => (
              <div key={groep.kop}>
                <p className="px-2 pt-1 pb-1 text-[11px] uppercase tracking-wider text-cm-gold/80 font-semibold">
                  {groep.kop}
                </p>
                <div className="space-y-0.5">
                  {groep.situaties.map((s) => (
                    <Link
                      key={s.label}
                      href={s.route}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-cm-gold/10 transition-colors"
                    >
                      <span className="text-lg flex-shrink-0 leading-none mt-0.5">
                        {s.emoji}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-cm-white">
                          {s.label}
                        </span>
                        <span className="block text-xs text-cm-white/60 mt-0.5">
                          {s.hint}
                        </span>
                      </span>
                      <span className="text-cm-gold text-sm flex-shrink-0 self-center">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-cm-border flex-shrink-0">
            <p className="text-cm-white/50 text-[11px] italic">
              Iets anders? Open gewoon de Mentor, die denkt overal in mee.
            </p>
          </div>
        </div>
      )}

      {/* De vaste knop, linksonder. Spiegelt de spraakknop (rechtsonder)
          qua hoogte: mobiel bottom-20 (boven de bottom-nav), desktop
          bottom-5. Rustiger gestyled (surface + gouden rand) zodat de
          spraakknop de opvallende blijft. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 lg:bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-cm-gold/50 bg-cm-surface-2/95 text-cm-gold px-4 py-3 shadow-2xl font-semibold text-sm hover:bg-cm-gold/10 transition-colors"
        aria-label="Wat nu? Hulp bij dit moment"
      >
        <span className="text-lg leading-none">🧰</span>
        {open ? "Sluiten" : "Wat nu?"}
      </button>
    </>
  );
}

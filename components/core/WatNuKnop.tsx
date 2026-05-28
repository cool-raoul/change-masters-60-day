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

const SITUATIES: Situatie[] = [
  {
    emoji: "💬",
    label: "Iemand reageerde op mijn post",
    route: "/scripts?cat=opener",
    hint: "Reactie-scripts klaarzetten",
  },
  {
    emoji: "🔥",
    label: "Iemand wil meer weten",
    route: "/coach",
    hint: "Mentor helpt je de volgende stap kiezen",
  },
  {
    emoji: "🤔",
    label: "Iemand twijfelt of zegt nee",
    route: "/scripts?cat=bezwaar",
    hint: "Bezwaren wegnemen, Feel-Felt-Found",
  },
  {
    emoji: "🎬",
    label: "Hoe deel ik een filmpje?",
    route: "/coach",
    hint: "Mentor zoekt het juiste prospect-filmpje",
  },
  {
    emoji: "🤝",
    label: "Ik wil een 3-weg inplannen",
    route: "/scripts?cat=uitnodiging",
    hint: "3-weg-scripts + introductie naar je sponsor",
  },
  {
    emoji: "🌙",
    label: "Iemand reageert niet meer",
    route: "/scripts?cat=opener",
    hint: "Hercontact-bericht, vrijblijvend en warm",
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
        <div className="fixed bottom-36 lg:bottom-20 left-4 z-50 w-[min(92vw,360px)] rounded-2xl border border-cm-gold/40 bg-cm-surface-2 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-cm-border">
            <p className="text-cm-white font-semibold text-sm">
              🧰 Wat is er aan de hand?
            </p>
            <p className="text-cm-white/60 text-xs mt-0.5">
              Kies wat er nu speelt, dan pak ik de hulp erbij.
            </p>
          </div>
          <div className="p-2 space-y-1">
            {SITUATIES.map((s) => (
              <Link
                key={s.label}
                href={s.route}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-cm-gold/10 transition-colors"
              >
                <span className="text-xl flex-shrink-0 leading-none mt-0.5">
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
          <div className="px-4 py-2.5 border-t border-cm-border">
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

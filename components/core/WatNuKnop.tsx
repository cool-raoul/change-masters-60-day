"use client";

// File: components/core/WatNuKnop.tsx
//
// De "wat nu?"-knop: de wegwijzer naar de gereedschapskist. Vaste knop
// linksonder (spraakknop VoiceFab zit rechtsonder). Bij tikken opent een
// menu met zes inklapbare onderwerpen. Tik een onderwerp open, tik dan
// een situatie: je gaat naar een volledige uitleg-pagina
// (/core-v9/wat-nu/[slug]) met de hele uitleg en pas daar de knop naar
// de tool. Het menu is dus kort; de diepte zit op de pagina.
//
// Data staat in lib/playbook/wat-nu-situaties.ts (gedeeld met de pagina's).

import { useState } from "react";
import Link from "next/link";
import { WAT_NU_GROEPEN } from "@/lib/playbook/wat-nu-situaties";

export function WatNuKnop() {
  const [open, setOpen] = useState(false);
  const [openGroep, setOpenGroep] = useState<string | null>(null);

  function sluitAlles() {
    setOpen(false);
    setOpenGroep(null);
  }

  return (
    <>
      {/* Backdrop sluit het menu bij klik elders */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={sluitAlles} />
      )}

      {/* Het menu, opent linksonder boven de knop. */}
      {open && (
        <div className="fixed bottom-36 lg:bottom-20 left-4 z-50 w-[min(92vw,380px)] max-h-[72vh] flex flex-col rounded-2xl border border-cm-gold/40 bg-cm-surface-2 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-cm-border flex-shrink-0">
            <p className="text-cm-white font-semibold text-sm">
              🧰 Wat is er aan de hand?
            </p>
            <p className="text-cm-white/60 text-xs mt-0.5">
              Kies een onderwerp, dan een situatie. Je krijgt de hele uitleg.
            </p>
          </div>

          <div className="overflow-y-auto p-2 space-y-1">
            {WAT_NU_GROEPEN.map((groep) => {
              const groepOpen = openGroep === groep.kop;
              return (
                <div key={groep.kop} className="rounded-lg overflow-hidden">
                  {/* Onderwerp-kop, inklapbaar */}
                  <button
                    type="button"
                    onClick={() => setOpenGroep(groepOpen ? null : groep.kop)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left rounded-lg hover:bg-cm-gold/5 transition-colors"
                  >
                    <span className="text-sm font-semibold text-cm-white">
                      {groep.kop}
                    </span>
                    <span
                      className={`text-cm-gold text-xs transition-transform ${
                        groepOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Situaties binnen het onderwerp, elk linkt naar z'n
                      eigen uitleg-pagina. */}
                  {groepOpen && (
                    <div className="pl-2 pr-1 pb-1 space-y-0.5">
                      {groep.situaties.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/core-v9/wat-nu/${s.slug}`}
                          onClick={sluitAlles}
                          className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-cm-gold/10 transition-colors"
                        >
                          <span className="text-lg flex-shrink-0 leading-none mt-0.5">
                            {s.emoji}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm text-cm-white">
                              {s.label}
                            </span>
                            <span className="block text-xs text-cm-white/55 mt-0.5">
                              {s.hint}
                            </span>
                          </span>
                          <span className="text-cm-gold/70 text-sm flex-shrink-0 self-center">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
          bottom-5. Rustiger gestyled zodat de spraakknop de opvallende blijft. */}
      <button
        type="button"
        onClick={() => (open ? sluitAlles() : setOpen(true))}
        className="fixed bottom-20 lg:bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-cm-gold/50 bg-cm-surface-2/95 text-cm-gold px-4 py-3 shadow-2xl font-semibold text-sm hover:bg-cm-gold/10 transition-colors"
        aria-label="Wat nu? Hulp bij dit moment"
      >
        <span className="text-lg leading-none">🧰</span>
        {open ? "Sluiten" : "Wat nu?"}
      </button>
    </>
  );
}

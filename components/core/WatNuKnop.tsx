"use client";

// File: components/core/WatNuKnop.tsx
//
// De "wat nu?"-knop: de wegwijzer naar de gereedschapskist. Vaste knop
// linksonder (spraakknop VoiceFab zit rechtsonder). Bij tikken opent een
// menu met zes inklapbare onderwerpen. Tik een onderwerp open, tik dan
// een situatie: je gaat naar een volledige uitleg-pagina
// (/wat-nu/[slug]) met de hele uitleg en pas daar de knop naar
// de tool. Het menu is dus kort; de diepte zit op de pagina.
//
// Data staat in lib/playbook/wat-nu-situaties.ts (gedeeld met de pagina's).

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WAT_NU_GROEPEN } from "@/lib/playbook/wat-nu-situaties";

// metSidebar: op desktop-routes mét de vaste sidebar (AppShell) schuift de
// knop naar rechts zodat 'ie niet over het menu valt. Op de volledige-
// scherm-flow /vandaag is er geen sidebar, dan staat 'ie links in het
// vrije vlak.
export function WatNuKnop({ metSidebar = false }: { metSidebar?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGroep, setOpenGroep] = useState<string | null>(null);

  // Scroll-aware: bij scroll-down verbergen, bij scroll-up weer tonen.
  // Zo zit de knop niet in de weg van content of input-velden onderaan.
  // Zelfde patroon als VoiceFab gebruikt.
  const [zichtbaar, setZichtbaar] = useState(true);
  const laatsteScrollRef = useRef(0);
  const scrollTimerRef = useRef<any>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    const target: HTMLElement | Window =
      main instanceof HTMLElement ? main : window;

    function huidigeScroll() {
      return target instanceof Window
        ? window.scrollY
        : (target as HTMLElement).scrollTop;
    }
    laatsteScrollRef.current = huidigeScroll();

    function onScroll() {
      const nu = huidigeScroll();
      const delta = nu - laatsteScrollRef.current;
      if (Math.abs(delta) < 8) return;
      if (nu < 40) {
        setZichtbaar(true);
      } else if (delta > 0) {
        setZichtbaar(false);
      } else {
        setZichtbaar(true);
      }
      laatsteScrollRef.current = nu;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setZichtbaar(true), 1500);
    }

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [pathname]);

  // Op routes met eigen Mentor-chat of een specifieke focus-flow (auth,
  // onboarding, why-coach) is "wat nu?" niet zinvol en verwart 'ie alleen.
  const verbergen =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/registreer") ||
    pathname?.startsWith("/welkom") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/mijn-why") ||
    pathname?.startsWith("/coach") ||
    pathname?.startsWith("/m/") ||
    pathname?.startsWith("/instellingen/mentor-trainen");

  if (verbergen) return null;

  function sluitAlles() {
    setOpen(false);
    setOpenGroep(null);
  }

  const knopLinks = metSidebar ? "left-5 lg:left-[17rem]" : "left-5";
  const menuLinks = metSidebar ? "left-4 lg:left-[17rem]" : "left-4";

  // Knop altijd in de DOM houden, alleen via CSS verbergen tijdens
  // scroll-down. Voorkomt iOS Safari position:fixed repaint-glitches.
  const knopVerborgen = !open && !zichtbaar;

  return (
    <>
      {/* Backdrop sluit het menu bij klik elders */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={sluitAlles} />
      )}

      {/* Het menu, opent linksonder boven de knop. */}
      {open && (
        <div className={`fixed bottom-36 lg:bottom-20 ${menuLinks} z-50 w-[min(92vw,380px)] max-h-[72vh] flex flex-col rounded-2xl border border-cm-gold/40 bg-cm-surface-2 shadow-2xl overflow-hidden`}>
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
                          href={`/wat-nu/${s.slug}`}
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
          bottom-5. Rustiger gestyled zodat de spraakknop de opvallende blijft.
          Glijdt naar onder weg bij scroll-down, schuift terug bij scroll-up. */}
      <button
        type="button"
        onClick={() => (open ? sluitAlles() : setOpen(true))}
        className={`fixed bottom-20 lg:bottom-5 ${knopLinks} z-40 flex items-center gap-2 rounded-full border border-cm-gold/50 bg-cm-surface-2/95 text-cm-gold px-4 py-3 shadow-2xl font-semibold text-sm hover:bg-cm-gold/10 transition-all duration-200`}
        style={{
          opacity: knopVerborgen ? 0 : 1,
          transform: knopVerborgen
            ? "translate3d(0, 96px, 0)"
            : "translate3d(0, 0, 0)",
          pointerEvents: knopVerborgen ? "none" : "auto",
          WebkitTransform: knopVerborgen
            ? "translate3d(0, 96px, 0)"
            : "translate3d(0, 0, 0)",
          willChange: "transform, opacity",
        }}
        aria-label="Wat nu? Hulp bij dit moment"
        aria-hidden={knopVerborgen}
        tabIndex={knopVerborgen ? -1 : 0}
      >
        <span className="text-lg leading-none">🧰</span>
        {open ? "Sluiten" : "Wat nu?"}
      </button>
    </>
  );
}

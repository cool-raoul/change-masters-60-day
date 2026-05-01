"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { WELKOMSTFILM_SLUG } from "@/lib/films/embed";

// ============================================================
// WelkomstFilm, modal-pop-up met de welkomstvideo.
//
// Twee triggers:
//   1. AUTO: bij eerste bezoek aan /dashboard, als de member 'm nog
//      niet heeft gezien (localStorage flag 'eleva-welkomstfilm-gezien').
//   2. HANDMATIG: via custom event 'open-welkomstfilm' dat de Topbar-
//      knop dispatcht. Zo kan de member 'm later altijd terugzien.
//
// Render-strategie: component zit altijd op /dashboard, doet zelf de
// detectie. Als de founder nog geen video-URL heeft gezet (slug bestaat
// niet of leeg), gedraagt FilmInBlok zich met fallback en zien we een
// nette 'film volgt'-tekst i.p.v. een leeg vlak.
// ============================================================

const STORAGE_KEY = "eleva-welkomstfilm-gezien";

export function WelkomstFilm() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [autoCheckGedaan, setAutoCheckGedaan] = useState(false);

  // Auto-open: alleen op /dashboard, alleen eerste keer (localStorage flag).
  // Op andere pagina's binnen de AppShell wel handmatig oproepbaar via de
  // 🎬-knop in de Topbar.
  useEffect(() => {
    if (autoCheckGedaan) return;
    if (pathname !== "/dashboard") return;
    setAutoCheckGedaan(true);
    try {
      const gezien = window.localStorage.getItem(STORAGE_KEY);
      if (!gezien) {
        // Klein vertraging zodat de pagina eerst kan renderen voordat
        // de modal eroverheen valt, voelt minder schokkerig.
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage geblokkeerd, geen auto-open dan.
    }
  }, [autoCheckGedaan, pathname]);

  // Luister naar handmatig-open-event vanuit Topbar.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-welkomstfilm", handler);
    return () => window.removeEventListener("open-welkomstfilm", handler);
  }, []);

  function sluit(markeerGezien: boolean = true) {
    if (markeerGezien) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "ja");
      } catch {
        // negeer
      }
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => sluit(true)}
    >
      <div
        className="bg-cm-bg border-2 border-cm-gold/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Welkom bij ELEVA
              </p>
              <h2 className="text-2xl font-display font-bold text-cm-white mt-1 leading-tight">
                Even kort uitleggen hoe dit werkt
              </h2>
              <p className="text-cm-white opacity-70 text-sm mt-2 leading-relaxed">
                Bekijk deze korte film, daarna weet je hoe je ELEVA dagelijks
                gebruikt. Geen tijd nu? Sluit deze pop-up, je vindt 'm altijd
                terug via de 💡-knop bovenaan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => sluit(true)}
              className="flex-shrink-0 text-cm-white opacity-50 hover:opacity-100 text-2xl leading-none"
              aria-label="Sluit welkomstfilm"
            >
              ×
            </button>
          </div>

          {/* De film zelf, FilmInBlok regelt fallback als slot nog leeg is */}
          <FilmInBlok
            slug={WELKOMSTFILM_SLUG}
            fallbackTitel="Welkomstfilm"
            fallbackTekst="De welkomstfilm wordt binnenkort toegevoegd. Voor nu: lees onderaan even hoe ELEVA werkt."
          />

          {/* Korte tekstuele uitleg, fall-back als de film nog niet staat */}
          <div className="rounded-lg border border-cm-border bg-cm-surface px-4 py-3 space-y-2 text-sm text-cm-white leading-relaxed">
            <p className="font-semibold text-cm-gold">Hoe ELEVA werkt in 4 punten:</p>
            <ul className="space-y-1.5 opacity-90">
              <li>
                <strong>1. Dagelijkse flow op /vandaag.</strong> Elke dag
                opent automatisch de stappen voor die dag, met les, eventueel
                filmpje, en een afvinklijst. Klik door, doe wat er staat.
              </li>
              <li>
                <strong>2. Je namenlijst is je voorraadkast.</strong> Daar
                staan al je prospects. Vul 'm via je telefoon-contacten of
                vul handmatig namen in. Ga vanuit daar uitnodigen of
                follow-uppen.
              </li>
              <li>
                <strong>3. ELEVA Mentor helpt je altijd.</strong> Vragen,
                scripts, advies bij een lastige prospect, productadvies. Open
                de Mentor via het menu of de gouden mic-knop rechtsonder.
              </li>
              <li>
                <strong>4. Je sponsor kijkt mee.</strong> Niet om te
                beoordelen, om je rugdekking te geven. Vraag gerust om hulp
                via de sponsor-knoppen in elke dag.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => sluit(true)}
              className="btn-gold flex-1 py-3 text-sm font-semibold"
            >
              ✓ Begrepen, ik ga aan de slag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

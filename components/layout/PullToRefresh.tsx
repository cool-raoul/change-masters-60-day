"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// PullToRefresh, native-achtig 'trek-naar-beneden om te verversen'.
//
// Werkt op alle pagina's: gebruiker scrollt helemaal naar boven, sleept
// dan verder naar beneden. Een spinner verschijnt boven de content. Bij
// loslaten boven de drempel (80px): router.refresh() haalt server-data
// opnieuw op + window.location.reload() als finale fallback.
//
// Detectie:
//   - touchstart alleen actief als de scroll-positie 0 is
//   - touchmove: dy > 0 (omlaag-richting) toont indicator
//   - touchend: dy >= drempel triggert refresh
//
// Geen externe dependencies. Werkt op iOS Safari, Android Chrome,
// desktop touch-screens. Op desktop met muis: niet zichtbaar (geen
// touch-events), gebruiker drukt gewoon F5.
// ============================================================

const TREK_DREMPEL = 80;
const MAX_TREK = 140;

export function PullToRefresh() {
  const router = useRouter();
  const [trekY, setTrekY] = useState(0);
  const [verversen, setVerversen] = useState(false);
  const startYRef = useRef<number | null>(null);
  const actiefRef = useRef(false);

  useEffect(() => {
    function isBovenaan(): boolean {
      // Werkt voor zowel window-scroll als de hoofd-main scrollcontainer
      if (window.scrollY > 0) return false;
      const main = document.querySelector("main");
      if (main && main.scrollTop > 0) return false;
      return true;
    }

    function onStart(e: TouchEvent) {
      if (verversen) return;
      if (!isBovenaan()) {
        startYRef.current = null;
        return;
      }
      startYRef.current = e.touches[0]?.clientY ?? null;
    }

    function onMove(e: TouchEvent) {
      if (verversen || startYRef.current === null) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = y - startYRef.current;
      if (dy <= 0) {
        // Omhoog scrollen, niet onze actie
        if (actiefRef.current) {
          actiefRef.current = false;
          setTrekY(0);
        }
        return;
      }
      // Omlaag-trek: visualiseer (met dempening)
      const visueel = Math.min(MAX_TREK, dy * 0.6);
      actiefRef.current = true;
      setTrekY(visueel);
    }

    async function onEnd() {
      if (verversen) return;
      const trek = trekY;
      startYRef.current = null;
      actiefRef.current = false;
      if (trek >= TREK_DREMPEL) {
        setVerversen(true);
        setTrekY(TREK_DREMPEL);
        // Geef de spinner een tel om te verschijnen, dan verversen
        try {
          router.refresh();
          // Korte wachttijd zodat server-data terugkomt; daarna alsnog
          // window.reload() als safety-net (niet alle data is server-driven).
          setTimeout(() => {
            try {
              window.location.reload();
            } catch {
              // negeer
            }
          }, 600);
        } catch {
          window.location.reload();
        }
      } else {
        setTrekY(0);
      }
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
    // We willen dat trekY/verversen/router actuele waarden zijn in de
    // event-handlers, vandaar de deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trekY, verversen]);

  if (trekY === 0 && !verversen) return null;

  const opacity = Math.min(1, trekY / TREK_DREMPEL);
  const draaiHoek = (trekY / TREK_DREMPEL) * 360;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${Math.max(0, trekY - 40)}px)`,
        transition: verversen ? "transform 0.2s ease" : "none",
      }}
    >
      <div
        className="mt-2 h-10 w-10 rounded-full bg-cm-bg border-2 border-cm-gold shadow-xl flex items-center justify-center"
        style={{ opacity }}
      >
        {verversen ? (
          <span
            className="inline-block h-5 w-5 border-2 border-cm-gold border-t-transparent rounded-full animate-spin"
            aria-label="Verversen..."
          />
        ) : (
          <span
            className="text-cm-gold text-base"
            style={{ transform: `rotate(${draaiHoek}deg)` }}
          >
            ↓
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ============================================================
// ScrollToTopOnNavigation
//
// AppShell heeft een aparte scroll-container (<main class="overflow-y-auto">)
// in plaats van de browser-window. Next.js' ingebouwde scroll-restore
// werkt alleen op window, niet op aparte scroll-containers. Resultaat:
// bij client-side navigatie naar een nieuwe route bleef de main-scroll
// op de oude positie staan, waardoor de nieuwe pagina onderaan opende.
//
// Deze component luistert op pathname + searchParams changes en zet
// de main-element-scroll bij elke nieuwe URL terug naar 0. Verder
// resetten we ook de window-scroll voor pagina's die GEEN AppShell
// gebruiken (login, registreer, etc., daar is window de scroll-bron).
//
// Werkt bij elke link-klik, knop-klik en programmatic router.push,
// niet bij back/forward (Next.js handelt die zelf voor window, en
// voor de main-container is back-positie minder belangrijk).
// ============================================================

export function ScrollToTopOnNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // De main-container met overflow-y-auto.
    const main = document.querySelector("main");
    if (main) {
      // Reset main-scroll. Geen smooth scroll: instant top, anders
      // ziet de gebruiker een korte glij-animatie bij navigatie.
      main.scrollTop = 0;
    }
    // Voor zekerheid ook de window-scroll resetten (sommige pagina's
    // zonder AppShell scrollen via window).
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname, searchParams]);

  return null;
}

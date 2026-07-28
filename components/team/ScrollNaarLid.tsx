"use client";

import { useEffect } from "react";

// ============================================================
// Scrollt naar de kaart van een teamlid (?lid=... via push-klik).
// Met retry: het oude inline-script vuurde één keer na 300ms en
// was dan vaak te vroeg (pagina nog aan het laden/animeren),
// waardoor er niets gebeurde (bug Raoul 28 juli).
// ============================================================

export function ScrollNaarLid({ lidId }: { lidId: string }) {
  useEffect(() => {
    let pogingen = 0;
    let gestopt = false;
    const probeer = () => {
      if (gestopt) return;
      const el = document.getElementById(`lid-${lidId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Nog één keer nadat de layout echt tot rust is gekomen
        // (uitklap-seintjes en animaties verschuiven de positie).
        setTimeout(() => {
          if (!gestopt) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 900);
        return;
      }
      if (++pogingen < 25) setTimeout(probeer, 200);
    };
    const t = setTimeout(probeer, 350);
    return () => {
      gestopt = true;
      clearTimeout(t);
    };
  }, [lidId]);

  return null;
}

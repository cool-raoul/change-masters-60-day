"use client";

import { useEffect, useState } from "react";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "./MediaBlokken";

// ============================================================
// MediaBlokkenClient, client-side variant van <MediaBlokken/>.
//
// Voor pagina's die client-rendered zijn (zoals /onboarding, een
// state-machine met `useState`-stappen) en daarom geen server-side
// blokken-fetch hebben. Roept zelf de GET /api/pagina-blokken aan
// op mount + bij refresh-trigger.
//
// Gebruik:
//   <MediaBlokkenClient
//     paginaNamespace="onboarding-stap"
//     paginaId="stap-1"
//     positie="boven-titel"
//     isFounder={isFounder}
//   />
//
// Versies refreshen automatisch via useState + window-event 'pagina-blokken:refresh'
// → MediaBlokken's interne edit-flow doet router.refresh() wat in
// client-only pagina's geen effect heeft. We luisteren daarom op
// een custom event dat de modal/edit-knoppen kunnen dispatchen.
// Voor v1 doen we 'm simpel: na elke window-focus refetchen.
// ============================================================

type Props = {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
  isFounder: boolean;
};

export function MediaBlokkenClient({
  paginaNamespace,
  paginaId,
  positie,
  isFounder,
}: Props) {
  const [blokken, setBlokken] = useState<Blok[] | null>(null);

  useEffect(() => {
    let levend = true;
    async function laad() {
      try {
        const res = await fetch(
          `/api/pagina-blokken?namespace=${encodeURIComponent(
            paginaNamespace,
          )}&id=${encodeURIComponent(paginaId)}`,
        );
        if (!res.ok) {
          if (levend) setBlokken([]);
          return;
        }
        const data = await res.json();
        const lijst = (data.blokken?.[positie] as Blok[] | undefined) ?? [];
        if (levend) setBlokken(lijst);
      } catch {
        if (levend) setBlokken([]);
      }
    }
    void laad();

    // Refetch bij window-focus zodat edits in een andere tab óók verschijnen,
    // en zodat na een edit-modal-action (volgens patroon: modal sluit,
    // window krijgt focus terug) de lijst opnieuw geladen wordt.
    function onFocus() {
      void laad();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      levend = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [paginaNamespace, paginaId, positie]);

  // Rendert null tot data is geladen (geen flash-of-empty-state).
  // Lege array geeft MediaBlokken zelf wel weer (voor + media hier-knop).
  if (blokken === null) return null;

  return (
    <MediaBlokken
      paginaNamespace={paginaNamespace}
      paginaId={paginaId}
      positie={positie}
      blokken={blokken}
      isFounder={isFounder}
    />
  );
}

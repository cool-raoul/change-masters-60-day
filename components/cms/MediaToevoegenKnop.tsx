"use client";

import { useState } from "react";
import { MediaToevoegenModal } from "./MediaToevoegenModal";

// ============================================================
// MediaToevoegenKnop, "+ media hier"-knop voor founder in edit-modus.
// Klik opent de MediaToevoegenModal voor type-keuze + invoer.
// ============================================================

type Props = {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
};

export function MediaToevoegenKnop({
  paginaNamespace,
  paginaId,
  positie,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-lg border-2 border-dashed border-cm-gold/40 text-cm-gold/70 hover:border-cm-gold hover:text-cm-gold hover:bg-cm-gold/5 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <span>+</span> media hier
      </button>
      {open && (
        <MediaToevoegenModal
          paginaNamespace={paginaNamespace}
          paginaId={paginaId}
          positie={positie}
          onSluit={() => setOpen(false)}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ============================================================
// Uitklap-menu's voor de nieuwe klantenkaart-kop. Twee smaken:
// - "📤 Stuur..." bundelt de verstuur-knoppen (uitnodiging /
//   film / freebie) die eerst los op één rij stonden.
// - "⋯" bundelt de stille acties (actief-toggle, verwijderen).
// De inhoud komt als children uit de server-pagina: de
// bestaande knop-componenten werken hierin ongewijzigd, dit
// paneel is alleen hun nieuwe opbergplek.
// ============================================================

export function KaartActieMenu({
  label,
  stil = false,
  children,
}: {
  label: string;
  /** true = rustige ⋯-stijl, false = gewone secundaire knop */
  stil?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function sluitBijBuitenKlik(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", sluitBijBuitenKlik);
    return () => document.removeEventListener("mousedown", sluitBijBuitenKlik);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          stil
            ? "px-3 py-1.5 rounded-full border border-cm-border text-cm-white/60 hover:text-cm-white text-sm transition-colors"
            : "btn-secondary text-sm"
        }
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 min-w-[220px] rounded-xl border border-cm-border bg-cm-surface shadow-xl p-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

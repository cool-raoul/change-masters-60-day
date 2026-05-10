"use client";

import { useState, useEffect } from "react";
import { useThema } from "./ThemeContext";

// ============================================================
// ThemeToggle — kleine knop om tussen dark en light te wisselen.
// Plaatst standaard naast de avatar in de Topbar. Heeft een
// dropdown-versie (geopend via klik) zodat de keuze leesbaar is
// in plaats van een mysterieus icoontje.
// ============================================================

export function ThemeToggle() {
  const { thema, zetThema } = useThema();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Render pas na mount om hydration-mismatch te voorkomen.
  // (Server kent geen localStorage, dus dark-rendered SSR vs eventueel
  // light-client kan mismatchen.)
  useEffect(() => setMounted(true), []);

  // Sluit dropdown als je ergens anders klikt.
  useEffect(() => {
    if (!open) return;
    function buiten(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-theme-toggle]")) setOpen(false);
    }
    window.addEventListener("click", buiten);
    return () => window.removeEventListener("click", buiten);
  }, [open]);

  if (!mounted) {
    // Skeleton — zelfde grootte als de echte knop, voorkomt layout-shift
    return <div className="w-8 h-8" />;
  }

  return (
    <div className="relative" data-theme-toggle>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-lg border border-cm-border bg-cm-surface flex items-center justify-center text-cm-white/70 hover:text-cm-gold hover:border-cm-gold-dim transition-colors"
        title={thema === "dark" ? "Schakel naar licht thema" : "Schakel naar donker thema"}
        aria-label="Thema wijzigen"
      >
        {thema === "dark" ? "🌙" : "☀️"}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 bg-cm-surface border border-cm-border rounded-lg shadow-gold-lg overflow-hidden min-w-[140px]">
          <button
            type="button"
            onClick={() => {
              zetThema("dark");
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-cm-surface-2 transition-colors ${
              thema === "dark" ? "text-cm-gold" : "text-cm-white"
            }`}
          >
            <span>🌙</span> Donker
            {thema === "dark" && <span className="ml-auto text-xs">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              zetThema("light");
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-cm-surface-2 transition-colors ${
              thema === "light" ? "text-cm-gold" : "text-cm-white"
            }`}
          >
            <span>☀️</span> Licht
            {thema === "light" && <span className="ml-auto text-xs">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

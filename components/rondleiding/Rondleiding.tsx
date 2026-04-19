"use client";

import { useEffect, useState } from "react";
import { rondleidingFeatures } from "@/lib/features/registry";

// Stappen komen uit de centrale features-registry (lib/features/registry.ts).
// Voeg daar een feature toe/verwijder/pas aan om de rondleiding mee te laten
// veranderen — dit component hoeft niet aangeraakt te worden.
const STAPPEN = rondleidingFeatures();

export function Rondleiding() {
  const [open, setOpen] = useState(false);
  const [stap, setStap] = useState(0);

  useEffect(() => {
    function handler() {
      setStap(0);
      setOpen(true);
    }
    window.addEventListener("rondleiding:open", handler);
    return () => window.removeEventListener("rondleiding:open", handler);
  }, []);

  if (!open) return null;

  const huidig = STAPPEN[stap];
  const isLaatste = stap === STAPPEN.length - 1;
  const isEerste = stap === 0;

  function sluit() {
    setOpen(false);
    try {
      localStorage.setItem("rondleiding_gezien", "1");
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={sluit}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-cm-surface border border-cm-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sluit knop */}
        <button
          onClick={sluit}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cm-surface-2 text-cm-white text-lg hover:opacity-80 flex items-center justify-center"
          aria-label="Sluit rondleiding"
        >
          ✕
        </button>

        {/* Stap-indicator */}
        <div className="px-6 pt-6">
          <div className="flex gap-1.5 mb-6">
            {STAPPEN.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= stap ? "bg-cm-gold" : "bg-cm-surface-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4 text-center">
          <div className="text-6xl">{huidig.emoji}</div>
          <h2 className="text-xl font-display font-bold text-cm-white">
            {huidig.titel}
          </h2>
          <p className="text-cm-white text-sm opacity-80 max-w-md mx-auto">
            {huidig.lead}
          </p>

          <ul className="text-left space-y-2 max-w-md mx-auto pt-2">
            {huidig.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-cm-white text-sm">
                <span className="text-cm-gold mt-0.5">✓</span>
                <span className="opacity-90">{b}</span>
              </li>
            ))}
          </ul>

          <div className="card bg-gradient-to-br from-cm-gold/15 to-cm-gold/5 border border-cm-gold/30 text-left mt-4">
            <p className="text-cm-gold text-xs font-semibold mb-1 uppercase tracking-wide">
              ✨ Waarom dit telt
            </p>
            <p className="text-cm-white text-sm">{huidig.wow}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-cm-border">
          <span className="text-cm-white text-xs opacity-60">
            {stap + 1} / {STAPPEN.length}
          </span>
          <div className="flex gap-2">
            {!isEerste && (
              <button
                onClick={() => setStap((s) => Math.max(0, s - 1))}
                className="btn-secondary text-sm"
              >
                Vorige
              </button>
            )}
            {!isLaatste ? (
              <button
                onClick={() => setStap((s) => Math.min(STAPPEN.length - 1, s + 1))}
                className="btn-gold text-sm"
              >
                Volgende →
              </button>
            ) : (
              <button onClick={sluit} className="btn-gold text-sm">
                Aan de slag! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function openRondleiding() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rondleiding:open"));
  }
}

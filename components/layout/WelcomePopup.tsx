"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WELKOM_KEY = "cm_welkom_getoond_v1";

export function WelcomePopup() {
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    const alGetoond = localStorage.getItem(WELKOM_KEY);
    if (!alGetoond) {
      setZichtbaar(true);
    }
  }, []);

  function sluit() {
    localStorage.setItem(WELKOM_KEY, "1");
    setZichtbaar(false);
  }

  if (!zichtbaar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className="bg-cm-surface border border-cm-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-4 relative">
        {/* Sluit knop */}
        <button
          onClick={sluit}
          className="absolute top-4 right-4 text-cm-white opacity-50 hover:opacity-100 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-cm-surface-2"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-14 w-14 mx-auto mb-3" />
          <h2 className="text-3xl eleva-brand">
            Welkom bij ELEVA!
          </h2>
          <p className="text-cm-white mt-2">
            Je persoonlijke systeem voor Project Meer Tijd en Vrijheid is klaar voor gebruik.
          </p>
        </div>

        {/* Uitleg blokken */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-cm-surface-2 rounded-xl p-3">
            <span className="text-xl mt-0.5">👥</span>
            <div>
              <p className="text-cm-white font-semibold text-sm">Namenlijst (Pipeline-weergave)</p>
              <p className="text-cm-white text-xs opacity-70">
                Voeg prospects toe en sleep ze door de pipeline. Van prospect tot member.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-cm-surface-2 rounded-xl p-3">
            <span className="text-xl mt-0.5">🌟</span>
            <div>
              <p className="text-cm-white font-semibold text-sm">ELEVA Mentor</p>
              <p className="text-cm-white text-xs opacity-70">
                Vraag om een DM, help bij bezwaren, of bespreek een specifiek contact.
                De ELEVA Mentor kent jouw WHY en situatie.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-cm-surface-2 rounded-xl p-3">
            <span className="text-xl mt-0.5">🔔</span>
            <div>
              <p className="text-cm-white font-semibold text-sm">Herinneringen</p>
              <p className="text-cm-white text-xs opacity-70">
                Het systeem herinnert je automatisch aan follow-ups en productbestellingen.
                Jij hoeft niets bij te houden.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-cm-surface-2 rounded-xl p-3">
            <span className="text-xl mt-0.5">⚡</span>
            <div>
              <p className="text-cm-white font-semibold text-sm">Dashboard</p>
              <p className="text-cm-white text-xs opacity-70">
                Houd dagelijks bij wat je gedaan hebt. Elke dag telt.
              </p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-gold-subtle border border-gold-subtle rounded-xl p-3 text-center">
          <p className="text-cm-gold text-sm font-semibold">
            Tip: begin met je WHY invullen als je dat nog niet gedaan hebt.
          </p>
          <p className="text-cm-white text-xs mt-1 opacity-80">
            Jouw WHY is het fundament. Zonder WHY geef je eerder op.
          </p>
        </div>

        {/* Knoppen */}
        <div className="flex gap-3">
          <button
            onClick={sluit}
            className="btn-secondary flex-1 text-sm py-3"
          >
            Sluiten
          </button>
          <Link
            href="/mijn-why"
            onClick={sluit}
            className="btn-gold flex-1 text-sm py-3 text-center font-bold"
          >
            Mijn WHY invullen →
          </Link>
        </div>
      </div>
    </div>
  );
}

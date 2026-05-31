"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Props = {
  slug: "pre-post" | "21-dagen-post";
  titel: string;
};

// ============================================================
// SideflowBanner: keuze-banner bovenaan /vandaag voor Core members
// met een openstaande sideflow (pre-post of 21-dagen-resultaat-post).
//
// Verschijnt vanaf dag 2 (en/of dag 14 voor de tweede trigger), zodat
// dag 1 zelf NIET wordt onderbroken. De member kan kiezen: nu openen
// of voor deze sessie wegklikken. Bij volgende /vandaag-bezoek komt
// 'm weer terug, totdat de sideflow is afgerond.
// ============================================================

export function SideflowBanner({ slug, titel }: Props) {
  const dismissKey = `sideflow-banner-dismissed-${slug}`;
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.sessionStorage.getItem(dismissKey);
      if (!dismissed) setZichtbaar(true);
    } catch {
      setZichtbaar(true);
    }
  }, [dismissKey]);

  function sluit() {
    try {
      window.sessionStorage.setItem(dismissKey, "1");
    } catch {
      // negeer
    }
    setZichtbaar(false);
  }

  if (!zichtbaar) return null;

  return (
    <div className="card border-l-4 border-cm-gold/60 mb-4 space-y-3">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Side-step beschikbaar
        </p>
        <h3 className="text-cm-white font-semibold text-base mt-1">
          Je {titel}-flow staat klaar
        </h3>
        <p className="text-cm-white/70 text-sm leading-relaxed mt-1">
          Geen druk. Wanneer je 'r tijd voor hebt, kun je 'm in een
          rustig moment doorlopen. Wil je 'm nu doen, of liever even
          overslaan en eerst je dag pakken?
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/sideflow/${slug}`}
          className="btn-gold text-sm"
        >
          ➡️ Open je {titel}-flow nu
        </Link>
        <button
          type="button"
          onClick={sluit}
          className="btn-secondary text-sm"
        >
          Sla over voor nu
        </button>
      </div>
      <p className="text-cm-white/40 text-[10px] italic">
        "Sla over voor nu" sluit deze banner voor deze sessie. De
        sideflow blijft beschikbaar en de banner komt terug bij je
        volgende bezoek tot 'ie is afgerond.
      </p>
    </div>
  );
}

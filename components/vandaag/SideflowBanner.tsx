"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ============================================================
// SideflowGate: een TUSSEN-SCHERM dat verschijnt op /vandaag voor
// Core members met een openstaande sideflow (pre-post of 21-dagen-
// resultaat-post), vanaf dag 2.
//
// Bewust geen slanke banner: de pre-post / 21-dagen-post is een van
// de krachtigste opstart-stappen, niet iets om gedachteloos voorbij
// te scrollen. Dus blokkeert 'r de normale dag-content tot de member
// een bewuste keuze maakt (open of bewust overslaan).
//
// Wegklikken zet een sessionStorage-vlag. Volgende /vandaag-bezoek
// komt 'm weer terug totdat de sideflow is afgerond.
// ============================================================

type AanRaad = {
  slug: "pre-post" | "21-dagen-post";
  titel: string;
};

type Props = {
  aanRaad: AanRaad | null;
  children: React.ReactNode;
};

export function SideflowGate({ aanRaad, children }: Props) {
  const dismissKey = aanRaad
    ? `sideflow-gate-dismissed-${aanRaad.slug}`
    : null;
  const [gehydrateerd, setGehydrateerd] = useState(false);
  const [overgeslagen, setOvergeslagen] = useState(false);

  useEffect(() => {
    if (!dismissKey) {
      setGehydrateerd(true);
      return;
    }
    try {
      const v = window.sessionStorage.getItem(dismissKey);
      if (v) setOvergeslagen(true);
    } catch {
      // negeer
    }
    setGehydrateerd(true);
  }, [dismissKey]);

  function slaOver() {
    if (!dismissKey) return;
    try {
      window.sessionStorage.setItem(dismissKey, "1");
    } catch {
      // negeer
    }
    setOvergeslagen(true);
  }

  // Geen aanRaad? Render gewoon de normale content.
  if (!aanRaad) return <>{children}</>;

  // Tijdens hydration nog even niets tonen om server/client-mismatch te
  // voorkomen. Voorkomt flicker.
  if (!gehydrateerd) return null;

  // Member heeft 'm bewust overgeslagen voor deze sessie → toon dag-content.
  if (overgeslagen) return <>{children}</>;

  // Anders: het tussen-scherm.
  return (
    <div className="space-y-4 max-w-2xl mx-auto pt-2">
      <div className="rounded-xl border-2 border-cm-gold/50 bg-cm-gold/5 p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Krachtige opstart-stap
          </p>
          <h2 className="text-cm-white text-2xl sm:text-3xl font-serif-warm leading-tight">
            Je {aanRaad.titel}-flow staat klaar
          </h2>
        </div>

        <div className="space-y-3 text-cm-white/85 text-sm sm:text-base leading-relaxed">
          <p>
            Voordat je verder gaat met je volgende dag: dit is een van de
            krachtigste stappen van je hele opstart. Met deze{" "}
            {aanRaad.titel} kom je laagdrempelig in gesprek met mensen,
            en kun je je eerste klanten al krijgen voordat je überhaupt
            je top-20-namenlijst hebt opgebouwd.
          </p>
          <p className="text-cm-white/75">
            Pak 'r een half uurtje voor, het systeem leidt je stap voor
            stap. Daarna heb je iets in handen waar je de hele rest van
            Core op voortbouwt.
          </p>
        </div>

        <Link
          href={`/sideflow/${aanRaad.slug}`}
          className="btn-gold w-full text-center py-4 text-base font-semibold inline-block"
        >
          ➡️ Open je {aanRaad.titel}-flow
        </Link>

        <button
          type="button"
          onClick={slaOver}
          className="block w-full text-center text-cm-white/45 hover:text-cm-white text-xs underline pt-1"
        >
          Sla over voor nu, ik pak 'm later op
        </button>
      </div>

      <p className="text-cm-white/40 text-xs text-center italic">
        Bewust overslaan kan, maar wij raden 'm echt aan. Hij blijft
        beschikbaar en deze keuze komt terug bij je volgende bezoek
        totdat je 'm hebt afgerond.
      </p>
    </div>
  );
}

// Backward-compat export voor eventuele bestaande imports onder de
// oude naam.
export const SideflowBanner = SideflowGate;

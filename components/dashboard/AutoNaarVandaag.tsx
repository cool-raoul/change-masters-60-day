"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// AutoNaarVandaag — bij eerste bezoek per dag stuur de member naar
// /vandaag (de guided full-screen flow). Daarna niet meer redirecten;
// het dashboard wordt dan de hoofdpagina.
//
// Detectie via localStorage met key per (dag, datum). Eenmaal afgerond
// of gesloten → niet meer auto-redirect — TENZIJ de gebruiker een
// tester of founder is, want die willen door alle 21 dagen kunnen
// klikken zonder dat de flag dwarsligt.
// ============================================================

type Props = {
  dagNummer: number;
  /** Skip-redirect als false (bv. dag > 21 of bewust uitgezet) */
  redirectActief: boolean;
  /**
   * Testers en founders krijgen ALTIJD de redirect — ook als ze
   * dag X eerder al hadden gezien. Anders kunnen ze tijdens een
   * test-ronde niet teruggaan om dezelfde dag opnieuw te bekijken.
   */
  altijdRedirect?: boolean;
};

export function AutoNaarVandaag({
  dagNummer,
  redirectActief,
  altijdRedirect = false,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!redirectActief) return;
    if (dagNummer < 1 || dagNummer > 21) return;
    try {
      const datum = new Date().toISOString().split("T")[0];
      const k = `eleva-vandaag-flow-dag${dagNummer}-${datum}`;
      // Voor testers/founders: wis de flag eerst zodat we 'm in elk
      // geval opnieuw kunnen zetten + redirecten.
      if (altijdRedirect) {
        window.localStorage.removeItem(k);
      }
      if (window.localStorage.getItem(k) === "gesloten") return;
      // Markeer ALVAST als gesloten — anders blijven we redirecten als
      // de user terugkomt op het dashboard via de browser-knop.
      window.localStorage.setItem(k, "gesloten");
      router.replace("/vandaag");
    } catch {
      // localStorage geblokkeerd? Dan niet redirecten.
    }
  }, [dagNummer, redirectActief, altijdRedirect, router]);

  return null;
}

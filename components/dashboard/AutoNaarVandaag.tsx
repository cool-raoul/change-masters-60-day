"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// AutoNaarVandaag — bij eerste bezoek per dag stuur de member naar
// /vandaag (de guided full-screen flow). Daarna niet meer redirecten;
// het dashboard wordt dan de hoofdpagina.
//
// Detectie via localStorage met key per (dag, datum). Eenmaal afgerond
// of gesloten → niet meer auto-redirect.
// ============================================================

type Props = {
  dagNummer: number;
  /** Skip-redirect als false (bv. testers willen niet auto-geredirect) */
  redirectActief: boolean;
};

export function AutoNaarVandaag({ dagNummer, redirectActief }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!redirectActief) return;
    if (dagNummer < 1 || dagNummer > 21) return;
    try {
      const datum = new Date().toISOString().split("T")[0];
      const k = `eleva-vandaag-flow-dag${dagNummer}-${datum}`;
      if (window.localStorage.getItem(k) === "gesloten") return;
      // Markeer ALVAST als gesloten — anders blijven we redirecten als
      // de user terugkomt op het dashboard via de browser-knop.
      window.localStorage.setItem(k, "gesloten");
      router.replace("/vandaag");
    } catch {
      // localStorage geblokkeerd? Dan niet redirecten.
    }
  }, [dagNummer, redirectActief, router]);

  return null;
}

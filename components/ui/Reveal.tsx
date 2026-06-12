"use client";

// ============================================================
// Reveal: laat content zacht binnenvliegen zodra 'ie in beeld
// scrollt. Het standaard-patroon om pagina's dynamisch te maken
// zonder circus: kleine afstanden, rustige timing, één keer.
//
// Gebruik:
//   <Reveal>...</Reveal>                        fade + omhoog
//   <Reveal richting="left" delay={150}>...     van links, gestaggerd
//   <Reveal richting="scale">...                zacht inzoomen
//
// Eigenschappen:
// - IntersectionObserver: animatie start pas als het element in
//   beeld komt, en speelt één keer (geen ge-jojo bij terugscrollen)
// - prefers-reduced-motion: dan meteen zichtbaar, geen beweging
// - Geen dependencies, server-component-vriendelijk als wrapper
// ============================================================

import { useEffect, useRef, useState } from "react";

type Richting = "up" | "left" | "right" | "scale" | "fade";

const START_KLASSEN: Record<Richting, string> = {
  up: "translate-y-6 opacity-0",
  left: "-translate-x-6 opacity-0",
  right: "translate-x-6 opacity-0",
  scale: "scale-[0.96] opacity-0",
  fade: "opacity-0",
};

export function Reveal({
  children,
  richting = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  richting?: Richting;
  /** Vertraging in ms, voor stagger-effect in lijsten (bv. i * 75). */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Geen observer-support of gebruiker wil geen beweging → direct tonen
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setZichtbaar(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setZichtbaar(true);
            observer.disconnect();
          }
        }
      },
      // Trigger iets vóór het element echt in beeld is, voelt vloeiender
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out will-change-transform ${
        zichtbaar
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : START_KLASSEN[richting]
      } ${className}`}
      style={{ transitionDelay: zichtbaar ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

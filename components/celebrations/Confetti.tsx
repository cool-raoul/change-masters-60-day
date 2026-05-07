"use client";

import { useEffect, useState } from "react";

// ============================================================
// Confetti, pure-CSS celebration-effect.
//
// Twee niveaus:
//   - 'klein' (mini-celebration): ~28 partikels, ~1.6s val
//     Gebruik: bij afvinken herinnering, kleine afgeronde actie.
//   - 'groot' (bigger celebration): ~80 partikels, ~2.5s val
//     Gebruik: bij week-mijlpaal, klant-conversie, dag-flow afsluiting.
//
// Render via CelebrationLayer (in AppShell) zodat één trigger op elke
// pagina werkt zonder per-page setup. Vuur af via celebrate()-helper
// uit lib/celebrate.ts.
//
// Geen dependencies, geen canvas. Pixels via DOM-elementen met CSS
// transform-animaties, dus GPU-vriendelijk en werkt prima op mobiel.
// ============================================================

const KLEUREN = [
  "#b89a52", // gedempt goud
  "#d4af52", // goud-light
  "#e8e6e0", // cream tekst
  "#7cba6b", // groen (success)
  "#e89855", // warm oranje (streak-vibes)
];

type Partikel = {
  id: number;
  links: number;
  delay: number;
  rotatie: number;
  kleur: string;
  vorm: "rect" | "circle";
  duur: number;
  grootte: number;
};

export function Confetti({
  trigger,
  intensiteit = "klein",
}: {
  /** Increment dit getal om een nieuwe celebration af te vuren. */
  trigger: number;
  intensiteit?: "klein" | "groot";
}) {
  const [partikels, setPartikels] = useState<Partikel[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const aantal = intensiteit === "groot" ? 80 : 28;
    const basisDuur = intensiteit === "groot" ? 2500 : 1600;

    const nieuw: Partikel[] = Array.from({ length: aantal }, (_, i) => ({
      id: trigger * 1000 + i,
      links: Math.random() * 100,
      delay: Math.random() * (intensiteit === "groot" ? 500 : 200),
      rotatie: Math.random() * 720 - 360,
      kleur: KLEUREN[Math.floor(Math.random() * KLEUREN.length)],
      vorm: Math.random() > 0.5 ? "rect" : "circle",
      duur: basisDuur + Math.random() * 800,
      grootte: 6 + Math.random() * 8,
    }));
    setPartikels(nieuw);

    const opruim = window.setTimeout(
      () => setPartikels([]),
      basisDuur + 1500,
    );
    return () => window.clearTimeout(opruim);
  }, [trigger, intensiteit]);

  if (partikels.length === 0) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
    >
      {partikels.map((p) => (
        <span
          key={p.id}
          className={`absolute top-[-24px] block ${
            p.vorm === "circle" ? "rounded-full" : "rounded-[2px]"
          }`}
          style={{
            left: `${p.links}%`,
            width: `${p.grootte}px`,
            height: p.vorm === "circle" ? `${p.grootte}px` : `${p.grootte * 1.6}px`,
            background: p.kleur,
            animation: `confetti-fall ${p.duur}ms ${p.delay}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
            transform: `rotate(${p.rotatie}deg)`,
            boxShadow: `0 0 4px ${p.kleur}80`,
          }}
        />
      ))}
    </div>
  );
}

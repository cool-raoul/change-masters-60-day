"use client";

import { useEffect, useState } from "react";
import { Confetti } from "./Confetti";

// ============================================================
// CelebrationLayer, één globale layer in AppShell die luistert naar
// 'eleva-celebrate'-events. Trigger met celebrate('klein' | 'groot')
// uit lib/celebrate.ts vanaf elke client component.
// ============================================================

export function CelebrationLayer() {
  const [trigger, setTrigger] = useState(0);
  const [intensiteit, setIntensiteit] = useState<"klein" | "groot">("klein");

  useEffect(() => {
    function onCelebrate(e: Event) {
      const detail = (e as CustomEvent<{ intensiteit?: "klein" | "groot" }>)
        .detail;
      setIntensiteit(detail?.intensiteit ?? "klein");
      setTrigger((t) => t + 1);
    }
    window.addEventListener("eleva-celebrate", onCelebrate);
    return () => window.removeEventListener("eleva-celebrate", onCelebrate);
  }, []);

  return <Confetti trigger={trigger} intensiteit={intensiteit} />;
}

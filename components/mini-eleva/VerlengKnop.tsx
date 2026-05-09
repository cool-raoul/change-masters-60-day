"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// VerlengKnop, verlengt een mini-ELEVA-uitnodiging met 14 dagen.
//
// Verschijnt in MiniElevaActieveSessies bij elke uitnodiging die nog
// niet maximaal is verlengd. Past bij Raoul's beslissingsmoment-
// filosofie: standaard 14 dagen, member kan tot 3x verlengen als
// prospect tijd nodig heeft.
// ============================================================

type Props = {
  invitationId: string;
  aantalVerlengd: number;
  maxVerlengingen?: number;
};

export function VerlengKnop({
  invitationId,
  aantalVerlengd,
  maxVerlengingen = 3,
}: Props) {
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  const isMaxBereikt = aantalVerlengd >= maxVerlengingen;

  async function verleng() {
    if (bezig || isMaxBereikt) return;
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/verleng", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, dagen: 14 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Verlengen mislukt");
        return;
      }
      toast.success(
        `Uitnodiging verlengd met 14 dagen (${data.aantal_verlengd}/${data.max_verlengingen})`,
      );
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  if (isMaxBereikt) {
    return (
      <div className="text-cm-white/40 text-[11px] italic">
        Max {maxVerlengingen} keer verlengd, maak een nieuwe uitnodiging als 'r
        een vers begin nodig is.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={verleng}
      disabled={bezig}
      className="text-cm-gold hover:text-cm-white text-xs underline disabled:opacity-50 disabled:no-underline"
    >
      {bezig
        ? "Bezig..."
        : `+ Verleng 14 dagen ${aantalVerlengd > 0 ? `(${aantalVerlengd}/${maxVerlengingen})` : ""}`}
    </button>
  );
}

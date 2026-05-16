"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// CrossModusOverslaanKaart, blauw kaartje voor stappen die al in
// een andere modus voltooid zijn. Member kiest: behouden of aanpassen.
// ============================================================

const MODUS_LABEL: Record<Modus, string> = {
  sprint: "Sprint",
  core: "Core",
  pro: "Pro",
};

type Props = {
  itemSlug: string;
  itemNaam: string;
  voltooidInModus: Modus;
  voltooidOpDatum: string;
  aanpassenRoute: string;
  huidigeModus: Modus;
  taakId: string;
  opOverslaan: () => void;
};

export function CrossModusOverslaanKaart({
  itemSlug,
  itemNaam,
  voltooidInModus,
  voltooidOpDatum,
  aanpassenRoute,
  huidigeModus,
  taakId,
  opOverslaan,
}: Props) {
  const [bezig, setBezig] = useState(false);
  const datum = new Date(voltooidOpDatum).toLocaleDateString("nl-NL");

  async function behouden() {
    setBezig(true);
    try {
      const res = await fetch("/api/onboarding/markeer-voltooid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_slug: itemSlug,
          modus_waarin: huidigeModus,
          taak_id: taakId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${itemNaam} behouden zoals het is`);
      opOverslaan();
    } catch {
      toast.error("Markeren mislukt, probeer opnieuw");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-blue-500/50 bg-blue-900/15 px-4 py-3 space-y-2">
      <p className="text-blue-200 text-sm">
        ✨ Je hebt <strong>{itemNaam}</strong> al gedaan tijdens{" "}
        <strong>{MODUS_LABEL[voltooidInModus]}</strong> op {datum}. Wil je het aanpassen of behouden zoals het is?
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={behouden}
          disabled={bezig}
          className="btn-secondary py-1.5 px-3 text-xs font-semibold"
        >
          {bezig ? "Bezig..." : "✓ Behouden"}
        </button>
        <Link
          href={aanpassenRoute}
          className="btn-gold py-1.5 px-3 text-xs font-semibold inline-block"
        >
          Aanpassen →
        </Link>
      </div>
    </div>
  );
}

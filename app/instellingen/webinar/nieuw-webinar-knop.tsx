"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// De plus-knop: opent een nieuw, leeg webinar-blok. Dat staat
// meteen op "concept" (niet actief), zodat de founder er rustig de
// video en teksten in kan zetten voordat het team 'm ziet.
// ============================================================

export function NieuwWebinarKnop() {
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  async function maakAan() {
    setBezig(true);
    try {
      const res = await fetch("/api/webinar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actie: "nieuw" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        toast.error(d?.error ?? "Aanmaken mislukt");
      } else {
        toast.success("Nieuw webinar geopend, vul 'm hieronder in");
        router.refresh();
      }
    } catch {
      toast.error("Geen verbinding");
    }
    setBezig(false);
  }

  return (
    <button
      onClick={maakAan}
      disabled={bezig}
      className="btn-gold w-full py-3.5 font-bold disabled:opacity-50"
    >
      {bezig ? "Bezig..." : "＋ Nieuw webinar toevoegen"}
    </button>
  );
}

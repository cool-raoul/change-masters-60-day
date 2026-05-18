"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// AdminItemAfvinkKnop, knop op /setup/[slug] om dat ene admin-item
// af te vinken en terug te gaan naar /setup.
// ============================================================

type Props = {
  slug: string;
};

export function AdminItemAfvinkKnop({ slug }: Props) {
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  async function markeer() {
    setBezig(true);
    const r = await fetch("/api/setup/markeer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setBezig(false);
    if (!r.ok) {
      toast.error("Niet gelukt om af te vinken, probeer 'm zo nog eens.");
      return;
    }
    toast.success("Afgevinkt");
    router.push("/setup");
    router.refresh();
  }

  return (
    <button
      onClick={markeer}
      disabled={bezig}
      className="btn-gold w-full py-3 font-semibold disabled:opacity-50"
    >
      {bezig ? "Bezig..." : "Markeer als gedaan + terug naar checklist"}
    </button>
  );
}

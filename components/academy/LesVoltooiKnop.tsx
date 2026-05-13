"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// LesVoltooiKnop, client component die een les markeert als
// voltooid via /api/academy/voltooien. Bij succes:
//   - toast met bevestiging
//   - router.refresh() zodat de server-component opnieuw rendert
//     met de nieuwe voortgang (groen vinkje)
//   - automatisch doorrollen naar volgende les als die er is
// ============================================================

type Props = {
  trainingSlug: string;
  lesSleutel: string;
  alVoltooid: boolean;
  volgendeSleutel: string | null;
};

export function LesVoltooiKnop({
  trainingSlug,
  lesSleutel,
  alVoltooid,
  volgendeSleutel,
}: Props) {
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  const router = useRouter();

  async function voltooi() {
    setBezig(true);
    try {
      const res = await fetch("/api/academy/voltooien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingSlug, lesSleutel }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      setVoltooid(true);
      toast.success("✓ Les voltooid");
      router.refresh();

      // Auto-doorrollen naar volgende les na korte vertraging,
      // zodat de gebruiker de bevestiging ziet.
      if (volgendeSleutel) {
        setTimeout(() => {
          router.push(`/academy/${trainingSlug}/les/${volgendeSleutel}`);
        }, 800);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "onbekende fout";
      toast.error(`Opslaan mislukt: ${msg}`);
    } finally {
      setBezig(false);
    }
  }

  if (voltooid) {
    return (
      <div className="card border-2 border-emerald-500/60 bg-emerald-900/15 text-center space-y-2">
        <p className="text-emerald-300 font-semibold">
          ✓ Deze les heb je voltooid
        </p>
        {volgendeSleutel && (
          <p className="text-cm-white/70 text-sm">
            Klaar voor de volgende? Klik 'Volgende les' hieronder.
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={voltooi}
      disabled={bezig}
      className="btn-gold w-full py-3 text-base font-semibold disabled:opacity-50"
    >
      {bezig
        ? "Bewaren..."
        : volgendeSleutel
          ? "✓ Voltooi deze les en ga naar de volgende"
          : "✓ Voltooi deze les"}
    </button>
  );
}

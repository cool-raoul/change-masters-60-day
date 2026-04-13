"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Prospect } from "@/lib/supabase/types";

interface Props {
  userId: string;
  prospects: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase">[];
}

export function NieuwGesprekKnop({ userId, prospects }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState("");
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function maakNieuwGesprek() {
    setLaden(true);
    const { data, error } = await supabase
      .from("ai_gesprekken")
      .insert({
        user_id: userId,
        prospect_id: selectedProspect || null,
        titel: selectedProspect
          ? `Coach gesprek`
          : "Algemeen coach gesprek",
        berichten: [],
      })
      .select()
      .single();

    if (error) {
      toast.error("Kon gesprek niet starten");
    } else {
      router.push(`/coach/${data.id}`);
    }
    setLaden(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-gold">
        + Nieuw gesprek
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-cm-surface border border-cm-border rounded-2xl p-6 max-w-md w-full space-y-4">
        <h2 className="text-xl font-display font-bold text-cm-white">
          Nieuw coach gesprek
        </h2>

        <div>
          <label className="block text-sm text-cm-white mb-1.5">
            Over welk prospect? (optioneel)
          </label>
          <select
            value={selectedProspect}
            onChange={(e) => setSelectedProspect(e.target.value)}
            className="input-cm"
          >
            <option value="">— Algemeen gesprek —</option>
            {prospects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.volledige_naam} ({p.pipeline_fase})
              </option>
            ))}
          </select>
          <p className="text-cm-white text-xs mt-1">
            Als je een prospect selecteert, weet de coach direct hun situatie.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={maakNieuwGesprek}
            disabled={laden}
            className="btn-gold flex-1"
          >
            {laden ? "Starten..." : "Start gesprek →"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="btn-secondary px-4"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}

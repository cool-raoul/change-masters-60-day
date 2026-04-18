"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  userId: string;
}

export function ProductadviesAlgemeenKnop({ userId }: Props) {
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function start() {
    if (laden) return;
    setLaden(true);

    const vraag =
      "Ik wil algemeen productadvies van Lifeplus. Geef NOG GEEN advies. Stel mij eerst 2-4 korte vragen om doel/klacht, medische context, huidige supplementen én budget helder te krijgen. Pas NA mijn antwoorden geef je een concreet Lifeplus-advies.";

    const { data, error } = await supabase
      .from("ai_gesprekken")
      .insert({
        user_id: userId,
        titel: "Productadvies (algemeen)",
        berichten: [],
      })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Kon adviesgesprek niet starten");
      setLaden(false);
      return;
    }

    router.push(`/coach/${data.id}?auto=${encodeURIComponent(vraag)}`);
  }

  return (
    <button
      onClick={start}
      disabled={laden}
      className="btn-secondary text-sm disabled:opacity-50"
      title="Start een adviesgesprek zonder dat een prospect geselecteerd is"
    >
      {laden ? "..." : "🧪 Productadvies"}
    </button>
  );
}

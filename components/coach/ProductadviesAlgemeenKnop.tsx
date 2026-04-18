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
      "Geef direct een algemeen Lifeplus-productadvies. Adviseer meteen op basis van wat gangbaar is (basis-stack, energie, darm, slaap, hormonen — afhankelijk van wat je redelijkerwijs kunt inschatten). Geen intake-vragenrondje vooraf. Sluit af met één korte check-vraag zodat ik kan aanscherpen als ik wil.";

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

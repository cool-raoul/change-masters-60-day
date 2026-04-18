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
      "Ik wil algemeen Lifeplus-productadvies. Start met EXACT ÉÉN open intake-vraag (\"Geef me zoveel mogelijk informatie zodat ik een gepast productadvies kan samenstellen\") met één zin voorbeelden erbij (doel/klacht, leeftijd, leefstijl, medische context, budget). Geen losse vragenrondje. Zodra ik antwoord: direct concreet advies.";

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

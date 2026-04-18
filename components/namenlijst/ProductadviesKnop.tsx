"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  prospectId: string;
  prospectNaam: string;
  userId: string;
  notities?: string | null;
}

export function ProductadviesKnop({ prospectId, prospectNaam, userId, notities }: Props) {
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function vraagAdvies() {
    if (laden) return;
    setLaden(true);

    const openingBericht = {
      role: "assistant" as const,
      content: `Geef me zoveel mogelijk informatie zodat ik een gepast Lifeplus-productadvies voor ${prospectNaam} kan samenstellen. Denk bijvoorbeeld aan doel of klacht, leeftijd, leefstijl, medische context en budget.${
        notities ? `\n\n(Ik heb deze context al: ${notities})` : ""
      }`,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("ai_gesprekken")
      .insert({
        user_id: userId,
        prospect_id: prospectId,
        titel: `Productadvies voor ${prospectNaam}`,
        berichten: [openingBericht],
      })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Kon adviesgesprek niet starten");
      setLaden(false);
      return;
    }

    router.push(`/coach/${data.id}`);
  }

  return (
    <button
      onClick={vraagAdvies}
      disabled={laden}
      className="btn-secondary text-sm disabled:opacity-50"
      title="Laat ELEVA een pakket voorstellen op basis van notities en fase"
    >
      {laden ? "..." : "🧪 Productadvies"}
    </button>
  );
}

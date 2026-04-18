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

    const vraag = `Welke Lifeplus-producten passen bij ${prospectNaam}?${
      notities ? ` Wat ik weet: ${notities}` : ""
    }`;

    const { data, error } = await supabase
      .from("ai_gesprekken")
      .insert({
        user_id: userId,
        prospect_id: prospectId,
        titel: `Productadvies voor ${prospectNaam}`,
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
      onClick={vraagAdvies}
      disabled={laden}
      className="btn-secondary text-sm disabled:opacity-50"
      title="Laat ELEVA een pakket voorstellen op basis van notities en fase"
    >
      {laden ? "..." : "🧪 Productadvies"}
    </button>
  );
}

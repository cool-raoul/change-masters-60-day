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
  /**
   * Als gezet: voeg het opening-bericht toe aan dit BESTAANDE gesprek
   * i.p.v. een nieuw gesprek aan te maken. Voor gebruik in de Mentor —
   * de user zit al in een gesprek over deze prospect, dus een tweede
   * gesprek aanmaken zou onnodig versplinteren.
   */
  huidigGesprekId?: string;
}

export function ProductadviesKnop({
  prospectId,
  prospectNaam,
  userId,
  notities,
  huidigGesprekId,
}: Props) {
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

    if (huidigGesprekId) {
      // Append in bestaand gesprek. Pak eerst de huidige berichten op,
      // voeg het opening toe, schrijf terug. Daarna refresh de pagina
      // zodat ChatVenster (server-rendered) het nieuwe bericht laadt.
      const { data: huidig, error: fetchErr } = await supabase
        .from("ai_gesprekken")
        .select("berichten, prospect_id")
        .eq("id", huidigGesprekId)
        .eq("user_id", userId)
        .single();
      if (fetchErr || !huidig) {
        toast.error("Kon huidig gesprek niet vinden");
        setLaden(false);
        return;
      }
      const nieuweBerichten = [
        ...((huidig.berichten as any[]) || []),
        openingBericht,
      ];
      const updates: Record<string, unknown> = {
        berichten: nieuweBerichten,
        updated_at: new Date().toISOString(),
      };
      // Koppel het gesprek aan deze prospect als dat nog niet gebeurd is.
      if (!huidig.prospect_id) updates.prospect_id = prospectId;

      const { error: updErr } = await supabase
        .from("ai_gesprekken")
        .update(updates)
        .eq("id", huidigGesprekId)
        .eq("user_id", userId);
      if (updErr) {
        toast.error("Kon advies-prompt niet toevoegen");
        setLaden(false);
        return;
      }
      router.refresh();
      setLaden(false);
      return;
    }

    // Geen huidig gesprek → nieuw gesprek aanmaken (klassieke flow)
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

// File: lib/mentor/laag-3-escalatie.ts
//
// Laag 3 van drie-laags Mentor-architectuur. Stuurt sponsor een
// handover-melding wanneer Mentor besluit dat een vraag boven Laag 2
// uitkomt. Voor pilot logt deze functie alleen naar DB; daadwerkelijke
// push-notificatie naar sponsor komt in latere Fase.

import { createClient } from "@/lib/supabase/server";

export type EscalatieTrigger =
  | "claim-gevoelig"
  | "emotioneel"
  | "mentor-onzeker"
  | "expliciet-verzoek";

export type ChatContextBericht = {
  rol: "member" | "mentor";
  tekst: string;
  tijdstip: string;
};

export type EscalatieAanvraag = {
  memberId: string;
  trigger: EscalatieTrigger;
  chatContext: ChatContextBericht[];
};

/** Logt een escalatie. Returnt het id van de aangemaakte record bij success. */
export async function escalereeNaarSponsor(
  aanvraag: EscalatieAanvraag,
): Promise<{ ok: boolean; escalatieId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Sponsor-id ophalen vanuit profiles.sponsor_id (huidige conventie).
    const { data: profile } = await supabase
      .from("profiles")
      .select("sponsor_id")
      .eq("id", aanvraag.memberId)
      .maybeSingle();

    const sponsorId = (profile as { sponsor_id?: string | null } | null)?.sponsor_id ?? null;

    const { data, error } = await supabase
      .from("mentor_escalaties")
      .insert({
        member_id: aanvraag.memberId,
        sponsor_id: sponsorId,
        trigger_type: aanvraag.trigger,
        chat_context: aanvraag.chatContext,
        status: "open",
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, escalatieId: (data as { id: string }).id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "onbekend" };
  }
}

/** Returnt aantal openstaande escalaties voor een sponsor. */
export async function aantalOpenEscalatiesVoorSponsor(
  sponsorId: string,
): Promise<number> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("mentor_escalaties")
      .select("id", { count: "exact", head: true })
      .eq("sponsor_id", sponsorId)
      .eq("status", "open");
    return count ?? 0;
  } catch {
    return 0;
  }
}

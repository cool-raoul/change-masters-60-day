import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sendPush";

// ============================================================
// lib/team/mijlpaal-detector.ts
//
// Bij elk /vandaag- en /dashboard-bezoek (server-side) checken of
// member zijn eerste partner heeft gekregen. Als ja én nog niet
// gevierd: registreer mijlpaal-rij + stuur push.
//
// Mijlpaal blijft uniek per (user_id, 'eerste-partner') via UNIQUE
// constraint op partner_mijlpalen-tabel.
// ============================================================

export type MijlpaalStatus = {
  /** True bij het exacte bezoek waarin de mijlpaal werd geregistreerd. */
  zojuistGevierd: boolean;
  /** Naam van eerste partner — alleen gevuld als zojuistGevierd=true. */
  eerstePartnerNaam: string | null;
};

export async function detecteerEnVierEerstePartner(
  supabase: SupabaseClient,
  userId: string,
): Promise<MijlpaalStatus> {
  // 1. Heeft member al eerste-partner-mijlpaal?
  const { data: bestaand } = await supabase
    .from("partner_mijlpalen")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "eerste-partner")
    .maybeSingle();

  if (bestaand) {
    return { zojuistGevierd: false, eerstePartnerNaam: null };
  }

  // 2. Heeft member minstens 1 directe partner?
  const { data: partners } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("sponsor_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!partners || partners.length === 0) {
    return { zojuistGevierd: false, eerstePartnerNaam: null };
  }

  const eerstePartner = partners[0] as { id: string; full_name: string };

  // 3. Registreer mijlpaal. UNIQUE constraint vangt race conditions af.
  const { error } = await supabase.from("partner_mijlpalen").insert({
    user_id: userId,
    type: "eerste-partner",
    partner_id: eerstePartner.id,
  });

  if (error) {
    // Race condition (duplicate key) of andere fout — geen viering, geen push.
    console.warn("partner_mijlpalen insert error:", error.message);
    return { zojuistGevierd: false, eerstePartnerNaam: null };
  }

  // 4. Stuur push-notificatie (best-effort, niet fataal).
  try {
    await sendPushToUser(userId, {
      title: "🎉 Je hebt je eerste partner!",
      body: `${eerstePartner.full_name} heeft zich net onder jou aangemeld. Open ELEVA om te vieren.`,
      url: "/dashboard?vier=eerste-partner",
      tag: "eerste-partner",
    });
  } catch {
    // negeer push-fouten
  }

  return { zojuistGevierd: true, eerstePartnerNaam: eerstePartner.full_name };
}

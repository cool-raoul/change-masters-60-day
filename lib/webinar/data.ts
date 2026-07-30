import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";

// ============================================================
// Gedeelde helpers voor de webinar-bibliotheek.
// ============================================================

export type Webinar = {
  id: string;
  titel: string;
  ondertitel: string;
  video_url: string | null;
  duur_minuten: number;
  intro_tekst: string | null;
  actie_label: string;
  actie_uitleg: string | null;
  bestellink_uitleg: string | null;
  actief: boolean;
  volgorde: number;
};

const VELDEN =
  "id, titel, ondertitel, video_url, duur_minuten, intro_tekst, actie_label, actie_uitleg, bestellink_uitleg, actief, volgorde";

/** Alle webinars, nieuwste bovenaan binnen de handmatige volgorde. */
export async function haalWebinars(alleenActief = false): Promise<Webinar[]> {
  const admin = createAdminClient();
  let query = admin
    .from("webinars")
    .select(VELDEN)
    .order("volgorde", { ascending: true })
    .order("created_at", { ascending: false });
  if (alleenActief) query = query.eq("actief", true);
  const { data } = await query;
  return (data ?? []) as Webinar[];
}

export async function haalWebinar(id: string): Promise<Webinar | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("webinars")
    .select(VELDEN)
    .eq("id", id)
    .maybeSingle();
  return (data as Webinar | null) ?? null;
}

/**
 * De persoonlijke deel-link van een teamlid voor één webinar. Bestaat
 * die nog niet, dan maken we 'm hier aan: zo krijgt elk teamlid vanzelf
 * een link zodra een nieuw webinar op actief gaat.
 */
export async function tokenVoor(
  webinarId: string,
  memberId: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data: bestaand } = await admin
    .from("webinar_member_links")
    .select("token")
    .eq("webinar_id", webinarId)
    .eq("member_id", memberId)
    .maybeSingle();
  const gevonden = (bestaand as { token?: string } | null)?.token;
  if (gevonden) return gevonden;

  const nieuw = genereerBotToken();
  const { data: ingevoegd } = await admin
    .from("webinar_member_links")
    .insert({ webinar_id: webinarId, member_id: memberId, token: nieuw })
    .select("token")
    .maybeSingle();
  return (ingevoegd as { token?: string } | null)?.token ?? nieuw;
}

export type Bestellink = {
  id: string;
  label: string;
  url: string;
  volgorde: number;
};

/** De eigen bestellinks van een teamlid bij één webinar. */
export async function haalBestellinks(
  webinarId: string,
  memberId: string,
): Promise<Bestellink[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("webinar_bestellinks")
    .select("id, label, url, volgorde")
    .eq("webinar_id", webinarId)
    .eq("member_id", memberId)
    .order("volgorde", { ascending: true });
  return (data ?? []) as Bestellink[];
}

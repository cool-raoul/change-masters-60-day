import { createAdminClient } from "@/lib/supabase/admin";
import { bouwIcs } from "@/lib/webinar/agenda";
import { SITE_URL } from "@/lib/site";

// ============================================================
// GET /api/webinar/agenda/[token].ics
//
// Levert het agenda-bestand voor één inschrijving, met een
// herinnering 30 minuten vooraf. Apple Agenda, Outlook-desktop en de
// meeste andere agenda's openen dit direct.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const schoon = token.replace(/\.ics$/i, "");
  const admin = createAdminClient();

  const { data: rij } = await admin
    .from("webinar_inschrijvingen")
    .select("id, slot_start, webinar_id")
    .eq("token", schoon)
    .maybeSingle();
  if (!rij) {
    return new Response("Niet gevonden", { status: 404 });
  }
  const inschrijving = rij as {
    id: string;
    slot_start: string;
    webinar_id: string | null;
  };

  let titel = "Webinar";
  let duur = 45;
  if (inschrijving.webinar_id) {
    const { data: w } = await admin
      .from("webinars")
      .select("titel, duur_minuten")
      .eq("id", inschrijving.webinar_id)
      .maybeSingle();
    const webinar = w as { titel?: string; duur_minuten?: number } | null;
    titel = webinar?.titel ?? titel;
    duur = webinar?.duur_minuten ?? duur;
  }

  const ics = bouwIcs({
    titel,
    startIso: inschrijving.slot_start,
    duurMinuten: duur,
    kijkUrl: `${SITE_URL}/webinar/kijk/${schoon}`,
    uid: inschrijving.id,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="webinar.ics"`,
      "Cache-Control": "no-store",
    },
  });
}

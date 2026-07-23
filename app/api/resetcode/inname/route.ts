import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/inname
//
// Afvinken (of weer uitvinken) van een inname-moment van vandaag
// uit het dagelijkse innameschema (Darmen in Balans). Puur voor
// de klant zelf; de datum bepaalt de server (Europe/Amsterdam),
// zodat er niet met dagen geschoven kan worden.
//
// Body: { token, moment: "nuchter"|"ochtend"|"lunch"|"avond"|"slapen", gedaan: boolean }
// Response: { ok: true, innames: string[] }  (de vinkjes van vandaag)
// ============================================================

const GELDIGE_MOMENTEN = ["nuchter", "ochtend", "lunch", "avond", "slapen"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const moment = (body.moment as string | undefined) ?? "";
  const gedaan = body.gedaan === true;
  if (!GELDIGE_MOMENTEN.includes(moment)) {
    return Response.json({ error: "Onbekend moment" }, { status: 400 });
  }
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const vandaag = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());

  const admin = createAdminClient();
  if (gedaan) {
    const { error } = await admin
      .from("resetcode_innames")
      .upsert(
        { link_id: ctx.linkId, datum: vandaag, moment },
        { onConflict: "link_id,datum,moment", ignoreDuplicates: true },
      );
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  } else {
    await admin
      .from("resetcode_innames")
      .delete()
      .eq("link_id", ctx.linkId)
      .eq("datum", vandaag)
      .eq("moment", moment);
  }

  const { data } = await admin
    .from("resetcode_innames")
    .select("moment")
    .eq("link_id", ctx.linkId)
    .eq("datum", vandaag);
  return Response.json({
    ok: true,
    innames: ((data ?? []) as { moment: string }[]).map((r) => r.moment),
  });
}

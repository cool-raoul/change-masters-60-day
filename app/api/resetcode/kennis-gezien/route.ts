import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/kennis-gezien
//
// Markeert dat het terugkom-bericht ("je vroeg laatst..., het team
// zegt...") aan deze klant is verteld, zodat het eenmalig blijft.
//
// Body: { token, ids: string[] }
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const ids = Array.isArray(body.ids)
    ? (body.ids as string[]).filter((x) => typeof x === "string").slice(0, 10)
    : [];
  if (ids.length === 0) {
    return Response.json({ error: "ids vereist" }, { status: 400 });
  }
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }
  const admin = createAdminClient();
  await admin
    .from("resetcode_kennis")
    .update({ terugkoppeling_gedaan: true })
    .in("id", ids)
    .eq("link_id", ctx.linkId);
  return Response.json({ ok: true });
}

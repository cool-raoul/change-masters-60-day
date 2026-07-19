import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/pakket
//
// Darmen in Balans: de klant geeft door welk pakket hij heeft
// (basis = rode schema, 5 producten; plus = blauwe schema,
// 8 producten). De Mentor antwoordt daarna pakket-specifiek.
//
// Body: { token, pakket: "basis" | "plus" }
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const pakket = body.pakket === "plus" ? "plus" : body.pakket === "basis" ? "basis" : null;
  if (!pakket) {
    return Response.json({ error: "Ongeldig pakket" }, { status: 400 });
  }

  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const admin = createAdminClient();
  await admin
    .from("resetcode_klant_links")
    .update({ pakket, laatste_activiteit: new Date().toISOString() })
    .eq("id", ctx.linkId);

  return Response.json({ ok: true });
}

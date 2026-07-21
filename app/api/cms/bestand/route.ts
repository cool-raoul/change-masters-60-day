import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// GET /api/cms/bestand?pad=<storage_pad>
//
// Altijd-verse toegang tot founder-media (PDF's, afbeeldingen,
// audio) uit pagina_blokken. Voorheen kregen pagina's een signed
// URL van 1 uur mee; een klant-tab die dagen openstaat had dan
// dode document-knoppen (bug-melding Raoul 21 juli). Deze route
// geeft bij elke klik een verse signed URL, en alleen voor paden
// die echt als gepubliceerd blok bestaan.
// ============================================================

export async function GET(req: NextRequest) {
  const pad = req.nextUrl.searchParams.get("pad") ?? "";
  if (!pad || pad.includes("..")) {
    return new Response("pad vereist", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: blok } = await admin
    .from("pagina_blokken")
    .select("id")
    .eq("storage_pad", pad)
    .limit(1)
    .maybeSingle();
  if (!blok) {
    return new Response("onbekend bestand", { status: 404 });
  }

  const { data: signed, error } = await admin.storage
    .from("pagina-media")
    .createSignedUrl(pad, 60 * 60);
  if (error || !signed?.signedUrl) {
    return new Response("bestand niet beschikbaar", { status: 404 });
  }
  return Response.redirect(signed.signedUrl, 302);
}

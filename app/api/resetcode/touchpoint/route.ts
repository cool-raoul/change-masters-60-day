import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/touchpoint
//
// Markeert dat een business-touchpoint (kern-verhaal, darm-einde,
// complimenten-moment...) aan deze klant is verteld, zodat het
// nooit dubbel gebeurt, ook niet in een volgend programma.
//
// Body: { token, sleutel }
// ============================================================

const GELDIG = [
  "kern-verhaal",
  "darm-einde",
  "reset-complimenten",
  "reset-afronding",
  "basis-week3",
  "basis-groeien",
  "dag10-video",
  "programma-einde",
  "samen-starten",
  "fase2-verlengd",
];
// Week-terugblikken zijn genummerd (week-terugblik-1, -2, ...).
const WEEK_TERUGBLIK = /^week-terugblik-\d{1,2}$/;
// Einde-markering per programma (doorgroei-route).
const PROGRAMMA_EINDE = /^programma-einde-(darm|reset|producten)$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const sleutel = (body.sleutel as string | undefined) ?? "";
  if (
    !GELDIG.includes(sleutel) &&
    !WEEK_TERUGBLIK.test(sleutel) &&
    !PROGRAMMA_EINDE.test(sleutel)
  ) {
    return Response.json({ error: "Onbekende sleutel" }, { status: 400 });
  }
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: rij } = await admin
    .from("resetcode_klant_links")
    .select("touchpoints")
    .eq("id", ctx.linkId)
    .maybeSingle();
  const huidig = Array.isArray((rij as { touchpoints?: unknown } | null)?.touchpoints)
    ? ((rij as { touchpoints: string[] }).touchpoints)
    : [];
  if (!huidig.includes(sleutel)) {
    await admin
      .from("resetcode_klant_links")
      .update({ touchpoints: [...huidig, sleutel] })
      .eq("id", ctx.linkId);
  }
  return Response.json({ ok: true });
}

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";
import { stationVoor, programmaVoor } from "@/lib/resetcode/programma";

// ============================================================
// POST /api/resetcode/stap
//
// Klant gaat naar een andere stap in het programma. Bewaart de
// plek (zodat de Mentor daar verdergaat) en stuurt de
// begeleider een seintje: dit zijn precies de pulse-momenten
// waarop persoonlijk contact het verschil maakt.
//
// Body: { token, station }
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const stationSlug = (body.station as string | undefined) ?? "";

  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }
  const station = stationVoor(ctx.programmaSlug, stationSlug);
  if (!station) {
    return Response.json({ error: "Onbekend station" }, { status: 400 });
  }
  if (ctx.stationSlug === stationSlug) return Response.json({ ok: true });

  const admin = createAdminClient();
  await admin
    .from("resetcode_klant_links")
    .update({
      station_slug: stationSlug,
      station_sinds: new Date().toISOString(),
      laatste_activiteit: new Date().toISOString(),
    })
    .eq("id", ctx.linkId);

  const programma = programmaVoor(ctx.programmaSlug);
  await seintjeNaarMember(
    ctx,
    `${ctx.klantVoornaam} is bij ${station.emoji} ${station.naam}`,
    station.contactMoment
      ? `Contactmoment! ${station.contactMoment}`
      : `${ctx.klantNaam} is doorgegaan naar stap ${station.nummer} van ${programma?.stations.length ?? "?"} (${programma?.naam ?? ""}). Even een berichtje sturen doet wonderen.`,
  );

  return Response.json({ ok: true });
}

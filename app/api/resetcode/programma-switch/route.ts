import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";
import { programmaVoor } from "@/lib/resetcode/programma";

// ============================================================
// POST /api/resetcode/programma-switch
//
// Doorgroei-route: de klant start (na vrijgave door de begeleider)
// een vervolg-programma in DEZELFDE omgeving. Zelfde token, zelfde
// chat, zelfde geheugen; alleen programma + fase + startmoment
// gaan opnieuw.
//
// Body: { token, programma }
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const slug = (body.programma as string | undefined) ?? "";

  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }
  const programma = programmaVoor(slug);
  if (!programma || slug === ctx.programmaSlug) {
    return Response.json({ error: "Onbekend programma" }, { status: 400 });
  }
  // Alleen door de begeleider vrijgegeven vervolg-programma's.
  if (!ctx.vrijgegeven.includes(slug)) {
    return Response.json(
      { error: "Dit vervolg is nog niet vrijgegeven" },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("resetcode_klant_links")
    .update({
      programma: slug,
      station_slug: programma.stations[0].slug,
      station_sinds: new Date().toISOString(),
      start_datum: null,
      laatste_activiteit: new Date().toISOString(),
    })
    .eq("id", ctx.linkId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await seintjeNaarMember(
    ctx,
    `${ctx.klantVoornaam} start met ${programma.emoji} ${programma.naam}! 🎉`,
    `${ctx.klantNaam} is doorgegroeid naar het vervolg-programma. Een persoonlijk berichtje maakt dit moment af.`,
  );

  return Response.json({ ok: true, eersteStation: programma.stations[0].slug });
}

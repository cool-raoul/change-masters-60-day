import { NextRequest } from "next/server";
import {
  pakResetKlantContext,
  pakResetChats,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";

// ============================================================
// GET /api/resetcode/context?token=...
//
// Klant-omgeving haalt hiermee bij het openen alles op: wie ben
// ik, welk programma, waar was ik, en het hele gesprek tot nu
// toe (het geheugen dat over apparaten meereist). Bij het
// allereerste bezoek krijgt de begeleider een seintje.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status === "gesloten") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const chats = await pakResetChats(ctx.linkId);

  // Eerste bezoek = nog geen station en geen gesprek: seintje.
  if (!ctx.stationSlug && chats.length === 0) {
    await seintjeNaarMember(
      ctx,
      `${ctx.klantVoornaam} heeft de klantomgeving geopend 🎉`,
      `${ctx.klantNaam} is gestart met de omgeving (${ctx.programmaSlug}). De Mentor neemt het eerste stuk; jouw persoonlijke berichtje maakt het af.`,
    );
  }

  return Response.json({
    ok: true,
    klantNaam: ctx.klantNaam,
    klantVoornaam: ctx.klantVoornaam,
    programma: ctx.programmaSlug,
    station: ctx.stationSlug,
    memberVoornaam: ctx.memberVoornaam,
    memberTelefoon: ctx.memberTelefoon,
    chats: chats.map((c) => ({
      van: c.van,
      soort: c.soort,
      kaart: c.kaart,
      stationSlug: c.station_slug,
      tekst: c.tekst,
    })),
  });
}

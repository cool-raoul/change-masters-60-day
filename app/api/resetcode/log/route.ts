import { NextRequest } from "next/server";
import {
  pakResetKlantContext,
  bewaarResetChats,
} from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/log
//
// Bewaart de "gescripte" gespreks-items (welkom-teksten,
// kaartjes, intent-echo's) die client-side ontstaan, zodat het
// hele gesprek terugkomt bij een volgend bezoek. De echte
// Mentor-vragen en -antwoorden worden al door
// /api/resetcode-mentor zelf opgeslagen.
//
// Body: { token, items: [{van,soort,kaart,stationSlug,tekst}] }
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  type Item = {
    van: "klant" | "mentor";
    soort: "tekst" | "kaart" | "foto";
    kaart?: string | null;
    stationSlug?: string | null;
    tekst?: string | null;
  };
  const items = (Array.isArray(body.items) ? (body.items as Item[]) : [])
    .filter(
      (i) =>
        i &&
        (i.van === "klant" || i.van === "mentor") &&
        (i.soort === "tekst" || i.soort === "kaart" || i.soort === "foto"),
    )
    .slice(0, 20)
    .map((i) => ({
      van: i.van,
      soort: i.soort,
      kaart: typeof i.kaart === "string" ? i.kaart.slice(0, 40) : null,
      stationSlug:
        typeof i.stationSlug === "string" ? i.stationSlug.slice(0, 60) : null,
      tekst: typeof i.tekst === "string" ? i.tekst.slice(0, 4000) : null,
    }));

  await bewaarResetChats(ctx.linkId, items);
  return Response.json({ ok: true });
}

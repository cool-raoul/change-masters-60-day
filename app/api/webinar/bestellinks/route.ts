import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/webinar/bestellinks
// Body: { webinarId, links: [{ label, url }] }
//
// De eigen bestellinks van een teamlid onder één webinar. We
// vervangen de hele set: dat is eenvoudiger dan per rij bijhouden
// wat er is toegevoegd of weggehaald, en het gaat om een handvol
// links per persoon.
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const webinarId = String(body.webinarId ?? "");
  if (!webinarId) {
    return NextResponse.json({ error: "webinarId ontbreekt" }, { status: 400 });
  }

  const ruw = Array.isArray(body.links) ? body.links : [];
  const links = ruw
    .map((l: { label?: string; url?: string }, i: number) => ({
      label: String(l?.label ?? "").trim().slice(0, 120),
      url: String(l?.url ?? "").trim().slice(0, 800),
      volgorde: i,
    }))
    .filter((l: { label: string; url: string }) => l.label && l.url)
    .slice(0, 12);

  // Alleen echte links doorlaten, anders staat er straks een knop die
  // nergens heen gaat op de kijkpagina van een prospect.
  const ongeldig = links.find(
    (l: { url: string }) => !/^https?:\/\//i.test(l.url),
  );
  if (ongeldig) {
    return NextResponse.json(
      { error: "Een link moet met http:// of https:// beginnen" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  await admin
    .from("webinar_bestellinks")
    .delete()
    .eq("webinar_id", webinarId)
    .eq("member_id", user.id);

  if (links.length > 0) {
    const { error } = await admin.from("webinar_bestellinks").insert(
      links.map((l: { label: string; url: string; volgorde: number }) => ({
        webinar_id: webinarId,
        member_id: user.id,
        label: l.label,
        url: l.url,
        volgorde: l.volgorde,
      })),
    );
    if (error) {
      console.error("bestellinks opslaan:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, aantal: links.length });
}

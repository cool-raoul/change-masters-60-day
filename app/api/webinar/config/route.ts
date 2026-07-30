import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/webinar/config — founder-only.
//
// Body { actie: "nieuw" }            → opent een leeg webinar-blok
// Body { actie: "opslaan", id, ... } → slaat dat webinar op
//
// Een nieuw webinar staat bewust op niet-actief: de founder vult 'm
// eerst, en zet 'm daarna vrij voor het team.
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((prof as { role?: string | null } | null)?.role !== "founder") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  if (body.actie === "nieuw") {
    const { data: hoogste } = await admin
      .from("webinars")
      .select("volgorde")
      .order("volgorde", { ascending: false })
      .limit(1);
    const volgende =
      (((hoogste ?? [])[0] as { volgorde?: number } | undefined)?.volgorde ??
        0) + 1;
    const { data, error } = await admin
      .from("webinars")
      .insert({ volgorde: volgende })
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("nieuw webinar:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: (data as { id: string }).id });
  }

  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id ontbreekt" }, { status: 400 });
  }
  const duur = Number(body.duur_minuten);

  const { error } = await admin
    .from("webinars")
    .update({
      titel: String(body.titel ?? "").slice(0, 200) || "Nieuw webinar",
      ondertitel:
        String(body.ondertitel ?? "").slice(0, 400) ||
        "Een opgenomen webinar. Jij kiest zelf wanneer je kijkt.",
      video_url: String(body.video_url ?? "").slice(0, 500) || null,
      duur_minuten:
        Number.isFinite(duur) && duur >= 5 && duur <= 180 ? Math.round(duur) : 45,
      intro_tekst: String(body.intro_tekst ?? "").slice(0, 4000) || null,
      actie_label:
        String(body.actie_label ?? "").slice(0, 120) ||
        "Ik wil hier meer over weten",
      actie_uitleg: String(body.actie_uitleg ?? "").slice(0, 600) || null,
      bestellink_uitleg:
        String(body.bestellink_uitleg ?? "").slice(0, 600) || null,
      actief: body.actief === true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("webinar opslaan:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/webinar/config — founder-only.
// Slaat de instellingen van de masterclass op (één rij).
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
  const duur = Number(body.duur_minuten);

  const admin = createAdminClient();
  const { error } = await admin
    .from("webinar_config")
    .update({
      titel: String(body.titel ?? "").slice(0, 200) || "Masterclass",
      ondertitel: String(body.ondertitel ?? "").slice(0, 400),
      video_url: String(body.video_url ?? "").slice(0, 500) || null,
      duur_minuten:
        Number.isFinite(duur) && duur >= 5 && duur <= 180 ? Math.round(duur) : 45,
      intro_tekst: String(body.intro_tekst ?? "").slice(0, 4000) || null,
      actie_label:
        String(body.actie_label ?? "").slice(0, 120) ||
        "Ik wil hier meer over weten",
      actie_uitleg: String(body.actie_uitleg ?? "").slice(0, 600) || null,
      actief: body.actief !== false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "standaard");

  if (error) {
    console.error("webinar-config opslaan:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

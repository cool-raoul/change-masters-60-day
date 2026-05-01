import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/presence/ping
//
// Heartbeat-endpoint. ELEVA-client roept dit elke 60s aan zolang de
// app open is. Update profiles.last_seen_at = now() voor de huidige
// member. Geen opt-in: members in een sponsor-team-relatie hebben
// baat bij verbinding, status zichtbaar binnen sponsor-lijn.
// ============================================================

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    await supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("presence/ping exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/presence/ping
//
// Heartbeat-endpoint. ELEVA-client roept dit elke 60s aan zolang de
// app open is. Update profiles.last_seen_at = now() voor de huidige
// member. Schrijft niet als presence_zichtbaar=false (privacy-toggle).
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

    // Privacy-toggle check: als member zichtbaarheid heeft uitgezet,
    // schrijven we niets. Anders blijft last_seen_at op een oude waarde
    // staan (of null als nooit gezet) en is de groene stip dus niet
    // zichtbaar voor teamleden.
    const { data: profielRow } = await supabase
      .from("profiles")
      .select("presence_zichtbaar")
      .eq("id", user.id)
      .maybeSingle();
    const zichtbaar =
      (profielRow as { presence_zichtbaar?: boolean } | null)
        ?.presence_zichtbaar !== false;
    if (!zichtbaar) {
      return NextResponse.json({ ok: true, geschreven: false });
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

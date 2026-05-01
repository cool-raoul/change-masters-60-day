import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/presence/uitloggen
//
// Aangeroepen door Topbar.logUit() vlak voor signOut. Zet last_seen_at
// op een uur geleden zodat teamleden de groene 'nu actief'-stip direct
// zien verdwijnen i.p.v. nog 2 min op 'recent actief' te blijven hangen.
// ============================================================

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: true });
    }
    const eenUurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await supabase
      .from("profiles")
      .update({ last_seen_at: eenUurGeleden })
      .eq("id", user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("presence/uitloggen exception:", e);
    return NextResponse.json({ ok: true });
  }
}

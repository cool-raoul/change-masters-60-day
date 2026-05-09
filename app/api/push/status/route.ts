import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/push/status
//
// Geeft de actieve push-subscription-status terug voor de huidige user.
// Door de UI gebruikt om browser-state vs server-state te vergelijken.
// Als browser zegt 'ik heb een subscription' maar server niet, weet de
// UI dat 'r een desync is en kan automatisch resyncen.
//
// Response: { hasActive, endpoint }
//   - hasActive: of 'r een is_active=true row staat
//   - endpoint:  endpoint van de actieve subscription (voor match-check)
// ============================================================

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { data: row } = await supabase
      .from("push_subscriptions")
      .select("endpoint, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    return NextResponse.json({
      hasActive: !!row,
      endpoint:
        (row as { endpoint?: string } | null)?.endpoint ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToUser, sendPushToLeiders } from "@/lib/push/sendPush";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { stap } = await request.json();

    if (!stap || typeof stap !== "string" || stap.length > 100) {
      return NextResponse.json({ error: "Ongeldige stap" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Haal naam + sponsor_id op
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("full_name, sponsor_id, role")
      .eq("id", user.id)
      .single();

    const naam = profile?.full_name || "Een teamlid";

    const payload = {
      title: "⚡ ELEVA Team Update",
      body: `${naam} ${stap}`,
      url: `/team?lid=${user.id}`,
      tag: "onboarding",
    };

    // 1. Stuur naar directe sponsor (als die bestaat)
    if (profile?.sponsor_id) {
      await sendPushToUser(profile.sponsor_id, payload);
    }

    // 2. Stuur ook naar alle leiders (dubbele melding voor leiders is ok)
    await sendPushToLeiders(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding notificatie fout:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}

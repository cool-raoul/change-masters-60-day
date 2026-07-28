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

    // Sommige aanroepen sturen een leesbare zin mee ("heeft de app
    // geïnstalleerd 📱"), andere een rauwe kolom-sleutel (stap_1_welkom).
    // Een rauwe sleutel mag NOOIT in een pushbericht landen (bug Raoul
    // 28 juli): vertaal bekende sleutels, en val anders netjes terug.
    const STAP_LABELS: Record<string, string> = {
      stap_1_welkom: 'heeft "Welkom & uitleg onboarding" doorlopen ✅',
      stap_2_run: "snapt de 60-dagenrun (3 fasen + dagdoelen) ✅",
      stap_3_namen: "heeft de eerste namen op de lijst gezet ✅",
      stap_4_script: "heeft het uitnodigingsscript gelezen en geoefend ✅",
      stap_5_doelen: "heeft de dagdoelen ingesteld ✅",
    };
    const leesbaar =
      STAP_LABELS[stap] ??
      (/^[a-z0-9_-]+$/i.test(stap)
        ? "heeft een onboarding-stap afgerond ✅"
        : stap);

    const payload = {
      title: "⚡ ELEVA Team Update",
      body: `${naam} ${leesbaar}`,
      url: `/team?lid=${user.id}`,
      tag: "onboarding",
    };

    // 1. Stuur naar directe sponsor (als die bestaat)
    if (profile?.sponsor_id) {
      await sendPushToUser(profile.sponsor_id, payload);
    }

    // 2. Stuur naar alle leiders, maar sluit sponsor + user zelf uit
    //    zodat niemand een dubbele push krijgt.
    const exclusies = [profile?.sponsor_id, user.id].filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );
    await sendPushToLeiders(payload, exclusies);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding notificatie fout:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}

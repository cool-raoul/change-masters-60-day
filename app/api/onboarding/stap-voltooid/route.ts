import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToLeiders } from "@/lib/push/sendPush";

const STAP_NAMEN: Record<string, string> = {
  stap_1_welkom: "Stap 1: Welkom",
  stap_2_why: "Stap 2: WHY ingevuld",
  stap_3_app: "Stap 3: App geïnstalleerd",
  stap_4_namenlijst: "Stap 4: Namenlijst aangemaakt",
  stap_5_doelen: "Stap 5: Doelen bepaald",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { stap } = await request.json();

    if (!stap || !STAP_NAMEN[stap]) {
      return NextResponse.json({ error: "Ongeldige stap" }, { status: 400 });
    }

    // Haal naam op
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const naam = profile?.full_name || "Een teamlid";
    const stapNaam = STAP_NAMEN[stap];

    // Stuur push naar alle leiders
    await sendPushToLeiders({
      title: `🎉 ${naam} heeft ${stapNaam} voltooid!`,
      body: "Bekijk de voortgang van je team in de app.",
      url: "/team",
      tag: "onboarding",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding notificatie fout:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}

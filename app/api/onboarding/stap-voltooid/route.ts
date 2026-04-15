import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToLeiders } from "@/lib/push/sendPush";

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

    // Haal naam op
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const naam = profile?.full_name || "Een teamlid";

    // Stuur push naar sponsor + alle leiders
    await sendPushToLeiders({
      title: `✅ ${naam}: ${stap}`,
      body: "Tik om de voortgang van je team te bekijken.",
      url: "/team",
      tag: "onboarding",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding notificatie fout:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}

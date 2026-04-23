import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push/sendPush";

// Diagnostische endpoint: stuurt een test-push naar de ingelogde user.
// Gebruikt door de "Test push" knop in PushNotificationToggle.
// Doel: isoleren of het probleem in de push-send-pipeline zit
// (VAPID, subscription, device) of in de cron-logica.
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const resultaat = await sendPushToUser(user.id, {
      title: "ELEVA test ✓",
      body: "Als je dit ziet werkt push-send. Cron-logica is dan de volgende stap.",
      url: "/dashboard",
      tag: "eleva-test-push",
    });

    if (!resultaat.success) {
      return NextResponse.json(
        {
          success: false,
          reason: resultaat.reason || "Onbekende fout bij versturen",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Test push fout:", error);
    return NextResponse.json(
      { error: error?.message || "Server fout" },
      { status: 500 }
    );
  }
}

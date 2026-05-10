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

    const resultaat = (await sendPushToUser(user.id, {
      title: "ELEVA test ✓",
      body: "Als je dit ziet werkt push-send. Cron-logica is dan de volgende stap.",
      url: "/dashboard",
      tag: "eleva-test-push",
    })) as {
      success: boolean;
      reason?: string;
      statusCode?: number | null;
      body?: string | null;
      deactivated?: boolean;
    };

    if (!resultaat.success) {
      // Geef de échte FCM-status-code + body door zodat /diagnose precies
      // kan tonen wat er fout ging (403 = VAPID mismatch, 410 = endpoint
      // verlopen, etc). Anders blijft 't bij de generieke 'Received
      // unexpected response code' en weet je niet welke kant op te lopen.
      return NextResponse.json(
        {
          success: false,
          reason: resultaat.reason || "Onbekende fout bij versturen",
          statusCode: resultaat.statusCode ?? null,
          body: resultaat.body ?? null,
          deactivated: resultaat.deactivated ?? false,
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

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface PushMessage {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  badge_color?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
}

// Deze endpoint is voor server-side push (momenteel niet gebruikt)
// Later kunnen we deze aanroepen vanuit webhooks of scheduled tasks
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "leider") {
      return NextResponse.json(
        { error: "Alleen leiders kunnen notificaties versturen" },
        { status: 403 }
      );
    }

    const body: { user_id: string; message: PushMessage } = await request.json();

    // Haal push subscription op
    const { data: subscription } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", body.user_id)
      .single();

    if (!subscription || !subscription.is_active) {
      return NextResponse.json(
        { error: "Gebruiker heeft push notifications niet geactiveerd" },
        { status: 404 }
      );
    }

    // Verstuur push notification
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys niet geconfigureerd");
      return NextResponse.json(
        { error: "Push notifications niet geconfigureerd" },
        { status: 500 }
      );
    }

    try {
      const webpush = require("web-push");
      webpush.setVapidDetails(
        "mailto:raoul@changemasters.com",
        vapidPublicKey,
        vapidPrivateKey
      );

      const payload = JSON.stringify({
        title: body.message.title,
        body: body.message.body,
        url: body.message.url || "/dashboard",
        tag: body.message.tag || "notification",
        badge_color: body.message.badge_color,
        data: body.message.data || {},
        requireInteraction: body.message.requireInteraction || false,
      });

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload
      );

      // Update last_used_at
      await supabase
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .eq("user_id", body.user_id);

      return NextResponse.json({
        success: true,
        message: "Notificatie verstuurd",
      });
    } catch (webpushError: any) {
      console.error("Web push error:", webpushError);

      // Deactiveer subscription als het niet meer geldig is
      if (webpushError.statusCode === 410 || webpushError.statusCode === 404) {
        await supabase
          .from("push_subscriptions")
          .update({ is_active: false })
          .eq("user_id", body.user_id);
      }

      return NextResponse.json(
        { error: "Push fout: " + webpushError.message },
        { status: webpushError.statusCode || 500 }
      );
    }
  } catch (error) {
    console.error("Send endpoint error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

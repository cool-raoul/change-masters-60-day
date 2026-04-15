import { createAdminClient } from "@/lib/supabase/admin";

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabase = createAdminClient();

  const { data: subscription } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!subscription) return { success: false, reason: "Geen subscription" };

  const webpush = require("web-push");
  webpush.setVapidDetails(
    "mailto:raoul@changemasters.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/dashboard",
        tag: payload.tag || "notificatie",
      })
    );

    await supabase
      .from("push_subscriptions")
      .update({ last_used_at: new Date().toISOString() })
      .eq("user_id", userId);

    return { success: true };
  } catch (error: any) {
    // Deactiveer verlopen subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      await supabase
        .from("push_subscriptions")
        .update({ is_active: false })
        .eq("user_id", userId);
    }
    return { success: false, reason: error.message };
  }
}

export async function sendPushToLeiders(payload: PushPayload) {
  const supabase = createAdminClient();

  const { data: leiders } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "leider");

  if (!leiders) return;

  for (const leider of leiders) {
    await sendPushToUser(leider.id, payload);
  }
}

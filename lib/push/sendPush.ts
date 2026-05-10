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
    // Deactiveer alleen subscriptions die door de push-service als ECHT DOOD
    // zijn gemarkeerd. 410 = Gone (browser unsubscribed of permission
    // ingetrokken), 404 = Not Found (endpoint bestaat niet meer). Daar wil je
    // 'm uit zetten, want elke nieuwe poging is verspilling.
    //
    // 401/403 NIET deactiveren: dat zijn server-config fouten (VAPID
    // public/private mismatch, verkeerde subject, etc). Subscriptions zijn
    // dan prima, maar onze server tekent verkeerd. Auto-deactivatie zou alle
    // gezonde subs killen na één foute deploy.
    //
    // 'Received unexpected response code' (zonder statusCode) is een generic
    // web-push error — meestal óók een config-issue (network, malformed
    // payload), dus laten we 'm staan.
    const statusCode = error.statusCode as number | undefined;
    const body =
      typeof error.body === "string"
        ? error.body
        : error.body
          ? JSON.stringify(error.body)
          : null;
    const msg = String(error.message ?? "");
    const moetDeactiveren = statusCode === 410 || statusCode === 404;
    if (moetDeactiveren) {
      await supabase
        .from("push_subscriptions")
        .update({ is_active: false })
        .eq("user_id", userId);
    }
    return {
      success: false,
      reason: msg || `HTTP ${statusCode ?? "onbekend"}`,
      statusCode: statusCode ?? null,
      body,
      deactivated: moetDeactiveren,
    };
  }
}

export async function sendPushToLeiders(
  payload: PushPayload,
  excludeUserIds: string[] = []
) {
  const supabase = createAdminClient();

  const { data: leiders } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "leider");

  if (!leiders) return;

  for (const leider of leiders) {
    if (excludeUserIds.includes(leider.id)) continue;
    await sendPushToUser(leider.id, payload);
  }
}

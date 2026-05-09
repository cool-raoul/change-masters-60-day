import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Push-helper voor prospects in mini-ELEVA.
//
// Prospect heeft GEEN auth.users-record, dus we kunnen de bestaande
// sendPushToUser() niet gebruiken. Push-subscriptions van prospects
// zitten in mini_eleva_prospect_subscriptions (gekoppeld aan
// invitation_id, niet user_id).
//
// Een prospect kan meerdere endpoints hebben (telefoon + tablet),
// dus we sturen naar elke actieve subscription voor de uitnodiging.
// ============================================================

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushToProspect(
  invitationId: string,
  payload: PushPayload,
): Promise<{ verzonden: number; mislukt: number }> {
  const supabase = createAdminClient();

  const { data: subs } = await supabase
    .from("mini_eleva_prospect_subscriptions")
    .select("*")
    .eq("invitation_id", invitationId)
    .eq("is_active", true);

  if (!subs || subs.length === 0) {
    return { verzonden: 0, mislukt: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const webpush = require("web-push");
  webpush.setVapidDetails(
    "mailto:raoul@changemasters.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  let verzonden = 0;
  let mislukt = 0;

  type SubRow = {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  };

  for (const subRaw of subs) {
    const sub = subRaw as SubRow;
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url || "/",
          tag: payload.tag || "mini-eleva",
        }),
      );
      verzonden++;
      await supabase
        .from("mini_eleva_prospect_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", sub.id);
    } catch (e: unknown) {
      mislukt++;
      const err = e as { statusCode?: number; message?: string };
      // 404/410 = endpoint dood, deactiveer
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from("mini_eleva_prospect_subscriptions")
          .update({ is_active: false })
          .eq("id", sub.id);
      }
    }
  }

  return { verzonden, mislukt };
}

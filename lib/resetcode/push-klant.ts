import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Web-push naar een Resetcode-klant (geen account; abonnementen
// in resetcode_klant_subscriptions per link). Zelfde aanpak als
// mini-ELEVA. Klaar voor de ochtend-check-in-cron en fase-momenten.
// ============================================================

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushNaarKlant(
  linkId: string,
  payload: PushPayload,
): Promise<{ verzonden: number; mislukt: number }> {
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("resetcode_klant_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("link_id", linkId)
    .eq("is_active", true);
  if (!subs || subs.length === 0) return { verzonden: 0, mislukt: 0 };

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const webpush = require("web-push");
  webpush.setVapidDetails(
    "mailto:raoul@changemasters.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  let verzonden = 0;
  let mislukt = 0;
  for (const s of subs as {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  }[]) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      );
      verzonden++;
    } catch (e: unknown) {
      mislukt++;
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await admin
          .from("resetcode_klant_subscriptions")
          .update({ is_active: false })
          .eq("id", s.id);
      }
    }
  }
  return { verzonden, mislukt };
}

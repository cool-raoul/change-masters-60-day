import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/push-subscribe
//
// Web-push-abonnement voor een Resetcode-klant (geen account,
// token-auth). Zelfde patroon als mini-ELEVA. Wordt gebruikt voor
// de ochtend-check-in-herinnering en fase-momenten.
//
// Body: { token, subscription: { endpoint, keys:{ p256dh, auth } } }
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const subscription = body.subscription as
    | { endpoint: string; keys: { p256dh: string; auth: string } }
    | undefined;
  if (!token || !subscription?.endpoint) {
    return Response.json({ error: "token en subscription vereist" }, { status: 400 });
  }

  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status === "gesloten") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("resetcode_klant_subscriptions").upsert(
    {
      link_id: ctx.linkId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: req.headers.get("user-agent") ?? "",
      is_active: true,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: "link_id,endpoint" },
  );
  if (error) {
    console.error("resetcode push-subscribe:", error.message);
    return Response.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
  return Response.json({ ok: true });
}

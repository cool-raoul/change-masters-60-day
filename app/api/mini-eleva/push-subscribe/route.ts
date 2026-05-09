import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakMiniElevaContext } from "@/lib/mini-eleva/helpers";

// ============================================================
// /api/mini-eleva/push-subscribe
//
// Push-subscribe-endpoint voor prospects. Prospects hebben geen
// auth-account, dus we authenticeren via het mini-ELEVA-token in
// de body en koppelen het abonnement aan invitation_id.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const subscription = body.subscription as
      | {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        }
      | undefined;

    if (!token || !subscription?.endpoint) {
      return NextResponse.json(
        { error: "token en subscription vereist" },
        { status: 400 },
      );
    }

    const ctx = await pakMiniElevaContext(token);
    if (!ctx) {
      return NextResponse.json({ error: "Ongeldige link" }, { status: 401 });
    }
    if (ctx.isVerlopen) {
      return NextResponse.json({ error: "Verlopen" }, { status: 410 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("mini_eleva_prospect_subscriptions")
      .upsert(
        {
          invitation_id: ctx.invitationId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: req.headers.get("user-agent") ?? "",
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "invitation_id,endpoint" },
      );

    if (error) {
      console.error(
        "[mini-eleva/push-subscribe] error:",
        error.message,
      );
      return NextResponse.json(
        { error: "Opslaan mislukt: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const endpoint = body.endpoint as string | undefined;

    if (!token || !endpoint) {
      return NextResponse.json(
        { error: "token en endpoint vereist" },
        { status: 400 },
      );
    }

    const ctx = await pakMiniElevaContext(token);
    if (!ctx) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    await admin
      .from("mini_eleva_prospect_subscriptions")
      .delete()
      .eq("invitation_id", ctx.invitationId)
      .eq("endpoint", endpoint);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mini-eleva/markeer-gelezen
//
// Werkt het lees-stempel bij voor alle uitnodigingen van deze
// member voor één prospect (of één specifieke uitnodiging).
//
// Body:
//   - { prospectId: string }   alle uitnodigingen voor deze prospect
//   - { invitationId: string } alleen die ene
//
// Effect: ongelezen-teller op /mijn-chats reset omdat we de
// laatst-gelezen-stempel naar nu zetten.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const prospectId = body.prospectId as string | undefined;
    const invitationId = body.invitationId as string | undefined;

    if (!prospectId && !invitationId) {
      return NextResponse.json(
        { error: "prospectId of invitationId vereist" },
        { status: 400 },
      );
    }

    // Verzamel invitation-IDs waar deze member eigenaar van is
    let invIds: string[] = [];
    if (invitationId) {
      const { data: inv } = await supabase
        .from("prospect_invitations")
        .select("id")
        .eq("id", invitationId)
        .eq("member_user_id", user.id)
        .maybeSingle();
      if (inv) invIds = [(inv as { id: string }).id];
    } else if (prospectId) {
      const { data: invs } = await supabase
        .from("prospect_invitations")
        .select("id")
        .eq("prospect_id", prospectId)
        .eq("member_user_id", user.id);
      invIds = ((invs as { id: string }[] | null) ?? []).map((r) => r.id);
    }

    if (invIds.length === 0) {
      return NextResponse.json({ ok: true, gemarkeerd: 0 });
    }

    const nu = new Date().toISOString();

    // Upsert per invitation-ID. Constraint heeft user_id + prospect_token,
    // voor leden zetten we prospect_token op null. Supabase upsert met
    // onConflict op de samengestelde unique-constraint.
    const rijen = invIds.map((id) => ({
      invitation_id: id,
      user_id: user.id,
      prospect_token: null,
      laatst_gelezen_op: nu,
    }));

    const { error } = await supabase
      .from("mini_eleva_leeskenmerk")
      .upsert(rijen, {
        onConflict: "invitation_id,user_id,prospect_token",
      });

    if (error) {
      console.error("[markeer-gelezen] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, gemarkeerd: invIds.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

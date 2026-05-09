import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// PATCH /api/mini-eleva/uitnodiging/sponsor
//
// Wijzigt de gekoppelde sponsor van een BESTAANDE mini-ELEVA-
// uitnodiging. Past in scenario "ik had eigenlijk Henk erbij moeten
// halen ipv Patrick" of "mijn directe sponsor is nog niet ervaren
// genoeg, ik wil hoger in de upline kiezen".
//
// Body: { invitationId: string, sponsorUserId: string | null }
//   - sponsorUserId = null → geen sponsor (alleen prospect + member)
//
// Beveiliging:
//   - Alleen ingelogde members
//   - Alleen de eigenaar van de uitnodiging kan wijzigen
//   - sponsorUserId moet bestaan in jouw upline-keten (anti-misbruik,
//     zelfde verificatie als bij maken van een uitnodiging)
// ============================================================

const MAX_NIVEAUS = 5;

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const invitationId = body.invitationId as string | undefined;
    const sponsorUserId = body.sponsorUserId as string | null | undefined;

    if (!invitationId) {
      return NextResponse.json(
        { error: "invitationId vereist" },
        { status: 400 },
      );
    }

    // Verifieer ownership
    const { data: inv } = await supabase
      .from("prospect_invitations")
      .select("id, member_user_id")
      .eq("id", invitationId)
      .maybeSingle();
    if (!inv) {
      return NextResponse.json(
        { error: "Uitnodiging niet gevonden" },
        { status: 404 },
      );
    }
    if ((inv as { member_user_id: string }).member_user_id !== user.id) {
      return NextResponse.json(
        { error: "Geen toegang tot deze uitnodiging" },
        { status: 403 },
      );
    }

    // Verifieer dat sponsorUserId in jouw upline-keten zit (of null)
    let nieuweSponsorId: string | null = null;
    if (sponsorUserId) {
      const gezien = new Set<string>([user.id]);
      let huidigeId = user.id;
      let bevestigd = false;
      for (let n = 0; n < MAX_NIVEAUS; n++) {
        const { data: stap } = await supabase
          .from("profiles")
          .select("sponsor_id")
          .eq("id", huidigeId)
          .maybeSingle();
        const next = (stap as { sponsor_id?: string | null } | null)
          ?.sponsor_id;
        if (!next || gezien.has(next)) break;
        gezien.add(next);
        if (next === sponsorUserId) {
          bevestigd = true;
          break;
        }
        huidigeId = next;
      }
      if (!bevestigd) {
        return NextResponse.json(
          { error: "Gekozen sponsor zit niet in jouw upline-keten" },
          { status: 400 },
        );
      }
      nieuweSponsorId = sponsorUserId;
    }

    const { error } = await supabase
      .from("prospect_invitations")
      .update({ sponsor_user_id: nieuweSponsorId })
      .eq("id", invitationId)
      .eq("member_user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      sponsor_user_id: nieuweSponsorId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";

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

    // Verifieer ownership + haal context op voor de notificatie
    const { data: inv } = await supabase
      .from("prospect_invitations")
      .select("id, member_user_id, prospect_id, sponsor_user_id")
      .eq("id", invitationId)
      .maybeSingle();
    if (!inv) {
      return NextResponse.json(
        { error: "Uitnodiging niet gevonden" },
        { status: 404 },
      );
    }
    type InvRow = {
      id: string;
      member_user_id: string;
      prospect_id: string;
      sponsor_user_id: string | null;
    };
    const invRow = inv as InvRow;
    if (invRow.member_user_id !== user.id) {
      return NextResponse.json(
        { error: "Geen toegang tot deze uitnodiging" },
        { status: 403 },
      );
    }
    const oudeSponsorId = invRow.sponsor_user_id;

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

    // Notificeer de NIEUWE sponsor (in-app + push) als er een nieuwe is
    // toegevoegd of er gewisseld is naar een andere sponsor. Niet bij
    // verwijderen of bij hetzelfde laten.
    if (nieuweSponsorId && nieuweSponsorId !== oudeSponsorId) {
      try {
        const admin = createAdminClient();

        // Member-naam + prospect-naam ophalen voor de tekst
        const [{ data: memberProfile }, { data: prospectRow }] =
          await Promise.all([
            admin
              .from("profiles")
              .select("full_name")
              .eq("id", user.id)
              .maybeSingle(),
            admin
              .from("prospects")
              .select("volledige_naam")
              .eq("id", invRow.prospect_id)
              .maybeSingle(),
          ]);
        const memberNaam =
          (memberProfile as { full_name?: string } | null)?.full_name ??
          "een member";
        const prospectNaam =
          (prospectRow as { volledige_naam?: string } | null)
            ?.volledige_naam ?? "een prospect";
        const memberVoornaam = memberNaam.split(" ")[0] || memberNaam;
        const prospectVoornaam =
          prospectNaam.split(" ")[0] || prospectNaam;

        // In-app notificatie (verschijnt op /mijn-chats banner + sidebar)
        await admin.from("mini_eleva_notificaties").insert({
          invitation_id: invitationId,
          ontvanger_user_id: nieuweSponsorId,
          type: "haal-erbij",
          titel: `${memberVoornaam} heeft je toegevoegd aan een chat met ${prospectVoornaam}`,
          detail: "Open de chat om mee te lezen en te reageren",
        });

        // Push naar de nieuwe sponsor (faalt stilletjes als geen push aan)
        await sendPushToUser(nieuweSponsorId, {
          title: `${memberVoornaam} haalt je erbij`,
          body: `Toegevoegd aan een Mini-ELEVA-chat met ${prospectVoornaam}`,
          url: `/sponsor/mini-eleva/${invitationId}`,
          tag: `mini-eleva-sponsor-toegevoegd-${invitationId}`,
        }).catch((e) => {
          console.warn("[wissel-sponsor] push faalde:", e?.message ?? e);
        });
      } catch (e) {
        console.warn("[wissel-sponsor] notificatie-fout:", e);
        // Niet falen op de hoofdactie, sponsor is succesvol gekoppeld
      }
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

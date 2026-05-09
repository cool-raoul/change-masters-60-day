import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mini-eleva/verleng
//
// Member verlengt een mini-ELEVA-uitnodiging met X dagen. Default
// 14 dagen. Voor situaties waar prospect tijd nodig had en nog niet
// klaar is met kijken/beslissen.
//
// Body: { invitationId: string, dagen?: number }
//
// Beveiliging:
//   - Alleen ingelogde members
//   - Alleen eigenaar van de uitnodiging mag verlengen (RLS-policy
//     en server-side check)
//   - Max 3 verlengingen per uitnodiging om "eindeloos kauwen" te
//     voorkomen (past bij beslissingsmoment-filosofie)
// ============================================================

const MAX_VERLENGINGEN = 3;
const STANDAARD_DAGEN = 14;

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
    const invitationId = body.invitationId as string | undefined;
    const dagen =
      typeof body.dagen === "number" && body.dagen >= 1 && body.dagen <= 30
        ? body.dagen
        : STANDAARD_DAGEN;

    if (!invitationId) {
      return NextResponse.json(
        { error: "invitationId vereist" },
        { status: 400 },
      );
    }

    // Haal huidige uitnodiging op + verifieer ownership
    const { data: huidig } = await supabase
      .from("prospect_invitations")
      .select("id, member_user_id, expires_at, aantal_verlengd, status")
      .eq("id", invitationId)
      .maybeSingle();

    if (!huidig) {
      return NextResponse.json(
        { error: "Uitnodiging niet gevonden" },
        { status: 404 },
      );
    }

    type InvitationRow = {
      id: string;
      member_user_id: string;
      expires_at: string;
      aantal_verlengd: number | null;
      status: string;
    };
    const inv = huidig as InvitationRow;

    if (inv.member_user_id !== user.id) {
      return NextResponse.json(
        { error: "Geen toegang tot deze uitnodiging" },
        { status: 403 },
      );
    }

    const aantalNu = inv.aantal_verlengd ?? 0;
    if (aantalNu >= MAX_VERLENGINGEN) {
      return NextResponse.json(
        {
          error: `Je hebt deze uitnodiging al ${MAX_VERLENGINGEN}x verlengd. Tijd voor een direct gesprek met de prospect, of maak een nieuwe uitnodiging aan als 'r een vers begin nodig is.`,
        },
        { status: 429 },
      );
    }

    // Bereken nieuwe expires_at: vanaf NU, niet vanaf oude expires_at,
    // zodat een al verlopen uitnodiging weer 14 dagen geldig wordt
    // (anders zou je een verlopen uitnodiging "verlengen" naar nog
    // steeds verleden = nutteloos)
    const nu = new Date();
    const huidigeExpires = new Date(inv.expires_at);
    const beginVanaf = huidigeExpires > nu ? huidigeExpires : nu;
    const nieuweExpires = new Date(
      beginVanaf.getTime() + dagen * 24 * 60 * 60 * 1000,
    );

    const { error: updateErr } = await supabase
      .from("prospect_invitations")
      .update({
        expires_at: nieuweExpires.toISOString(),
        aantal_verlengd: aantalNu + 1,
        laatst_verlengd_op: nu.toISOString(),
        // Reset status naar 'actief' als 'ie verlopen was, anders
        // ongewijzigd laten
        status: inv.status === "verlopen" ? "actief" : inv.status,
      })
      .eq("id", invitationId)
      .eq("member_user_id", user.id);

    if (updateErr) {
      console.error("verleng-uitnodiging error:", updateErr.message);
      return NextResponse.json(
        { error: "Verlengen mislukt: " + updateErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      nieuwe_expires_at: nieuweExpires.toISOString(),
      aantal_verlengd: aantalNu + 1,
      max_verlengingen: MAX_VERLENGINGEN,
      dagen_toegevoegd: dagen,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("verleng exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

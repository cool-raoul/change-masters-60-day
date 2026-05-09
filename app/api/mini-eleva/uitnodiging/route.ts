import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mini-eleva/uitnodiging
//
// Body: { prospectId: string }
//
// Maakt een nieuwe mini-ELEVA-uitnodiging voor de gegeven prospect.
// Genereert een uniek token (lange random string) en zet expiratie
// op 72u vanaf nu. Geeft de deelbare URL terug zodat de member 'm
// kan kopieren of doorsturen via WhatsApp.
//
// Sponsor wordt automatisch gekoppeld op basis van profiles.sponsor_id
// van de member, zodat sponsor later in de chat kan komen.
//
// RLS-policy zorgt dat alleen de eigenaar van de prospect een
// uitnodiging kan maken.
// ============================================================

function genereerToken(): string {
  // 32 hex-karakters via crypto.randomUUID() x2, ruim genoeg uniek
  const a = crypto.randomUUID().replace(/-/g, "");
  const b = crypto.randomUUID().replace(/-/g, "");
  return (a + b).substring(0, 40);
}

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
    if (!prospectId) {
      return NextResponse.json({ error: "prospectId vereist" }, { status: 400 });
    }

    // Controleer dat prospect van deze user is
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, user_id, volledige_naam")
      .eq("id", prospectId)
      .maybeSingle();
    if (!prospect || (prospect as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { error: "Prospect niet gevonden of geen toegang" },
        { status: 404 },
      );
    }

    // Sponsor van de huidige member ophalen, zodat hij in de chat kan komen
    const { data: profile } = await supabase
      .from("profiles")
      .select("sponsor_id")
      .eq("id", user.id)
      .maybeSingle();
    const sponsorId = (profile as { sponsor_id?: string | null } | null)
      ?.sponsor_id ?? null;

    const token = genereerToken();
    const nu = new Date();
    const expires = new Date(nu.getTime() + 72 * 60 * 60 * 1000);

    const { data: nieuw, error } = await supabase
      .from("prospect_invitations")
      .insert({
        prospect_id: prospectId,
        member_user_id: user.id,
        sponsor_user_id: sponsorId,
        token,
        expires_at: expires.toISOString(),
        status: "actief",
      })
      .select("id, token, expires_at")
      .maybeSingle();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error:
              "Mini-ELEVA-tabellen bestaan nog niet. Vraag founder om migratie mini_eleva.sql te draaien in Supabase.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "Aanmaken mislukt: " + error.message },
        { status: 500 },
      );
    }

    // Bouw deelbare URL op basis van app-URL of huidige host
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      `https://${req.headers.get("host")}`;
    const deelLink = `${origin}/m/${token}`;

    return NextResponse.json({
      ok: true,
      id: (nieuw as { id?: string } | null)?.id ?? null,
      token,
      expires_at: (nieuw as { expires_at?: string } | null)?.expires_at ?? null,
      deelLink,
      prospectNaam: (prospect as { volledige_naam: string }).volledige_naam,
    });
  } catch (e) {
    console.error("mini-eleva/uitnodiging exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

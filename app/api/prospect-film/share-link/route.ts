import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "node:crypto";

// ============================================================
// POST /api/prospect-film/share-link
//
// Body: { prospectId: string, filmSlug: string }
// Returnt: { token, url, hergebruikt }
//
// Genereert (of hergebruikt) een unieke share-token voor de combinatie
// (member, prospect, film). Als er al een view-rij bestaat met dezelfde
// 3-tuple en NIET-afgekeken status, geven we die terug zodat één
// prospect niet 5 verschillende links voor dezelfde film krijgt.
// ============================================================

function genereerToken(): string {
  // 24 bytes = 32 base64url-chars. Genoeg entropie en korte URL.
  return randomBytes(24).toString("base64url");
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

    const body = await req.json();
    const prospectId: string | undefined = body.prospectId;
    const filmSlug: string | undefined = body.filmSlug;
    if (!prospectId || !filmSlug) {
      return NextResponse.json(
        { error: "prospectId en filmSlug zijn verplicht" },
        { status: 400 },
      );
    }

    // Validatie: hoort deze prospect bij de ingelogde member?
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, user_id")
      .eq("id", prospectId)
      .maybeSingle();
    if (!prospect || (prospect as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { error: "Prospect niet gevonden of geen toegang" },
        { status: 403 },
      );
    }

    // Bestaande open view (zelfde combinatie, nog niet afgekeken) → hergebruiken.
    const { data: bestaande } = await supabase
      .from("prospect_film_views")
      .select("share_token")
      .eq("prospect_id", prospectId)
      .eq("member_user_id", user.id)
      .eq("film_slug", filmSlug)
      .is("afgekeken_op", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const origin = req.headers.get("origin") || req.nextUrl.origin;

    if (bestaande) {
      const token = (bestaande as { share_token: string }).share_token;
      return NextResponse.json({
        token,
        url: `${origin}/prospect-film/${token}`,
        hergebruikt: true,
      });
    }

    // Nieuwe rij aanmaken
    const token = genereerToken();
    const { error: insertError } = await supabase
      .from("prospect_film_views")
      .insert({
        share_token: token,
        prospect_id: prospectId,
        member_user_id: user.id,
        film_slug: filmSlug,
      });
    if (insertError) {
      return NextResponse.json(
        { error: "Aanmaken mislukt: " + insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      url: `${origin}/prospect-film/${token}`,
      hergebruikt: false,
    });
  } catch (e) {
    console.error("share-link exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/productadvies-test/open-link
//   Geeft het open-template-token van de member terug. Maakt aan als
//   nog niet aanwezig.
//
// POST /api/productadvies-test/open-link/regenereer
//   Maakt een nieuw token aan (oude wordt verwijderd, oude links werken
//   niet meer). Gebruik bij compromittering of als member een schone
//   start wil voor een nieuwe campagne.
// ============================================================

function genereerToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "open-";
  for (let i = 0; i < 14; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Bestaande open template ophalen
    const { data: bestaande } = await supabase
      .from("productadvies_tests")
      .select("token")
      .eq("member_id", user.id)
      .eq("is_open_template", true)
      .maybeSingle();

    if (bestaande) {
      return NextResponse.json({
        token: bestaande.token,
        url: `/test/${bestaande.token}`,
        bestaand: true,
      });
    }

    // Maak nieuwe template aan
    let token = genereerToken();
    for (let pogingen = 0; pogingen < 5; pogingen++) {
      const { data: collision } = await supabase
        .from("productadvies_tests")
        .select("id")
        .eq("token", token)
        .maybeSingle();
      if (!collision) break;
      token = genereerToken();
    }

    const { error: insertErr } = await supabase
      .from("productadvies_tests")
      .insert({
        token,
        member_id: user.id,
        prospect_id: null,
        is_open_template: true,
        status: "verstuurd", // template-status, wordt nooit ingevuld
      });

    if (insertErr) {
      console.error("Open template aanmaken mislukt:", insertErr);
      return NextResponse.json(
        { error: "Aanmaken mislukt: " + insertErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      url: `/test/${token}`,
      bestaand: false,
    });
  } catch (e) {
    console.error("Open-link exception:", e);
    return NextResponse.json(
      { error: "Onverwachte fout" },
      { status: 500 },
    );
  }
}

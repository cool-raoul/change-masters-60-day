import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/productadvies-test/maak-aan
//
// Maakt een nieuwe productadvies-test aan voor een prospect.
// Genereert een uniek token dat in de URL gaat: /test/[token]
//
// Body: { prospectId: string, isSixtyDay?: boolean }
// Response: { token, url }
// ============================================================

function genereerToken(): string {
  // 32-tekens random hex token
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
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
    const prospectId: string = body.prospectId;
    const isSixtyDay: boolean = body.isSixtyDay ?? false;

    if (!prospectId) {
      return NextResponse.json(
        { error: "prospectId ontbreekt" },
        { status: 400 },
      );
    }

    // Verifieer dat de prospect van deze member is
    const { data: prospect, error: prospectErr } = await supabase
      .from("prospects")
      .select("id, volledige_naam")
      .eq("id", prospectId)
      .eq("user_id", user.id)
      .single();

    if (prospectErr || !prospect) {
      return NextResponse.json(
        { error: "Prospect niet gevonden of niet van jou" },
        { status: 404 },
      );
    }

    // Check of er al een test bestaat met status verstuurd
    const { data: bestaande } = await supabase
      .from("productadvies_tests")
      .select("id, token, status")
      .eq("prospect_id", prospectId)
      .eq("member_id", user.id)
      .eq("status", "verstuurd")
      .maybeSingle();

    if (bestaande) {
      // Hergebruik bestaand token
      return NextResponse.json({
        token: bestaande.token,
        url: `/test/${bestaande.token}`,
        nieuw: false,
      });
    }

    // Genereer nieuw token (probeer max 5x in geval van collision)
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

    // Maak nieuwe test aan
    const { error: insertErr } = await supabase
      .from("productadvies_tests")
      .insert({
        token,
        member_id: user.id,
        prospect_id: prospectId,
        // Member kiest of het 60-day-flow is. Wordt opgeslagen als trigger_60day
        // bij submit van de test, niet hier (anders zou prospect het kunnen zien
        // in URL-state). Hier alleen meta in een veld dat de UI later kan checken.
        trigger_60day: isSixtyDay ? "ja" : "nee",
        status: "verstuurd",
      });

    if (insertErr) {
      console.error("Test maken mislukt:", insertErr);
      return NextResponse.json(
        { error: "Test aanmaken mislukt" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      url: `/test/${token}`,
      nieuw: true,
    });
  } catch (e) {
    console.error("Maak-aan exception:", e);
    return NextResponse.json(
      { error: "Onverwachte fout" },
      { status: 500 },
    );
  }
}

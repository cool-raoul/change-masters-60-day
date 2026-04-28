import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/productadvies-test/open-intake
//
// Wordt aangeroepen wanneer iemand een open testlink invult op de eerste
// stap (naam + telefoon/email). Maakt:
//   1. Een nieuwe prospect-rij in de namenlijst van de member
//   2. Een nieuwe productadvies_tests rij gekoppeld aan die prospect
//   3. Geeft het nieuwe token terug zodat de prospect doorgeleid wordt
//      naar zijn persoonlijke vragenlijst
//
// Geen auth: prospect heeft alleen het template-token.
// ============================================================

function genereerToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      templateToken,
      naam,
      telefoon,
      email,
    }: {
      templateToken: string;
      naam: string;
      telefoon: string | null;
      email: string | null;
    } = body;

    if (!templateToken || !naam || naam.trim().length < 2) {
      return NextResponse.json(
        { error: "Naam en template-token zijn verplicht" },
        { status: 400 },
      );
    }
    if (!telefoon && !email) {
      return NextResponse.json(
        { error: "Telefoonnummer of email is verplicht" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Validatie: bestaat dit template?
    const { data: template, error: templateErr } = await supabase
      .from("productadvies_tests")
      .select("id, member_id, is_open_template")
      .eq("token", templateToken)
      .eq("is_open_template", true)
      .maybeSingle();

    if (templateErr || !template) {
      return NextResponse.json(
        { error: "Open testlink niet gevonden of verlopen" },
        { status: 404 },
      );
    }

    // Maak prospect aan in de namenlijst van de member
    const { data: nieuweProspect, error: prospectErr } = await supabase
      .from("prospects")
      .insert({
        user_id: template.member_id,
        volledige_naam: naam.trim(),
        telefoon: telefoon || null,
        email: email || null,
        pipeline_fase: "prospect",
        prioriteit: "normaal",
        bron: "social",
        notities: "Aangemaakt via open testlink (vragenlijst)",
      })
      .select("id")
      .single();

    if (prospectErr || !nieuweProspect) {
      console.error("Prospect aanmaken mislukt:", prospectErr);
      return NextResponse.json(
        { error: "Aanmaken prospect mislukt: " + prospectErr?.message },
        { status: 500 },
      );
    }

    // Genereer uniek token voor deze persoonlijke vragenlijst
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

    // Maak persoonlijke vragenlijst-rij aan
    const { error: testErr } = await supabase
      .from("productadvies_tests")
      .insert({
        token,
        member_id: template.member_id,
        prospect_id: nieuweProspect.id,
        trigger_60day: "nee",
        status: "verstuurd",
        is_open_template: false,
      });

    if (testErr) {
      console.error("Test aanmaken mislukt:", testErr);
      return NextResponse.json(
        { error: "Vragenlijst aanmaken mislukt" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      url: `/test/${token}`,
    });
  } catch (e) {
    console.error("Open-intake exception:", e);
    return NextResponse.json(
      { error: "Onverwachte fout" },
      { status: 500 },
    );
  }
}

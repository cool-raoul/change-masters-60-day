import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { berekenDarmUitslag } from "@/lib/zelftest/darm-vragen";

// ============================================================
// POST /api/productadvies-test/darm-submit
//
// Vervolgvragenlijst-submit voor de darmvragenlijst.
// Privacy-by-design: server berekent bucket, slaat ALLEEN uitslag op,
// individuele antwoorden gaan niet in de DB.
//
// Body:
//   { token: string, antwoorden: Record<vraag_id, 0|1|2|3> }
//
// Voorwaarde: er moet al een productadvies_tests rij bestaan met deze
// token. Dat is de rij waarvan de prospect de hoofd-vragenlijst al heeft
// ingevuld (status='ingevuld').
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      antwoorden,
    }: {
      token: string;
      antwoorden: Record<string, number>;
    } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token ontbreekt" }, { status: 400 });
    }
    if (!antwoorden || typeof antwoorden !== "object") {
      return NextResponse.json(
        { error: "Antwoorden ontbreken" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Bestaat de hoofdvragenlijst?
    const { data: test, error: testErr } = await supabase
      .from("productadvies_tests")
      .select("id, token, status, member_id, prospect_id")
      .eq("token", token)
      .maybeSingle();

    if (testErr || !test) {
      return NextResponse.json(
        { error: "Vragenlijst niet gevonden" },
        { status: 404 },
      );
    }

    // Bereken bucket op de server (privacy: client kan output niet beïnvloeden)
    const uitslag = berekenDarmUitslag(antwoorden);

    // Sla alleen uitslag op
    const { error: updErr } = await supabase
      .from("productadvies_tests")
      .update({
        darmvragenlijst_uitslag: uitslag,
        darmvragenlijst_ingevuld_op: new Date().toISOString(),
      })
      .eq("id", test.id);

    if (updErr) {
      console.error("Darmvragenlijst opslaan mislukt:", updErr);
      return NextResponse.json(
        { error: "Opslaan mislukt: " + updErr.message },
        { status: 500 },
      );
    }

    // Member-notificatie als er een prospect bekend is. Iedereen krijgt
    // een advies (basis of plus), dus elke ingevulde vragenlijst is
    // actiebaar voor de member.
    if (test.prospect_id && test.member_id) {
      let prospectNaam = "een prospect";
      const { data: prospect } = await supabase
        .from("prospects")
        .select("volledige_naam")
        .eq("id", test.prospect_id)
        .single();
      if (prospect?.volledige_naam) {
        prospectNaam = prospect.volledige_naam;
      }

      await supabase.from("herinneringen").insert({
        user_id: test.member_id,
        prospect_id: test.prospect_id,
        titel: `Darmvragenlijst ingevuld: ${uitslag.bucket_label}`,
        type: "followup",
        vervaldatum: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        voltooid: false,
      });

      // Live push naar de telefoon van de member.
      await sendPushToUser(test.member_id, {
        title: `${prospectNaam} heeft de darmvragenlijst ingevuld`,
        body: `Uitkomst: ${uitslag.bucket_label}. Tik om de prospect-kaart te openen.`,
        url: `/namenlijst/${test.prospect_id}`,
        tag: `darmvragenlijst-${test.prospect_id}`,
      });
    }

    return NextResponse.json({ uitslag });
  } catch (e) {
    console.error("Darm-submit exception:", e);
    return NextResponse.json(
      { error: "Onverwachte fout" },
      { status: 500 },
    );
  }
}

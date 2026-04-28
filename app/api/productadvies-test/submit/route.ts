import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  berekenUitslag,
  type ZelftestAntwoorden,
  type Antwoord,
  type Trigger60Day,
  type Geslacht,
} from "@/lib/zelftest/vragen";

// ============================================================
// POST /api/productadvies-test/submit
//
// Privacy-by-design: ontvangt antwoorden, berekent uitslag,
// slaat ALLEEN de uitslag op (niet de individuele scores).
// Geen authentication: prospect heeft alleen de token uit de URL.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      trigger60day,
      geslacht,
      avg_akkoord,
      responses,
    }: {
      token: string;
      trigger60day: Trigger60Day;
      geslacht: Geslacht;
      avg_akkoord: boolean;
      responses: Record<string, Antwoord>;
    } = body;

    // Validatie
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token ontbreekt" }, { status: 400 });
    }
    if (!avg_akkoord) {
      return NextResponse.json(
        { error: "AVG-akkoord is verplicht voordat we het advies tonen" },
        { status: 400 },
      );
    }
    const triggerOK: Trigger60Day[] = ["ja", "nee", "weet_niet"];
    if (!triggerOK.includes(trigger60day)) {
      return NextResponse.json(
        { error: "Ongeldige trigger-vraag-waarde" },
        { status: 400 },
      );
    }
    const geslachtOK: Geslacht[] = ["vrouw", "man", "zeg-niet"];
    if (!geslachtOK.includes(geslacht)) {
      return NextResponse.json(
        { error: "Ongeldige geslacht-waarde" },
        { status: 400 },
      );
    }
    if (!responses || typeof responses !== "object") {
      return NextResponse.json(
        { error: "Antwoorden ontbreken" },
        { status: 400 },
      );
    }

    // Admin client want prospect heeft geen auth-sessie
    const supabase = createAdminClient();

    // Test ophalen op basis van token
    const { data: test, error: fetchErr } = await supabase
      .from("productadvies_tests")
      .select("id, status, trigger_60day, member_id, prospect_id")
      .eq("token", token)
      .single();

    if (fetchErr || !test) {
      return NextResponse.json(
        { error: "Test niet gevonden of verlopen" },
        { status: 404 },
      );
    }

    if (test.status === "ingevuld") {
      return NextResponse.json(
        { error: "Deze test is al ingevuld" },
        { status: 409 },
      );
    }

    // De trigger_60day wordt door de MEMBER ingesteld bij maak-aan, niet door
    // de prospect. We respecteren de bestaande waarde uit de DB i.p.v. de
    // (nu hardcoded) waarde uit de prospect-form.
    const echteTrigger: Trigger60Day =
      (test.trigger_60day as Trigger60Day) || trigger60day;

    // Bereken uitslag in geheugen — antwoorden gaan NIET naar DB
    const antwoorden: ZelftestAntwoorden = {
      trigger60day: echteTrigger,
      geslacht,
      avg_akkoord,
      responses,
    };
    const uitslag = berekenUitslag(antwoorden);

    // Sla alleen uitslag + metadata op (privacy-by-design)
    const { error: updateErr } = await supabase
      .from("productadvies_tests")
      .update({
        geslacht,
        avg_akkoord: true,
        uitslag: {
          categorie: uitslag.categorie,
          categorieLabel: uitslag.categorieLabel,
          niveau: uitslag.niveau,
          pakket_key: uitslag.pakket_key,
          opstartSuggestie: uitslag.opstartSuggestie,
          fallback: uitslag.fallback,
        },
        status: "ingevuld",
        ingevuld_op: new Date().toISOString(),
      })
      .eq("token", token);

    if (updateErr) {
      console.error("Submit error:", updateErr);
      return NextResponse.json(
        { error: "Opslaan van uitslag mislukt" },
        { status: 500 },
      );
    }

    // Pipeline auto-update: alle pre-followup-fases verschuiven naar 'followup'
    // wanneer prospect de test heeft ingevuld. Niet harder dan dat — fases
    // ná followup (member, shopper, not_yet) blijven onaangetast.
    const PRE_FOLLOWUP_FASES = [
      "prospect",
      "uitgenodigd",
      "one_pager",
      "presentatie",
    ];
    let bestaandeIngezetTools: string[] = [];
    if (test.prospect_id) {
      const { data: prospect } = await supabase
        .from("prospects")
        .select("pipeline_fase, ingezette_tools")
        .eq("id", test.prospect_id)
        .single();
      bestaandeIngezetTools = (prospect?.ingezette_tools as string[]) ?? [];
      const updates: Record<string, unknown> = {};
      if (
        prospect?.pipeline_fase &&
        PRE_FOLLOWUP_FASES.includes(prospect.pipeline_fase as string)
      ) {
        updates.pipeline_fase = "followup";
      }
      // Voeg "Productadvies-test" toe aan ingezette_tools als die er nog niet
      // tussen staat. Zo wordt de tool automatisch aangevinkt op de kaart.
      if (!bestaandeIngezetTools.includes("Productadvies-test")) {
        updates.ingezette_tools = [
          ...bestaandeIngezetTools,
          "Productadvies-test",
        ];
      }
      if (Object.keys(updates).length > 0) {
        await supabase
          .from("prospects")
          .update(updates)
          .eq("id", test.prospect_id);
      }
    }

    // Member-notificatie: maak een herinnering aan zodat member ziet dat
    // er een test ingevuld is en hij/zij contact kan opnemen met de prospect.
    if (test.member_id && test.prospect_id) {
      await supabase.from("herinneringen").insert({
        user_id: test.member_id,
        prospect_id: test.prospect_id,
        titel: `Productadvies-test ingevuld: ${uitslag.categorieLabel}`,
        type: "followup",
        vervaldatum: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        voltooid: false,
      });
    }

    return NextResponse.json({ success: true, redirect: `/test/${token}/resultaat` });
  } catch (e) {
    console.error("Submit exception:", e);
    return NextResponse.json(
      { error: "Onverwachte fout bij verwerken" },
      { status: 500 },
    );
  }
}

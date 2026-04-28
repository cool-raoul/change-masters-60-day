import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
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

    // Eerder blokkeerden we hier op status='ingevuld'. Bewust niet meer:
    // de prospect mag de vragenlijst opnieuw invullen totdat hij/zij hem
    // definitief naar de member doorstuurt. Bij elke nieuwe submit
    // overschrijft de uitslag de vorige op DEZELFDE rij — dezelfde token
    // blijft, member krijgt automatisch de laatste versie te zien op de
    // prospect-kaart (we sorteren op meest recente test).
    const wasAlIngevuld = test.status === "ingevuld";

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
    // Bij re-submit (wasAlIngevuld) doen we geen pipeline-update of herinnering
    // meer — die zijn al eerder afgehandeld.
    const PRE_FOLLOWUP_FASES = [
      "prospect",
      "uitgenodigd",
      "one_pager",
      "presentatie",
    ];
    let bestaandeIngezetTools: string[] = [];
    if (test.prospect_id && !wasAlIngevuld) {
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
      // Voeg "Productadvies-vragenlijst" toe aan ingezette_tools als die er
      // nog niet tussen staat. Zo wordt de tool automatisch aangevinkt op de
      // kaart. (Oude waarde "Productadvies-test" telt ook mee voor backwards
      // compatibility met al-aangevinkte items.)
      const heeftAlOud = bestaandeIngezetTools.includes("Productadvies-test");
      const heeftAlNieuw = bestaandeIngezetTools.includes(
        "Productadvies-vragenlijst",
      );
      if (!heeftAlOud && !heeftAlNieuw) {
        updates.ingezette_tools = [
          ...bestaandeIngezetTools,
          "Productadvies-vragenlijst",
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
    // Niet bij re-submit — anders krijgt member dubbele/triple herinneringen.
    if (test.member_id && test.prospect_id && !wasAlIngevuld) {
      // Prospect-naam voor in de pushtitel zodat de member meteen ziet wie
      // ingevuld heeft, ook met telefoon op slot.
      let prospectNaam = "Een prospect";
      const { data: prospect } = await supabase
        .from("prospects")
        .select("volledige_naam")
        .eq("id", test.prospect_id)
        .single();
      if (prospect?.volledige_naam) prospectNaam = prospect.volledige_naam;

      await supabase.from("herinneringen").insert({
        user_id: test.member_id,
        prospect_id: test.prospect_id,
        titel: `Productadvies-vragenlijst ingevuld: ${uitslag.categorieLabel}`,
        type: "followup",
        vervaldatum: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        voltooid: false,
      });

      // Live push naar de telefoon van de member — telefoon pingt zelfs als
      // de app dicht is. Stil falen als geen subscription / verlopen.
      await sendPushToUser(test.member_id, {
        title: `${prospectNaam} heeft de vragenlijst ingevuld`,
        body: `Advies: ${uitslag.categorieLabel} ${uitslag.niveau}. Tik om de prospect-kaart te openen.`,
        url: `/namenlijst/${test.prospect_id}`,
        tag: `productadvies-${test.prospect_id}`,
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

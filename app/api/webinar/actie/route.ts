import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { warmNaarOpvolgen } from "@/lib/prospect/warm-naar-opvolgen";

// ============================================================
// POST /api/webinar/actie
// Body: { token, soort: "gekeken" | "actie" }
//
// "gekeken": de kijkpagina is geopend. Zet de status, zodat de
//   member het ziet en de "je hebt 'm nog niet gezien"-mail niet
//   meer vertrekt.
// "actie": de bezoeker klikte de actie-knop. Dan schuift de
//   prospect naar Opvolgen met een herinnering, en krijgt de
//   member direct een seintje. Dit is het warme moment.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    const soort = body.soort === "actie" ? "actie" : "gekeken";
    if (!token) {
      return NextResponse.json({ error: "token ontbreekt" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: rij } = await admin
      .from("webinar_inschrijvingen")
      .select("id, member_id, prospect_id, naam, status, gekeken_op")
      .eq("token", token)
      .maybeSingle();
    if (!rij) {
      return NextResponse.json({ error: "onbekend" }, { status: 404 });
    }
    const inschrijving = rij as {
      id: string;
      member_id: string;
      prospect_id: string | null;
      naam: string;
      status: string;
      gekeken_op: string | null;
    };

    if (soort === "gekeken") {
      // Alleen de eerste keer bijwerken en seinen; iemand die de
      // pagina drie keer opent hoeft geen drie pushberichten op te
      // leveren. Een al doorgeklikte actie nooit terugzetten.
      if (inschrijving.gekeken_op || inschrijving.status === "actie") {
        return NextResponse.json({ ok: true });
      }
      await admin
        .from("webinar_inschrijvingen")
        .update({ status: "gekeken", gekeken_op: new Date().toISOString() })
        .eq("id", inschrijving.id);
      try {
        await sendPushToUser(inschrijving.member_id, {
          title: `${inschrijving.naam} kijkt nu de masterclass 👀`,
          body: "Mooi moment om straks even te vragen wat 'm het meeste aansprak.",
          url: inschrijving.prospect_id
            ? `/namenlijst/${inschrijving.prospect_id}`
            : "/namenlijst",
          tag: `webinar-kijk-${inschrijving.id}`,
        });
      } catch {
        // push is nooit blokkerend
      }
      return NextResponse.json({ ok: true });
    }

    // soort === "actie"
    if (inschrijving.status === "actie") {
      return NextResponse.json({ ok: true });
    }
    await admin
      .from("webinar_inschrijvingen")
      .update({
        status: "actie",
        actie_op: new Date().toISOString(),
        gekeken_op: inschrijving.gekeken_op ?? new Date().toISOString(),
      })
      .eq("id", inschrijving.id);

    if (inschrijving.prospect_id) {
      try {
        await admin
          .from("prospects")
          .update({ prioriteit: "hoog" })
          .eq("id", inschrijving.prospect_id);
        await warmNaarOpvolgen({
          admin,
          prospectId: inschrijving.prospect_id,
          memberId: inschrijving.member_id,
          reden: "masterclass bekeken en om contact gevraagd",
        });
      } catch (e) {
        console.error("webinar actie → opvolgen:", e);
      }
    }

    try {
      await sendPushToUser(inschrijving.member_id, {
        title: `${inschrijving.naam} wil meer weten 🔥`,
        body: "Heeft de masterclass gekeken en op de actie-knop geklikt. Staat op Opvolgen.",
        url: inschrijving.prospect_id
          ? `/namenlijst/${inschrijving.prospect_id}`
          : "/namenlijst",
        tag: `webinar-actie-${inschrijving.id}`,
      });
    } catch {
      // push is nooit blokkerend
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webinar actie exception:", e);
    return NextResponse.json({ error: "mislukt" }, { status: 500 });
  }
}

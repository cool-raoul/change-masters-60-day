import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { verstuurMail } from "@/lib/mail/resend";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import { bouwMail } from "@/lib/webinar/mails";
import { slotTekst } from "@/lib/webinar/slots";
import { SITE_URL } from "@/lib/site";

// ============================================================
// POST /api/webinar/inschrijven
// Body: { token, naam, email, telefoon?, slotStart }
//
// Eén aanmelding doet vier dingen:
//   1. prospect-kaart in de namenlijst van de member (of bijwerken)
//   2. inschrijving vastleggen met een eigen kijk-token
//   3. bevestigingsmail met de kijklink
//   4. seintje naar de member
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    const naam = (body.naam as string | undefined)?.trim();
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const telefoon = (body.telefoon as string | undefined)?.trim() || null;
    const slotStart = (body.slotStart as string | undefined)?.trim();

    if (!token || !naam || !email || !slotStart) {
      return NextResponse.json({ error: "Vul alles even in" }, { status: 400 });
    }
    if (Number.isNaN(Date.parse(slotStart))) {
      return NextResponse.json({ error: "Ongeldig moment" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: tokenRij } = await admin
      .from("freebie_bot_member_tokens")
      .select("member_id")
      .eq("token", token)
      .eq("bot_slug", "webinar")
      .maybeSingle();
    if (!tokenRij) {
      return NextResponse.json({ error: "Onbekende link" }, { status: 404 });
    }
    const memberId = (tokenRij as { member_id: string }).member_id;

    const { data: memberProfiel } = await admin
      .from("profiles")
      .select("full_name, email, notificatie_email, resend_api_key")
      .eq("id", memberId)
      .maybeSingle();
    const member = (memberProfiel ?? {}) as {
      full_name?: string | null;
      email?: string | null;
      notificatie_email?: string | null;
      resend_api_key?: string | null;
    };
    const memberVoornaam = (member.full_name ?? "").split(" ")[0] || "ELEVA";

    const { data: configRij } = await admin
      .from("webinar_config")
      .select("titel, duur_minuten")
      .eq("id", "standaard")
      .maybeSingle();
    const config = (configRij ?? {}) as {
      titel?: string;
      duur_minuten?: number;
    };

    // 1. Prospect: bestaat deze e-mail al bij deze member? Dan bijwerken,
    //    anders een nieuwe kaart. Escape LIKE-wildcards, anders matcht
    //    "%@%" andermans kaart.
    const veiligEmail = email.replace(/([\\%_])/g, "\\$1");
    const { data: bestaand } = await admin
      .from("prospects")
      .select("id, telefoon, notities")
      .eq("user_id", memberId)
      .ilike("email", veiligEmail)
      .maybeSingle();

    const notitieRegel = `Aangemeld voor de masterclass, gekozen moment: ${slotTekst(slotStart)}.`;
    let prospectId: string | null =
      (bestaand as { id?: string } | null)?.id ?? null;

    if (prospectId) {
      const oudeNotities =
        ((bestaand as { notities?: string | null }).notities ?? "").trim();
      await admin
        .from("prospects")
        .update({
          telefoon:
            (bestaand as { telefoon?: string | null }).telefoon || telefoon,
          notities: oudeNotities
            ? `${oudeNotities}\n${notitieRegel}`
            : notitieRegel,
        })
        .eq("id", prospectId);
    } else {
      const { data: nieuw } = await admin
        .from("prospects")
        .insert({
          user_id: memberId,
          volledige_naam: naam,
          email,
          telefoon,
          bron: "Masterclass",
          pipeline_fase: "prospect",
          notities: notitieRegel,
        })
        .select("id")
        .maybeSingle();
      prospectId = (nieuw as { id?: string } | null)?.id ?? null;
    }

    // 2. Inschrijving vastleggen.
    const kijkToken = genereerBotToken();
    const { error: insErr } = await admin
      .from("webinar_inschrijvingen")
      .insert({
        member_id: memberId,
        prospect_id: prospectId,
        token: kijkToken,
        naam,
        email,
        telefoon,
        slot_start: new Date(slotStart).toISOString(),
        mail_bevestiging_op: new Date().toISOString(),
      });
    if (insErr) {
      console.error("webinar-inschrijving insert:", insErr.message);
      return NextResponse.json(
        { error: "Aanmelden lukte niet, probeer het zo nog eens" },
        { status: 500 },
      );
    }

    const kijkUrl = `${SITE_URL}/webinar/kijk/${kijkToken}`;

    // 3. Bevestigingsmail (faalt stil: de aanmelding staat al).
    try {
      const mail = bouwMail("bevestiging", {
        naam,
        token: kijkToken,
        slotStart,
        memberVoornaam,
        titel: config.titel ?? "de masterclass",
        duurMinuten: config.duur_minuten ?? 45,
      });
      await verstuurMail({
        naar: email,
        onderwerp: mail.onderwerp,
        html: mail.html,
        van: `${memberVoornaam} <${process.env.RESEND_FROM_EMAIL ?? "team@mail.my-eleva.com"}>`,
        replyTo: member.notificatie_email ?? member.email ?? undefined,
        apiKey: member.resend_api_key ?? undefined,
      });
    } catch (e) {
      console.error("webinar bevestigingsmail:", e);
    }

    // 4. Seintje naar de member.
    try {
      await sendPushToUser(memberId, {
        title: `${naam} meldde zich aan voor de masterclass 🎥`,
        body: `Gekozen moment: ${slotTekst(slotStart)}. Staat op je namenlijst.`,
        url: prospectId ? `/namenlijst/${prospectId}` : "/namenlijst",
        tag: `webinar-${kijkToken}`,
      });
    } catch (e) {
      console.error("webinar push:", e);
    }

    return NextResponse.json({ ok: true, kijkUrl });
  } catch (e) {
    console.error("webinar inschrijven exception:", e);
    return NextResponse.json(
      { error: "Er ging iets mis, probeer het zo nog eens" },
      { status: 500 },
    );
  }
}

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

    const { data: linkRij } = await admin
      .from("webinar_member_links")
      .select("member_id, webinar_id")
      .eq("token", token)
      .maybeSingle();
    if (!linkRij) {
      return NextResponse.json({ error: "Onbekende link" }, { status: 404 });
    }
    const { member_id: memberId, webinar_id: webinarId } = linkRij as {
      member_id: string;
      webinar_id: string;
    };

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
      .from("webinars")
      .select("titel, duur_minuten")
      .eq("id", webinarId)
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

    // De naam erbij: komt iemand binnen op een e-mailadres dat al op een
    // andere kaart staat (bijvoorbeeld een eerdere freebie), dan zou de
    // aanmelding anders onzichtbaar zijn onder een andere naam.
    const notitieRegel = `🎥 WEBINAR-AANMELDING (${new Date().toLocaleDateString("nl-NL")})\nAangemeld als "${naam}" voor "${config.titel ?? "webinar"}".\nGekozen kijkmoment: ${slotTekst(slotStart)}.`;
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
      // bron MOET een van warm/social/doorverwijzing/koud zijn (check-
      // constraint op de tabel). Stond hier eerst "Webinar", waardoor
      // élke nieuwe kaart stil faalde en de aanmelding nergens landde.
      // De freebie-bots gebruiken om dezelfde reden "social"; waar de
      // lead vandaan komt staat in de notitie.
      const { data: nieuw, error: prospectFout } = await admin
        .from("prospects")
        .insert({
          user_id: memberId,
          volledige_naam: naam,
          email,
          telefoon,
          bron: "social",
          pipeline_fase: "prospect",
          notities: notitieRegel,
        })
        .select("id")
        .maybeSingle();
      if (prospectFout) {
        console.error("webinar prospect-insert:", prospectFout.message);
      }
      prospectId = (nieuw as { id?: string } | null)?.id ?? null;
    }

    // 2. Inschrijving vastleggen.
    const kijkToken = genereerBotToken();
    const { error: insErr } = await admin
      .from("webinar_inschrijvingen")
      .insert({
        member_id: memberId,
        webinar_id: webinarId,
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
      const antwoordAdres = member.notificatie_email ?? member.email ?? undefined;
      await verstuurMail({
        naar: email,
        onderwerp: mail.onderwerp,
        html: mail.html,
        // Platte tekst + afmeld-header: beide wegen mee in de
        // spam-beoordeling, en zonder die twee belandt een mail met
        // knoppen en links sneller in de ongewenste map.
        tekst: mail.tekst,
        headers: antwoordAdres
          ? {
              "List-Unsubscribe": `<mailto:${antwoordAdres}?subject=Afmelden>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          : undefined,
        van: `${memberVoornaam} <${process.env.RESEND_FROM_EMAIL ?? "team@mail.my-eleva.com"}>`,
        replyTo: antwoordAdres,
        // GEEN eigen sleutel van de member meegeven: het afzender-domein
        // (mail.my-eleva.com) is alleen geverifieerd op het gedeelde
        // ELEVA-account. Met een persoonlijke sleutel weigert Resend de
        // mail, en dan vertrekt er stil niets. Zelfde keuze als bij de
        // freebie-mails.
      });
    } catch (e) {
      console.error("webinar bevestigingsmail:", e);
    }

    // 4. Seintje naar de member.
    try {
      await sendPushToUser(memberId, {
        title: `${naam} meldde zich aan voor je webinar 🎥`,
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

// File: app/api/freebie-bot/contact/route.ts
//
// POST /api/freebie-bot/contact
// Body: { token, leadEmail, leadVoornaam?, leadAchternaam?, leadTelefoon }
//
// De "ik wil persoonlijk contact"-trigger. Wordt PAS aangeroepen nadat de
// prospect een telefoonnummer achterlaat (de laatste stap van de bot). De
// volledige vangst (prospect in de namenlijst, antwoorden, mail-serie,
// uitkomst-mail) is op dat moment al gebeurd bij het invullen van de e-mail
// (zie /api/freebie-bot/opt-in). Deze route doet daar alleen het
// telefoon-/contact-stuk bovenop:
//   - telefoonnummer op de prospect-kaart zetten
//   - prioriteit naar 'hoog'
//   - korte notitie 'wil gebeld worden'
//   - push naar de member: 'X vraagt persoonlijk contact'

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { getBotConfig } from "@/lib/freebie-bots/registry";
import { warmNaarOpvolgen } from "@/lib/prospect/warm-naar-opvolgen";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const leadEmail = (body.leadEmail as string | undefined)?.trim();
    const leadVoornaam = (body.leadVoornaam as string | undefined)?.trim();
    const leadAchternaam = (body.leadAchternaam as string | undefined)?.trim();
    const leadTelefoon = (body.leadTelefoon as string | undefined)?.trim();
    const reden = (body.reden as string | undefined)?.trim();

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!leadEmail) {
      return NextResponse.json({ error: "E-mail ontbreekt" }, { status: 400 });
    }
    if (!leadTelefoon || leadTelefoon.length < 8) {
      return NextResponse.json(
        { error: "Telefoonnummer ontbreekt" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Token → member + bot
    const { data: tokenRow } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();
    if (!tokenRow) {
      return NextResponse.json({ error: "Onbekende token" }, { status: 404 });
    }

    const botSlug = (tokenRow.bot_slug ?? "energie-en-focus") as string;
    const botTitel =
      getBotConfig(botSlug)?.titel ??
      botSlug
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");

    // Prospect van deze member met dit e-mailadres (door opt-in al aangemaakt)
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, volledige_naam, notities, telefoon")
      .eq("user_id", tokenRow.member_id)
      // Escape LIKE-wildcards: anders matcht "%@%" andermans prospect-kaart
      .ilike("email", leadEmail.replace(/([\\%_])/g, "\\$1"))
      .maybeSingle();

    const leadNaam =
      (prospect?.volledige_naam as string | undefined)?.trim() ||
      [leadVoornaam, leadAchternaam].filter(Boolean).join(" ").trim() ||
      "Een lead";

    if (prospect?.id) {
      const datum = new Date().toLocaleDateString("nl-NL");
      const contactNotitie = `⚡ VRAAGT PERSOONLIJK CONTACT (${datum}) · tel ${leadTelefoon}${reden ? ` · ${reden}` : ""}`;
      const aangevuldeNotitie =
        (prospect.notities ? `${prospect.notities}\n\n` : "") + contactNotitie;
      const updateData: Record<string, unknown> = {
        notities: aangevuldeNotitie,
        prioriteit: "hoog",
        gearchiveerd: false,
        updated_at: new Date().toISOString(),
      };
      // Telefoon zetten als die nog ontbrak (oude waarde niet overschrijven).
      if (!prospect.telefoon) updateData.telefoon = leadTelefoon;
      const { error: updErr } = await supabase
        .from("prospects")
        .update(updateData)
        .eq("id", prospect.id);
      if (updErr) {
        console.error("contact prospect-update mislukt:", updErr);
      }

      // Warm geworden: telefoonnummer achtergelaten / contact gevraagd →
      // schuif naar Opvolgen + maak een opvolg-herinnering.
      await warmNaarOpvolgen({
        admin: supabase,
        prospectId: prospect.id,
        memberId: tokenRow.member_id,
        reden: `${leadNaam} vraagt persoonlijk contact`,
        beschrijving: `Liet een telefoonnummer achter (${leadTelefoon}). Tijd om persoonlijk op te volgen.`,
      });
    }

    // Push naar member: deze lead wil gebeld/geappt worden.
    try {
      await sendPushToUser(tokenRow.member_id, {
        title: `${leadNaam} vraagt persoonlijk contact`,
        body: reden
          ? `${reden}. Open de prospect-kaart.`
          : "Liet een telefoonnummer achter voor een vrijblijvend gesprek. Open haar prospect-kaart.",
        url: "/namenlijst",
        tag: `${botSlug}-contact`,
      });
    } catch (pushErr) {
      console.warn("Push contact mislukt:", pushErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("freebie-bot/contact exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

// File: app/api/cron/freebie-mails/route.ts
//
// Cron-route die dagelijks de wacht-rij van freebie_mail_queue afwerkt.
// Pikt rijen op waar gepland_op < now() en status = 'wacht', rendert
// de juiste template, verstuurt via Resend, update de rij.
//
// VERSTUREN: via het GEDEELDE ELEVA-Resend-account (één geverifieerd domein
// voor het hele team), gepersonaliseerd met de naam van het teamlid als
// afzender + hun e-mail als reply-to. Master-schakelaar = RESEND_API_KEY in de
// Vercel-env: zonder dat blijft alles dry-run (geen echte verzending). Env:
//   RESEND_API_KEY     = sleutel van het ELEVA-Resend-account
//   RESEND_FROM_EMAIL  = afzender-adres op het geverifieerde domein
//                        (bv. team@mail.eleva.app)
//
// CRON-CONFIG: staat in vercel.json:
//   { "path": "/api/cron/freebie-mails", "schedule": "0 18 * * *" }
// Schedule = dagelijks om 18:00 UTC (= 19:00/20:00 NL). Mails komen dus
// 's avonds aan, passend bij Eleva-toon.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBotConfig } from "@/lib/freebie-bots/registry";
import { verstuurMail } from "@/lib/mail/resend";

export const maxDuration = 60;

const MAX_POGINGEN = 3;
const BATCH_LIMIET = 50;

export async function GET(request: Request) {
  // Authenticatie van cron-call. Vercel zet een Authorization-header met
  // CRON_SECRET als die in env staat. Anders alleen toelaten in dev.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const nu = new Date().toISOString();

  // Haal mails op die klaar zijn om verstuurd te worden
  const { data: kandidaten, error: leesErr } = await supabase
    .from("freebie_mail_queue")
    .select(
      "id, opt_in_id, freebie_slug, lead_email, lead_naam, member_id, dag, pogingen, unsubscribe_token",
    )
    .eq("status", "wacht")
    .lt("gepland_op", nu)
    .lt("pogingen", MAX_POGINGEN)
    .limit(BATCH_LIMIET);

  if (leesErr) {
    console.error("[freebie-mails cron] DB-fout:", leesErr);
    return NextResponse.json({ error: leesErr.message }, { status: 500 });
  }

  let verstuurd = 0;
  let mislukt = 0;
  let overgeslagen = 0;

  for (const rij of kandidaten ?? []) {
    // Check unsubscribe
    const { data: afgemeld } = await supabase
      .from("freebie_mail_unsubscribed")
      .select("email")
      .eq("email", rij.lead_email.toLowerCase())
      .maybeSingle();
    if (afgemeld) {
      await supabase
        .from("freebie_mail_queue")
        .update({ status: "overgeslagen", foutmelding: "Lead heeft zich afgemeld" })
        .eq("id", rij.id);
      overgeslagen++;
      continue;
    }

    // Freebie-mails gaan via het GEDEELDE ELEVA-Resend-account (één
    // geverifieerd domein voor het hele team), gepersonaliseerd met de naam
    // van het teamlid als afzender + hun e-mail als reply-to. Master-schakelaar
    // is RESEND_API_KEY in de env: zonder dat blijft verstuurMail dry-run.
    const { data: memberProfiel } = await supabase
      .from("profiles")
      .select("full_name, email, notificatie_email")
      .eq("id", rij.member_id)
      .maybeSingle();
    if (!memberProfiel) {
      await supabase
        .from("freebie_mail_queue")
        .update({ status: "mislukt", foutmelding: "Member niet gevonden" })
        .eq("id", rij.id);
      mislukt++;
      continue;
    }

    // Haal opt-in-data op voor personalisatie
    const { data: optIn } = await supabase
      .from("freebie_opt_ins")
      .select("bot_antwoorden, spiegel_tekst")
      .eq("id", rij.opt_in_id)
      .maybeSingle();

    // Bouw template via registry op basis van bot-slug uit de rij
    const botConfig = getBotConfig(rij.freebie_slug);
    const template = botConfig?.templateVoorDag?.(rij.dag) ?? null;
    if (!template) {
      await supabase
        .from("freebie_mail_queue")
        .update({
          status: "mislukt",
          foutmelding: `Geen template voor ${rij.freebie_slug} dag ${rij.dag}`,
          pogingen: rij.pogingen + 1,
        })
        .eq("id", rij.id);
      mislukt++;
      continue;
    }

    const memberVoornaam =
      ((memberProfiel.full_name ?? "") as string).split(" ")[0] || "team";
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://eleva.app";
    const unsubscribeUrl = rij.unsubscribe_token
      ? `${origin}/api/freebie-bot/unsubscribe?token=${rij.unsubscribe_token}`
      : `${origin}/`;

    // Mini-ELEVA-status van deze lead bepalen op verzend-moment:
    // 1. prospect van deze member met dit e-mailadres
    // 2. actieve, niet-verlopen uitnodiging voor die prospect
    // 3. al activiteit op die uitnodiging? → korte verwijzing ipv
    //    vol introductie-blok in de mail
    // Standaard wijst de omgeving-knop naar de aanvraag-link: pas als de
    // PROSPECT daarop klikt, wordt haar mini-ELEVA aangemaakt (niet vooraf).
    // Bestaat er al een actieve omgeving, dan linken we direct daarheen.
    let miniElevaUrl: string | null =
      `${origin}/api/mini-eleva/aanvraag?optin=${rij.opt_in_id}&dag=${rij.dag}`;
    let alInMiniEleva = false;
    try {
      const { data: prospect } = await supabase
        .from("prospects")
        .select("id")
        .eq("user_id", rij.member_id)
        .ilike("email", rij.lead_email)
        .maybeSingle();
      if (prospect?.id) {
        const { data: invitation } = await supabase
          .from("prospect_invitations")
          .select("id, token")
          .eq("prospect_id", prospect.id)
          .eq("status", "actief")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (invitation?.token) {
          miniElevaUrl = `${origin}/m/${invitation.token}`;
          const { count } = await supabase
            .from("mini_eleva_activiteit")
            .select("id", { count: "exact", head: true })
            .eq("invitation_id", invitation.id);
          alInMiniEleva = (count ?? 0) > 0;
        }
      }
    } catch (e) {
      // Mini-ELEVA-info is verrijking, geen vereiste. Mail gaat door
      // met de aanvraag-link als dit faalt.
      console.warn("[freebie-mails cron] mini-eleva lookup faalde:", e);
    }

    const html = template.bouwHtml({
      leadVoornaam: rij.lead_naam.split(" ")[0] || "jij",
      memberVoornaam,
      spiegelTekst: (optIn?.spiegel_tekst as string) ?? null,
      antwoorden: (optIn?.bot_antwoorden as never) ?? null,
      unsubscribeUrl,
      miniElevaUrl,
      alInMiniEleva,
    });

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "team@mail.eleva.app";
    const resultaat = await verstuurMail({
      naar: rij.lead_email,
      onderwerp: template.onderwerp,
      html,
      van: `${memberVoornaam} <${fromEmail}>`,
      replyTo:
        memberProfiel.notificatie_email ?? memberProfiel.email ?? undefined,
    });

    if (resultaat.ok) {
      await supabase
        .from("freebie_mail_queue")
        .update({
          status: "verstuurd",
          verstuurd_op: new Date().toISOString(),
          pogingen: rij.pogingen + 1,
          foutmelding: resultaat.dryRun ? "DRY-RUN (geen API-key)" : null,
        })
        .eq("id", rij.id);
      verstuurd++;
    } else {
      const isLaatstePoging = rij.pogingen + 1 >= MAX_POGINGEN;
      await supabase
        .from("freebie_mail_queue")
        .update({
          status: isLaatstePoging ? "mislukt" : "wacht",
          foutmelding: resultaat.fout,
          pogingen: rij.pogingen + 1,
        })
        .eq("id", rij.id);
      mislukt++;
    }
  }

  return NextResponse.json({
    ok: true,
    bekeken: kandidaten?.length ?? 0,
    verstuurd,
    mislukt,
    overgeslagen,
    tijdstip: nu,
  });
}

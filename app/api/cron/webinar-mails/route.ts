import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verstuurMail } from "@/lib/mail/resend";
import { bouwMail, type MailSoort } from "@/lib/webinar/mails";

// ============================================================
// GET /api/cron/webinar-mails
//
// Draait elk uur mee met de bestaande reminder-cron. Drie momenten:
//   herinnering  ~1 uur vóór het gekozen moment
//   kijklink     op het gekozen moment
//   terugkijk    ~20 uur erna, alleen als er niet gekeken is
//
// Elke mail heeft een eigen datum-kolom, dus niets gaat dubbel de
// deur uit. Verzending loopt via het Resend-account van de member
// zelf als die er een heeft (net als de freebie-mails), zodat de
// mail van hém komt en niet van een systeem-adres.
// ============================================================

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const UUR = 3_600_000;
const BATCH = 40;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const nu = Date.now();

  const { data: configRij } = await admin
    .from("webinar_config")
    .select("titel, duur_minuten, actief")
    .eq("id", "standaard")
    .maybeSingle();
  const config = (configRij ?? {}) as {
    titel?: string;
    duur_minuten?: number;
    actief?: boolean;
  };
  if (config.actief === false) {
    return NextResponse.json({ ok: true, overgeslagen: "webinar staat uit" });
  }

  // Alles van de afgelopen twee dagen en de komende twee dagen; daar
  // vallen alle drie de momenten binnen.
  const { data: rijen } = await admin
    .from("webinar_inschrijvingen")
    .select(
      "id, member_id, naam, email, token, slot_start, status, gekeken_op, mail_herinnering_op, mail_kijklink_op, mail_terugkijk_op",
    )
    .gte("slot_start", new Date(nu - 48 * UUR).toISOString())
    .lte("slot_start", new Date(nu + 48 * UUR).toISOString())
    .limit(200);

  type Rij = {
    id: string;
    member_id: string;
    naam: string;
    email: string;
    token: string;
    slot_start: string;
    status: string;
    gekeken_op: string | null;
    mail_herinnering_op: string | null;
    mail_kijklink_op: string | null;
    mail_terugkijk_op: string | null;
  };

  const memberCache = new Map<
    string,
    {
      voornaam: string;
      replyTo?: string;
      apiKey?: string;
    }
  >();

  async function memberInfo(id: string) {
    const bestaand = memberCache.get(id);
    if (bestaand) return bestaand;
    const { data } = await admin
      .from("profiles")
      .select("full_name, email, notificatie_email, resend_api_key")
      .eq("id", id)
      .maybeSingle();
    const p = (data ?? {}) as {
      full_name?: string | null;
      email?: string | null;
      notificatie_email?: string | null;
      resend_api_key?: string | null;
    };
    const info = {
      voornaam: (p.full_name ?? "").split(" ")[0] || "ELEVA",
      replyTo: p.notificatie_email ?? p.email ?? undefined,
      apiKey: p.resend_api_key ?? undefined,
    };
    memberCache.set(id, info);
    return info;
  }

  let verstuurd = 0;
  const teDoen: { rij: Rij; soort: MailSoort; kolom: string }[] = [];

  for (const r of (rijen ?? []) as Rij[]) {
    const slot = Date.parse(r.slot_start);
    const gekeken = Boolean(r.gekeken_op) || r.status !== "ingeschreven";

    if (
      !r.mail_herinnering_op &&
      !gekeken &&
      slot - nu <= UUR &&
      slot - nu > 5 * 60_000
    ) {
      teDoen.push({ rij: r, soort: "herinnering", kolom: "mail_herinnering_op" });
      continue;
    }
    if (!r.mail_kijklink_op && !gekeken && nu >= slot && nu - slot < 3 * UUR) {
      teDoen.push({ rij: r, soort: "kijklink", kolom: "mail_kijklink_op" });
      continue;
    }
    if (
      !r.mail_terugkijk_op &&
      !gekeken &&
      nu - slot >= 20 * UUR &&
      nu - slot < 44 * UUR
    ) {
      teDoen.push({ rij: r, soort: "terugkijk", kolom: "mail_terugkijk_op" });
    }
  }

  for (const item of teDoen.slice(0, BATCH)) {
    const info = await memberInfo(item.rij.member_id);
    const mail = bouwMail(item.soort, {
      naam: item.rij.naam,
      token: item.rij.token,
      slotStart: item.rij.slot_start,
      memberVoornaam: info.voornaam,
      titel: config.titel ?? "de masterclass",
      duurMinuten: config.duur_minuten ?? 45,
    });
    const resultaat = await verstuurMail({
      naar: item.rij.email,
      onderwerp: mail.onderwerp,
      html: mail.html,
      van: `${info.voornaam} <${process.env.RESEND_FROM_EMAIL ?? "team@mail.my-eleva.com"}>`,
      replyTo: info.replyTo,
      apiKey: info.apiKey,
    });
    if (resultaat.ok) {
      await admin
        .from("webinar_inschrijvingen")
        .update({ [item.kolom]: new Date().toISOString() })
        .eq("id", item.rij.id);
      verstuurd++;
    } else {
      console.error("webinar-mail mislukt:", resultaat.fout);
    }
  }

  return NextResponse.json({ ok: true, gevonden: teDoen.length, verstuurd });
}

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNaarKlant } from "@/lib/resetcode/push-klant";

// ============================================================
// GET /api/resetcode/ochtend-cron  (Bearer CRON_SECRET)
//
// Het beloofde ochtend-seintje voor Resetcode-klanten: "ik geef je
// elke ochtend een klein seintje voor je check-in". Wordt uurlijks
// gepingd door de GitHub Actions-workflow (reminders-hourly) en
// verstuurt zelf alleen rond 08:00 Europe/Amsterdam. Alleen naar
// klanten die de seintjes-knop hebben aangezet, vandaag nog niet
// hebben ingecheckt en (op of voorbij) hun startdag zijn.
// ============================================================

function nuAmsterdam() {
  const uur = Number(
    new Intl.DateTimeFormat("nl-NL", {
      timeZone: "Europe/Amsterdam",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
  const datum = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());
  return { uur, datum };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Niet toegestaan" }, { status: 401 });
  }

  const { uur, datum } = nuAmsterdam();
  if (uur !== 8) {
    return Response.json({ ok: true, overgeslagen: `uur ${uur}, verstuurt alleen om 08:00` });
  }

  const admin = createAdminClient();

  // Links met minstens één actief push-abonnement.
  const { data: subRijen } = await admin
    .from("resetcode_klant_subscriptions")
    .select("link_id")
    .eq("is_active", true);
  const linkIds = Array.from(
    new Set(((subRijen ?? []) as { link_id: string }[]).map((s) => s.link_id)),
  );
  if (linkIds.length === 0) {
    return Response.json({ ok: true, verzonden: 0, reden: "geen abonnementen" });
  }

  const { data: linkRijen } = await admin
    .from("resetcode_klant_links")
    .select("id, token, klant_naam, status, start_datum, station_slug")
    .in("id", linkIds)
    .eq("status", "actief");
  const links = (linkRijen ?? []) as {
    id: string;
    token: string;
    klant_naam: string;
    status: string;
    start_datum: string | null;
    station_slug: string | null;
  }[];

  // Vandaag al ingecheckt? Dan geen seintje meer nodig.
  const { data: checkins } = await admin
    .from("resetcode_checkin")
    .select("link_id")
    .eq("datum", datum)
    .in(
      "link_id",
      links.map((l) => l.id),
    );
  const alIngecheckt = new Set(
    ((checkins ?? []) as { link_id: string }[]).map((c) => c.link_id),
  );

  let verzonden = 0;
  let mislukt = 0;
  for (const link of links) {
    if (alIngecheckt.has(link.id)) continue;
    // Startdatum in de toekomst: nog geen dagelijkse seintjes, behalve
    // een speciaal seintje op de startdag zelf.
    const isStartdag = link.start_datum === datum;
    if (link.start_datum && link.start_datum > datum) continue;
    const voornaam = link.klant_naam.split(" ")[0];
    const res = await sendPushNaarKlant(link.id, {
      title: isStartdag
        ? `Vandaag is jouw dag 1, ${voornaam}! 🚀`
        : `Goedemorgen ${voornaam}! ☀️`,
      body: isStartdag
        ? "Je startdag is aangebroken. Je Mentor staat voor je klaar, begin met je eerste check-in. 💚"
        : "Je dagelijkse check-in staat voor je klaar. Een halve minuut, en je Mentor houdt je voortgang bij. 💚",
      url: `/k/${link.token}`,
      tag: `resetcode-ochtend-${link.id}`,
    });
    verzonden += res.verzonden;
    mislukt += res.mislukt;
  }

  return Response.json({ ok: true, links: links.length, verzonden, mislukt });
}

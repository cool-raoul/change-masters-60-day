// File: app/api/cron/nachtwacht/route.ts
//
// De automatische nachtronde van de Nachtwacht + Data-wachter (de
// "stille-ramp-detector"). Draait dagelijks via GitHub Actions
// (.github/workflows/nachtwacht.yml, zelfde patroon als de
// reminders-cron) en zoekt patronen die geen foutmelding geven maar
// wel fout zijn. Precedent: 19 juni bleven alle Core-members op dag 1
// hangen - geen error, wel een ramp.
//
// Gedrag: alle checks zijn ALLEEN-LEZEN. Bij bevindingen krijgen de
// founders een push en gaat er een mail met het volledige rapport naar
// hun (notificatie-)mailadres. Is alles groen, dan blijft het stil:
// stilte = goed nieuws. Het rapport staat ook altijd in de JSON-response
// (terug te lezen in de GitHub Actions-log).
//
// De diepe variant van deze ronde is de data-wachter-agent
// (.claude/agents/data-wachter.md): die verklaart WAAROM een patroon
// bestaat; deze route signaleert alleen DAT het bestaat.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { verstuurMail } from "@/lib/mail/resend";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Bevinding = {
  check: string;
  niveau: "ok" | "let-op" | "rood";
  detail: string;
};

const DAG_MS = 86_400_000;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const nu = Date.now();
  const bevindingen: Bevinding[] = [];
  const meld = (check: string, niveau: Bevinding["niveau"], detail: string) =>
    bevindingen.push({ check, niveau, detail });

  // ── 1. Dag-1-hang: echte members die 5+ dagen geleden startten maar
  //      nooit voorbij dag 1 kwamen (precedent nacht-audit 19 juni).
  try {
    const { data: leden } = await admin
      .from("profiles")
      .select(
        "id, full_name, role, is_tester, modus, core_startdatum, sprint_startdatum, run_startdatum",
      )
      .not("modus", "is", null);
    type Lid = {
      id: string;
      full_name: string | null;
      role: string | null;
      is_tester: boolean | null;
      modus: string | null;
      core_startdatum: string | null;
      sprint_startdatum: string | null;
      run_startdatum: string | null;
    };
    const kandidaten = ((leden ?? []) as Lid[]).filter((l) => {
      if (l.role === "founder" || l.is_tester) return false;
      const start =
        l.modus === "core"
          ? l.core_startdatum
          : l.modus === "sprint"
            ? l.sprint_startdatum
            : l.run_startdatum;
      if (!start) return false;
      return nu - Date.parse(start) >= 5 * DAG_MS;
    });
    const hangers: string[] = [];
    for (const lid of kandidaten) {
      const { count } = await admin
        .from("dag_voltooiingen")
        .select("id", { count: "exact", head: true })
        .eq("user_id", lid.id)
        .gte("dag_nummer", 2);
      if ((count ?? 0) === 0) hangers.push(lid.full_name ?? lid.id);
    }
    if (hangers.length > 0) {
      meld(
        "dag-1-hang",
        "rood",
        `${hangers.length} member(s) 5+ dagen gestart maar nooit voorbij dag 1: ${hangers.slice(0, 5).join(", ")}${hangers.length > 5 ? ", ..." : ""}`,
      );
    } else {
      meld("dag-1-hang", "ok", `${kandidaten.length} gestarte member(s) gecheckt`);
    }
  } catch (e) {
    meld("dag-1-hang", "let-op", `check faalde: ${e instanceof Error ? e.message : "onbekend"}`);
  }

  // ── 2. Mail-queue: wacht-rijen die al 24+ uur voorbij hun geplande
  //      moment zijn, of recente fout-rijen.
  try {
    const grens = new Date(nu - DAG_MS).toISOString();
    const { count: vast } = await admin
      .from("freebie_mail_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "wacht")
      .lt("gepland_op", grens);
    const { count: fouten } = await admin
      .from("freebie_mail_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "fout")
      .gte("created_at", new Date(nu - 2 * DAG_MS).toISOString());
    if ((vast ?? 0) > 0) {
      meld("mail-queue", "rood", `${vast} mail(s) staan 24+ uur vast in de wachtrij`);
    } else if ((fouten ?? 0) > 0) {
      meld("mail-queue", "let-op", `${fouten} mail(s) op fout in de laatste 48 uur`);
    } else {
      meld("mail-queue", "ok", "geen vastgelopen of gefaalde mails");
    }
  } catch (e) {
    meld("mail-queue", "let-op", `check faalde: ${e instanceof Error ? e.message : "onbekend"}`);
  }

  // ── 3. Check-in gestopt: actieve, gestarte reset/darm-klanten van wie
  //      de laatste check-in 3+ dagen oud is (of die er nooit één deden
  //      terwijl ze al 3+ dagen bezig zijn).
  try {
    const { data: links } = await admin
      .from("resetcode_klant_links")
      .select("id, klant_naam, token, status, start_datum, station_slug, member_id")
      .eq("status", "actief")
      .not("start_datum", "is", null);
    type Link = {
      id: string;
      klant_naam: string;
      token: string;
      start_datum: string;
      station_slug: string | null;
      member_id: string;
    };
    // Founder-test-links (reis-tokens) tellen niet mee.
    const echte = ((links ?? []) as Link[]).filter(
      (l) => !l.token.startsWith("reis") && nu - Date.parse(l.start_datum) >= 3 * DAG_MS,
    );
    const gestopt: string[] = [];
    for (const link of echte) {
      const { data: laatste } = await admin
        .from("resetcode_checkin")
        .select("datum")
        .eq("link_id", link.id)
        .order("datum", { ascending: false })
        .limit(1);
      const rij = (laatste ?? [])[0] as { datum: string } | undefined;
      if (!rij || nu - Date.parse(rij.datum) >= 3 * DAG_MS) {
        gestopt.push(link.klant_naam);
      }
    }
    if (gestopt.length > 0) {
      meld(
        "check-in-gestopt",
        "let-op",
        `${gestopt.length} actieve klant(en) 3+ dagen zonder check-in: ${gestopt.slice(0, 5).join(", ")}${gestopt.length > 5 ? ", ..." : ""}`,
      );
    } else {
      meld("check-in-gestopt", "ok", `${echte.length} actieve klant(en) gecheckt`);
    }
  } catch (e) {
    meld("check-in-gestopt", "let-op", `check faalde: ${e instanceof Error ? e.message : "onbekend"}`);
  }

  // ── 4. Open teamvragen ouder dan 24 uur: daar zit een klant te wachten.
  try {
    const { count } = await admin
      .from("resetcode_kennis")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .lt("created_at", new Date(nu - DAG_MS).toISOString());
    if ((count ?? 0) > 0) {
      meld("teamvragen", "let-op", `${count} teamvraag/-vragen staan 24+ uur open op /resetcode-kennis`);
    } else {
      meld("teamvragen", "ok", "geen oude open teamvragen");
    }
  } catch (e) {
    meld("teamvragen", "let-op", `check faalde: ${e instanceof Error ? e.message : "onbekend"}`);
  }

  // ── 5. Push-abonnementen: 0 actieve abonnementen zou betekenen dat
  //      alle seintjes stil de mist ingaan.
  try {
    const { count } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    if ((count ?? 0) === 0) {
      meld("push", "rood", "0 actieve push-abonnementen: alle seintjes gaan stil verloren");
    } else {
      meld("push", "ok", `${count} actieve push-abonnement(en)`);
    }
  } catch (e) {
    meld("push", "let-op", `check faalde: ${e instanceof Error ? e.message : "onbekend"}`);
  }

  // ── 6. Deploy-status van main: een failure of een deploy die al 30+
  //      minuten op "pending" hangt (precedent: de gemiste deploy van
  //      78e4235 op 28 juli).
  try {
    const r = await fetch(
      "https://api.github.com/repos/cool-raoul/change-masters-60-day/commits/main/status",
      { headers: { "User-Agent": "eleva-nachtwacht" }, cache: "no-store" },
    );
    const j = (await r.json()) as {
      state?: string;
      statuses?: { context: string; created_at: string }[];
    };
    if (j.state === "failure" || j.state === "error") {
      meld("deploy", "rood", "laatste deploy van main is GEFAALD (zie Vercel)");
    } else if (j.state === "pending") {
      const oudste = (j.statuses ?? [])[0]?.created_at;
      const minuten = oudste ? Math.round((nu - Date.parse(oudste)) / 60_000) : null;
      if (minuten === null || minuten >= 30) {
        meld("deploy", "rood", `deploy van main hangt op pending${minuten !== null ? ` (${minuten} min)` : " (geen status van Vercel)"}`);
      } else {
        meld("deploy", "ok", `deploy loopt nog (${minuten} min)`);
      }
    } else {
      meld("deploy", "ok", "laatste deploy van main is groen");
    }
  } catch (e) {
    meld("deploy", "let-op", `check faalde: ${e instanceof Error ? e.message : "onbekend"}`);
  }

  // ── Rapport + alarmering ─────────────────────────────────────────
  const rood = bevindingen.filter((b) => b.niveau === "rood");
  const letOp = bevindingen.filter((b) => b.niveau === "let-op");
  const alarm = rood.length > 0 || letOp.length > 0;

  if (alarm) {
    try {
      const { data: founders } = await admin
        .from("profiles")
        .select("id, email, notificatie_email")
        .eq("role", "founder");
      type Founder = { id: string; email: string | null; notificatie_email: string | null };
      const lijst = (founders ?? []) as Founder[];

      const emoji = rood.length > 0 ? "🔴" : "🟡";
      const titel = `🌙 Nachtwacht: ${rood.length > 0 ? `${rood.length} rood` : `${letOp.length} aandachtspunt(en)`}`;
      const kort = [...rood, ...letOp]
        .slice(0, 2)
        .map((b) => b.detail)
        .join(" • ");
      await Promise.allSettled(
        lijst.map((f) =>
          sendPushToUser(f.id, {
            title: titel,
            body: kort || "Bekijk het rapport in je mail.",
            url: "/dashboard",
            tag: "nachtwacht",
          }),
        ),
      );

      const rijen = bevindingen
        .map((b) => {
          const dot = b.niveau === "rood" ? "🔴" : b.niveau === "let-op" ? "🟡" : "✅";
          return `<tr><td style="padding:6px 10px">${dot}</td><td style="padding:6px 10px"><b>${b.check}</b></td><td style="padding:6px 10px">${b.detail}</td></tr>`;
        })
        .join("");
      const html = `
        <div style="font-family:sans-serif;max-width:620px">
          <h2 style="margin:0 0 4px">${emoji} Nachtwacht-rapport</h2>
          <p style="color:#555;margin:0 0 16px">Automatische nachtronde van ${new Intl.DateTimeFormat("nl-NL", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(new Date())}</p>
          <table style="border-collapse:collapse;background:#f7f7f7;border-radius:8px">${rijen}</table>
          <p style="color:#888;font-size:13px;margin-top:16px">Dit is de lichte automatische ronde. Voor een diepe analyse: vraag Claude om de data-wachter- of nachtwacht-agent te draaien.</p>
        </div>`;
      await Promise.allSettled(
        lijst
          .map((f) => f.notificatie_email || f.email)
          .filter((m): m is string => Boolean(m))
          .map((naar) =>
            verstuurMail({
              naar,
              onderwerp: `${emoji} Nachtwacht: ${rood.length} rood, ${letOp.length} aandacht`,
              html,
            }),
          ),
      );
    } catch (e) {
      console.error("[nachtwacht] alarmering faalde:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    alarm,
    rood: rood.length,
    letOp: letOp.length,
    bevindingen,
  });
}

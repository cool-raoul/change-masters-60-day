import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push/sendPush";

// ============================================================
// /api/reminders/stilte
//
// Wordt elk uur via GitHub Actions cron aangeroepen, naast de bestaande
// /api/reminders/send. Filtert per member op zijn lokale uur + tijdzone
// (zelfde mechaniek als de ochtend-herinnering) zodat de stilte-nudge
// óók 1× per dag op zijn voorkeurstijd valt.
//
// Gedrag:
// - Member zit in dag 1-21 van de run (run_startdatum is gevuld).
// - Geen activiteit gisteren én eergisteren = stille periode.
// - Bij 1 dag stilte → vriendelijke push naar member (1× per 24u).
// - Bij 2+ dagen stilte → stevigere push naar member (1× per 24u)
//   + push naar sponsor (1× per 72u per member-sponsor combi).
// - Eerste run-dag (vandaag = startdatum) krijgt geen nudge.
// ============================================================

function huidigUurInTijdzone(tz: string): number | null {
  try {
    const fmt = new Intl.DateTimeFormat("nl-NL", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    });
    const val = parseInt(fmt.format(new Date()), 10);
    if (Number.isNaN(val) || val < 0 || val > 23) return null;
    return val;
  } catch {
    return null;
  }
}

function dagenTussen(vroeger: Date, later: Date): number {
  const ms = later.getTime() - vroeger.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function urenGeleden(d: Date | null): number {
  if (!d) return Infinity;
  const ms = Date.now() - d.getTime();
  return ms / (1000 * 60 * 60);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Pak alle members met lopende run + toggles + sponsor-info
  const { data: profielen } = await supabase
    .from("profiles")
    .select(
      "id, full_name, run_startdatum, sponsor_id, stilte_reminder_aan, sponsor_stilte_push_aan, laatste_stilte_reminder_op, dagelijkse_push_uur, tijdzone, dagelijkse_push_aan",
    )
    .not("run_startdatum", "is", null);

  if (!profielen || profielen.length === 0) {
    return NextResponse.json({ message: "Geen actieve members", verzonden: 0 });
  }

  type Profiel = {
    id: string;
    full_name: string | null;
    run_startdatum: string;
    sponsor_id: string | null;
    stilte_reminder_aan: boolean | null;
    sponsor_stilte_push_aan: boolean | null;
    laatste_stilte_reminder_op: string | null;
    dagelijkse_push_uur: number | null;
    tijdzone: string | null;
    dagelijkse_push_aan: boolean | null;
  };

  let memberPushes = 0;
  let sponsorPushes = 0;
  const fouten: string[] = [];

  for (const rij of profielen as Profiel[]) {
    // 1) Filter op lokaal uur (zelfde mechaniek als ochtendherinnering)
    const tz = rij.tijdzone || "Europe/Amsterdam";
    const gewenstUur = rij.dagelijkse_push_uur ?? 7;
    const huidigUur = huidigUurInTijdzone(tz);
    if (huidigUur === null || huidigUur !== gewenstUur) continue;

    // 2) Skip als hele dagelijkse push uitstaat (master-toggle)
    const dagelijkseAan = rij.dagelijkse_push_aan ?? true;
    if (!dagelijkseAan) continue;

    // 3) Bepaal welke run-dag de member nu zit. Buiten dag 2-21 → skip:
    //    - dag 1 (vandaag is startdag, nog niets verwacht)
    //    - dag > 21 (run zit in fase 2/3 zonder dagtegels)
    const start = new Date(rij.run_startdatum + "T00:00:00Z");
    const dagNummer = dagenTussen(start, new Date()) + 1;
    if (dagNummer < 2 || dagNummer > 21) continue;

    // 4) Pak laatste activiteit uit dag_voltooiingen
    const { data: laatsteRijen } = await supabase
      .from("dag_voltooiingen")
      .select("voltooid_op")
      .eq("user_id", rij.id)
      .order("voltooid_op", { ascending: false })
      .limit(1);
    const laatsteActiviteit =
      (laatsteRijen as Array<{ voltooid_op: string }> | null)?.[0]
        ?.voltooid_op ?? null;

    // 5) Bereken stilte-dagen (afgerond naar boven, in tijdzone-onafhankelijke
    //    24-uurs blokken — fijnere granulariteit niet nodig).
    let stilteDagen: number;
    if (!laatsteActiviteit) {
      // Nooit afgevinkt → stilte vanaf dag 1 van de run
      stilteDagen = dagNummer - 1;
    } else {
      stilteDagen = dagenTussen(new Date(laatsteActiviteit), new Date());
    }

    if (stilteDagen < 1) continue; // Vandaag al activiteit gehad

    // 6) Member-nudge — automatisch onderdeel van ELEVA's coaching.
    //    Geen aparte toggle (master-push-toggle is dagelijkse_push_aan).
    //    Wel >24u anti-spam tussen pushes.
    const urenSindsVorigeNudge = urenGeleden(
      rij.laatste_stilte_reminder_op
        ? new Date(rij.laatste_stilte_reminder_op)
        : null,
    );
    if (urenSindsVorigeNudge >= 24) {
      const voornaam = rij.full_name?.split(" ")[0] || "Hey";
      const titel =
        stilteDagen === 1
          ? `Hey ${voornaam}, dag ${dagNummer} wacht op je 💛`
          : `${voornaam}, ${stilteDagen} dagen geen activiteit`;
      const body =
        stilteDagen === 1
          ? `Eén kleine stap is al een win — pak dag ${dagNummer} erbij.`
          : `We missen je. Je bent op dag ${dagNummer}. Eén kleine stap is genoeg om weer te starten.`;
      const res = await sendPushToUser(rij.id, {
        title: titel,
        body,
        url: `/playbook?dag=${dagNummer}`,
        tag: `stilte-${rij.id}`,
      });
      if (res.success) {
        memberPushes++;
        await supabase
          .from("profiles")
          .update({ laatste_stilte_reminder_op: new Date().toISOString() })
          .eq("id", rij.id);
      } else if (res.reason) {
        fouten.push(`member ${rij.id}: ${res.reason}`);
      }
    }

    // 7) Sponsor-push — alleen bij 2+ dagen stilte, sponsor-toggle aan,
    //    en >72u sinds vorige sponsor-push voor dezelfde member.
    if (stilteDagen >= 2 && rij.sponsor_id) {
      // Sponsor-toggle ophalen (apart, want sponsor is een ándere user)
      const { data: sponsorProfiel } = await supabase
        .from("profiles")
        .select("sponsor_stilte_push_aan, full_name")
        .eq("id", rij.sponsor_id)
        .maybeSingle();
      const sponsorAan =
        (sponsorProfiel as { sponsor_stilte_push_aan: boolean | null } | null)
          ?.sponsor_stilte_push_aan ?? true;
      if (!sponsorAan) continue;

      // Anti-spam: laatste push voor deze (sponsor, member)?
      const { data: vorigeSponsorPush } = await supabase
        .from("sponsor_stilte_pushes")
        .select("laatst_op")
        .eq("sponsor_id", rij.sponsor_id)
        .eq("member_id", rij.id)
        .maybeSingle();
      const urenSindsVorigeSponsor = urenGeleden(
        (vorigeSponsorPush as { laatst_op: string } | null)?.laatst_op
          ? new Date(
              (vorigeSponsorPush as { laatst_op: string }).laatst_op,
            )
          : null,
      );
      if (urenSindsVorigeSponsor < 72) continue;

      const memberNaam = rij.full_name || "Een teamlid";
      const sponsorRes = await sendPushToUser(rij.sponsor_id, {
        title: `${memberNaam} — ${stilteDagen} dagen stil`,
        body: `Een belletje of berichtje kan helpen om weer in beweging te komen.`,
        url: `/team`,
        tag: `sponsor-stilte-${rij.id}`,
      });
      if (sponsorRes.success) {
        sponsorPushes++;
        await supabase.from("sponsor_stilte_pushes").upsert(
          {
            sponsor_id: rij.sponsor_id,
            member_id: rij.id,
            laatst_op: new Date().toISOString(),
          },
          { onConflict: "sponsor_id,member_id" },
        );
      } else if (sponsorRes.reason) {
        fouten.push(`sponsor ${rij.sponsor_id} → ${rij.id}: ${sponsorRes.reason}`);
      }
    }
  }

  return NextResponse.json({
    message: `${memberPushes} member-nudges + ${sponsorPushes} sponsor-pushes verzonden`,
    member_pushes: memberPushes,
    sponsor_pushes: sponsorPushes,
    fouten: fouten.length > 0 ? fouten : undefined,
  });
}

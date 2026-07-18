import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/start
//
// De klant kiest zijn startmoment: vandaag, morgen of een datum.
// Vanaf die dag telt dag 1 (check-ins, dag 10, einde-moment) en
// de begeleider krijgt een seintje, zodat iedereen hetzelfde
// startmoment kent.
//
// Body: { token, datum: "YYYY-MM-DD" }
// ============================================================

function vandaagNL(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const datum = (body.datum as string | undefined) ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return Response.json({ error: "Ongeldige datum" }, { status: 400 });
  }
  const vandaag = vandaagNL();
  const verschilDagen = Math.round(
    (Date.parse(datum) - Date.parse(vandaag)) / 86_400_000,
  );
  if (verschilDagen < 0 || verschilDagen > 60) {
    return Response.json(
      { error: "Kies een dag vanaf vandaag" },
      { status: 400 },
    );
  }

  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const admin = createAdminClient();
  await admin
    .from("resetcode_klant_links")
    .update({
      start_datum: datum,
      laatste_activiteit: new Date().toISOString(),
    })
    .eq("id", ctx.linkId);

  const wanneer =
    verschilDagen === 0
      ? "vandaag"
      : verschilDagen === 1
        ? "morgen"
        : `op ${new Intl.DateTimeFormat("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "Europe/Amsterdam",
          }).format(new Date(`${datum}T12:00:00`))}`;
  await seintjeNaarMember(
    ctx,
    `${ctx.klantVoornaam} start ${wanneer} 🚀`,
    verschilDagen === 0
      ? `${ctx.klantNaam} begint vandaag aan dag 1. Een persoonlijk succes-berichtje doet nu wonderen.`
      : `${ctx.klantNaam} heeft ${wanneer} als startmoment gekozen. Even een aanmoedigings-berichtje rond de start doet wonderen.`,
  );

  return Response.json({ ok: true });
}

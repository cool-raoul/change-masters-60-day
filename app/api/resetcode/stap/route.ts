import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";
import { stationVoor, programmaVoor } from "@/lib/resetcode/programma";

// ============================================================
// POST /api/resetcode/stap
//
// Klant gaat naar een andere stap in het programma. Bewaart de
// plek (zodat de Mentor daar verdergaat) en stuurt de
// begeleider een seintje: dit zijn precies de pulse-momenten
// waarop persoonlijk contact het verschil maakt.
//
// Body: { token, station }
// ============================================================

// De contactMoment-teksten in programma.ts zijn voor de KLANT geschreven
// ("plan een momentje met je begeleider"). Naar de begeleider sturen we
// dezelfde momenten, maar dan vanuit zíjn kant, met de naam van de klant
// ({n}) erin (feedback Raoul 28 juli: de klant-tekst als push voelde
// alsof de begeleider met zichzelf moest afspreken).
const CONTACT_VOOR_MEMBER: Record<string, string> = {
  "Laat je begeleider weten wanneer je pakket binnen is en welke dag je start.":
    "{n} laat je weten wanneer het pakket binnen is en welke dag de start wordt.",
  "Rond het einde van de 16 dagen: plan een momentje met je begeleider over jouw vervolgstap.":
    "Rond het einde van de 16 dagen: plan een momentje met {n} over de vervolgstap.",
  "Laat je begeleider even weten dat je gestart bent met de reset.":
    "{n} is gestart met de reset. Een persoonlijk berichtje doet nu wonderen.",
  "Plan vóór het einde van fase 2 een momentje met je begeleider om fase 3 samen door te nemen.":
    "Plan vóór het einde van fase 2 een momentje met {n} om fase 3 samen door te nemen.",
  "Aan het einde van fase 4: plan het vervolg-gesprek met je begeleider over jouw ritme na het programma.":
    "Aan het einde van fase 4: plan het vervolg-gesprek met {n} over het ritme na het programma.",
  "Laat je begeleider weten wanneer je pakket binnen is en hoe de eerste dagen voelen.":
    "{n} laat je weten wanneer het pakket binnen is en hoe de eerste dagen voelen.",
  "Rond twee weken: deel je eerste ervaringen even met je begeleider.":
    "Rond twee weken: {n} deelt de eerste ervaringen even met je.",
  "Rond drie weken: plan een momentje met je begeleider om terug te blikken en vooruit te kijken.":
    "Rond drie weken: plan een momentje met {n} om samen terug te blikken en vooruit te kijken.",
  "Rond twee maanden: bespreek met je begeleider je blijvende routine, en of de webshop iets voor jou is.":
    "Rond twee maanden: bespreek samen met {n} de blijvende routine, en of de webshop iets voor {n} is.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const stationSlug = (body.station as string | undefined) ?? "";

  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }
  const station = stationVoor(ctx.programmaSlug, stationSlug);
  if (!station) {
    return Response.json({ error: "Onbekend station" }, { status: 400 });
  }
  if (ctx.stationSlug === stationSlug) return Response.json({ ok: true });

  const admin = createAdminClient();
  await admin
    .from("resetcode_klant_links")
    .update({
      station_slug: stationSlug,
      station_sinds: new Date().toISOString(),
      laatste_activiteit: new Date().toISOString(),
    })
    .eq("id", ctx.linkId);

  const programma = programmaVoor(ctx.programmaSlug);
  const cm = station.contactMoment;
  await seintjeNaarMember(
    ctx,
    `${ctx.klantVoornaam} is bij ${station.emoji} ${station.naam}`,
    cm
      ? `Contactmoment! ${(
          CONTACT_VOOR_MEMBER[cm] ?? `Plan een momentje met {n}.`
        ).replaceAll("{n}", ctx.klantVoornaam)}`
      : `${ctx.klantNaam} is doorgegaan naar stap ${station.nummer} van ${programma?.stations.length ?? "?"} (${programma?.naam ?? ""}). Even een berichtje sturen doet wonderen.`,
  );

  return Response.json({ ok: true });
}

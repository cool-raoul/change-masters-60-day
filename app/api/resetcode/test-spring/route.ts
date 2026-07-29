import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/test-spring
//
// Dag-springen op TEST-reis-links (laatste testronde, Raoul 23
// juli): het team beleeft de klant-reis dag voor dag, versneld.
// Alleen voor links waarvan (a) het token met "reis" begint én
// (b) de eigenaar (member) een founder is. Echte klant-links
// kunnen hier dus nooit mee verzet worden.
//
// Body: { token, actie: "vooruit" | "terug" | "reset" }
// - vooruit/terug: verschuift de reis één dag (en wist de
//   check-in + vinkjes van vandaag, zodat elke testdag vers is)
// - reset: de hele reis terug naar het begin (chats, check-ins,
//   touchpoints, vinkjes, pakket en startdatum gewist)
// ============================================================

const EERSTE_STATION: Record<string, string> = {
  darm: "start",
  reset: "voorbereiding",
  producten: "welkom",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const actie = (body.actie as string | undefined) ?? "";
  if (!["vooruit", "terug", "reset"].includes(actie)) {
    return Response.json({ error: "Onbekende actie" }, { status: 400 });
  }
  if (!token.startsWith("reis")) {
    return Response.json({ error: "Geen test-link" }, { status: 403 });
  }
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data: eigenaar } = await admin
    .from("profiles")
    .select("role")
    .eq("id", ctx.memberId)
    .maybeSingle();
  if ((eigenaar as { role?: string } | null)?.role !== "founder") {
    return Response.json({ error: "Geen test-link" }, { status: 403 });
  }

  const vandaag = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());

  if (actie === "reset") {
    await admin.from("resetcode_chats").delete().eq("link_id", ctx.linkId);
    await admin.from("resetcode_checkin").delete().eq("link_id", ctx.linkId);
    await admin.from("resetcode_innames").delete().eq("link_id", ctx.linkId);
    await admin.from("resetcode_kcal_log").delete().eq("link_id", ctx.linkId);
    await admin
      .from("resetcode_klant_links")
      .update({
        touchpoints: [],
        station_slug: EERSTE_STATION[ctx.programmaSlug] ?? "start",
        station_sinds: new Date().toISOString(),
        start_datum: null,
        pakket: null,
      })
      .eq("id", ctx.linkId);
    return Response.json({ ok: true });
  }

  // vooruit = de reis ouder maken (alles schuift terug in de tijd),
  // terug = jonger. Optioneel meerdere dagen tegelijk (body.dagen), om
  // direct naar een volgend bijzonder moment te springen.
  const aantalRuw = Number(body.dagen);
  const aantal =
    Number.isFinite(aantalRuw) && aantalRuw >= 1 && aantalRuw <= 45
      ? Math.floor(aantalRuw)
      : 1;
  const delta = (actie === "vooruit" ? -1 : 1) * aantal;
  const { data: rij } = await admin
    .from("resetcode_klant_links")
    .select("station_sinds, start_datum")
    .eq("id", ctx.linkId)
    .maybeSingle();
  const r = rij as { station_sinds: string | null; start_datum: string | null } | null;
  const updates: Record<string, string> = {};
  if (r?.station_sinds) {
    const nieuw = new Date(
      new Date(r.station_sinds).getTime() + delta * 86_400_000,
    );
    // Vloer op dag 1: "dag terug" mag de fase-start nooit voorbij "nu"
    // duwen, anders wordt de dag-teller "—" en speelt het aftel-welkom
    // van de voorbereiding midden in een latere fase (bug Raoul 27 juli).
    updates.station_sinds = (
      delta > 0 && nieuw.getTime() > Date.now() ? new Date() : nieuw
    ).toISOString();
  }
  if (r?.start_datum) {
    const d = new Date(Date.parse(r.start_datum) + delta * 86_400_000);
    // Zelfde vloer als station_sinds: "dag terug" mag de startdatum
    // nooit voorbij vandaag duwen, anders speelt het aftel-welkom
    // midden in de 16 dagen (agent-jacht 29 juli).
    const vandaagD = new Date(`${vandaag}T00:00:00Z`);
    const geklemd = delta > 0 && d.getTime() > vandaagD.getTime() ? vandaagD : d;
    updates.start_datum = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "UTC",
    }).format(geklemd);
  }
  if (Object.keys(updates).length > 0) {
    await admin
      .from("resetcode_klant_links")
      .update(updates)
      .eq("id", ctx.linkId);
  }
  // Check-ins en schema-vinkjes schuiven MEE met de sprong (de check-in
  // van "vandaag" wordt gisteren, enz.): zo bouwt de voortgangs-reeks
  // zich op zoals bij een echte klant, en is vandaag weer vrij voor een
  // verse check-in (feedback Raoul 23 juli: de voortgang bleef leeg).
  // Volgorde is belangrijk vanwege de unieke datum per link: bij vooruit
  // eerst de oudste rij verschuiven, bij terug eerst de nieuwste.
  const schuif = async (tabel: string) => {
    const { data } = await admin
      .from(tabel)
      .select("id, datum")
      .eq("link_id", ctx.linkId)
      .order("datum", { ascending: delta < 0 });
    for (const rij of (data ?? []) as { id: string; datum: string }[]) {
      const nieuw = new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC" }).format(
        new Date(Date.parse(rij.datum) + delta * 86_400_000),
      );
      await admin.from(tabel).update({ datum: nieuw }).eq("id", rij.id);
    }
  };
  await schuif("resetcode_checkin");
  await schuif("resetcode_innames");
  await schuif("resetcode_kcal_log");
  void vandaag;
  return Response.json({ ok: true });
}

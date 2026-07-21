import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Beheer van Resetcode-klant-links door het member.
// Auth: ingelogde founder/tester (pilot-fase; later hele team).
// RLS doet de rest: member ziet en beheert alleen eigen links.
//
// GET    → eigen links
// POST   { naam, programma } → nieuwe link
// PATCH  { id, status } → pauzeren/sluiten/heractiveren
// ============================================================

async function checkToegang() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fout: new Response("Niet ingelogd", { status: 401 }) };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as { role?: string | null; is_tester?: boolean | null } | null;
  if (!(p?.role === "founder" || p?.is_tester === true)) {
    return {
      fout: new Response("Alleen voor founders en testers (pilot)", {
        status: 403,
      }),
    };
  }
  return { supabase, user };
}

export async function GET() {
  const t = await checkToegang();
  if ("fout" in t) return t.fout;
  const { data } = await t.supabase
    .from("resetcode_klant_links")
    .select("id, token, klant_naam, programma, station_slug, status, laatste_activiteit, created_at")
    .order("created_at", { ascending: false });
  const links = (data ?? []) as { id: string }[];

  // Laatste seintje per link erbij (RLS: eigen links), zodat een klik
  // op een pushbericht hier de context terugvindt.
  let seintjes: {
    link_id: string;
    titel: string;
    detail: string | null;
    created_at: string;
  }[] = [];
  if (links.length > 0) {
    const { data: sData } = await t.supabase
      .from("resetcode_seintjes")
      .select("link_id, titel, detail, created_at")
      .in(
        "link_id",
        links.map((l) => l.id),
      )
      .order("created_at", { ascending: false })
      .limit(100);
    seintjes = (sData ?? []) as typeof seintjes;
  }
  const laatstePerLink: Record<string, (typeof seintjes)[number]> = {};
  for (const s of seintjes) {
    if (!laatstePerLink[s.link_id]) laatstePerLink[s.link_id] = s;
  }
  return Response.json({
    ok: true,
    links: links.map((l) => ({
      ...l,
      laatste_seintje: laatstePerLink[l.id] ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const t = await checkToegang();
  if ("fout" in t) return t.fout;
  const body = await req.json().catch(() => ({}));
  let naam = ((body.naam as string | undefined) ?? "").trim().slice(0, 80);
  const programma = (body.programma as string | undefined) ?? "";
  const prospectId = (body.prospectId as string | undefined) ?? null;
  const isBouwer = Boolean(body.isBouwer);
  if (!["darm", "reset", "producten"].includes(programma)) {
    return new Response("onbekend programma", { status: 400 });
  }

  // Vanaf de klantenkaart: koppel aan de prospect (RLS bewaakt eigendom)
  // en pak de naam van de kaart als die niet is meegegeven.
  if (prospectId) {
    const { data: prospect } = await t.supabase
      .from("prospects")
      .select("id, volledige_naam")
      .eq("id", prospectId)
      .maybeSingle();
    if (!prospect) {
      return new Response("onbekende prospect", { status: 404 });
    }
    if (!naam) {
      naam = ((prospect as { volledige_naam?: string | null }).volledige_naam ?? "").trim();
    }
  }
  if (!naam) return new Response("naam is vereist", { status: 400 });

  const token = `k-${randomUUID().replace(/-/g, "")}`;
  const { data, error } = await t.supabase
    .from("resetcode_klant_links")
    .insert({
      token,
      member_id: t.user.id,
      klant_naam: naam,
      programma,
      prospect_id: prospectId,
      is_bouwer: isBouwer,
    })
    .select("id, token, klant_naam, programma, status")
    .single();
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true, link: data });
}

export async function PATCH(req: NextRequest) {
  const t = await checkToegang();
  if ("fout" in t) return t.fout;
  const body = await req.json().catch(() => ({}));
  const id = (body.id as string | undefined) ?? "";
  if (!id) return new Response("id vereist", { status: 400 });

  // Vervolg-programma vrijgeven of weer op slot (doorgroei-route):
  // hetzelfde token, de klant krijgt de start-knop na het einde.
  const vrijgeven = (body.vrijgeven as string | undefined) ?? "";
  const intrekken = (body.intrekken as string | undefined) ?? "";
  if (vrijgeven || intrekken) {
    const slug = vrijgeven || intrekken;
    if (!["darm", "reset", "producten"].includes(slug)) {
      return new Response("onbekend programma", { status: 400 });
    }
    const { data: rij } = await t.supabase
      .from("resetcode_klant_links")
      .select("vrijgegeven")
      .eq("id", id)
      .maybeSingle();
    if (!rij) return new Response("onbekende link", { status: 404 });
    const huidig = Array.isArray((rij as { vrijgegeven?: unknown }).vrijgegeven)
      ? ((rij as { vrijgegeven: string[] }).vrijgegeven)
      : [];
    const nieuw = vrijgeven
      ? Array.from(new Set([...huidig, slug]))
      : huidig.filter((s) => s !== slug);
    const { error } = await t.supabase
      .from("resetcode_klant_links")
      .update({ vrijgegeven: nieuw })
      .eq("id", id);
    if (error) return new Response(error.message, { status: 500 });
    return Response.json({ ok: true, vrijgegeven: nieuw });
  }

  const status = (body.status as string | undefined) ?? "";
  if (!["actief", "gepauzeerd", "gesloten"].includes(status)) {
    return new Response("geldige status vereist", { status: 400 });
  }
  const { error } = await t.supabase
    .from("resetcode_klant_links")
    .update({ status })
    .eq("id", id);
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}

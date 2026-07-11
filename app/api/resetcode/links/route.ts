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
  return Response.json({ ok: true, links: data ?? [] });
}

export async function POST(req: NextRequest) {
  const t = await checkToegang();
  if ("fout" in t) return t.fout;
  const body = await req.json().catch(() => ({}));
  let naam = ((body.naam as string | undefined) ?? "").trim().slice(0, 80);
  const programma = (body.programma as string | undefined) ?? "";
  const prospectId = (body.prospectId as string | undefined) ?? null;
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
  const status = (body.status as string | undefined) ?? "";
  if (!id || !["actief", "gepauzeerd", "gesloten"].includes(status)) {
    return new Response("id en geldige status vereist", { status: 400 });
  }
  const { error } = await t.supabase
    .from("resetcode_klant_links")
    .update({ status })
    .eq("id", id);
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}

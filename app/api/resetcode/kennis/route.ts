import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// /api/resetcode/kennis (founders only)
//
// GET  : lijst open + beantwoorde kennis-items
// POST : { actie: "beantwoord", id, antwoord, programma? }
//        { actie: "afwijzen", id }
//        { actie: "nieuw", vraag, antwoord, programma }
//
// Beantwoorde items gaan direct mee in het Mentor-brein; de klant
// die de vraag stelde krijgt bij het volgende bezoek een
// terugkom-bericht.
// ============================================================

async function checkFounder(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as { role?: string | null } | null)?.role === "founder"
    ? user.id
    : null;
}

export async function GET() {
  const founderId = await checkFounder();
  if (!founderId) {
    return Response.json({ error: "Alleen founders" }, { status: 403 });
  }
  const admin = createAdminClient();
  const { data } = await admin
    .from("resetcode_kennis")
    .select("id, programma, vraag, antwoord, status, bron, created_at, beantwoord_op")
    .neq("status", "afgewezen")
    .order("created_at", { ascending: false })
    .limit(200);
  return Response.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const founderId = await checkFounder();
  if (!founderId) {
    return Response.json({ error: "Alleen founders" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const actie = body.actie as string | undefined;
  const admin = createAdminClient();
  const PROGRAMMAS = ["darm", "reset", "producten", "algemeen"];

  if (actie === "beantwoord") {
    const id = (body.id as string | undefined) ?? "";
    const antwoord = ((body.antwoord as string | undefined) ?? "").trim();
    if (!id || !antwoord) {
      return Response.json({ error: "id en antwoord vereist" }, { status: 400 });
    }
    const update: Record<string, unknown> = {
      antwoord: antwoord.slice(0, 2000),
      status: "beantwoord",
      beantwoord_op: new Date().toISOString(),
      beantwoord_door: founderId,
    };
    if (PROGRAMMAS.includes(body.programma)) update.programma = body.programma;
    const { error } = await admin
      .from("resetcode_kennis")
      .update(update)
      .eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (actie === "afwijzen") {
    const id = (body.id as string | undefined) ?? "";
    if (!id) return Response.json({ error: "id vereist" }, { status: 400 });
    const { error } = await admin
      .from("resetcode_kennis")
      .update({ status: "afgewezen" })
      .eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (actie === "nieuw") {
    const vraag = ((body.vraag as string | undefined) ?? "").trim();
    const antwoord = ((body.antwoord as string | undefined) ?? "").trim();
    const programma = PROGRAMMAS.includes(body.programma)
      ? (body.programma as string)
      : "algemeen";
    if (!vraag || !antwoord) {
      return Response.json({ error: "vraag en antwoord vereist" }, { status: 400 });
    }
    const { error } = await admin.from("resetcode_kennis").insert({
      programma,
      vraag: vraag.slice(0, 600),
      antwoord: antwoord.slice(0, 2000),
      status: "beantwoord",
      bron: "founder",
      beantwoord_op: new Date().toISOString(),
      beantwoord_door: founderId,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Onbekende actie" }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mentor-trainen/voorbeeld
//
// Voegt een nieuw vraag-antwoord-voorbeeld toe. Alleen founders.
// RLS van de tabel doet de daadwerkelijke check, maar we falen hier
// vroeg voor een nettere foutmelding.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Founder-check
    const { data: profielRow } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profielRow as { role?: string | null } | null)?.role !== "founder") {
      return NextResponse.json(
        { error: "Alleen founders mogen voorbeelden toevoegen" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const doelgroep = String(body.doelgroep ?? "member").trim() || "member";
    const categorie = String(body.categorie ?? "algemeen").trim() || "algemeen";
    const vraag = String(body.vraag ?? "").trim();
    const goed_antwoord = String(body.goed_antwoord ?? "").trim();
    const tags = Array.isArray(body.tags)
      ? (body.tags as unknown[])
          .map((t) => String(t).trim().toLowerCase())
          .filter((t) => t.length > 0)
      : [];

    if (vraag.length < 5 || goed_antwoord.length < 10) {
      return NextResponse.json(
        { error: "Vraag (min 5 tekens) en antwoord (min 10 tekens) verplicht" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("coach_voorbeelden").insert({
      created_by: user.id,
      doelgroep,
      categorie,
      vraag,
      goed_antwoord,
      tags,
    });
    if (error) {
      return NextResponse.json(
        { error: "Opslaan mislukt: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("voorbeeld POST exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

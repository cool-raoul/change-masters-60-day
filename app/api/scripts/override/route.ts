import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/scripts/override
//
// Body: { scriptId: string, titel?: string, inhoud?: string,
//         reset?: boolean }
//
// PARTIAL update: alleen velden die in de body staan worden gewijzigd.
// Lege string ("") = reset naar standaard (NULL in DB).
// reset=true = hele rij weg.
//
// Founder-only.
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

    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string | null } | null)?.role !== "founder") {
      return NextResponse.json(
        { error: "Geen toegang — alleen voor founders" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const scriptId: string = body.scriptId;
    if (!scriptId || typeof scriptId !== "string" || scriptId.length > 80) {
      return NextResponse.json(
        { error: "Ongeldige scriptId" },
        { status: 400 },
      );
    }

    if (body.reset === true) {
      const { error: delErr } = await supabase
        .from("script_overrides")
        .delete()
        .eq("script_id", scriptId);
      if (delErr) {
        return NextResponse.json(
          { error: "Reset mislukt: " + delErr.message },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, reset: true });
    }

    const { data: bestaand } = await supabase
      .from("script_overrides")
      .select("titel, inhoud")
      .eq("script_id", scriptId)
      .maybeSingle();

    const trim = (v: unknown) =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
    const huidig = (bestaand ?? {}) as Record<string, string | null>;

    const payload: Record<string, unknown> = {
      script_id: scriptId,
      titel: Object.prototype.hasOwnProperty.call(body, "titel")
        ? trim(body.titel)
        : (huidig.titel ?? null),
      inhoud: Object.prototype.hasOwnProperty.call(body, "inhoud")
        ? trim(body.inhoud)
        : (huidig.inhoud ?? null),
      updated_by: user.id,
    };

    if (!payload.titel && !payload.inhoud) {
      // Alle velden NULL → row weg
      const { error: delErr } = await supabase
        .from("script_overrides")
        .delete()
        .eq("script_id", scriptId);
      if (delErr) {
        return NextResponse.json(
          { error: "Opschonen mislukt: " + delErr.message },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, leeg: true });
    }

    const { error: upsertErr } = await supabase
      .from("script_overrides")
      .upsert(payload, { onConflict: "script_id" });
    if (upsertErr) {
      return NextResponse.json(
        { error: "Opslaan mislukt: " + upsertErr.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("scripts/override exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/tekst/override
//
// Body: { namespace, sleutel, waarde, reset?: boolean }
//
// Generieke endpoint om tekst-overrides op te slaan voor founder-
// bewerkbare content (onboarding, welkom-popup, mentor-stijl, etc.).
//
// - waarde leeg of reset=true → row deleten (= terug naar standaard)
// - waarde niet leeg → upsert
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
    const namespace: string = body.namespace;
    const sleutel: string = body.sleutel;
    const reset = body.reset === true;
    const waarde: string =
      typeof body.waarde === "string" ? body.waarde : "";

    if (!namespace || !sleutel) {
      return NextResponse.json(
        { error: "namespace en sleutel zijn verplicht" },
        { status: 400 },
      );
    }
    if (namespace.length > 80 || sleutel.length > 200) {
      return NextResponse.json({ error: "Te lange key" }, { status: 400 });
    }

    if (reset || !waarde.trim()) {
      const { error: delErr } = await supabase
        .from("tekst_overrides")
        .delete()
        .eq("namespace", namespace)
        .eq("sleutel", sleutel);
      if (delErr) {
        return NextResponse.json(
          { error: "Reset mislukt: " + delErr.message },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, reset: true });
    }

    const { error: upsertErr } = await supabase
      .from("tekst_overrides")
      .upsert(
        {
          namespace,
          sleutel,
          waarde: waarde.trim(),
          updated_by: user.id,
        },
        { onConflict: "namespace,sleutel" },
      );
    if (upsertErr) {
      return NextResponse.json(
        { error: "Opslaan mislukt: " + upsertErr.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("tekst/override exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/cms/overrides?namespace=onboarding
//
// Returnt voor de ingelogde user:
// - overrides: { sleutel: waarde } voor de gegeven namespace
// - isFounder: of de user de ✏️-knoppen mag zien
//
// Wordt gebruikt door client-pages (zoals /onboarding) die geen
// server-prefetch hebben. Een server-rendered page kan haalTekstOverrides()
// rechtstreeks aanroepen — geen API-call nodig.
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const namespace = searchParams.get("namespace");
    if (!namespace || namespace.length > 80) {
      return NextResponse.json(
        { error: "namespace ontbreekt" },
        { status: 400 },
      );
    }

    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const isFounder =
      (profiel as { role?: string | null } | null)?.role === "founder";

    const { data, error } = await supabase
      .from("tekst_overrides")
      .select("sleutel, waarde")
      .eq("namespace", namespace);

    const overrides: Record<string, string> = {};
    if (!error && data) {
      for (const r of data as { sleutel: string; waarde: string }[]) {
        overrides[r.sleutel] = r.waarde;
      }
    }

    return NextResponse.json({ overrides, isFounder });
  } catch (e) {
    console.error("cms/overrides exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

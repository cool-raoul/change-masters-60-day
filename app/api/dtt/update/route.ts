import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/dtt/update
// Body: { doel_per_maand, uren_per_week, termijn_maanden }
// Slaat op in profiles.core_dtt (JSONB).
// ============================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

    const body = await request.json();
    const { doel_per_maand, uren_per_week, termijn_maanden } = body;

    if (
      isNaN(parseFloat(doel_per_maand)) ||
      isNaN(parseFloat(uren_per_week)) ||
      isNaN(parseFloat(termijn_maanden))
    ) {
      return NextResponse.json(
        { error: "Numerieke waardes vereist" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        core_dtt: {
          doel_per_maand: parseFloat(doel_per_maand),
          uren_per_week: parseFloat(uren_per_week),
          termijn_maanden: parseFloat(termijn_maanden),
        },
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("dtt-update exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/radar/afvinken
//
// Body: { prospectId: string }
// Schrijft een rij in radar_voltooiingen voor (user, prospect,
// CURRENT_DATE). UNIQUE-constraint vangt dubbele afvinkingen op —
// conflict = no-op, geen fout.
// ============================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = (await request.json()) as { prospectId?: string };
    const prospectId = body.prospectId;

    if (!prospectId || typeof prospectId !== "string") {
      return NextResponse.json({ error: "prospectId vereist" }, { status: 400 });
    }

    const { error } = await supabase.from("radar_voltooiingen").insert({
      user_id: user.id,
      prospect_id: prospectId,
    });

    // Negeer duplicate-key (al afgevinkt vandaag) — dat is een no-op.
    if (error && error.code !== "23505") {
      console.warn("radar-afvinken insert error:", error.message);
      return NextResponse.json({ error: "Afvinken mislukt" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("radar-afvinken exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

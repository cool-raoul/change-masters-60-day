import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/prospect/aanpak
//
// Slaat de gekozen aanpak op voor een prospect:
//   - 'drieweg'    klassiek 3-weg-gesprek met sponsor
//   - 'mini_eleva' eigen mini-ELEVA-omgeving (14 dagen)
//   - null         keuze terugzetten (nog niet besloten)
//
// Body: { prospectId: string, aanpak: 'drieweg' | 'mini_eleva' | null }
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

    const body = await req.json().catch(() => ({}));
    const prospectId = body.prospectId as string | undefined;
    const aanpak = body.aanpak as "drieweg" | "mini_eleva" | null | undefined;

    if (!prospectId) {
      return NextResponse.json(
        { error: "prospectId vereist" },
        { status: 400 },
      );
    }
    if (
      aanpak !== null &&
      aanpak !== undefined &&
      aanpak !== "drieweg" &&
      aanpak !== "mini_eleva"
    ) {
      return NextResponse.json(
        { error: "Ongeldige aanpak (drieweg/mini_eleva/null)" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("prospects")
      .update({ gekozen_aanpak: aanpak ?? null })
      .eq("id", prospectId)
      .eq("user_id", user.id);

    if (error) {
      // Kolom bestaat nog niet (migratie niet gerund)
      if (error.code === "42703" || error.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error:
              "Migratie mini_eleva_fase6d.sql nog niet gedraaid in Supabase",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, aanpak: aanpak ?? null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

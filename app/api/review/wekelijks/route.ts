import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/review/wekelijks
//
// Body: {
//   weekNummer: number (1-21+ voor Sprint of weekritme),
//   gingGoed: string,
//   nietSoepel: string,
//   focusVolgendeWeek: string,
//   gedeeldMetSponsor: boolean
// }
//
// Slaat een wekelijkse review op in de wekelijkse_reviews tabel.
// RLS-policy zorgt dat de member alleen eigen reviews kan invullen.
// Sponsor ziet alleen reviews waar gedeeldMetSponsor=true.
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
    const weekNummer = Number(body.weekNummer);
    if (!Number.isFinite(weekNummer) || weekNummer < 1) {
      return NextResponse.json(
        { error: "Ongeldig week-nummer" },
        { status: 400 },
      );
    }

    const trim = (v: unknown): string | null =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

    const payload = {
      user_id: user.id,
      week_nummer: weekNummer,
      ging_goed: trim(body.gingGoed),
      niet_soepel: trim(body.nietSoepel),
      focus_volgende_week: trim(body.focusVolgendeWeek),
      gedeeld_met_sponsor: body.gedeeldMetSponsor === true,
    };

    if (!payload.ging_goed && !payload.niet_soepel && !payload.focus_volgende_week) {
      return NextResponse.json(
        { error: "Vul minimaal één antwoord in" },
        { status: 400 },
      );
    }

    const { data: rij, error } = await supabase
      .from("wekelijkse_reviews")
      .insert(payload)
      .select("id")
      .maybeSingle();
    if (error) {
      // Tabel bestaat mogelijk nog niet (migratie nog te draaien)
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error:
              "Review-tabel bestaat nog niet in Supabase. Vraag Raoul om de migratie te draaien (lib/supabase/migrations/wekelijkse_reviews.sql).",
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "Opslaan mislukt: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: (rij as { id?: string } | null)?.id ?? null });
  } catch (e) {
    console.error("review/wekelijks exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

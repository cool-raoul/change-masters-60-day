import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/mini-eleva/upline
//
// Geeft de upline-keten van de huidige member terug, t/m max 5 niveaus
// omhoog. De prospect-member kiest uit deze lijst wie 'r erbij komt
// in de mini-ELEVA. Soms is de directe sponsor genoeg, soms helpt
// een ervarener persoon hoger in de keten meer.
//
// Response:
//   { upline: [
//       { id, naam, niveau: 1, isDirect: true },
//       { id, naam, niveau: 2 },
//       ...
//   ]}
//
// Niveau 1 = directe sponsor, niveau 2 = sponsor van sponsor, etc.
// Loop-protectie: max 5 niveaus, en stopt als 'n sponsor zichzelf is.
// ============================================================

export const dynamic = "force-dynamic";

const MAX_NIVEAUS = 5;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Loop omhoog door sponsor_id's
    type UplineNode = {
      id: string;
      naam: string;
      niveau: number;
      isDirect: boolean;
    };
    const upline: UplineNode[] = [];
    const gezien = new Set<string>([user.id]);

    let huidigeId = user.id;
    for (let niveau = 1; niveau <= MAX_NIVEAUS; niveau++) {
      const { data: profiel } = await supabase
        .from("profiles")
        .select("sponsor_id")
        .eq("id", huidigeId)
        .maybeSingle();
      const sponsorId = (profiel as { sponsor_id?: string } | null)
        ?.sponsor_id;
      if (!sponsorId || gezien.has(sponsorId)) break;
      gezien.add(sponsorId);

      const { data: sp } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", sponsorId)
        .maybeSingle();
      const spRow = sp as
        | { id: string; full_name: string | null }
        | null;
      if (!spRow) break;

      upline.push({
        id: spRow.id,
        naam: spRow.full_name ?? "Onbekend",
        niveau,
        isDirect: niveau === 1,
      });

      huidigeId = sponsorId;
    }

    return NextResponse.json({ ok: true, upline });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

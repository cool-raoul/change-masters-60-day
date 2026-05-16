import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markeerVoltooid, type Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// POST /api/onboarding/markeer-voltooid
// Body: { item_slug, modus_waarin, taak_id }
// Schrijft naar onboarding_voltooiingen + dag_voltooiingen.
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

    const body = await request.json();
    const { item_slug, modus_waarin, taak_id } = body as {
      item_slug?: string;
      modus_waarin?: Modus;
      taak_id?: string;
    };

    if (!item_slug || !modus_waarin || !taak_id) {
      return NextResponse.json(
        { error: "item_slug, modus_waarin en taak_id zijn vereist" },
        { status: 400 },
      );
    }

    // Markeer in cross-modus tabel
    await markeerVoltooid(supabase, user.id, item_slug, modus_waarin);

    // Markeer huidige taak als voltooid in dag_voltooiingen
    // dag_nummer extraheren uit taak_id, format "core-dagN-xxx" of "dagN-xxx"
    const dagMatch = taak_id.match(/(?:core-)?dag(\d+)/);
    const dagNummer = dagMatch ? parseInt(dagMatch[1], 10) : null;
    if (dagNummer !== null) {
      await supabase
        .from("dag_voltooiingen")
        .upsert(
          {
            user_id: user.id,
            dag_nummer: dagNummer,
            taak_id,
          },
          { onConflict: "user_id,dag_nummer,taak_id" },
        );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("markeer-voltooid exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

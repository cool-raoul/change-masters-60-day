import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  markeerVoltooid,
  haalAlleVoltooiingenVoorUser,
  type Modus,
} from "@/lib/onboarding/voltooiingen";

// ============================================================
// /api/onboarding/markeer-voltooid
//
// POST: markeert een onderdeel als voltooid voor de huidige user.
//   Body accepteert beide naming-conventies:
//     - { slug, modus }              (nieuwe pre-day-1 / admin-rail)
//     - { item_slug, modus_waarin }  (oude dag-taak markering)
//   Optioneel: taak_id (dag-taak), wordt ook in dag_voltooiingen geschreven.
//
// GET: geeft alle voltooiingen voor de huidige user terug, als
//   { voltooiingen: { [item_slug]: { voltooid, modus, datum } } }
//   voor cross-modus skip-detectie op de onboarding-pagina.
// ============================================================

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ voltooiingen: {} }, { status: 401 });
  }

  const map = await haalAlleVoltooiingenVoorUser(supabase, user.id);
  const obj: Record<
    string,
    { voltooid: boolean; modus: string | null; datum: string | null }
  > = {};
  map.forEach((v, k) => {
    obj[k] = v;
  });
  return NextResponse.json({ voltooiingen: obj });
}

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
    const raw = body as {
      slug?: string;
      modus?: Modus;
      item_slug?: string;
      modus_waarin?: Modus;
      taak_id?: string;
    };

    const slug = raw.slug ?? raw.item_slug;
    const modus = raw.modus ?? raw.modus_waarin;
    const taakId = raw.taak_id;

    if (!slug || !modus) {
      return NextResponse.json(
        { error: "slug en modus zijn vereist" },
        { status: 400 },
      );
    }

    // Markeer in cross-modus tabel
    await markeerVoltooid(supabase, user.id, slug, modus);

    // Als er een taak_id meegegeven is: schrijf 'm ook in dag_voltooiingen.
    if (taakId) {
      const dagMatch = taakId.match(/(?:core-)?dag(\d+)/);
      const dagNummer = dagMatch ? parseInt(dagMatch[1], 10) : null;
      if (dagNummer !== null) {
        await supabase.from("dag_voltooiingen").upsert(
          {
            user_id: user.id,
            dag_nummer: dagNummer,
            taak_id: taakId,
          },
          { onConflict: "user_id,dag_nummer,taak_id" },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("markeer-voltooid exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

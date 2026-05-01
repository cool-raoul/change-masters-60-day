import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/prospect-film/markeer
//
// Body: { token: string, actie: 'gestart' | 'afgekeken' }
//
// Markeert de view als gestart (bij iframe-load) of afgekeken (bij
// 'klaar'-knop). Geen auth nodig: prospect heeft geen account, alleen
// de share-token. We gebruiken de service-role om de RLS te omzeilen.
//
// Bij 'afgekeken':
//  1. afgekeken_op wordt gezet
//  2. Member krijgt een push-notificatie
//  3. Prospect schuift automatisch naar 'followup'-fase (mits 'ie nog
//     in 'prospect', 'uitgenodigd', 'one_pager' of 'presentatie' staat,
//     dus alleen voorwaarts schuiven, nooit terug).
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string | undefined = body.token;
    const actie: string | undefined = body.actie;
    if (!token || (actie !== "gestart" && actie !== "afgekeken")) {
      return NextResponse.json(
        { error: "token + actie ('gestart' of 'afgekeken') zijn verplicht" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Haal de view-rij op via token
    const { data: view, error: selectError } = await admin
      .from("prospect_film_views")
      .select("id, prospect_id, member_user_id, film_slug, gestart_op, afgekeken_op")
      .eq("share_token", token)
      .maybeSingle();
    if (selectError) {
      return NextResponse.json(
        { error: "Lookup mislukt: " + selectError.message },
        { status: 500 },
      );
    }
    if (!view) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    const v = view as {
      id: string;
      prospect_id: string;
      member_user_id: string;
      film_slug: string;
      gestart_op: string | null;
      afgekeken_op: string | null;
    };

    if (actie === "gestart") {
      // Idempotent: alleen zetten als nog niet gezet.
      if (!v.gestart_op) {
        await admin
          .from("prospect_film_views")
          .update({ gestart_op: new Date().toISOString() })
          .eq("id", v.id);
      }
      return NextResponse.json({ ok: true });
    }

    // actie === 'afgekeken'
    if (v.afgekeken_op) {
      // Al gemarkeerd, niets doen.
      return NextResponse.json({ ok: true, reedsAfgekeken: true });
    }

    const nu = new Date().toISOString();
    await admin
      .from("prospect_film_views")
      .update({
        afgekeken_op: nu,
        gestart_op: v.gestart_op ?? nu,
      })
      .eq("id", v.id);

    // Auto-pipeline-shift: alleen voorwaarts (nooit terug schuiven).
    // Voorwaarts = van prospect/uitgenodigd/one_pager/presentatie → followup.
    const { data: prospectRow } = await admin
      .from("prospects")
      .select("id, pipeline_fase, volledige_naam")
      .eq("id", v.prospect_id)
      .maybeSingle();
    if (prospectRow) {
      const huidigeFase = (prospectRow as { pipeline_fase: string })
        .pipeline_fase;
      const voorwaartseFases = [
        "prospect",
        "uitgenodigd",
        "one_pager",
        "presentatie",
      ];
      if (voorwaartseFases.includes(huidigeFase)) {
        await admin
          .from("prospects")
          .update({ pipeline_fase: "followup" })
          .eq("id", v.prospect_id);
      }

      // Maak een herinnering voor de member zodat 'ie 'm meteen ziet
      // op /herinneringen + dashboard.
      await admin.from("herinneringen").insert({
        user_id: v.member_user_id,
        prospect_id: v.prospect_id,
        titel: `🎬 ${(prospectRow as { volledige_naam: string }).volledige_naam} heeft je film bekeken`,
        beschrijving: `Tijd voor follow-up. De film "${v.film_slug}" is afgekeken op ${new Date(nu).toLocaleString("nl-NL")}.`,
        vervaldatum: new Date().toISOString().split("T")[0],
        herinnering_type: "followup",
        voltooid: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("markeer exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

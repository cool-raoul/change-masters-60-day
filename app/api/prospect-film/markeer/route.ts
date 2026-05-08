import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { PROSPECT_FILM_BESCHRIJVINGEN } from "@/lib/films/embed";

// ============================================================
// POST /api/prospect-film/markeer
//
// Body: { token: string, actie: 'gestart' | 'afgekeken' | 'percentage', percentage?: number }
//
// Markeert de view als gestart (bij iframe-load) of afgekeken (bij
// 'klaar'-knop). Of update het kijkpercentage (real-time tracking via
// YouTube IFrame API). Geen auth nodig: prospect heeft geen account,
// alleen de share-token. Service-role bypass van RLS.
//
// Bij 'afgekeken':
//  1. afgekeken_op wordt gezet
//  2. Member krijgt een herinnering
//  3. Prospect schuift naar 'followup'-fase (alleen voorwaarts).
//
// Bij 'percentage':
//  1. kijkpercentage wordt geüpdatet (alleen als nieuwe waarde hoger)
//  2. Bij >= 90%: ook auto-markeer afgekeken (member krijgt notificatie)
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string | undefined = body.token;
    const actie: string | undefined = body.actie;
    const percentage: number | undefined =
      typeof body.percentage === "number" ? body.percentage : undefined;
    if (
      !token ||
      (actie !== "gestart" && actie !== "afgekeken" && actie !== "percentage")
    ) {
      return NextResponse.json(
        { error: "token + actie ('gestart' / 'afgekeken' / 'percentage') verplicht" },
        { status: 400 },
      );
    }
    if (actie === "percentage" && (percentage === undefined || percentage < 0)) {
      return NextResponse.json(
        { error: "percentage (0-100) verplicht bij actie='percentage'" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Haal de view-rij op via token
    const { data: view, error: selectError } = await admin
      .from("prospect_film_views")
      .select(
        "id, prospect_id, member_user_id, film_slug, gestart_op, afgekeken_op, kijkpercentage",
      )
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
      kijkpercentage: number;
    };

    if (actie === "gestart") {
      // Idempotent: alleen zetten als nog niet gezet, plus push naar member
      // alleen op de eerste-keer transitie.
      if (!v.gestart_op) {
        await admin
          .from("prospect_film_views")
          .update({ gestart_op: new Date().toISOString() })
          .eq("id", v.id);
        await stuurFilmPush(admin, v, "gestart");
      }
      return NextResponse.json({ ok: true });
    }

    if (actie === "percentage") {
      // Alleen schrijven als hoger dan vorige waarde (monotoon stijgend).
      const nieuwPct = Math.max(0, Math.min(100, Math.round(percentage ?? 0)));
      if (nieuwPct <= v.kijkpercentage) {
        return NextResponse.json({ ok: true, geupdate: false });
      }
      // Bij >= 90% behandelen we als 'afgekeken': ook nu de auto-flow
      // triggeren als 'ie nog niet eerder is uitgevoerd.
      if (nieuwPct >= 90 && !v.afgekeken_op) {
        // Vervang actie naar 'afgekeken' en val door naar de auto-flow.
        await admin
          .from("prospect_film_views")
          .update({ kijkpercentage: nieuwPct })
          .eq("id", v.id);
        // Doorvallen naar afgekeken-flow door v.kijkpercentage te updaten
        // en het verdere blok beneden te laten draaien, simpeler: hier
        // direct de logica dupliceren.
        const nu = new Date().toISOString();
        await admin
          .from("prospect_film_views")
          .update({
            afgekeken_op: nu,
            gestart_op: v.gestart_op ?? nu,
          })
          .eq("id", v.id);
        await triggerAfgekekenAutomatie(admin, v, v.film_slug, nu);
        return NextResponse.json({ ok: true, autoAfgekeken: true });
      }
      // Anders: alleen percentage updaten, geen verdere actie.
      await admin
        .from("prospect_film_views")
        .update({ kijkpercentage: nieuwPct })
        .eq("id", v.id);
      return NextResponse.json({ ok: true, geupdate: true });
    }

    // actie === 'afgekeken'
    if (v.afgekeken_op) {
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

    await triggerAfgekekenAutomatie(admin, v, v.film_slug, nu);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("markeer exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

// ============================================================
// triggerAfgekekenAutomatie:
//   1. Prospect schuift naar 'followup' (alleen voorwaarts)
//   2. Member krijgt een herinnering
// Idempotent door de caller te controleren (afgekeken_op vóór call).
// ============================================================
type AdminClient = ReturnType<typeof createAdminClient>;
async function triggerAfgekekenAutomatie(
  admin: AdminClient,
  v: {
    id: string;
    prospect_id: string;
    member_user_id: string;
    film_slug: string;
    gestart_op: string | null;
  },
  filmSlug: string,
  nu: string,
) {
  const { data: prospectRow } = await admin
    .from("prospects")
    .select("id, pipeline_fase, volledige_naam")
    .eq("id", v.prospect_id)
    .maybeSingle();
  if (!prospectRow) return;

  const huidigeFase = (prospectRow as { pipeline_fase: string }).pipeline_fase;
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

  // Voorkom duplicate herinneringen bij dubbele triggers (percentage 90%
  // én daarna handmatige 'afgekeken'-knop): check of er al een vergelijkbare
  // open herinnering staat voor dezelfde (prospect, film) van vandaag.
  const vandaag = new Date().toISOString().split("T")[0];
  const { data: bestaandeHerinnering } = await admin
    .from("herinneringen")
    .select("id")
    .eq("user_id", v.member_user_id)
    .eq("prospect_id", v.prospect_id)
    .eq("vervaldatum", vandaag)
    .like("titel", "%heeft je film bekeken%")
    .limit(1)
    .maybeSingle();
  if (bestaandeHerinnering) return;

  await admin.from("herinneringen").insert({
    user_id: v.member_user_id,
    prospect_id: v.prospect_id,
    titel: `🎬 ${(prospectRow as { volledige_naam: string }).volledige_naam} heeft je film bekeken`,
    beschrijving: `Tijd voor follow-up. De film "${filmSlug}" is afgekeken op ${new Date(nu).toLocaleString("nl-NL")}.`,
    vervaldatum: vandaag,
    herinnering_type: "followup",
    voltooid: false,
  });

  // Push naar member: 'film afgekeken'
  const prospectNaam = (prospectRow as { volledige_naam: string }).volledige_naam;
  await stuurFilmPush(admin, v, "afgekeken", prospectNaam);
}

// ============================================================
// stuurFilmPush, push-notificatie naar member bij gestart of afgekeken.
// Klik op melding leidt naar prospect-kaart waar de real-time
// kijkpercentage-balk staat.
// ============================================================
async function stuurFilmPush(
  admin: AdminClient,
  v: { prospect_id: string; member_user_id: string; film_slug: string },
  fase: "gestart" | "afgekeken",
  prospectNaamOpt?: string,
) {
  let prospectNaam = prospectNaamOpt;
  if (!prospectNaam) {
    const { data: prospectRow } = await admin
      .from("prospects")
      .select("volledige_naam")
      .eq("id", v.prospect_id)
      .maybeSingle();
    prospectNaam =
      (prospectRow as { volledige_naam?: string } | null)?.volledige_naam ?? "Een prospect";
  }

  const filmTitel =
    PROSPECT_FILM_BESCHRIJVINGEN[v.film_slug]?.suggestieTitel ?? v.film_slug;

  const titel =
    fase === "gestart"
      ? `▶️ ${prospectNaam} kijkt nu je film`
      : `🎬 ${prospectNaam} heeft je film afgekeken`;
  const body =
    fase === "gestart"
      ? `Aan het kijken: "${filmTitel}". Klik om real-time mee te kijken hoe ver 'ie is.`
      : `Klaar gekeken: "${filmTitel}". Tijd voor een follow-up. Klik om de prospect-kaart te openen.`;

  try {
    await sendPushToUser(v.member_user_id, {
      title: titel,
      body,
      url: `/namenlijst/${v.prospect_id}`,
      tag: `film-${fase}-${v.prospect_id}-${v.film_slug}`,
    });
  } catch (e) {
    console.error("film-push fout:", e);
  }
}

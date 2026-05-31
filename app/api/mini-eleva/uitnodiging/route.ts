import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mini-eleva/uitnodiging
//
// Body: { prospectId: string }
//
// Maakt een nieuwe mini-ELEVA-uitnodiging voor de gegeven prospect.
// Genereert een uniek token (lange random string) en zet expiratie
// op 72u vanaf nu. Geeft de deelbare URL terug zodat de member 'm
// kan kopieren of doorsturen via WhatsApp.
//
// Sponsor wordt automatisch gekoppeld op basis van profiles.sponsor_id
// van de member, zodat sponsor later in de chat kan komen.
//
// RLS-policy zorgt dat alleen de eigenaar van de prospect een
// uitnodiging kan maken.
// ============================================================

function genereerToken(soort: "product" | "business"): string {
  // 32 hex-karakters via crypto.randomUUID() x2, ruim genoeg uniek.
  //
  // Prefix 'p-' of 'b-' draagt de soort in het token zelf. Reden:
  // de soort-kolom in prospect_invitations is optioneel (migratie hoeft
  // niet te draaien om twee-spoor werkend te krijgen). Door de soort in
  // het token te stoppen kan de prospect-pagina altijd de juiste
  // ervaring serveren, ook in omgevingen waar de kolom nog niet bestaat.
  const a = crypto.randomUUID().replace(/-/g, "");
  const b = crypto.randomUUID().replace(/-/g, "");
  const prefix = soort === "product" ? "p-" : "b-";
  return prefix + (a + b).substring(0, 38);
}

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
    const gekozenSponsorId = body.sponsorUserId as string | undefined;
    // soort: 'product' (alleen productkant) of 'business' (product + business).
    // Default 'business' = oude gedrag voor backward-compat.
    const ruwSoort = body.soort as string | undefined;
    if (ruwSoort !== "product" && ruwSoort !== "business") {
      return NextResponse.json(
        { error: "soort vereist: 'product' of 'business'" },
        { status: 400 },
      );
    }
    const soort: "product" | "business" = ruwSoort;
    if (!prospectId) {
      return NextResponse.json({ error: "prospectId vereist" }, { status: 400 });
    }

    // Controleer dat prospect van deze user is
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, user_id, volledige_naam")
      .eq("id", prospectId)
      .maybeSingle();
    if (!prospect || (prospect as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { error: "Prospect niet gevonden of geen toegang" },
        { status: 404 },
      );
    }

    // Sponsor bepalen: alleen als member EXPLICIET een upline-persoon kiest.
    // Default = NULL (geen sponsor in chat). Member kan later via de wissel-
    // knop in de chat zelf alsnog iemand toevoegen.
    //
    // Geen automatische fallback naar profiles.sponsor_id meer (= eerder
    // gedrag). Reden: Raoul wil dat een nieuwe chat default 'Chat met
    // [prospect]' is, niet 'Chat met [prospect] + [sponsor]'. Kwestie van
    // bewuste keuze ipv automatisch koppelen.
    let sponsorId: string | null = null;
    if (gekozenSponsorId) {
      // Verifieer dat de gekozen persoon écht in de upline zit (anti-misbruik)
      const gezien = new Set<string>([user.id]);
      let huidigeId = user.id;
      let bevestigd = false;
      for (let n = 0; n < 5; n++) {
        const { data: stap } = await supabase
          .from("profiles")
          .select("sponsor_id")
          .eq("id", huidigeId)
          .maybeSingle();
        const next = (stap as { sponsor_id?: string | null } | null)?.sponsor_id;
        if (!next || gezien.has(next)) break;
        gezien.add(next);
        if (next === gekozenSponsorId) {
          bevestigd = true;
          break;
        }
        huidigeId = next;
      }
      if (bevestigd) sponsorId = gekozenSponsorId;
    }

    const token = genereerToken(soort);
    const nu = new Date();
    // 14 dagen geldigheid. Beslissingsmoment forceren, niet eindeloos
    // kauwen. Member kan via /api/mini-eleva/verleng later met 14 dagen
    // erbij verlengen als prospect tijd nodig had.
    const expires = new Date(nu.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Probeer eerst met soort-kolom (nieuw veld per 2026-05-31).
    // Bestaat de kolom nog niet (migratie niet gedraaid), retry zonder
    // zodat 'r in elk geval een uitnodiging gemaakt wordt. De
    // resulterende rij krijgt dan de default 'business' zodra de
    // migratie alsnog wordt uitgevoerd.
    let nieuw:
      | { id?: string; token?: string; expires_at?: string }
      | null = null;
    let error: { code?: string; message?: string } | null = null;

    {
      const res = await supabase
        .from("prospect_invitations")
        .insert({
          prospect_id: prospectId,
          member_user_id: user.id,
          sponsor_user_id: sponsorId,
          token,
          expires_at: expires.toISOString(),
          status: "actief",
          soort,
        })
        .select("id, token, expires_at")
        .maybeSingle();
      nieuw = res.data;
      error = res.error;
    }

    // Kolom niet gevonden? Retry zonder soort.
    if (
      error &&
      (error.code === "PGRST204" ||
        error.code === "42703" ||
        error.message?.includes("soort"))
    ) {
      const res2 = await supabase
        .from("prospect_invitations")
        .insert({
          prospect_id: prospectId,
          member_user_id: user.id,
          sponsor_user_id: sponsorId,
          token,
          expires_at: expires.toISOString(),
          status: "actief",
        })
        .select("id, token, expires_at")
        .maybeSingle();
      nieuw = res2.data;
      error = res2.error;
    }

    if (error) {
      if (
        error.code === "42P01" ||
        error.message?.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            error:
              "Mini-ELEVA-tabellen bestaan nog niet. Vraag founder om migratie mini_eleva.sql te draaien in Supabase.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "Aanmaken mislukt: " + error.message },
        { status: 500 },
      );
    }

    // Bouw deelbare URL op basis van app-URL of huidige host
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      `https://${req.headers.get("host")}`;
    const deelLink = `${origin}/m/${token}`;

    return NextResponse.json({
      ok: true,
      id: (nieuw as { id?: string } | null)?.id ?? null,
      token,
      expires_at: (nieuw as { expires_at?: string } | null)?.expires_at ?? null,
      deelLink,
      prospectNaam: (prospect as { volledige_naam: string }).volledige_naam,
    });
  } catch (e) {
    console.error("mini-eleva/uitnodiging exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

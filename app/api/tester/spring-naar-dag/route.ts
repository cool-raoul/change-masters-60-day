import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/tester/spring-naar-dag
//
// Body: { dagNummer: 1-60 }
//
// Verzet profiles.run_startdatum zodat de berekende huidige dag
// gelijk wordt aan dagNummer. Alleen voor users met is_tester=true
// (of role='founder'). Members krijgen 403.
//
// Bv. dagNummer=18 → run_startdatum = vandaag - 17 dagen.
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

    const { data: profiel } = await supabase
      .from("profiles")
      .select("role, is_tester")
      .eq("id", user.id)
      .maybeSingle();
    const rij = profiel as
      | { role?: string | null; is_tester?: boolean | null }
      | null;
    const magSpringen = rij?.is_tester === true || rij?.role === "founder";
    if (!magSpringen) {
      return NextResponse.json(
        { error: "Geen toegang — alleen voor testers en founders" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const dagNummer: number = Number(body.dagNummer);
    const wisVoltooiingen: boolean = body.wisVoltooiingen !== false; // default: WEL wissen
    if (!Number.isFinite(dagNummer) || dagNummer < 1 || dagNummer > 60) {
      return NextResponse.json(
        { error: "Ongeldig dagNummer (moet 1-60 zijn)" },
        { status: 400 },
      );
    }

    // Bereken nieuwe startdatum: vandaag - (dagNummer - 1) dagen.
    // Zo wordt berekenDag() = dagNummer.
    const vandaag = new Date();
    vandaag.setHours(0, 0, 0, 0);
    const nieuweStart = new Date(vandaag);
    nieuweStart.setDate(nieuweStart.getDate() - (dagNummer - 1));
    const isoDatum = nieuweStart.toISOString().split("T")[0];

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ run_startdatum: isoDatum })
      .eq("id", user.id);
    if (updErr) {
      return NextResponse.json(
        { error: "Update mislukt: " + updErr.message },
        { status: 500 },
      );
    }

    // Reset voltooiingen voor de nieuwe dag — testers willen die dag opnieuw
    // beleven. Anders staat de hele flow al als 'gedaan' uit een eerdere
    // ronde. Default ingeschakeld; alleen uitschakelen via expliciet
    // wisVoltooiingen:false in de body.
    let voltooiingenGewist = 0;
    if (wisVoltooiingen) {
      const { data: gewist, error: delErr } = await supabase
        .from("dag_voltooiingen")
        .delete()
        .eq("user_id", user.id)
        .eq("dag_nummer", dagNummer)
        .select("taak_id");
      if (delErr) {
        // Niet fatal — log voor debugging maar laat de spring zelf wel slagen.
        console.error("dag_voltooiingen wissen mislukt:", delErr);
      } else {
        voltooiingenGewist = (gewist as Array<unknown>)?.length ?? 0;
      }
    }

    return NextResponse.json({
      ok: true,
      nieuweStartdatum: isoDatum,
      dagNummer,
      voltooiingenGewist,
    });
  } catch (e) {
    console.error("tester/spring-naar-dag exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

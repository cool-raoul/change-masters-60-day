import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leesMentorProfiel } from "@/lib/mentor-profiel/helpers";
import type { MentorProfiel, Talent } from "@/lib/mentor-profiel/types";

// ============================================================
// /api/mentor-profiel
//
// GET  → het Mentor-profiel van de ingelogde member.
// POST → vervangt de DOOR-DE-MEMBER-BEWERKBARE velden (situatie, niche,
//        ideale klant, producten, passies, stem-voorbeelden, talent, drie
//        verhalen). Authoritatief: wat het formulier stuurt IS de nieuwe
//        waarde, zodat ook verwijderen werkt. De systeem-velden (why,
//        FORM, eerste-doel) blijven behouden.
//
// RLS op mentor_profielen is user-only, dus de auth-client volstaat.
// ============================================================

export const dynamic = "force-dynamic";

const TALENTEN: Talent[] = ["schrijver", "spreker", "filmer", "DM-er"];

function schoonLijst(v: unknown, cap: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, cap);
}

function schoonTekst(v: unknown, maxLen: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, maxLen);
  return t.length > 0 ? t : undefined;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const profiel = await leesMentorProfiel(user.id);
  return NextResponse.json({ profiel });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const inp = (body?.profiel ?? {}) as Record<string, unknown>;

  const huidig = await leesMentorProfiel(user.id);

  // Bouw de nieuwe data: systeem-velden behouden, bewerkbare velden vervangen.
  const data: MentorProfiel = {
    // Niet door de member bewerkbaar hier, behouden (systeem-velden die de
    // Mentor zelf bijhoudt):
    why: huidig.why,
    formContexts: huidig.formContexts,
    eersteDoel: huidig.eersteDoel,
    curatorVoorstellen: huidig.curatorVoorstellen,
    historieNotitie: huidig.historieNotitie,
    kennismakingKlaar: huidig.kennismakingKlaar,
    // Bewerkbaar (authoritatief uit het formulier):
    situatie: schoonTekst(inp.situatie, 600),
    nicheZaadje: schoonTekst(inp.nicheZaadje, 400),
    idealeKlant: schoonTekst(inp.idealeKlant, 400),
    eigenProducten: schoonLijst(inp.eigenProducten, 20, 200),
    passies: schoonLijst(inp.passies, 12, 120),
    stemVoorbeelden: schoonLijst(inp.stemVoorbeelden, 6, 600),
    eigenPosts: schoonLijst(inp.eigenPosts, 5, 1500),
    praattaal: schoonLijst(inp.praattaal, 12, 200),
    nooitWoorden: schoonLijst(inp.nooitWoorden, 12, 200),
    grenzen: schoonLijst(inp.grenzen, 8, 300),
    schrijfVoorkeuren: schoonTekst(inp.schrijfVoorkeuren, 400),
    socialSituatie: schoonTekst(inp.socialSituatie, 600),
    ritme: schoonTekst(inp.ritme, 300),
    eersteFeestje: schoonTekst(inp.eersteFeestje, 300),
    vrijeContext: schoonTekst(inp.vrijeContext, 1500),
    talent:
      typeof inp.talent === "string" && TALENTEN.includes(inp.talent as Talent)
        ? (inp.talent as Talent)
        : undefined,
  };

  if (inp.drieVerhalen && typeof inp.drieVerhalen === "object") {
    const dv = inp.drieVerhalen as Record<string, unknown>;
    const verhalen: { persoonlijk?: string; product?: string; business?: string } = {};
    for (const k of ["persoonlijk", "product", "business"] as const) {
      const t = schoonTekst(dv[k], 800);
      if (t) verhalen[k] = t;
    }
    if (Object.keys(verhalen).length > 0) data.drieVerhalen = verhalen;
  }

  const { error } = await supabase.from("mentor_profielen").upsert(
    { user_id: user.id, data, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, profiel: data });
}

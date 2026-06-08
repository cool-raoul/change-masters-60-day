// File: app/api/reset-check/submit/route.ts
//
// Publieke submit-endpoint voor de Holistic Reset persoonlijke check.
// Berekent heat-score server-side en bewaart in reset_check_submissions.
// Geen auth nodig (publieke route via middleware).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { berekenHeat, type Antwoorden } from "@/lib/reset-check";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Antwoorden;
  try {
    body = (await req.json()) as Antwoorden;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Minimale validatie
  if (!body.voornaam?.trim() || !body.email?.includes("@")) {
    return NextResponse.json({ error: "Voornaam en e-mail zijn verplicht" }, { status: 400 });
  }

  const heat = berekenHeat(body);

  const supabase = await createClient();
  const { error } = await supabase
    .from("reset_check_submissions")
    .insert({
      voornaam: body.voornaam.trim(),
      achternaam: body.achternaam?.trim() || null,
      email: body.email.trim().toLowerCase(),
      telefoon: body.telefoon?.trim() || null,
      instagram: body.instagram?.trim() || null,
      facebook: body.facebook?.trim() || null,
      antwoorden: body,
      heat_score: heat.score,
      heat_categorie: heat.categorie,
    });

  if (error) {
    console.error("reset-check submit error", error);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, heat: heat.score, categorie: heat.categorie });
}

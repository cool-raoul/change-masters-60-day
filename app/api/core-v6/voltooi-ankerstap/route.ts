// File: app/api/core-v6/voltooi-ankerstap/route.ts
//
// Endpoint dat de huidige Core V6-ankerstap voltooit en de progressie
// verhoogt naar de volgende. Alleen mogelijk voor de eigen huidige stap
// (geen voor-springen, geen achteruit).
//
// Kolom profiles.core_v6_ankerstap (default 1) moet aanwezig zijn. Bij
// ontbrekende kolom faalt het stil en redirectet terug naar /core-v6.

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { CORE_V6_AANTAL_STAPPEN } from "@/lib/playbook/core-dagen-v6";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData().catch(() => null);
  const raw = formData?.get("ankerstap");
  const gevraagd = raw ? Number(String(raw)) : NaN;
  if (!Number.isInteger(gevraagd)) {
    return NextResponse.redirect(new URL("/core-v6", request.url));
  }

  // Huidige positie ophalen.
  let huidig = 1;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("core_v6_ankerstap")
      .eq("id", user.id)
      .maybeSingle();
    const raw = (data as { core_v6_ankerstap?: number } | null)?.core_v6_ankerstap;
    if (typeof raw === "number" && raw >= 1) huidig = raw;
  } catch {
    huidig = 1;
  }

  // Alleen de huidige stap mag worden voltooid (anti-skip).
  if (gevraagd !== huidig) {
    return NextResponse.redirect(new URL("/core-v6", request.url));
  }

  const volgende = Math.min(CORE_V6_AANTAL_STAPPEN, huidig + 1);

  try {
    await supabase
      .from("profiles")
      .update({ core_v6_ankerstap: volgende })
      .eq("id", user.id);
  } catch {
    // Stil falen: kolom kan ontbreken bij niet-gedraaide migratie.
  }

  // Bij voltooien van laatste ankerstap: naar afsluit-pagina (komt in Fase B).
  // Voor nu: gewoon terug naar /core-v6 met de nieuwe positie.
  return NextResponse.redirect(new URL("/core-v6", request.url), 303);
}

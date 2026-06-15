// POST /api/test/reset
//
// Volledige account-reset voor test-accounts. Wist alle voortgang +
// namenlijst van de ingelogde gebruiker en zet het profiel terug naar
// 'nieuwe gebruiker', zodat de onboarding + dag-1-flow opnieuw vanaf
// nul doorlopen kan worden.
//
// STRIKT beperkt: alleen founders + specifieke test-accounts (allowlist).
// Bewust NIET voor gewone testers (is_tester): die bouwen echte lijsten
// en mogen hun voortgang niet kunnen wegvagen. Voor normale gebruikers
// die van modus wisselen blijft de voortgang sowieso bewaard (dat is de
// mode-switch, een andere actie). Werkt alleen op het eigen account.

// Test-accounts die wél volledig mogen resetten (los van rol).
const RESET_ALLOWLIST = ["livingwithlv@outlook.com"];
//
// prospects staat vooraan in de wipe-lijst: de FK-cascades ruimen dan
// meteen contact_logs, film_views, product_bestellingen, prospect_film_
// views, prospect_invitations (+ mini_eleva-tabellen) en radar mee op.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIPE_TABELLEN = [
  "prospects", // eerst: cascade ruimt veel kinderen op
  "dag_voltooiingen",
  "core_v6_substep_voltooiingen",
  "onboarding_voltooiingen",
  "onboarding_voortgang",
  "dagelijkse_stats",
  "eigen_zinnen",
  "why_profiles",
  "training_voortgang",
  "wekelijkse_reviews",
  "mentor_profielen",
  "ai_gesprekken",
  "coach_gebruik",
  "herinneringen",
  "contacten_reservoir",
  "member_bestellinks",
  "partner_mijlpalen",
  "mini_eleva_leeskenmerk",
  "film_views",
  "radar_voltooiingen",
];

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const p = profiel as { role?: string | null } | null;
  const emailOk =
    !!user.email && RESET_ALLOWLIST.includes(user.email.toLowerCase());
  if (p?.role !== "founder" && !emailOk) {
    return NextResponse.json(
      { error: "Volledige reset is alleen voor founders en test-accounts" },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const gewist: string[] = [];
  const mislukt: Record<string, string> = {};

  for (const tabel of WIPE_TABELLEN) {
    const { error } = await admin.from(tabel).delete().eq("user_id", user.id);
    if (error) mislukt[tabel] = error.message;
    else gewist.push(tabel);
  }

  // Profiel terug naar 'nieuwe gebruiker', zonder de identiteit te raken
  // (naam, e-mail, rol, sponsor, push-instellingen blijven staan).
  const { error: profErr } = await admin
    .from("profiles")
    .update({
      modus: null,
      onboarding_klaar: false,
      run_startdatum: null,
      sprint_startdatum: null,
      core_startdatum: null,
      core_dtt: null,
      core_eigen_resultaat: null,
      core_v6_actief: false,
      core_v6_ankerstap: null,
    })
    .eq("id", user.id);
  if (profErr) mislukt["profiles"] = profErr.message;

  return NextResponse.json({
    ok: Object.keys(mislukt).length === 0,
    gewist,
    mislukt,
  });
}

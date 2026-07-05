// Eenmalig admin-script: reset een specifiek account terug naar
// "nieuwe gebruiker", zodat het hele onboarding-pad vanaf stap 1 opnieuw
// doorlopen wordt. Spiegelt app/api/test/reset/route.ts, MAAR werkt op een
// opgegeven account (niet de ingelogde) EN reset ook user_metadata.
// onboarding_stap (anders kaatst een al-afgeronde gebruiker na de
// routekeuze door naar /vandaag i.p.v. onboarding stap 1).
//
// Gebruik:
//   node scripts/reset-account.cjs find <zoekterm>      (read-only, toont matches)
//   node scripts/reset-account.cjs reset <user_id>      (WIST + reset dat account)

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Ontbrekend: NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Zelfde lijst + volgorde als de reset-route (prospects eerst i.v.m. FK-cascade).
const WIPE_TABELLEN = [
  "prospects",
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

async function find(term) {
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, role, modus, onboarding_klaar, created_at")
    .ilike("full_name", `%${term}%`);
  if (error) {
    console.error("Zoekfout:", error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log(`Geen profielen gevonden met naam die '${term}' bevat.`);
    return;
  }
  console.log(`Gevonden (${data.length}):\n`);
  for (const p of data) {
    console.log(`  id:            ${p.id}`);
    console.log(`  naam:          ${p.full_name}`);
    console.log(`  email:         ${p.email}`);
    console.log(`  role:          ${p.role}`);
    console.log(`  modus:         ${p.modus}`);
    console.log(`  onboarding_klaar: ${p.onboarding_klaar}`);
    console.log(`  aangemaakt:    ${p.created_at}`);
    console.log("  ---");
  }
  console.log(`\nReset uitvoeren? → node scripts/reset-account.cjs reset <id>`);
}

async function reset(userId) {
  // Eerst tonen WIE we resetten, als veiligheidscheck.
  const { data: prof, error: profErr } = await admin
    .from("profiles")
    .select("id, full_name, email, role, modus, onboarding_klaar")
    .eq("id", userId)
    .maybeSingle();
  if (profErr) {
    console.error("Profiel ophalen mislukt:", profErr.message);
    process.exit(1);
  }
  if (!prof) {
    console.error(`Geen profiel met id ${userId}.`);
    process.exit(1);
  }
  console.log(`\nReset wordt uitgevoerd op:`);
  console.log(`  ${prof.full_name}  <${prof.email}>  (role=${prof.role}, modus=${prof.modus})\n`);

  const gewist = [];
  const mislukt = {};
  for (const tabel of WIPE_TABELLEN) {
    const { error } = await admin.from(tabel).delete().eq("user_id", userId);
    if (error) mislukt[tabel] = error.message;
    else gewist.push(tabel);
  }

  // Profiel terug naar 'nieuwe gebruiker' (identiteit blijft: naam, email,
  // rol, sponsor, push-instellingen).
  const { error: pErr } = await admin
    .from("profiles")
    .update({
      // Alleen de velden die de huidige (V9) flow sturen + de startdatums/
      // DTT die bij her-onboarding vers gezet worden. run_startdatum en de
      // core_v6_* velden zijn legacy NOT NULL kolommen: die laten we met
      // rust (null zetten faalt en ze raken de V9-flow niet).
      modus: null,
      onboarding_klaar: false,
      sprint_startdatum: null,
      core_startdatum: null,
      core_dtt: null,
    })
    .eq("id", userId);
  if (pErr) mislukt["profiles"] = pErr.message;

  // user_metadata.onboarding_stap terug naar 1 (rest van metadata behouden).
  const { data: userResp, error: getErr } = await admin.auth.admin.getUserById(userId);
  if (getErr) {
    mislukt["auth_getUser"] = getErr.message;
  } else {
    const bestaand = userResp?.user?.user_metadata ?? {};
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...bestaand, onboarding_stap: 1 },
    });
    if (updErr) mislukt["auth_updateUser"] = updErr.message;
  }

  console.log(`Gewist (${gewist.length} tabellen): ${gewist.join(", ")}`);
  if (Object.keys(mislukt).length) {
    console.log(`\nMISLUKT:`);
    for (const [k, v] of Object.entries(mislukt)) console.log(`  ${k}: ${v}`);
  } else {
    console.log(`\n✓ Klaar. Account staat terug op start. Bij volgende login: /welkom-keuze → routekeuze → onboarding stap 1.`);
  }
}

const [, , cmd, arg] = process.argv;
if (cmd === "find" && arg) find(arg);
else if (cmd === "reset" && arg) reset(arg);
else {
  console.log("Gebruik:");
  console.log("  node scripts/reset-account.cjs find <zoekterm>");
  console.log("  node scripts/reset-account.cjs reset <user_id>");
  process.exit(1);
}

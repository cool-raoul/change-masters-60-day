import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StappenDashboard } from "@/components/leerpaden/StappenDashboard";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { MODUS_WELKOMSTFILM_SLUGS } from "@/lib/films/embed";
import { PRO_LEERPAD } from "@/lib/leerpaden/pro-stappen";

// ============================================================
// /welkom-pro, dashboard voor de Professional-flow (14 stappen)
//
// Toont een stap-voor-stap dashboard met dezelfde structuur als de
// Sprint-flow heeft, maar dan voor de 14 Pro-stappen. De gebruiker
// blijft op deze pagina elke dag terugkomen, ziet z'n huidige stap
// + voortgang + volgende paar stappen + snelle toegang tot tools.
//
// De huidige stap wordt voor nu eenvoudig bepaald op basis van de
// aanmaakdatum van het profiel. In een volgende iteratie wordt dit
// op basis van voltooide taken (zoals Sprint dat doet).
// ============================================================

export const dynamic = "force-dynamic";

export default async function WelkomProPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, full_name, role, run_startdatum, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as {
      modus?: string | null;
      full_name?: string | null;
      role?: string | null;
      run_startdatum?: string | null;
      created_at?: string | null;
    } | null) ?? {};
  const modus = profielData.modus;
  if (modus !== "pro") {
    if (modus === "sprint") redirect("/dashboard");
    if (modus === "core") redirect("/welkom-core");
    redirect("/welkom-keuze");
  }

  const naam = profielData.full_name?.split(" ")[0] || "";
  const isFounder = profielData.role === "founder";

  // Bereken huidige stap op basis van dagen sinds start van de Pro-route.
  // Voor founders/testers: blijf op stap 1 zodat ze het hele leerpad kunnen testen.
  // Voor members: 1 stap per dag, met max op het totaal.
  const startDatum = profielData.run_startdatum
    ? new Date(profielData.run_startdatum)
    : profielData.created_at
      ? new Date(profielData.created_at)
      : new Date();
  const dagenSindsStart = Math.max(
    0,
    Math.floor((Date.now() - startDatum.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const huidigeStap = isFounder
    ? 1
    : Math.min(PRO_LEERPAD.totaal, Math.max(1, dagenSindsStart + 1));

  const overrides = await haalTekstOverrides(supabase, "welkom-pro");

  return (
    <StappenDashboard
      leerpad={PRO_LEERPAD}
      huidigeStap={huidigeStap}
      naam={naam}
      isFounder={isFounder}
      welkomstFilmSlug={MODUS_WELKOMSTFILM_SLUGS.PRO}
      stapFilmSlugPrefix="pro-stap"
      tekstNamespace="welkom-pro"
      overrides={overrides}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StappenDashboard } from "@/components/leerpaden/StappenDashboard";
import { PRO_LEERPAD } from "@/lib/leerpaden/pro-stappen";
import { haalSponsorNaam } from "@/lib/sponsors/haal-sponsor-naam";

// ============================================================
// /welkom-pro, dashboard voor de Professional-flow (14 stappen)
//
// Toont een simpel overzicht: huidige stap-tegel + voortgang +
// voorvertoning komende stappen. Klik op een stap = naar
// /welkom-pro/stap/[nummer] voor de volle content.
//
// Sidebar werkt via /welkom-pro/layout.tsx (AppShell).
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
    .select("modus, full_name, role, run_startdatum, created_at, sponsor_id")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as {
      modus?: string | null;
      full_name?: string | null;
      role?: string | null;
      run_startdatum?: string | null;
      created_at?: string | null;
      sponsor_id?: string | null;
    } | null) ?? {};
  const modus = profielData.modus;
  if (modus !== "pro") {
    if (modus === "sprint") redirect("/dashboard");
    if (modus === "core") redirect("/welkom-core");
    redirect("/welkom-keuze");
  }

  const naam = profielData.full_name?.split(" ")[0] || "";
  const isFounder = profielData.role === "founder";

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

  const sponsorNaam = await haalSponsorNaam(
    supabase,
    profielData.sponsor_id ?? null,
    profielData.role ?? null,
  );

  return (
    <StappenDashboard
      leerpad={PRO_LEERPAD}
      huidigeStap={huidigeStap}
      naam={naam}
      stapBasisRoute="/welkom-pro/stap"
      sponsorNaam={sponsorNaam}
    />
  );
}

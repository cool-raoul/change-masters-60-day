import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CORE_LEERPAD } from "@/lib/leerpaden/core-stappen";
import { StapDetail } from "@/components/leerpaden/StapDetail";

// ============================================================
// /welkom-core/stap/[nummer], stap-detail-pagina voor de Core-flow
//
// Zelfde structuur als de Pro-stap-detail, maar met Core-data.
// ============================================================

export const dynamic = "force-dynamic";

type Params = Promise<{ nummer: string }>;

export default async function CoreStapPagina({ params }: { params: Params }) {
  const { nummer } = await params;
  const stapNr = Number.parseInt(nummer, 10);
  if (!Number.isFinite(stapNr) || stapNr < 1 || stapNr > CORE_LEERPAD.totaal) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, role")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as { modus?: string | null; role?: string | null } | null) ?? {};
  const modus = profielData.modus;
  const isFounder = profielData.role === "founder";
  if (modus !== "core" && !isFounder) {
    if (modus === "sprint") redirect("/dashboard");
    if (modus === "pro") redirect("/welkom-pro");
    redirect("/welkom-keuze");
  }

  const stap = CORE_LEERPAD.stappen.find((s) => s.nummer === stapNr);
  if (!stap) notFound();

  return (
    <StapDetail
      leerpad={CORE_LEERPAD}
      stap={stap}
      dashboardRoute="/welkom-core"
      stapFilmSlugPrefix="core-stap"
    />
  );
}

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRO_LEERPAD } from "@/lib/leerpaden/pro-stappen";
import { StapDetail } from "@/components/leerpaden/StapDetail";

// ============================================================
// /welkom-pro/stap/[nummer], stap-detail-pagina voor de Pro-flow
//
// Toont één stap met de volle content: terug-knop, film-slot,
// titel, doel, "wat je leert", "wat je doet"-taken, "waar in ELEVA",
// vorige/volgende navigatie.
//
// Sidebar werkt via /welkom-pro/layout.tsx (AppShell).
// ============================================================

export const dynamic = "force-dynamic";

type Params = Promise<{ nummer: string }>;

export default async function ProStapPagina({ params }: { params: Params }) {
  const { nummer } = await params;
  const stapNr = Number.parseInt(nummer, 10);
  if (!Number.isFinite(stapNr) || stapNr < 1 || stapNr > PRO_LEERPAD.totaal) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check modus, alleen Pro-gebruikers en founders mogen hier komen
  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, role")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as { modus?: string | null; role?: string | null } | null) ?? {};
  const modus = profielData.modus;
  const isFounder = profielData.role === "founder";
  if (modus !== "pro" && !isFounder) {
    if (modus === "sprint") redirect("/dashboard");
    if (modus === "core") redirect("/welkom-core");
    redirect("/welkom-keuze");
  }

  const stap = PRO_LEERPAD.stappen.find((s) => s.nummer === stapNr);
  if (!stap) notFound();

  return (
    <StapDetail
      leerpad={PRO_LEERPAD}
      stap={stap}
      dashboardRoute="/welkom-pro"
      stapFilmSlugPrefix="pro-stap"
    />
  );
}

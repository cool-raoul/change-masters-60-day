import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRO_LEERPAD } from "@/lib/leerpaden/pro-stappen";
import { StapDetail } from "@/components/leerpaden/StapDetail";
import { pasStapOverridesToe } from "@/lib/leerpaden/overrides";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import {
  haalPaginaBlokken,
  blokkenAlsRecord,
} from "@/lib/cms/pagina-blokken";

// ============================================================
// /welkom-pro/stap/[nummer], stap-detail-pagina voor de Pro-flow
//
// Toont één stap met de volle content: terug-knop, film-slot,
// titel, doel, "wat je leert", "wat je doet"-taken, "waar in ELEVA",
// vorige/volgende navigatie.
//
// Sidebar werkt via /welkom-pro/layout.tsx (AppShell).
//
// Server-side laadt tekst_overrides (pro-stap, pro-ui) en pagina_blokken
// zodat founders inline kunnen bewerken.
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

  let stap = PRO_LEERPAD.stappen.find((s) => s.nummer === stapNr);
  if (!stap) notFound();

  // Tekst-overrides laden (pro-stap voor per-stap content, pro-ui
  // voor gedeelde headers/buttons)
  const tekstOverrides = await haalTekstOverridesMulti(supabase, [
    "pro-stap",
    "pro-ui",
  ]);
  stap = pasStapOverridesToe(stap, tekstOverrides.get("pro-stap"));
  const uiOverrides = namespaceAlsRecord(tekstOverrides, "pro-ui");

  // Media-blokken voor deze stap
  const paginaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "pro-stap",
    String(stapNr),
  );
  const paginaBlokken = blokkenAlsRecord(paginaBlokkenMap);

  return (
    <StapDetail
      leerpad={PRO_LEERPAD}
      stap={stap}
      dashboardRoute="/welkom-pro"
      stapFilmSlugPrefix="pro-stap"
      isFounder={isFounder}
      uiOverrides={uiOverrides}
      paginaBlokken={paginaBlokken}
      paginaNamespace="pro-stap"
      tekstNamespace="pro"
    />
  );
}

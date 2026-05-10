import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CORE_LEERPAD } from "@/lib/leerpaden/core-stappen";
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
// /welkom-core/stap/[nummer], stap-detail-pagina voor de Core-flow
//
// Zelfde structuur als de Pro-stap-detail, maar met Core-data.
// Server-side laadt nu ook tekst_overrides (core-stap, core-ui) en
// pagina_blokken zodat founders hun edits inline kunnen doen.
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

  let stap = CORE_LEERPAD.stappen.find((s) => s.nummer === stapNr);
  if (!stap) notFound();

  // Tekst-overrides laden (core-stap voor per-stap content, core-ui
  // voor gedeelde headers/buttons)
  const tekstOverrides = await haalTekstOverridesMulti(supabase, [
    "core-stap",
    "core-ui",
  ]);
  stap = pasStapOverridesToe(stap, tekstOverrides.get("core-stap"));
  const uiOverrides = namespaceAlsRecord(tekstOverrides, "core-ui");

  // Media-blokken voor deze stap
  const paginaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "core-stap",
    String(stapNr),
  );
  const paginaBlokken = blokkenAlsRecord(paginaBlokkenMap);

  return (
    <StapDetail
      leerpad={CORE_LEERPAD}
      stap={stap}
      dashboardRoute="/welkom-core"
      stapFilmSlugPrefix="core-stap"
      isFounder={isFounder}
      uiOverrides={uiOverrides}
      paginaBlokken={paginaBlokken}
      paginaNamespace="core-stap"
      tekstNamespace="core"
    />
  );
}

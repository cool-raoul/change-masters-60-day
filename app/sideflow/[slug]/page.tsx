// File: app/sideflow/[slug]/page.tsx
//
// Side-flow-route voor de pre-post en 21-dagen-resultaat-post.
// Sinds 2026-05-31 verhuisd uit /core-v9/sideflow naar /sideflow zodat
// 'r geen V9-prefix meer aan kleeft. Op /vandaag triggert de gate na
// dag 1 een redirect hierheen voordat dag 2 opent.
//
// Toont de side-flow als een lijst substeps + MediaBlokken per substep,
// met een "Voltooid"-knop die de side-flow afsluit en de member naar
// /vandaag terugbrengt voor dag 2.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  CORE_V9_SIDEFLOWS,
  type CoreV9SideflowSlug,
} from "@/lib/playbook/core-sideflows-v9";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { CoreV9SideflowView } from "@/app/core-v9/sideflow/[slug]/sideflow-view";
import { EditModeProvider } from "@/components/cms/EditModeContext";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

const GELDIGE_SLUGS: CoreV9SideflowSlug[] = ["pre-post", "21-dagen-post"];

export default async function SideflowPagina({
  params,
}: {
  params: Params;
}) {
  const { slug: slugStr } = await params;

  if (!GELDIGE_SLUGS.includes(slugStr as CoreV9SideflowSlug)) {
    notFound();
  }
  const slug = slugStr as CoreV9SideflowSlug;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";

  const sideflow = CORE_V9_SIDEFLOWS[slug];

  // MediaBlokken vooraf ophalen. We blijven namespace `core-v9-sideflow`
  // gebruiken zodat bestaande blokken van eerdere uitnodigingen blijven
  // werken zonder migratie.
  const mediaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "core-v9-sideflow",
    slug,
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  mediaBlokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  // Voltooiingen ophalen uit core_v6_substep_voltooiingen met
  // ankerstap_nummer = 0 (sideflow-marker).
  let voltooidIds: string[] = [];
  try {
    const { data } = await supabase
      .from("core_v6_substep_voltooiingen")
      .select("taak_id")
      .eq("user_id", user.id)
      .eq("ankerstap_nummer", 0);
    voltooidIds = ((data ?? []) as { taak_id: string }[])
      .map((r) => r.taak_id)
      .filter((id) => id.startsWith(`core-v9-sideflow-${slug}-`));
  } catch {
    voltooidIds = [];
  }

  const voornaam =
    ((profile as { full_name?: string } | null)?.full_name ?? "").split(" ")[0] ||
    "";

  return (
    <EditModeProvider>
      <CoreV9SideflowView
        sideflow={sideflow}
        isFounder={isFounder}
        voornaam={voornaam}
        initieelVoltooidIds={voltooidIds}
        blokkenPerPositie={blokkenPerPositie}
      />
    </EditModeProvider>
  );
}

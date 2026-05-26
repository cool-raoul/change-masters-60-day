// File: app/core-v9/sideflow/[slug]/page.tsx
//
// Side-flow-route voor de pre-post en 21-dagen-resultaat-post.
// Toont de side-flow als een lijst substeps + MediaBlokken per substep,
// met een "Voltooid"-knop die de side-flow afsluit en de member naar
// ankerstap 2 brengt.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { isCoreV9Actief } from "@/lib/feature-flags/core-v9";
import {
  CORE_V9_SIDEFLOWS,
  type CoreV9SideflowSlug,
} from "@/lib/playbook/core-sideflows-v9";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { CoreV9SideflowView } from "./sideflow-view";
import { EditModeProvider } from "@/components/cms/EditModeContext";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

const GELDIGE_SLUGS: CoreV9SideflowSlug[] = ["pre-post", "21-dagen-post"];

export default async function CoreV9SideflowPagina({
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

  const v9Actief = await isCoreV9Actief(user.id);
  if (!v9Actief) redirect("/vandaag");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";

  const sideflow = CORE_V9_SIDEFLOWS[slug];

  // MediaBlokken vooraf ophalen, namespace `core-v9-sideflow`.
  const mediaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "core-v9-sideflow",
    slug,
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  mediaBlokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  // Voltooiingen voor deze sideflow ophalen. We hergebruiken
  // core_v6_substep_voltooiingen want taak-IDs zijn uniek
  // (`core-v9-sideflow-...`). Sla ze op met ankerstap_nummer = 0
  // om ze te onderscheiden van ankerstap-substeps.
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

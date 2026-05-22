// File: app/core-v6/stap/[nummer]/page.tsx
//
// Open een specifieke Core V6-ankerstap in de multi-step flow. Founder
// kan elke ankerstap openen om vooruit te kijken of inhoud te bewerken.
// Member kan alleen z'n huidige of eerdere ankerstap openen.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";
import {
  coreV6Stap,
  CORE_V6_AANTAL_STAPPEN,
} from "@/lib/playbook/core-dagen-v6";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { CoreV6Flow } from "../../core-v6-flow";
import { EditModeProvider } from "@/components/cms/EditModeContext";

export const dynamic = "force-dynamic";

type Params = Promise<{ nummer: string }>;

export default async function CoreV6StapDetailPagina({
  params,
}: {
  params: Params;
}) {
  const { nummer: nummerStr } = await params;
  const nummer = Number(nummerStr);
  if (
    !Number.isInteger(nummer) ||
    nummer < 1 ||
    nummer > CORE_V6_AANTAL_STAPPEN
  ) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, core_v6_ankerstap, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";

  const huidigeStap = Math.max(
    1,
    Math.min(
      CORE_V6_AANTAL_STAPPEN,
      (profile as { core_v6_ankerstap?: number } | null)?.core_v6_ankerstap ?? 1,
    ),
  );
  if (!isFounder && nummer > huidigeStap) {
    redirect(`/core-v6/stap/${huidigeStap}`);
  }

  const stap = coreV6Stap(nummer);
  if (!stap) notFound();

  const mediaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "core-v6-stap",
    String(stap.nummer),
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  mediaBlokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  let voltooidIds: string[] = [];
  try {
    const { data } = await supabase
      .from("core_v6_substep_voltooiingen")
      .select("taak_id")
      .eq("user_id", user.id)
      .eq("ankerstap_nummer", stap.nummer);
    voltooidIds = ((data ?? []) as { taak_id: string }[]).map((r) => r.taak_id);
  } catch {
    voltooidIds = [];
  }

  const voornaam =
    ((profile as { full_name?: string } | null)?.full_name ?? "").split(" ")[0] ||
    "";

  return (
    <EditModeProvider>
      <CoreV6Flow
        ankerstap={stap}
        totaalAnkerstappen={CORE_V6_AANTAL_STAPPEN}
        isFounder={isFounder}
        voornaam={voornaam}
        initieelVoltooidIds={voltooidIds}
        blokkenPerPositie={blokkenPerPositie}
        isHuidigeAnkerstap={nummer === huidigeStap}
      />
    </EditModeProvider>
  );
}

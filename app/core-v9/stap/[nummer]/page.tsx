// File: app/core-v9/stap/[nummer]/page.tsx
//
// Open een specifieke Core V6-ankerstap in de multi-step flow. Founder
// kan elke ankerstap openen om vooruit te kijken of inhoud te bewerken.
// Member kan alleen z'n huidige of eerdere ankerstap openen.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { isCoreV9Actief } from "@/lib/feature-flags/core-v9";
import {
  coreV9Stap,
  CORE_V9_AANTAL_STAPPEN,
} from "@/lib/playbook/core-dagen-v9";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { CoreV9Flow } from "../../core-v9-flow";
import { EditModeProvider } from "@/components/cms/EditModeContext";

export const dynamic = "force-dynamic";

type Params = Promise<{ nummer: string }>;

export default async function CoreV9StapDetailPagina({
  params,
}: {
  params: Params;
}) {
  const { nummer: nummerStr } = await params;
  const nummer = Number(nummerStr);
  if (
    !Number.isInteger(nummer) ||
    nummer < 1 ||
    nummer > CORE_V9_AANTAL_STAPPEN
  ) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV9Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  // Veilige basis-query: alleen kolommen die zeker bestaan.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";

  // Optionele V9-progressie ophalen, fallback naar 1 als kolom nog niet bestaat.
  let huidigeStap = 1;
  try {
    const { data: progressie } = await supabase
      .from("profiles")
      .select("core_v9_ankerstap")
      .eq("id", user.id)
      .maybeSingle();
    const rawStap = (progressie as { core_v9_ankerstap?: number } | null)
      ?.core_v9_ankerstap;
    if (typeof rawStap === "number" && rawStap >= 1) {
      huidigeStap = Math.min(CORE_V9_AANTAL_STAPPEN, rawStap);
    }
  } catch {
    huidigeStap = 1;
  }
  if (!isFounder && nummer > huidigeStap) {
    redirect(`/core-v9/stap/${huidigeStap}`);
  }

  const stap = coreV9Stap(nummer);
  if (!stap) notFound();

  const mediaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "core-v9-stap",
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
      <CoreV9Flow
        ankerstap={stap}
        totaalAnkerstappen={CORE_V9_AANTAL_STAPPEN}
        isFounder={isFounder}
        voornaam={voornaam}
        initieelVoltooidIds={voltooidIds}
        blokkenPerPositie={blokkenPerPositie}
        isHuidigeAnkerstap={nummer === huidigeStap}
      />
    </EditModeProvider>
  );
}

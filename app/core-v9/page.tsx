// File: app/core-v9/page.tsx
//
// Core V6 vandaag-pagina, rendert de CoreV9Flow client-component met
// de HUIDIGE ankerstap van de user. Anti-overwhelm UI-componenten
// (KlantenTegel, DMO compact, Pulse-signaal) komen onder de flow.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isCoreV9Actief } from "@/lib/feature-flags/core-v9";
import {
  coreV9Stap,
  CORE_V9_AANTAL_STAPPEN,
} from "@/lib/playbook/core-dagen-v9";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { CoreV9Flow } from "./core-v9-flow";
import {
  CompactDMOBlok,
  type DMOTaak,
} from "@/components/anti-overwhelm/CompactDMOBlok";
import { KlantenTegel } from "@/components/anti-overwhelm/KlantenTegel";
import { PulseSignaalBox } from "@/components/anti-overwhelm/PulseSignaalBox";
import { EditModeProvider } from "@/components/cms/EditModeContext";

export const dynamic = "force-dynamic";

export default async function CoreV9VandaagPagina() {
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

  // Optionele V9-progressie ophalen, fallback naar 1 als kolom nog niet bestaat
  // in profiles-tabel (geen migratie nodig voor pilot).
  let ankerstap = 1;
  try {
    const { data: progressie } = await supabase
      .from("profiles")
      .select("core_v9_ankerstap")
      .eq("id", user.id)
      .maybeSingle();
    const rawStap = (progressie as { core_v9_ankerstap?: number } | null)
      ?.core_v9_ankerstap;
    if (typeof rawStap === "number" && rawStap >= 1 && rawStap <= CORE_V9_AANTAL_STAPPEN) {
      ankerstap = rawStap;
    }
  } catch {
    ankerstap = 1;
  }

  const stap = coreV9Stap(ankerstap);
  if (!stap) redirect("/dashboard");

  // MediaBlokken vooraf ophalen en groeperen per positie.
  const mediaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "core-v9-stap",
    String(stap.nummer),
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  mediaBlokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  // Substep-voortgang voor deze ankerstap ophalen.
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

  // Klanten-tegel data.
  let aantalKlanten = 0;
  try {
    const { count } = await supabase
      .from("klantomgeving_klanten")
      .select("id", { count: "exact", head: true })
      .eq("member_id", user.id);
    aantalKlanten = count ?? 0;
  } catch {
    aantalKlanten = 0;
  }

  // DMO-taken (pilot-skelet).
  const dmoTaken: DMOTaak[] = [
    { id: "dmo-namen", label: "Voeg een nieuwe naam toe aan je lijst", voltooid: false },
    { id: "dmo-contact", label: "Stuur een warm bericht (uit je top-20)", voltooid: false },
    { id: "dmo-story", label: "Plaats minimaal een Story", voltooid: false },
    { id: "dmo-followup", label: "Volg een prospect op die nog open staat", voltooid: false },
    { id: "dmo-radar", label: "Check je momentum-radar", voltooid: false },
  ];

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
        isHuidigeAnkerstap={true}
      />

      {/* Anti-overwhelm-componenten onder de flow */}
      <div className="mx-auto max-w-2xl px-4 pb-10 space-y-4">
        <div>
          <h3 className="text-cm-muted text-xs uppercase tracking-wider mb-2">
            Daarnaast, je dagelijkse ritme
          </h3>
          <CompactDMOBlok taken={dmoTaken} standaardIngeklapt={true} />
        </div>
        <KlantenTegel
          aantalKlanten={aantalKlanten}
          aantalNieuweSignalen={0}
          signaalSamenvatting={
            aantalKlanten === 0 ? "Nog geen klanten in beeld" : undefined
          }
        />
        <PulseSignaalBox signalen={[]} />
        <div className="text-center text-xs text-cm-muted/70 pt-2">
          Core V6 pilot, alleen voor jouw account zichtbaar.
        </div>
      </div>
    </EditModeProvider>
  );
}

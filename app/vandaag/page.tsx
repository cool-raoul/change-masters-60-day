import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";
import { DAGEN } from "@/lib/playbook/dagen";
import { haalOverrides, pasOverrideToe } from "@/lib/playbook/overrides";
import { VandaagFlow } from "./vandaag-flow";

// ============================================================
// /vandaag — guided full-screen flow voor de huidige playbook-dag.
//
// Werkt als de onboarding: geen AppShell, geen sidebar — focus alleen
// op wat de member vandaag moet doen. Stap voor stap door alle taken
// + uitleg, met afvink-knoppen. Aan eind een viering en knop terug
// naar dashboard.
//
// Bedoeld om bij eerste bezoek per dag de overweldiging weg te halen:
// niet alle dashboard-tegels in beeld, maar één duidelijke flow.
// ============================================================

export const dynamic = "force-dynamic";

function berekenDag(runStartdatum: string | null): number {
  const start = runStartdatum ? new Date(runStartdatum) : new Date();
  const dagen = differenceInDays(new Date(), start) + 1;
  return Math.max(1, dagen);
}

export default async function VandaagPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("run_startdatum, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const dag = berekenDag((profile as any)?.run_startdatum ?? null);

  // Buiten dag 1-21 → terug naar dashboard (weekritme-modus)
  if (dag < 1 || dag > 21) {
    redirect("/dashboard");
  }

  let dagData = DAGEN.find((d) => d.nummer === dag);
  if (!dagData) redirect("/dashboard");

  // Founder-overrides toepassen — zelfde patroon als dashboard.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overrideMap = await haalOverrides(supabase as any, [dag]);
  dagData = pasOverrideToe(dagData, overrideMap.get(dag) ?? null);

  // Voltooide taken voor deze dag
  const { data: voltooiingen } = await supabase
    .from("dag_voltooiingen")
    .select("taak_id")
    .eq("user_id", user.id)
    .eq("dag_nummer", dag);
  const voltooidIds = (
    (voltooiingen as Array<{ taak_id: string }>) || []
  ).map((v) => v.taak_id);

  // Eerder geschreven inline-zinnen (edification etc.)
  const slugs = dagData.vandaagDoen
    .map((t) => t.inlineActie?.slug)
    .filter((s): s is string => !!s);
  const initialZinnen: Record<string, string> = {};
  if (slugs.length > 0) {
    const { data: zinnen } = await supabase
      .from("eigen_zinnen")
      .select("slug, waarde")
      .eq("user_id", user.id)
      .in("slug", slugs);
    for (const r of (zinnen as Array<{ slug: string; waarde: string }>) ||
      []) {
      initialZinnen[r.slug] = r.waarde;
    }
  }

  const voornaam =
    ((profile as { full_name?: string | null } | null)?.full_name ?? "")
      .split(" ")[0] || user.email?.split("@")[0] || "";

  return (
    <VandaagFlow
      dag={dagData}
      voltooidIds={voltooidIds}
      initialZinnen={initialZinnen}
      voornaam={voornaam}
    />
  );
}

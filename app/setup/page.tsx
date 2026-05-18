import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { haalAlleVoltooiingenVoorUser } from "@/lib/onboarding/voltooiingen";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { AdminChecklist } from "@/components/setup/AdminChecklist";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";

// ============================================================
// /setup, admin-rail pagina.
//
// Vijf eenmalige admin-stappen (webshop, krediet, teams-admin,
// bestellinks, productadvies-test). Cross-modus voltooid blijft
// cross-modus voltooid. Pop-up op /vandaag wijst hierheen zolang
// niet alles is afgevinkt.
// ============================================================

export const dynamic = "force-dynamic";

export default async function SetupPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (profile as { role?: string } | null)?.role === "founder";

  const voltooiMap = await haalAlleVoltooiingenVoorUser(supabase, user.id);
  const beginVoltooiingen: Record<string, boolean> = {};
  for (const item of ADMIN_ITEMS) {
    beginVoltooiingen[item.slug] = !!voltooiMap.get(item.slug)?.voltooid;
  }

  const overrides = await haalTekstOverrides(supabase, "setup-admin");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <AdminChecklist
        beginVoltooiingen={beginVoltooiingen}
        isFounder={isFounder}
        overrides={overrides}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ModusSwitchKnoppen } from "./modus-switch-knoppen";

// ============================================================
// /instellingen/modus-test, founder + tester modus-switcher
//
// Voor founders (Raoul, Gaby) én pilot-testaccounts (is_tester=true)
// om snel te kunnen testen hoe een nieuwe gebruiker binnenkomt in
// elke modus, zonder een tweede account aan te maken. Vier knoppen:
//   - Reset naar nieuwe gebruiker (modus = NULL → /welkom-keuze)
//   - Word Sprint-gebruiker (modus = sprint → /vandaag)
//   - Word Core-gebruiker (modus = core → /vandaag)
//   - Word Pro-gebruiker (modus = pro → /welkom-pro)
//
// Gewone members en leiders zien deze pagina niet (redirect naar
// /dashboard).
// ============================================================

export const dynamic = "force-dynamic";

export default async function ModusTestPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, modus, is_tester")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as { role?: string | null } | null)?.role;
  const isTester =
    (profile as { is_tester?: boolean | null } | null)?.is_tester === true;
  const huidigeModus = (profile as { modus?: string | null } | null)?.modus ?? null;

  if (role !== "founder" && !isTester) redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/instellingen"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
      >
        ← Terug naar instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          🧪 Modus-test, voor founders
        </h1>
        <p className="text-cm-white opacity-70 mt-2 leading-relaxed">
          Switch je eigen account tussen de drie wegen om te zien hoe elke
          gebruikersgroep ELEVA ervaart. Reset naar &quot;nieuwe gebruiker&quot; om
          de keuzepagina opnieuw te doorlopen, alsof je net inlogt.
        </p>
      </div>

      <div className="card border-gold-subtle">
        <div className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          Jouw huidige modus
        </div>
        <div className="text-cm-white text-2xl font-display font-bold">
          {huidigeModus === "sprint" && "🏃 Sprint (60-day Run)"}
          {huidigeModus === "core" && "🚶 Core (Webshop-strategie)"}
          {huidigeModus === "pro" && "💼 Pro (Professional)"}
          {huidigeModus === null && "👋 Nieuwe gebruiker (geen modus gekozen)"}
        </div>
      </div>

      <ModusSwitchKnoppen userId={user.id} huidigeModus={huidigeModus} />

      <div className="card border-l-4 border-amber-500">
        <h2 className="text-amber-300 font-semibold text-sm flex items-center gap-2 mb-2">
          ⚠️ Belangrijk om te weten
        </h2>
        <ul className="text-cm-white text-sm space-y-2 opacity-90">
          <li>
            • Deze pagina is alleen voor jou en Gaby zichtbaar (rol = founder).
          </li>
          <li>
            • Switchen verandert je echte account. Als je weer wilt werken in je
            normale modus, kies dan opnieuw &quot;Sprint&quot; (jullie testers-modus).
          </li>
          <li>
            • Bij &quot;Reset naar nieuwe gebruiker&quot; wordt je modus op leeg gezet
            en zie je de keuzepagina alsof je net hebt ingelogd. Je voortgang
            (namen, prospects, etc.) blijft bewaard.
          </li>
        </ul>
      </div>
    </div>
  );
}

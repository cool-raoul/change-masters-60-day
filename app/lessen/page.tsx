import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { berekenHuidigeDag } from "@/lib/playbook/bereken-dag";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { CORE_V9_STAPPEN } from "@/lib/playbook/core-dagen-v9";
import { DAGEN } from "@/lib/playbook/dagen";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// /lessen, overzicht van de lessen die de member AL heeft gehad.
//
// Bewust ACHTERUIT-only: dag 1 t/m de huidige dag. Vooruit-bladeren
// blijft dicht (geen ritme-skip); just-in-time vooruit-vragen lopen
// via de "Wat nu?"-knop. Modus-bewust: Core toont de V9-lessen,
// Sprint de Sprint-lessen. Pro heeft geen dag-lessen.
// ============================================================

export const dynamic = "force-dynamic";

function Header() {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          📖 Lessen
        </h1>
        <p className="text-cm-white opacity-60 mt-1">
          De lessen die je al hebt gehad, om rustig terug te lezen. Vooruit
          blader je niet. Wil je iets van vandaag of straks weten, gebruik dan
          de &ldquo;Wat nu?&rdquo;-knop.
        </p>
      </div>
      <Link href="/dashboard" className="btn-secondary text-sm">
        ← Dashboard
      </Link>
    </div>
  );
}

export default async function LessenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, is_tester, modus, sprint_startdatum, core_startdatum, run_startdatum, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as Record<string, unknown> | null;

  const modusRaw = (p?.modus as string | null) ?? null;
  const modus: Modus =
    modusRaw === "core" ? "core" : modusRaw === "pro" ? "pro" : "sprint";

  // Pro heeft geen dag-lessen in deze pilot.
  if (modus === "pro") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Header />
        <div className="card border-dashed">
          <p className="text-cm-white opacity-70 text-sm">
            Jouw route (Pro) werkt met een leerpad in plaats van dag-lessen.
            Open ELEVA Mentor of je leerpad om verder te gaan.
          </p>
        </div>
      </div>
    );
  }

  const { data: voltooiingen } = await supabase
    .from("dag_voltooiingen")
    .select("dag_nummer, taak_id")
    .eq("user_id", user.id);

  const isTester = p?.role === "founder" || p?.is_tester === true;
  const startD = startdatumVoorModus(
    {
      sprint_startdatum: (p?.sprint_startdatum as string | null) ?? null,
      core_startdatum: (p?.core_startdatum as string | null) ?? null,
      run_startdatum: (p?.run_startdatum as string | null) ?? null,
      created_at: (p?.created_at as string | null) ?? null,
    },
    modus,
  );
  const startIso = startD ? startD.toISOString().slice(0, 10) : null;

  const huidigeDag = berekenHuidigeDag(
    (voltooiingen as Array<{ dag_nummer: number; taak_id: string }>) || [],
    startIso,
    { isTester, modus },
  );

  const dagenArray = modus === "core" ? CORE_V9_STAPPEN : DAGEN;
  // Achteruit-only: dag 1 t/m je huidige dag, gecapt op 21 (de opstart-lessen).
  const tot = Math.min(Math.max(huidigeDag, 1), 21);
  const lessen = dagenArray
    .filter((d) => d.nummer >= 1 && d.nummer <= tot)
    .sort((a, b) => a.nummer - b.nummer);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Header />
      {lessen.length === 0 ? (
        <div className="card border-dashed">
          <p className="text-cm-white opacity-70 text-sm">
            Je eerste les verschijnt hier zodra je met dag 1 begint.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {lessen.map((d) => (
            <Link
              key={d.nummer}
              href={`/lessen/${d.nummer}`}
              className="card flex items-center justify-between gap-3 hover:bg-cm-surface-2 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-cm-white/50 text-xs">Dag {d.nummer}</p>
                <p className="text-cm-white text-sm font-semibold truncate">
                  {d.titel}
                </p>
              </div>
              <span className="text-cm-gold text-xs whitespace-nowrap">
                Lees terug →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

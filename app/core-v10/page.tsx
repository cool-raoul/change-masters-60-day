// File: app/core-v10/page.tsx
//
// Founder-preview van Core 2.0 (V10): overzicht van alle 30 dagen,
// gegroepeerd per fase, elke dag klikbaar naar de detail-route
// /core-v10/stap/[nummer]. Puur een preview: de live Core (V9) en de
// dag-engine (bereken-dag, dagen-voor-modus, /vandaag) blijven
// ongewijzigd. Toegang: alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CORE_V10_STAPPEN } from "@/lib/playbook/core-dagen-v10";

export const dynamic = "force-dynamic";

const FASE_LABELS: Record<1 | 2 | 3 | 4, { titel: string; dagen: string }> = {
  1: { titel: "Lanceerweek + oogst", dagen: "Dag 1 t/m 8" },
  2: { titel: "Business-boog + eerste skills", dagen: "Dag 9 t/m 14" },
  3: { titel: "Gesprekken + finale", dagen: "Dag 15 t/m 21" },
  4: { titel: "Verdieping + verdiende top-20", dagen: "Dag 22 t/m 30" },
};

export default async function CoreV10OverzichtPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as { role?: string | null; is_tester?: boolean | null } | null;
  const magKijken = p?.role === "founder" || p?.is_tester === true;
  if (!magKijken) redirect("/dashboard");

  const fasen = ([1, 2, 3, 4] as const).map((fase) => ({
    fase,
    dagen: CORE_V10_STAPPEN.filter((d) => d.fase === fase),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      {/* Preview-banner */}
      <div className="mb-8 rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-3">
        <p className="text-amber-300 text-sm font-semibold">
          🔭 Core 2.0 preview, nog niet live
        </p>
        <p className="text-cm-muted text-xs mt-1 leading-relaxed">
          Dit is de eerdere 30-dagen-voorproef. Inmiddels is er een nieuwere
          opzet met twee routes en de lanceer-reeksen:{" "}
          <Link href="/lanceer-reis" className="text-cm-gold underline">
            bekijk de lanceer-reis preview →
          </Link>
        </p>
      </div>

      <header className="mb-8">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-preview · Core 2.0 (V10)
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white mt-2">
          De 30 dagen van Core 2.0
        </h1>
        <p className="mt-3 text-cm-muted text-sm leading-relaxed">
          Klik een dag open om de volledige inhoud te zien: de mini-les, de
          taken van die dag en waar alles in ELEVA zit. Onderaan elke dag kun
          je door naar de volgende.
        </p>
      </header>

      {fasen.map(({ fase, dagen }) => (
        <section key={fase} className="mb-8">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-1">
            Fase {fase} · {FASE_LABELS[fase].titel}
          </h2>
          <p className="text-cm-muted text-xs mb-3">{FASE_LABELS[fase].dagen}</p>
          <div className="space-y-2">
            {dagen.map((dag) => (
              <Link
                key={dag.nummer}
                href={`/core-v10/stap/${dag.nummer}`}
                className="card block hover:border-cm-gold/50 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-cm-gold/80 text-xs font-semibold mr-2">
                      Dag {dag.nummer}
                    </span>
                    <span className="text-cm-white font-medium text-base">
                      {dag.titel}
                    </span>
                  </div>
                  <span className="text-xs text-cm-gold/70 flex-shrink-0">
                    Bekijk →
                  </span>
                </div>
                <p className="text-cm-muted text-xs mt-1.5">
                  {dag.vandaagDoen.length}{" "}
                  {dag.vandaagDoen.length === 1 ? "taak" : "taken"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-12 border-t border-cm-border pt-6 text-center text-xs text-cm-muted">
        <p>
          Klaar met doorklikken? Geef in chat per dag of fase je akkoord of
          aanpassings-richting, dan werk ik de teksten bij voordat er iets
          live gaat.
        </p>
      </footer>
    </main>
  );
}

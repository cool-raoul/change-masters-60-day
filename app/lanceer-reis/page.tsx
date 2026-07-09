// File: app/lanceer-reis/page.tsx
//
// Founder-preview van DE LANCEER-REIS (goedgekeurde opzet 2026-07-09):
// twee routes uit dezelfde bouwblokken, gegroepeerd per fase, elke dag
// klikbaar naar /lanceer-reis/[route]/dag/[nummer]. Puur preview: de
// live Core (V9) en de dag-engine blijven ongewijzigd.
// Toegang: alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  routeDagen,
  routeFasen,
  type LanceerRoute,
} from "@/lib/playbook/lanceer-routes";

export const dynamic = "force-dynamic";

export default async function LanceerReisOverzicht({
  searchParams,
}: {
  searchParams: Promise<{ route?: string }>;
}) {
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

  const sp = await searchParams;
  const route: LanceerRoute = sp.route === "b" ? "b" : "a";
  const dagen = routeDagen(route);
  const fasen = routeFasen(route);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      {/* Preview-banner */}
      <div className="mb-8 rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-3">
        <p className="text-amber-300 text-sm font-semibold">
          🔭 Lanceer-reis preview, nog niet live
        </p>
        <p className="text-cm-muted text-xs mt-1 leading-relaxed">
          Dit is de nieuwe opzet: de 21-dagen-werkwijze verdeeld over 30-40
          dagen, met de pre-post en de 21-dagen-post als reeks. De huidige
          Core (V9) blijft ongewijzigd tot deze preview is goedgekeurd.
        </p>
      </div>

      <header className="mb-6">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-preview · De lanceer-reis
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white mt-2">
          {route === "a"
            ? "Route A · nog geen eigen resultaat"
            : "Route B · al eigen resultaat"}
        </h1>
        <p className="mt-3 text-cm-muted text-sm leading-relaxed">
          {route === "a"
            ? "±40 dagen: de 6-daagse pre-post-lancering eerst, en rond dag 21 de resultaten-reeks als finale (vervolg-smaak: hervertellen, niet herhalen)."
            : "±30 dagen: meteen de volledige 10-daagse resultaten-lancering, daarna oogst, opportunity en skills."}
        </p>
      </header>

      {/* Route-wissel */}
      <div className="mb-8 flex gap-2">
        <Link
          href="/lanceer-reis?route=a"
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            route === "a"
              ? "bg-cm-gold text-cm-bg border-cm-gold"
              : "border-cm-border text-cm-white/60 hover:text-cm-white"
          }`}
        >
          🚀 Route A (±40 dagen)
        </Link>
        <Link
          href="/lanceer-reis?route=b"
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            route === "b"
              ? "bg-cm-gold text-cm-bg border-cm-gold"
              : "border-cm-border text-cm-white/60 hover:text-cm-white"
          }`}
        >
          ✨ Route B (±30 dagen)
        </Link>
      </div>

      {fasen.map((fase) => {
        const faseDagen = dagen.filter(
          (d) => d.nummer >= fase.dagen[0] && d.nummer <= fase.dagen[1],
        );
        return (
          <section key={`${fase.titel}-${fase.dagen[0]}`} className="mb-8">
            <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-1">
              {fase.emoji} {fase.titel}
            </h2>
            <p className="text-cm-muted text-xs mb-3">
              Dag {fase.dagen[0]} t/m {fase.dagen[1]} · {fase.detail}
            </p>
            <div className="space-y-2">
              {faseDagen.map((dag) => (
                <Link
                  key={dag.nummer}
                  href={`/lanceer-reis/${route}/dag/${dag.nummer}`}
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
        );
      })}

      <footer className="mt-12 border-t border-cm-border pt-6 text-center text-xs text-cm-muted">
        <p>
          Klaar met doorklikken? Geef in chat per dag, reeks of fase je
          akkoord of aanpassings-richting, dan werk ik de teksten bij
          voordat er iets live gaat.
        </p>
      </footer>
    </main>
  );
}

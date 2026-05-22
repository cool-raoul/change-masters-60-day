// File: app/core-v6/page.tsx
//
// Core V6 vandaag-shell. Beschermd door feature-flag core_v6_actief.
// Toont de huidige ankerstap bovenaan (K1) + DMO compact ingeklapt (K1) +
// KlantenTegel (K2) + PulseSignaalBox (K4) als die signalen heeft.
//
// Anker-progressie loopt via een nieuwe kolom profiles.core_v6_ankerstap
// (default 1). Komt in latere Fase met SQL-migratie. Voor nu: lees uit
// profile, default 1 als kolom mist.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";
import { coreV6Stap } from "@/lib/playbook/core-dagen-v6";
import { CompactDMOBlok, type DMOTaak } from "@/components/anti-overwhelm/CompactDMOBlok";
import { KlantenTegel } from "@/components/anti-overwhelm/KlantenTegel";
import { PulseSignaalBox } from "@/components/anti-overwhelm/PulseSignaalBox";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoreV6VandaagPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  // Lees ankerstap-positie. Default 1.
  let ankerstap = 1;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("core_v6_ankerstap")
      .eq("id", user.id)
      .maybeSingle();
    const raw = (data as { core_v6_ankerstap?: number } | null)?.core_v6_ankerstap;
    if (typeof raw === "number" && raw >= 1 && raw <= 21) ankerstap = raw;
  } catch {
    ankerstap = 1;
  }

  const stap = coreV6Stap(ankerstap);
  if (!stap) redirect("/dashboard");

  // PLACEHOLDER DMO-taken. In latere Fase: genereerDMOStappenV6() uit lib.
  // Voor pilot-skelet: vijf basis-taken zonder voltooid-state.
  const dmoTaken: DMOTaak[] = [
    { id: "dmo-namen", label: "Voeg 1 nieuwe naam toe", voltooid: false },
    { id: "dmo-contact", label: "Stuur 1 warm bericht", voltooid: false },
    { id: "dmo-story", label: "Plaats 1 Story", voltooid: false },
    { id: "dmo-followup", label: "Volg 1 prospect op", voltooid: false },
    { id: "dmo-radar", label: "Check momentum-radar", voltooid: false },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 text-slate-100">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>Core V6 (pilot)</span>
        <span>Ankerstap {ankerstap} van 21</span>
      </div>

      {/* K1: één ankerstap bovenaan, dominant blok */}
      <section className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
        <h1 className="text-xl font-semibold">{stap.titel}</h1>
        <p className="mt-3 text-sm text-slate-300">{stap.watJeLeert}</p>

        <h2 className="mt-5 text-sm font-medium text-slate-200">Wat doe je vandaag</h2>
        <ul className="mt-2 space-y-2">
          {stap.vandaagDoen.map((t) => (
            <li key={t.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border border-slate-500"></span>
              <div>
                <div className="text-slate-100">{t.label}</div>
                {t.uitleg && (
                  <div className="mt-0.5 text-xs text-slate-400">{t.uitleg}</div>
                )}
                {t.actieRoute && (
                  <Link
                    href={t.actieRoute}
                    className="mt-1 inline-block text-xs text-amber-400 hover:text-amber-300"
                  >
                    Naar {t.actieRoute}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* K1: DMO compact ingeklapt onder ankerstap */}
      <section className="mt-4">
        <CompactDMOBlok taken={dmoTaken} standaardIngeklapt={true} />
      </section>

      {/* K2: KlantenTegel als één regel */}
      <section className="mt-4">
        <KlantenTegel
          aantalKlanten={0}
          aantalNieuweSignalen={0}
          signaalSamenvatting="Nog geen klanten in beeld"
        />
      </section>

      {/* K4: PulseSignaalBox (leeg in skelet, vult zich als pulse_momenten data heeft) */}
      <section className="mt-4">
        <PulseSignaalBox signalen={[]} />
      </section>

      <div className="mt-8 text-center text-xs text-slate-500">
        Pilot-shell. Cross-modus skip, DMO-progressie en KlantenTegel-data
        worden in latere Fase aangesloten.
      </div>
    </main>
  );
}

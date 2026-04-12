import { createClient } from "@/lib/supabase/server";
import { differenceInDays, format } from "date-fns";
import { nl } from "date-fns/locale";
import Link from "next/link";
import { DagelijkseStat, Herinnering, WhyProfile } from "@/lib/supabase/types";
import { DagStatForm } from "@/components/dashboard/DagStatForm";

const RUN_START = new Date("2026-04-12");

function getDagInfo() {
  const vandaag = new Date();
  const dag = Math.max(1, Math.min(60, differenceInDays(vandaag, RUN_START) + 1));
  const fase = dag <= 20 ? 1 : dag <= 40 ? 2 : 3;
  const faseLabel = fase === 1 ? "Team bouwen" : fase === 2 ? "Team helpen bouwen" : "Opschalen";
  const dagInFase = fase === 1 ? dag : fase === 2 ? dag - 20 : dag - 40;
  return { dag, fase, faseLabel, dagInFase };
}

export default async function DashboardPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { dag, fase, faseLabel, dagInFase } = getDagInfo();
  const vandaagStr = new Date().toISOString().split("T")[0];

  // Laad alle data parallel
  const [
    { data: whyProfile },
    { data: vandaagStats },
    { data: herinneringen },
    { data: pipelineCounts },
  ] = await Promise.all([
    supabase.from("why_profiles").select("*").eq("user_id", user.id).single(),
    supabase
      .from("dagelijkse_stats")
      .select("*")
      .eq("user_id", user.id)
      .eq("stat_datum", vandaagStr)
      .single(),
    supabase
      .from("herinneringen")
      .select("*, prospect:prospects(volledige_naam)")
      .eq("user_id", user.id)
      .lte("vervaldatum", vandaagStr)
      .eq("voltooid", false)
      .order("vervaldatum", { ascending: true })
      .limit(5),
    supabase
      .from("prospects")
      .select("pipeline_fase")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false),
  ]);

  const stats = vandaagStats as DagelijkseStat | null;
  const herinneringenLijst = (herinneringen as (Herinnering & { prospect: { volledige_naam: string } | null })[]) || [];
  const why = whyProfile as WhyProfile | null;

  // Bereken pipeline aantallen
  const faseCounts: Record<string, number> = {};
  (pipelineCounts || []).forEach((p: { pipeline_fase: string }) => {
    faseCounts[p.pipeline_fase] = (faseCounts[p.pipeline_fase] || 0) + 1;
  });

  const faseKleuren: Record<string, string> = {
    lead: "text-[#999]",
    uitgenodigd: "text-[#4A9EDB]",
    presentatie: "text-[#9A6ADB]",
    followup: "text-cm-gold",
    klant: "text-[#4ACB6A]",
    partner: "text-cm-gold-light",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Goedemorgen! Dag <span className="text-cm-gold">{dag}</span> van 60.
        </h1>
        <p className="text-cm-muted mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: nl })} •{" "}
          <span className="text-cm-gold">Fase {fase}: {faseLabel}</span> • Dag {dagInFase} van 20
        </p>
      </div>

      {/* Fase voortgang */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider">
            60-Dagenrun Voortgang
          </h2>
          <span className="text-cm-gold text-sm font-semibold">{Math.round((dag / 60) * 100)}% voltooid</span>
        </div>
        <div className="h-3 bg-cm-surface-2 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
            style={{ width: `${(dag / 60) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((f) => (
            <div
              key={f}
              className={`text-center p-2 rounded-lg text-xs ${
                fase === f
                  ? "bg-gold-subtle border border-gold-subtle text-cm-gold"
                  : fase > f
                  ? "bg-cm-surface-2 text-cm-muted line-through"
                  : "text-cm-muted"
              }`}
            >
              <div className="font-semibold">Fase {f}</div>
              <div className="opacity-75">
                {f === 1 ? "Team bouwen" : f === 2 ? "Team helpen" : "Opschalen"}
              </div>
              <div className="opacity-60">Dag {(f - 1) * 20 + 1}-{f * 20}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dagelijkse stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider mb-4">
              Vandaag bijhouden
            </h2>
            <DagStatForm
              userId={user.id}
              bestaandeStats={stats}
              datum={vandaagStr}
            />
          </div>

          {/* Pipeline overzicht */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider">
                Pipeline Status
              </h2>
              <Link href="/namenlijst" className="text-cm-gold text-sm hover:text-cm-gold-light">
                Bekijk alles →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { fase: "lead", label: "Leads" },
                { fase: "uitgenodigd", label: "Uitgenodigd" },
                { fase: "presentatie", label: "Presentatie" },
                { fase: "followup", label: "Follow-up" },
                { fase: "klant", label: "Klanten" },
                { fase: "partner", label: "Partners" },
              ].map(({ fase: f, label }) => (
                <div key={f} className="bg-cm-surface-2 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${faseKleuren[f]}`}>
                    {faseCounts[f] || 0}
                  </div>
                  <div className="text-xs text-cm-muted mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rechter kolom */}
        <div className="space-y-4">
          {/* WHY kaart */}
          {why?.why_samenvatting && (
            <div className="card border-gold-subtle">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-cm-gold">🎯</span>
                  <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider">
                    Jouw WHY
                  </h2>
                </div>
                <Link href="/mijn-why" className="text-cm-muted text-xs hover:text-cm-gold">
                  Bekijken / Aanpassen
                </Link>
              </div>
              <p className="text-cm-muted text-sm leading-relaxed italic">
                &ldquo;{why.why_samenvatting}&rdquo;
              </p>
              {why.financieel_doel_maand && (
                <div className="mt-3 bg-gold-subtle rounded-lg p-2 text-center">
                  <p className="text-cm-gold font-bold text-lg">
                    €{why.financieel_doel_maand.toLocaleString("nl-NL")}
                  </p>
                  <p className="text-cm-muted text-xs">per maand doel</p>
                </div>
              )}
            </div>
          )}

          {/* Herinneringen */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider">
                Herinneringen
              </h2>
              {herinneringenLijst.length > 0 && (
                <span className="bg-cm-gold text-cm-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {herinneringenLijst.length}
                </span>
              )}
            </div>

            {herinneringenLijst.length === 0 ? (
              <p className="text-cm-muted text-sm">
                Geen openstaande herinneringen. Goed bezig! 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {herinneringenLijst.map((her) => (
                  <div
                    key={her.id}
                    className="bg-cm-surface-2 rounded-lg p-3 border-l-2 border-cm-gold"
                  >
                    <p className="text-cm-white text-sm font-medium">{her.titel}</p>
                    {her.prospect && (
                      <p className="text-cm-muted text-xs mt-0.5">
                        👤 {her.prospect.volledige_naam}
                      </p>
                    )}
                    <p className="text-cm-gold text-xs mt-1">
                      {her.vervaldatum === vandaagStr ? "Vandaag" : her.vervaldatum}
                    </p>
                  </div>
                ))}
                <Link
                  href="/herinneringen"
                  className="block text-center text-cm-gold text-sm hover:text-cm-gold-light mt-2"
                >
                  Alle herinneringen →
                </Link>
              </div>
            )}
          </div>

          {/* Snelle acties */}
          <div className="card">
            <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider mb-3">
              Snelle acties
            </h2>
            <div className="space-y-2">
              <Link href="/namenlijst/nieuw" className="btn-secondary w-full text-sm text-center block">
                + Prospect toevoegen
              </Link>
              <Link href="/coach" className="btn-secondary w-full text-sm text-center block">
                🤖 Coach raadplegen
              </Link>
              <Link href="/scripts" className="btn-secondary w-full text-sm text-center block">
                📋 Scripts bekijken
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

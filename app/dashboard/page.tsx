import { createClient } from "@/lib/supabase/server";
import { differenceInDays, format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import Link from "next/link";
import { DagelijkseStat, Herinnering, WhyProfile } from "@/lib/supabase/types";
import { DagStatForm } from "@/components/dashboard/DagStatForm";
import { PushNotificationToggle } from "@/components/pwa/PushNotificationToggle";
import { getServerTaal, v } from "@/lib/i18n/server";
import { Locale } from "date-fns";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

function berekenDag(runStartdatum: string | null): number {
  const start = runStartdatum ? new Date(runStartdatum) : new Date();
  const dag = differenceInDays(new Date(), start) + 1;
  return Math.max(1, Math.min(60, dag));
}

export default async function DashboardPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;
  const vandaagStr = new Date().toISOString().split("T")[0];

  const [
    { data: profile },
    { data: whyProfile },
    { data: vandaagStats },
    { data: herinneringen },
    { data: pipelineCounts },
  ] = await Promise.all([
    supabase.from("profiles").select("run_startdatum").eq("id", user.id).maybeSingle(),
    supabase.from("why_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("dagelijkse_stats").select("*").eq("user_id", user.id).eq("stat_datum", vandaagStr).maybeSingle(),
    supabase.from("herinneringen").select("*, prospect:prospects(id, volledige_naam)").eq("user_id", user.id).lte("vervaldatum", vandaagStr).eq("voltooid", false).order("vervaldatum", { ascending: true }).limit(5),
    supabase.from("prospects").select("pipeline_fase").eq("user_id", user.id).eq("gearchiveerd", false),
  ]);

  const dag = berekenDag((profile as any)?.run_startdatum ?? null);

  const stats = vandaagStats as DagelijkseStat | null;
  const herinneringenLijst = (herinneringen as (Herinnering & { prospect: { id: string; volledige_naam: string } | null })[]) || [];
  const why = whyProfile as WhyProfile | null;

  const faseCounts: Record<string, number> = {};
  (pipelineCounts || []).forEach((p: { pipeline_fase: string }) => {
    faseCounts[p.pipeline_fase] = (faseCounts[p.pipeline_fase] || 0) + 1;
  });

  const faseKleuren: Record<string, string> = {
    prospect: "text-[#CCCCCC]", uitgenodigd: "text-[#4A9EDB]",
    one_pager: "text-[#7A6ADB]", presentatie: "text-[#9A6ADB]",
    followup: "text-cm-gold", not_yet: "text-[#DB6A6A]",
    shopper: "text-[#4ACB6A]", member: "text-[#E8C96B]",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("dashboard.dag", taal)} <span className="text-cm-gold">{dag}</span> {v("dashboard.van_60", taal)}
        </h1>
        <p className="text-cm-white mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: datumLocale })}
        </p>
      </div>

      {/* Voortgang */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            {v("dashboard.voortgang", taal)}
          </h2>
          <span className="text-cm-gold text-sm font-semibold">{Math.round((dag / 60) * 100)}%</span>
        </div>
        <div className="h-3 bg-cm-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-gold rounded-full transition-all duration-1000" style={{ width: `${(dag / 60) * 100}%` }} />
        </div>
        <p className="text-cm-white text-xs mt-2">{60 - dag} {v("dashboard.dagen_te_gaan", taal)}</p>
      </div>

      {/* Meldingen — push + e-mail naast elkaar op desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <PushNotificationToggle />
        <div className="card flex items-start gap-3">
          <span className="text-2xl mt-0.5">📧</span>
          <div className="flex-1 min-w-0">
            <p className="text-cm-white font-semibold text-sm">E-mail herinneringen</p>
            <p className="text-cm-white text-xs opacity-60 mt-0.5 mb-3 leading-relaxed">
              Ontvang elke ochtend een e-mail met je openstaande taken. Maak een gratis account aan op{" "}
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-cm-gold underline">resend.com</a>
              , kopieer je API-key en plak hem in Instellingen.
            </p>
            <Link
              href="/instellingen"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cm-gold border border-cm-gold/40 rounded-lg px-3 py-1.5 hover:bg-cm-gold/10 transition-colors"
            >
              Instellen via Instellingen →
            </Link>
          </div>
        </div>
      </div>

      {/* Snelle acties — prominent bovenaan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/namenlijst/nieuw" className="card text-center py-4 hover:border-cm-gold-dim transition-colors group">
          <div className="text-2xl mb-1">➕</div>
          <span className="text-cm-white text-sm group-hover:text-cm-gold transition-colors">{v("namenlijst.nieuw", taal)}</span>
        </Link>
        <Link href="/coach" className="card text-center py-4 hover:border-cm-gold-dim transition-colors group">
          <div className="text-2xl mb-1">🤖</div>
          <span className="text-cm-white text-sm group-hover:text-cm-gold transition-colors">{v("dashboard.coach_raadplegen", taal)}</span>
        </Link>
        <Link href="/scripts" className="card text-center py-4 hover:border-cm-gold-dim transition-colors group">
          <div className="text-2xl mb-1">📋</div>
          <span className="text-cm-white text-sm group-hover:text-cm-gold transition-colors">{v("dashboard.scripts_bekijken", taal)}</span>
        </Link>
        <Link href="/statistieken" className="card text-center py-4 hover:border-cm-gold-dim transition-colors group">
          <div className="text-2xl mb-1">📊</div>
          <span className="text-cm-white text-sm group-hover:text-cm-gold transition-colors">{v("nav.statistieken", taal)}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dagelijkse stats + pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
              {v("dashboard.vandaag", taal)}
            </h2>
            <DagStatForm userId={user.id} bestaandeStats={stats} datum={vandaagStr} />
          </div>

          {/* Pipeline overzicht */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
                {v("dashboard.pipeline", taal)}
              </h2>
              <Link href="/namenlijst" className="text-cm-gold text-sm hover:text-cm-gold-light">
                {v("dashboard.bekijk_alles", taal)} →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { fase: "prospect", labelKey: "fase.prospect" },
                { fase: "uitgenodigd", labelKey: "fase.uitgenodigd" },
                { fase: "one_pager", labelKey: "fase.one_pager" },
                { fase: "presentatie", labelKey: "fase.presentatie" },
                { fase: "followup", labelKey: "fase.followup" },
                { fase: "not_yet", labelKey: "fase.not_yet" },
                { fase: "shopper", labelKey: "fase.shopper" },
                { fase: "member", labelKey: "fase.member" },
              ].map(({ fase: f, labelKey }) => (
                <div key={f} className="bg-cm-surface-2 rounded-lg p-2 text-center">
                  <div className={`text-xl font-bold ${faseKleuren[f]}`}>{faseCounts[f] || 0}</div>
                  <div className="text-xs text-cm-white mt-0.5">{v(labelKey, taal)}</div>
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
                    {v("dashboard.jouw_why", taal)}
                  </h2>
                </div>
                <Link href="/mijn-why" className="text-cm-white text-xs hover:text-cm-gold">
                  {v("dashboard.aanpassen", taal)}
                </Link>
              </div>
              <p className="text-cm-white text-sm leading-relaxed italic">
                &ldquo;{why.why_samenvatting}&rdquo;
              </p>
            </div>
          )}

          {/* Herinneringen */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
                {v("dashboard.herinneringen", taal)}
              </h2>
              {herinneringenLijst.length > 0 && (
                <span className="bg-cm-gold text-cm-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {herinneringenLijst.length}
                </span>
              )}
            </div>
            {herinneringenLijst.length === 0 ? (
              <p className="text-cm-white text-sm">{v("dashboard.geen_herinneringen", taal)}</p>
            ) : (
              <div className="space-y-2">
                {herinneringenLijst.map((her) => (
                  <div key={her.id} className="bg-cm-surface-2 rounded-lg p-3 border-l-2 border-cm-gold">
                    <p className="text-cm-white text-sm font-medium">{her.titel}</p>
                    {her.prospect && (
                      <Link href={`/namenlijst/${her.prospect.id}`} className="text-cm-gold text-xs mt-0.5 hover:text-cm-gold-light flex items-center gap-1 w-fit">
                        👤 {her.prospect.volledige_naam} →
                      </Link>
                    )}
                    <p className="text-cm-gold text-xs mt-1">
                      {her.vervaldatum === vandaagStr ? v("algemeen.vandaag", taal) : her.vervaldatum}
                    </p>
                  </div>
                ))}
                <Link href="/herinneringen" className="block text-center text-cm-gold text-sm hover:text-cm-gold-light mt-2">
                  {v("dashboard.alle_herinneringen", taal)} →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

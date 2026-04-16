import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";
import KopieerLink from "@/components/team/KopieerLink";
import { TeamBoom } from "@/components/team/TeamBoom";
import { PremiumToggleKnop } from "@/components/team/PremiumToggleKnop";
import { RolToggleKnop } from "@/components/team/RolToggleKnop";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";

interface OnboardingVoortgang {
  user_id: string;
  stap_1_welkom: boolean;
  stap_2_run: boolean;
  stap_3_namen: boolean;
  stap_4_script: boolean;
  stap_5_doelen: boolean;
}

interface TeamLid {
  id: string;
  full_name: string;
  email: string;
  role: "leider" | "lid";
  onboarding_klaar: boolean;
  created_at: string;
  run_startdatum: string | null;
  premium_tot: string | null;
  kinderen: TeamLid[];
  onboarding?: OnboardingVoortgang | null;
}

async function haalTeamBoomOp(supabase: any, userId: string, diepte: number = 0, maxDiepte: number = 10): Promise<TeamLid[]> {
  if (diepte >= maxDiepte) return [];

  const { data: directeleden } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, onboarding_klaar, created_at, run_startdatum, premium_tot")
    .eq("sponsor_id", userId)
    .order("created_at", { ascending: true });

  if (!directeleden || directeleden.length === 0) return [];

  // Haal onboarding voortgang op voor alle directe leden in één query
  const ledenIds = directeleden.map((l: any) => l.id);
  const { data: voortgangData } = await supabase
    .from("onboarding_voortgang")
    .select("*")
    .in("user_id", ledenIds);

  const voortgangMap: Record<string, OnboardingVoortgang> = {};
  for (const v of (voortgangData || [])) {
    voortgangMap[v.user_id] = v;
  }

  const boom: TeamLid[] = [];
  for (const lid of directeleden) {
    const kinderen = await haalTeamBoomOp(supabase, lid.id, diepte + 1, maxDiepte);
    boom.push({
      ...lid,
      kinderen,
      onboarding: voortgangMap[lid.id] || null,
    });
  }

  return boom;
}

function telTotaal(leden: TeamLid[]): number {
  let totaal = leden.length;
  for (const lid of leden) {
    totaal += telTotaal(lid.kinderen);
  }
  return totaal;
}

function telPerLevel(leden: TeamLid[], level: number = 1, counts: Record<number, number> = {}): Record<number, number> {
  counts[level] = (counts[level] || 0) + leden.length;
  for (const lid of leden) {
    telPerLevel(lid.kinderen, level + 1, counts);
  }
  return counts;
}

function haalDirecteLedenPlat(leden: TeamLid[]): TeamLid[] {
  return leden; // Alleen level 1 voor het overzicht
}

const ONBOARDING_STAPPEN = [
  { key: "stap_1_welkom", label: "App geïnstalleerd", icoon: "📱" },
  { key: "stap_2_run", label: "WHY gemaakt", icoon: "💛" },
  { key: "stap_3_namen", label: "Namenlijst aangemaakt", icoon: "📝" },
  { key: "stap_4_script", label: "Script gelezen", icoon: "💬" },
  { key: "stap_5_doelen", label: "Doelen ingesteld", icoon: "🎯" },
];

export default async function TeamPagina({ searchParams }: { searchParams: { lid?: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const uitgelichtLid = searchParams?.lid || null;

  const taal = await getServerTaal();

  const { data: profile } = await supabase.from("profiles").select("run_startdatum, role").eq("id", user.id).maybeSingle();
  const isLeider = (profile as any)?.role === "leider";
  const runStart = (profile as any)?.run_startdatum ? new Date((profile as any).run_startdatum) : new Date();
  const dag = Math.max(1, Math.min(60, differenceInDays(new Date(), runStart) + 1));

  const teamboom = await haalTeamBoomOp(supabase, user.id);
  const totaalLeden = telTotaal(teamboom);
  const levelCounts = telPerLevel(teamboom);
  const aantalLevels = Object.keys(levelCounts).length;
  const directeLeden = haalDirecteLedenPlat(teamboom);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4">
        {v("algemeen.terug", taal)}
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            {v("team.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">
            {v("team.dag", taal)} {dag} {v("dashboard.van_60", taal)}
          </p>
        </div>
      </div>

      {/* Uitnodigingslink */}
      <div className="card border-gold-subtle">
        <h2 className="text-cm-gold font-semibold mb-2">{v("team.uitnodigen", taal)}</h2>
        <p className="text-cm-white text-sm mb-3">
          {v("team.uitnodiging_subtitel", taal)}
        </p>
        <KopieerLink userId={user.id} />
      </div>

      {/* Statistieken */}
      {totaalLeden > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card text-center">
            <div className="text-2xl font-bold text-cm-gold">{teamboom.length}</div>
            <div className="text-xs text-cm-white mt-1">{v("team.level_direct", taal)}</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-cm-white">{totaalLeden}</div>
            <div className="text-xs text-cm-white mt-1">{v("team.totaal", taal)}</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-cm-white">{aantalLevels}</div>
            <div className="text-xs text-cm-white mt-1">{v("team.levels", taal)}</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-[#4ACB6A]">
              {totaalLeden > 0 ? Math.round((teamboom.reduce((acc, l) => acc + telTotaal(l.kinderen), 0) / totaalLeden) * 100) : 0}%
            </div>
            <div className="text-xs text-cm-white mt-1">{v("team.duplicatie", taal)}</div>
          </div>
        </div>
      )}

      {/* ONBOARDING VOORTGANG PER TEAMLID */}
      {directeLeden.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider mb-4">
            📋 Onboarding voortgang — direct team
          </h2>

          {/* Header rij */}
          <div className="hidden md:grid gap-2 mb-2 text-xs text-cm-white opacity-50 font-medium"
            style={{ gridTemplateColumns: "1fr repeat(5, 40px)" }}>
            <span>Naam</span>
            {ONBOARDING_STAPPEN.map((s) => (
              <span key={s.key} className="text-center" title={s.label}>{s.icoon}</span>
            ))}
          </div>

          <div className="space-y-2">
            {directeLeden.map((lid) => {
              const voortgang = lid.onboarding;
              const aantalKlaar = ONBOARDING_STAPPEN.filter(
                (s) => voortgang?.[s.key as keyof OnboardingVoortgang]
              ).length;
              const klaarPct = Math.round((aantalKlaar / ONBOARDING_STAPPEN.length) * 100);
              const isUitgelicht = uitgelichtLid === lid.id;

              return (
                <div
                  key={lid.id}
                  id={`lid-${lid.id}`}
                  className={`rounded-xl px-3 py-3 transition-all ${
                    isUitgelicht
                      ? "bg-cm-gold/10 border-2 border-cm-gold/60 shadow-[0_0_16px_rgba(212,175,55,0.25)]"
                      : "bg-cm-surface-2"
                  }`}
                >
                  {/* Desktop: grid layout */}
                  <div className="hidden md:grid items-center gap-2"
                    style={{ gridTemplateColumns: "1fr repeat(5, 40px)" }}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-cm-white text-sm font-medium">{lid.full_name}</p>
                        {isLeider && (
                          <>
                            <RolToggleKnop
                              lidId={lid.id}
                              lidNaam={lid.full_name}
                              huidigeRol={lid.role ?? "lid"}
                            />
                            <PremiumToggleKnop
                              lidId={lid.id}
                              isPremium={
                                lid.premium_tot
                                  ? new Date(lid.premium_tot) >= new Date()
                                  : false
                              }
                            />
                          </>
                        )}
                      </div>
                      <p className="text-cm-white opacity-40 text-xs">{aantalKlaar}/{ONBOARDING_STAPPEN.length} stappen</p>
                    </div>
                    {ONBOARDING_STAPPEN.map((s) => {
                      const gedaan = voortgang?.[s.key as keyof OnboardingVoortgang];
                      return (
                        <div key={s.key} className="flex justify-center" title={s.label}>
                          {gedaan
                            ? <span className="text-base">✅</span>
                            : <span className="text-base opacity-20">⬜</span>
                          }
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobiel: naam + voortgangsbalk + icoontjes */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-cm-white text-sm font-medium">{lid.full_name}</p>
                        {isLeider && (
                          <>
                            <RolToggleKnop
                              lidId={lid.id}
                              lidNaam={lid.full_name}
                              huidigeRol={lid.role ?? "lid"}
                            />
                            <PremiumToggleKnop
                              lidId={lid.id}
                              isPremium={
                                lid.premium_tot
                                  ? new Date(lid.premium_tot) >= new Date()
                                  : false
                              }
                            />
                          </>
                        )}
                      </div>
                      <span className={`text-xs font-bold ${lid.onboarding_klaar ? "text-[#4ACB6A]" : "text-cm-gold"}`}>
                        {aantalKlaar}/{ONBOARDING_STAPPEN.length}
                      </span>
                    </div>
                    {/* Voortgangsbalk */}
                    <div className="w-full h-1.5 bg-cm-surface rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${lid.onboarding_klaar ? "bg-[#4ACB6A]" : "bg-gradient-gold"}`}
                        style={{ width: `${klaarPct}%` }}
                      />
                    </div>
                    {/* Stappen icoontjes */}
                    <div className="flex gap-2 flex-wrap">
                      {ONBOARDING_STAPPEN.map((s) => {
                        const gedaan = voortgang?.[s.key as keyof OnboardingVoortgang];
                        return (
                          <div key={s.key}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                              gedaan
                                ? "bg-cm-gold/20 text-cm-gold"
                                : "bg-cm-surface text-cm-white opacity-30"
                            }`}
                            title={s.label}
                          >
                            <span>{s.icoon}</span>
                            <span className="hidden sm:inline">{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-cm-white opacity-30 mt-3">
            Alleen directe teamleden worden getoond. Klik op een naam in de stamboom voor meer detail.
          </p>

          {/* Auto-scroll naar uitgelicht lid (via push melding) */}
          {uitgelichtLid && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    var el = document.getElementById('lid-${uitgelichtLid}');
                    if (el) { setTimeout(function() { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); }
                  })();
                `,
              }}
            />
          )}
        </div>
      )}

      {/* Level overzicht */}
      {aantalLevels > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
            {v("team.per_level", taal)}
          </h2>
          <div className="space-y-2">
            {Object.entries(levelCounts).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className="text-cm-white text-sm">Level {level}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-cm-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-gold rounded-full"
                      style={{ width: `${Math.min(100, (count / Math.max(1, totaalLeden)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-cm-gold text-sm font-semibold w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stamboom */}
      {totaalLeden === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-cm-white font-semibold mb-2">
            {v("team.geen_leden", taal)}
          </p>
          <p className="text-cm-white text-sm">
            {v("team.geen_uitleg", taal)}
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
            {v("team.structuur", taal)}
          </h2>
          <TeamBoom leden={teamboom} />
        </div>
      )}
    </div>
  );
}

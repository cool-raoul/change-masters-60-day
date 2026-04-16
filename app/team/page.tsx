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

  const vandaagStr = new Date().toISOString().split("T")[0];
  // Haal alle direct teamleden IDs op (plat)
  const alleTeamIds = teamboom.flatMap(function flatten(l: TeamLid): string[] {
    return [l.id, ...l.kinderen.flatMap(flatten)];
  });

  let teamStats: any[] = [];
  if (alleTeamIds.length > 0) {
    const { data: statsData } = await supabase
      .from("dagelijkse_stats")
      .select("*, profiel:profiles!user_id(full_name)")
      .in("user_id", alleTeamIds)
      .eq("stat_datum", vandaagStr);
    teamStats = statsData || [];
  }

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

      {/* Leider bevoegdheden */}
      {isLeider && (
        <div className="card border border-cm-gold/20 bg-cm-gold/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-cm-gold text-lg">👑</span>
            <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider">Jouw leider bevoegdheden</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icoon: "🏆", titel: "Team & stamboom", omschrijving: "Zie je volledige team op elk level" },
              { icoon: "👑", titel: "Rollen beheren", omschrijving: "Maak teamleden leider of zet ze terug" },
              { icoon: "⭐", titel: "Premium beheren", omschrijving: "Geef teamleden premium toegang" },
              { icoon: "🔗", titel: "Uitnodigingslink", omschrijving: "Nodig nieuwe leden uit in jouw tak" },
              { icoon: "📊", titel: "Onboarding inzicht", omschrijving: "Zie de voortgang van elk teamlid" },
              { icoon: "📈", titel: "Team statistieken", omschrijving: "Bekijk de dagelijkse activiteit van je team" },
            ].map((b) => (
              <div key={b.titel} className="flex items-start gap-2 bg-cm-surface-2 rounded-lg p-2">
                <span className="text-base mt-0.5">{b.icoon}</span>
                <div>
                  <p className="text-cm-white text-xs font-semibold">{b.titel}</p>
                  <p className="text-cm-white text-xs opacity-50">{b.omschrijving}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-cm-white text-xs opacity-40 mt-3 italic">Meer bevoegdheden worden toegevoegd naarmate het systeem groeit.</p>
        </div>
      )}

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

      {/* Team statistieken vandaag */}
      {isLeider && teamStats.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider mb-4">
            📈 Team activiteit vandaag
          </h2>
          <div className="space-y-2">
            <div className="hidden md:grid text-xs text-cm-white opacity-40 font-medium gap-2 mb-1"
              style={{ gridTemplateColumns: "1fr repeat(6, 48px)" }}>
              <span>Naam</span>
              <span className="text-center" title="Contacten">👥</span>
              <span className="text-center" title="Uitnodigingen">📨</span>
              <span className="text-center" title="Follow-ups">🔄</span>
              <span className="text-center" title="Presentaties">🎯</span>
              <span className="text-center" title="Nieuwe partners">🤝</span>
              <span className="text-center" title="Nieuwe klanten">⭐</span>
            </div>
            {teamStats.map((stat) => (
              <div key={stat.id} className="bg-cm-surface-2 rounded-lg px-3 py-2">
                <div className="hidden md:grid items-center gap-2 text-sm"
                  style={{ gridTemplateColumns: "1fr repeat(6, 48px)" }}>
                  <span className="text-cm-white font-medium">{(stat.profiel as any)?.full_name || "—"}</span>
                  <span className="text-center text-cm-white">{stat.contacten_gemaakt}</span>
                  <span className="text-center text-cm-white">{stat.uitnodigingen}</span>
                  <span className="text-center text-cm-white">{stat.followups}</span>
                  <span className="text-center text-cm-white">{stat.presentaties}</span>
                  <span className="text-center text-[#4ACB6A]">{stat.nieuwe_partners}</span>
                  <span className="text-center text-cm-gold">{stat.nieuwe_klanten}</span>
                </div>
                <div className="md:hidden flex items-center justify-between">
                  <span className="text-cm-white text-sm font-medium">{(stat.profiel as any)?.full_name || "—"}</span>
                  <div className="flex gap-3 text-xs text-cm-white opacity-70">
                    <span>👥{stat.contacten_gemaakt}</span>
                    <span>📨{stat.uitnodigingen}</span>
                    <span>🎯{stat.presentaties}</span>
                    <span className="text-[#4ACB6A]">🤝{stat.nieuwe_partners}</span>
                  </div>
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

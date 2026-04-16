import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";
import KopieerLink from "@/components/team/KopieerLink";
import { TeamBoom } from "@/components/team/TeamBoom";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";


interface TeamLid {
  id: string;
  full_name: string;
  email: string;
  onboarding_klaar: boolean;
  created_at: string;
  kinderen: TeamLid[];
}

async function haalTeamBoomOp(supabase: any, userId: string, diepte: number = 0, maxDiepte: number = 10): Promise<TeamLid[]> {
  if (diepte >= maxDiepte) return [];

  // Haal directe teamleden op (mensen die door deze persoon zijn uitgenodigd)
  const { data: directeleden } = await supabase
    .from("profiles")
    .select("id, full_name, email, onboarding_klaar, created_at")
    .eq("sponsor_id", userId)
    .order("created_at", { ascending: true });

  if (!directeleden || directeleden.length === 0) return [];

  // Voor elk teamlid, haal recursief hun teamleden op
  const boom: TeamLid[] = [];
  for (const lid of directeleden) {
    const kinderen = await haalTeamBoomOp(supabase, lid.id, diepte + 1, maxDiepte);
    boom.push({
      ...lid,
      kinderen,
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

export default async function TeamPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();

  // Haal profiel op voor run_startdatum
  const { data: profile } = await supabase.from("profiles").select("run_startdatum").eq("id", user.id).maybeSingle();
  const runStart = (profile as any)?.run_startdatum ? new Date((profile as any).run_startdatum) : new Date();
  const dag = Math.max(1, Math.min(60, differenceInDays(new Date(), runStart) + 1));

  // Haal de volledige teamboom op
  const teamboom = await haalTeamBoomOp(supabase, user.id);
  const totaalLeden = telTotaal(teamboom);
  const levelCounts = telPerLevel(teamboom);
  const aantalLevels = Object.keys(levelCounts).length;

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

      {/* Overzicht statistieken */}
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

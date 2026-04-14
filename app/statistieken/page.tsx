import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";
import { StatsOverzicht } from "@/components/statistieken/StatsOverzicht";

const RUN_START = new Date("2026-04-12");

export default async function StatistiekenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();
  const dag = Math.max(1, Math.min(60, differenceInDays(new Date(), RUN_START) + 1));

  // Haal alle stats op voor de hele run
  const [{ data: alleStats }, { data: prospects }] = await Promise.all([
    supabase
      .from("dagelijkse_stats")
      .select("*")
      .eq("user_id", user.id)
      .order("stat_datum", { ascending: true }),
    supabase
      .from("prospects")
      .select("pipeline_fase")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false),
  ]);

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  (prospects || []).forEach((p: { pipeline_fase: string }) => {
    pipelineCounts[p.pipeline_fase] = (pipelineCounts[p.pipeline_fase] || 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4"
      >
        {v("algemeen.terug", taal)}
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("stats.titel", taal)}
        </h1>
        <p className="text-cm-white mt-1 opacity-70">
          {v("stats.subtitel", taal)} — {v("dashboard.dag", taal)} {dag} {v("dashboard.van_60", taal)}
        </p>
      </div>

      <StatsOverzicht
        alleStats={alleStats || []}
        pipelineCounts={pipelineCounts}
        dag={dag}
      />
    </div>
  );
}

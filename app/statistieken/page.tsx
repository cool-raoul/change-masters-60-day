import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";
import { StatsOverzicht } from "@/components/statistieken/StatsOverzicht";
import { WekelijkseReviewFormulier } from "@/components/statistieken/WekelijkseReviewFormulier";
import { MentorStatsAnalyseKnop } from "@/components/statistieken/MentorStatsAnalyseKnop";
import {
  ProductadviesStatsBlok,
  TweedeLenteStatsBlok,
} from "@/components/freebies/FreebieStatsBlok";
import {
  haalProductadviesStats,
  haalTweedeLenteStats,
} from "@/lib/freebie-bots/stats";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { topbarLabelVoorModus } from "@/lib/playbook/dagen-voor-modus";
import { berekenKalenderdag } from "@/lib/playbook/bereken-dag";
import type { Modus } from "@/lib/onboarding/voltooiingen";

export default async function StatistiekenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();

  const [{ data: profile }, { data: alleStats }, { data: prospects }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "modus, role, run_startdatum, sprint_startdatum, core_startdatum, created_at",
        )
        .eq("id", user.id)
        .maybeSingle(),
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

  // Pro heeft eigen leerpad zonder dag-gebaseerde stats in deze pilot.
  const profielModus = ((profile as { modus?: string | null } | null)?.modus ??
    "sprint") as Modus;
  if (profielModus === "pro") redirect("/welkom-pro");

  // Modus-specifieke startdatum als anker. Voor Sprint capt op 60,
  // voor Core mag boven 40 (lifetime).
  const profielDatums = {
    sprint_startdatum:
      (profile as { sprint_startdatum?: string | null } | null)
        ?.sprint_startdatum ?? null,
    core_startdatum:
      (profile as { core_startdatum?: string | null } | null)
        ?.core_startdatum ?? null,
    run_startdatum:
      (profile as { run_startdatum?: string | null } | null)?.run_startdatum ??
      null,
    created_at:
      (profile as { created_at?: string | null } | null)?.created_at ?? null,
  };
  const startdatumDate = startdatumVoorModus(profielDatums, profielModus);
  const startdatumIso = startdatumDate
    ? startdatumDate.toISOString().slice(0, 10)
    : null;
  const ruweDag = berekenKalenderdag(startdatumIso);
  const dag =
    profielModus === "sprint" ? Math.max(1, Math.min(60, ruweDag)) : ruweDag;

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  (prospects || []).forEach((p: { pipeline_fase: string }) => {
    pipelineCounts[p.pipeline_fase] =
      (pipelineCounts[p.pipeline_fase] || 0) + 1;
  });

  const dagLabel = topbarLabelVoorModus(profielModus, dag);

  // Freebie-stats: zichtbaar voor iedereen (productadvies-vragenlijst)
  // en voor Core + founders (Tweede Lente bot).
  const productadviesStats = await haalProductadviesStats(supabase, user.id);
  const eigenRol = (profile as { role?: string | null } | null)?.role ?? null;
  const ziet_tweede_lente =
    eigenRol === "founder" || profielModus === "core";
  const tweedeLenteStats = ziet_tweede_lente
    ? await haalTweedeLenteStats(supabase, user.id)
    : null;

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
          {v("stats.subtitel", taal)}, {dagLabel}
        </p>
      </div>

      {/* Mentor-analyse-knop: prominentste plek, bovenaan. Haalt
          alle cijfers op + bouwt rijke prompt naar Mentor voor
          diepgaande analyse + concreet advies. */}
      <MentorStatsAnalyseKnop />

      {/* Wekelijkse review-formulier, drie vragen + sponsor-deel-keuze.
          Week-nummer berekend op basis van de huidige run-dag (dag 7,
          14, 21 zijn de natuurlijke review-momenten in Sprint, en ook
          op andere dagen mag de member 'm gebruiken). */}
      <WekelijkseReviewFormulier weekNummer={Math.max(1, Math.ceil(dag / 7))} />

      <StatsOverzicht
        alleStats={alleStats || []}
        pipelineCounts={pipelineCounts}
        dag={dag}
      />

      {/* Freebie-stats: prestaties van de freebies die deze member
          deelt. Productadvies-vragenlijst voor iedereen, Tweede Lente
          bot alleen voor Core + founder. */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-display font-bold text-cm-white">
            🎁 Mijn freebies
          </h2>
          <p className="text-cm-white opacity-60 text-sm mt-1">
            Hoeveel mensen hebben jouw freebies gedaan, en hoeveel maakten
            het helemaal af.
          </p>
        </div>
        <ProductadviesStatsBlok stats={productadviesStats} />
        {tweedeLenteStats && (
          <TweedeLenteStatsBlok stats={tweedeLenteStats} />
        )}
      </section>
    </div>
  );
}

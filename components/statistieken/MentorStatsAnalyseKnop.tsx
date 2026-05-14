"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PIPELINE_FASEN } from "@/lib/supabase/types";

// ============================================================
// MentorStatsAnalyseKnop, prominente knop bovenaan /statistieken
// die ELEVA Mentor inschakelt voor een DIEPGAANDE analyse op basis
// van ALLE beschikbare data: pipeline-fases + dagelijkse stats
// (contacten/uitnodigingen/followups/presentaties) + tempo-keuze
// + huidige streak + conversie-ratio's.
//
// Verschil met MentorFunnelAnalyseKnop (in vandaag-flow):
// - Funnel-analyse-knop = compact, alleen pipeline-fases, op
//   specifieke dag-stappen (dag 7, 14, 21, en weekstart-dagen
//   in 22-60)
// - Stats-analyse-knop = uitgebreid, alle cijfers, altijd op te
//   roepen vanuit /statistieken
//
// Mentor krijgt veel meer mee in de prompt en geeft DIEPGAANDE
// adviezen: niet alleen 'waar lekt de funnel', maar ook 'haal je
// je tempo-doel?', 'wat is je sterkste/zwakste fase qua conversie?',
// 'wat zegt je streak over consistency?', etc.
// ============================================================

type FaseTelling = {
  fase: string;
  label: string;
  aantal: number;
};

type DagelijkseStat = {
  stat_datum: string;
  contacten_gemaakt: number;
  uitnodigingen: number;
  followups: number;
  presentaties: number;
  nieuwe_klanten: number;
  nieuwe_partners: number;
};

const TOON_VOLGORDE = [
  "prospect",
  "in_gesprek",
  "uitgenodigd",
  "one_pager",
  "presentatie",
  "followup",
  "member",
  "shopper",
  "not_yet",
];

function labelVoor(fase: string): string {
  return PIPELINE_FASEN.find((f) => f.fase === fase)?.label ?? fase;
}

export function MentorStatsAnalyseKnop() {
  const [data, setData] = useState<{
    pipelineTellingen: FaseTelling[];
    stats: DagelijkseStat[];
    tempo: number | null;
    runStartDatum: string | null;
  } | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: profielData }, { data: prospectsData }, { data: statsData }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("run_startdatum")
              .eq("id", user.id)
              .maybeSingle(),
            supabase
              .from("prospects")
              .select("pipeline_fase")
              .eq("user_id", user.id)
              .eq("gearchiveerd", false),
            supabase
              .from("dagelijkse_stats")
              .select(
                "stat_datum, contacten_gemaakt, uitnodigingen, followups, presentaties, nieuwe_klanten, nieuwe_partners",
              )
              .eq("user_id", user.id)
              .order("stat_datum", { ascending: true }),
          ]);

        if (!actief) return;

        // Pipeline-tellingen
        const teller: Record<string, number> = {};
        for (const p of (prospectsData as Array<{ pipeline_fase: string }> | null) ?? []) {
          teller[p.pipeline_fase] = (teller[p.pipeline_fase] || 0) + 1;
        }
        const pipelineTellingen: FaseTelling[] = TOON_VOLGORDE.filter(
          (fase) => teller[fase] !== undefined && teller[fase] > 0,
        ).map((fase) => ({
          fase,
          label: labelVoor(fase),
          aantal: teller[fase],
        }));

        const tempoMeta = (user.user_metadata as { commitment_uren?: unknown } | undefined)
          ?.commitment_uren;
        const tempo =
          typeof tempoMeta === "number" && (tempoMeta === 2 || tempoMeta === 4 || tempoMeta === 6)
            ? tempoMeta
            : null;

        const runStartDatum = (profielData as { run_startdatum?: string | null } | null)
          ?.run_startdatum ?? null;

        setData({
          pipelineTellingen,
          stats: (statsData as DagelijkseStat[]) ?? [],
          tempo,
          runStartDatum,
        });
      } catch {
        // negeer; knop wordt zonder context-cijfers gerenderd
      } finally {
        if (actief) setLaden(false);
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  if (laden || !data) {
    return (
      <div className="rounded-lg border-2 border-cm-border bg-cm-surface px-4 py-3">
        <p className="text-cm-white opacity-60 text-sm">Statistieken laden…</p>
      </div>
    );
  }

  // Aggregaties opbouwen
  const totaalContacten = data.stats.reduce((s, d) => s + d.contacten_gemaakt, 0);
  const totaalUitnodigingen = data.stats.reduce((s, d) => s + d.uitnodigingen, 0);
  const totaalFollowups = data.stats.reduce((s, d) => s + d.followups, 0);
  const totaalPresentaties = data.stats.reduce((s, d) => s + d.presentaties, 0);
  const totaalKlanten = data.stats.reduce((s, d) => s + d.nieuwe_klanten, 0);
  const totaalPartners = data.stats.reduce((s, d) => s + d.nieuwe_partners, 0);
  const totaalBeslissingen = totaalKlanten + totaalPartners;

  // Actieve dagen
  const actieveDagen = data.stats.filter(
    (d) =>
      d.contacten_gemaakt > 0 ||
      d.uitnodigingen > 0 ||
      d.followups > 0 ||
      d.presentaties > 0,
  ).length;

  // Conversie-ratio's (in %)
  const convContactUitn =
    totaalContacten > 0
      ? Math.round((totaalUitnodigingen / totaalContacten) * 100)
      : 0;
  const convUitnPres =
    totaalUitnodigingen > 0
      ? Math.round((totaalPresentaties / totaalUitnodigingen) * 100)
      : 0;
  const convPresBeslissing =
    totaalPresentaties > 0
      ? Math.round((totaalBeslissingen / totaalPresentaties) * 100)
      : 0;

  // Pipeline-counts samenvatting
  const pipelineRegels =
    data.pipelineTellingen.length > 0
      ? data.pipelineTellingen.map((t) => `${t.label}: ${t.aantal}`).join(" / ")
      : "Nog geen prospects geregistreerd";

  const tempoNaam =
    data.tempo === 2
      ? "Fundament (2u/dag)"
      : data.tempo === 4
        ? "Bouwen (4u/dag)"
        : data.tempo === 6
          ? "Doorbreken (6u/dag)"
          : "Nog geen tempo gekozen";

  // Bouw een rijke Mentor-prompt op
  const prefill = [
    `Maak een diepgaande analyse van mijn 60-dagen Sprint-voortgang.`,
    ``,
    `MIJN TEMPO: ${tempoNaam}`,
    `ACTIEVE DAGEN (met minimaal 1 actie): ${actieveDagen}`,
    ``,
    `TOTAAL-AANTALLEN OVER DE RUN:`,
    `- Contacten gemaakt: ${totaalContacten}`,
    `- Uitnodigingen verzonden: ${totaalUitnodigingen}`,
    `- Follow-ups gedaan: ${totaalFollowups}`,
    `- Presentaties / 3-wegs: ${totaalPresentaties}`,
    `- Nieuwe klanten: ${totaalKlanten}`,
    `- Nieuwe partners: ${totaalPartners}`,
    `- Totaal beslissingen (klanten + partners): ${totaalBeslissingen}`,
    ``,
    `CONVERSIE-RATIOS:`,
    `- Contact → Uitnodiging: ${convContactUitn}%`,
    `- Uitnodiging → Presentatie: ${convUitnPres}%`,
    `- Presentatie → Beslissing: ${convPresBeslissing}%`,
    ``,
    `HUIDIGE PIPELINE PER FASE:`,
    pipelineRegels,
    ``,
    `Wat ik wil weten:`,
    `1. Wat is mijn grootste bottleneck (welke fase verliest de meeste mensen)?`,
    `2. Hoe sta ik in vergelijking met de verwachte 'gezonde trechter'?`,
    `3. Welke specifieke dag-les uit het playbook kan ik herzien om dit te verbeteren?`,
    `4. Wat is één concrete oefening die ik komende week kan doen?`,
    `5. Loopt mijn tempo op schema, of haal ik mijn dagdoelen niet?`,
  ].join("\n");

  const coachUrl = `/coach?onderwerp=stats-analyse&prefill=${encodeURIComponent(prefill)}`;

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-3">
      <div className="space-y-1">
        <h2 className="text-cm-gold font-semibold text-base">
          🔍 Vraag ELEVA om een complete analyse
        </h2>
        <p className="text-cm-white opacity-85 text-sm leading-relaxed">
          De Mentor kijkt naar ál je cijfers, identificeert je grootste
          bottleneck, vergelijkt je conversie-ratio's met de verwachte gezonde
          trechter, en geeft je een concrete oefening voor de komende week.
        </p>
      </div>

      <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-2 space-y-1.5">
        <p className="text-cm-gold text-[11px] font-semibold uppercase tracking-wider">
          Wat de Mentor meeneemt
        </p>
        <ul className="space-y-0.5 text-cm-white/85 text-xs">
          <li>
            <span className="text-cm-white/60">Tempo:</span> {tempoNaam}
          </li>
          <li>
            <span className="text-cm-white/60">Actieve dagen:</span>{" "}
            <span className="font-semibold tabular-nums">{actieveDagen}</span>
          </li>
          <li>
            <span className="text-cm-white/60">Totaal contacten / uitnod. / pres. / beslissingen:</span>{" "}
            <span className="font-semibold tabular-nums">
              {totaalContacten} / {totaalUitnodigingen} / {totaalPresentaties} /{" "}
              {totaalBeslissingen}
            </span>
          </li>
          {totaalContacten > 0 && (
            <li>
              <span className="text-cm-white/60">Conversies:</span>{" "}
              <span className="font-semibold tabular-nums">
                {convContactUitn}% → {convUitnPres}% → {convPresBeslissing}%
              </span>
            </li>
          )}
          <li>
            <span className="text-cm-white/60">Pijplijn nu:</span>{" "}
            {data.pipelineTellingen.length > 0
              ? data.pipelineTellingen
                  .map((t) => `${t.aantal} ${t.label.toLowerCase()}`)
                  .join(" / ")
              : "leeg"}
          </li>
        </ul>
      </div>

      <a
        href={coachUrl}
        className="btn-gold inline-block py-3 px-5 text-sm font-semibold text-center w-full sm:w-auto"
      >
        🔍 Open complete analyse in Mentor
      </a>
    </div>
  );
}

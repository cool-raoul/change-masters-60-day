import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DAGEN } from "@/lib/playbook/dagen";
import {
  haalOverrides,
  pasOverrideToe,
  pasSprintDagOverridesToe,
} from "@/lib/playbook/overrides";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import {
  haalPaginaBlokken,
  blokkenAlsRecord,
} from "@/lib/cms/pagina-blokken";
import { berekenHuidigeDag } from "@/lib/playbook/bereken-dag";
import { pasTempoToeOpDag } from "@/lib/playbook/tempo-aware";
import { genereerWeekritmeDag } from "@/lib/playbook/weekritme";
import { detecteerEnVierEerstePartner } from "@/lib/team/mijlpaal-detector";
import { pakTopRadar, type ProspectInput } from "@/lib/radar/volgende-beste-actie";
import { haalRadarAfvinkSets } from "@/lib/radar/carry-over";
import type { CommitmentUren } from "@/lib/dagdoelen";
import { VandaagFlow } from "./vandaag-flow";

// ============================================================
// /vandaag, guided full-screen flow voor de huidige playbook-dag.
//
// Werkt als de onboarding: geen AppShell, geen sidebar, focus alleen
// op wat de member vandaag moet doen. Stap voor stap door alle taken
// + uitleg, met afvink-knoppen. Aan eind een viering en knop terug
// naar dashboard.
//
// Bedoeld om bij eerste bezoek per dag de overweldiging weg te halen:
// niet alle dashboard-tegels in beeld, maar één duidelijke flow.
//
// Founders kunnen ?dag=N gebruiken om naar elke dag te springen
// zonder hun eigen voortgang aan te raken (rechtstreeks aangeroepen
// vanuit TesterToolbar in queryparam-mode).
// ============================================================

export const dynamic = "force-dynamic";

export default async function VandaagPagina({
  searchParams,
}: {
  searchParams: Promise<{ dag?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("run_startdatum, full_name, role, is_tester")
    .eq("id", user.id)
    .maybeSingle();

  // NB: middleware vangt onboarding-niet-klaar al af, die redirect
  // automatisch naar /mijn-why of /onboarding. Hier hoeft geen extra
  // check, anders krijg je dubbele redirects.

  // ALLE voltooiingen ophalen (niet alleen voor één dag) zodat we de
  // voortgang-gebaseerde dag-berekening kunnen doen: eerste dag waar
  // niet alle verplichte taken voltooid zijn = de huidige dag.
  const { data: alleVoltooiingen } = await supabase
    .from("dag_voltooiingen")
    .select("dag_nummer, taak_id")
    .eq("user_id", user.id);

  // Eerste-partner-mijlpaal-detectie: registreer mijlpaal + stuur push
  // wanneer member voor het eerst een directe partner heeft. Race-safe
  // via UNIQUE-constraint op partner_mijlpalen.
  await detecteerEnVierEerstePartner(supabase, user.id);

  // ============================================================
  // RADAR-BALK: zelfde signaal-bronnen als dashboard, maar nu in /vandaag.
  // Eén round-trip voor de afvink-sets (vandaag + gisteren).
  // ============================================================
  const afvinkSets = await haalRadarAfvinkSets(supabase, user.id);

  const [
    { data: prospectsRadar },
    { data: filmViewsRadar },
    { data: testsRadar },
    { data: openHerinneringenRadar },
  ] = await Promise.all([
    supabase
      .from("prospects")
      .select("id, volledige_naam, telefoon, pipeline_fase, laatste_contact, gekozen_aanpak")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false),
    supabase
      .from("prospect_film_views")
      .select("prospect_id, afgekeken_op")
      .eq("member_user_id", user.id)
      .not("afgekeken_op", "is", null)
      .gte("afgekeken_op", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("productadvies_tests")
      .select("prospect_id, ingevuld_op")
      .eq("user_id", user.id)
      .eq("status", "ingevuld")
      .not("ingevuld_op", "is", null)
      .gte("ingevuld_op", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("herinneringen")
      .select("prospect_id, vervaldatum")
      .eq("user_id", user.id)
      .eq("voltooid", false)
      .order("vervaldatum", { ascending: true }),
  ]);

  // Map: prospectId → meest recente datum
  const filmAfPerProspect = new Map<string, string>();
  for (const v of (filmViewsRadar as Array<{ prospect_id: string; afgekeken_op: string }>) || []) {
    const bestaand = filmAfPerProspect.get(v.prospect_id);
    if (!bestaand || v.afgekeken_op > bestaand) filmAfPerProspect.set(v.prospect_id, v.afgekeken_op);
  }
  const testAfPerProspect = new Map<string, string>();
  for (const t of (testsRadar as Array<{ prospect_id: string; ingevuld_op: string }>) || []) {
    if (!t.prospect_id) continue;
    const bestaand = testAfPerProspect.get(t.prospect_id);
    if (!bestaand || t.ingevuld_op > bestaand) testAfPerProspect.set(t.prospect_id, t.ingevuld_op);
  }
  const oudsteHerinneringPerProspectVandaag = new Map<string, string>();
  for (const h of (openHerinneringenRadar as Array<{ prospect_id: string; vervaldatum: string }>) || []) {
    if (!h.prospect_id) continue;
    if (!oudsteHerinneringPerProspectVandaag.has(h.prospect_id)) {
      oudsteHerinneringPerProspectVandaag.set(h.prospect_id, h.vervaldatum);
    }
  }

  function dagenVanafIso(iso: string | undefined): number | null {
    if (!iso) return null;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  }

  const radarInputVandaag: ProspectInput[] = (
    (prospectsRadar as Array<{
      id: string;
      volledige_naam: string;
      telefoon: string | null;
      pipeline_fase: string;
      laatste_contact: string | null;
      gekozen_aanpak: "drieweg" | "mini_eleva" | null;
    }>) || []
  ).map((p) => ({
    id: p.id,
    volledige_naam: p.volledige_naam,
    telefoon: p.telefoon,
    pipeline_fase: p.pipeline_fase,
    laatste_contact: p.laatste_contact,
    oudsteHerinneringDatum: oudsteHerinneringPerProspectVandaag.get(p.id) ?? null,
    dagenSindsFilmAfgekeken: dagenVanafIso(filmAfPerProspect.get(p.id)),
    dagenSindsTestIngevuld: dagenVanafIso(testAfPerProspect.get(p.id)),
    gekozenAanpak: p.gekozen_aanpak ?? null,
  }));

  const radarItems = pakTopRadar(radarInputVandaag, 5, {
    bumpIds: afvinkSets.carryOverBump,
  });

  const isFounder = (profile as any)?.role === "founder";
  const isTester = (profile as any)?.is_tester === true;

  // Founder mag via ?dag=N elke dag bekijken zonder z'n eigen voortgang
  // aan te raken. Member negeert de query-param (security).
  const dagParam =
    isFounder && sp.dag ? Number.parseInt(sp.dag, 10) : NaN;
  const dagOverride =
    Number.isFinite(dagParam) && dagParam >= 1 && dagParam <= 60
      ? dagParam
      : null;

  const dag =
    dagOverride ??
    berekenHuidigeDag(
      (alleVoltooiingen as Array<{ dag_nummer: number; taak_id: string }>) ||
        [],
      (profile as any)?.run_startdatum ?? null,
      { isTester: isTester || isFounder },
    );

  // Buiten dag 1-60 → terug naar dashboard
  if (dag < 1 || dag > 60) {
    redirect("/dashboard");
  }

  // Tempo-aware vervanging: lees commitment_uren uit user_metadata
  // en pas tempo-specifieke taken toe.
  const ruwUren = Number(
    (user.user_metadata as { commitment_uren?: unknown } | undefined)
      ?.commitment_uren,
  );
  const commitmentUren: CommitmentUren | null =
    ruwUren === 2 || ruwUren === 4 || ruwUren === 6 ? ruwUren : null;

  let dagData;
  if (dag >= 22) {
    // Dag 22-60: weekritme-modus. Synthetische dag op basis van de
    // RUN-weekdag (= (dag - 1) % 7), niet de kalender-weekdag. Zo blijft
    // het ritme synchroon met de start-datum van de member: weekstart-dag
    // (dag 22, 29, 36...), audio-dag, content-dag, plannings-dag,
    // follow-up-dag, reflectie-dag, week-review-dag. Roterende F-stap,
    // zelfde ABCDE-basis.
    dagData = genereerWeekritmeDag(dag, commitmentUren);
    if (!dagData) redirect("/dashboard");
  } else {
    // Dag 1-21: statische basis uit DAGEN[], plus tempo-aware
    // vervanging waar van toepassing.
    dagData = DAGEN.find((d) => d.nummer === dag);
    if (!dagData) redirect("/dashboard");
    // Doen we VOOR de override-passes zodat founder-CMS-edits nog
    // steeds bovenop tempo-varianten kunnen worden gelegd.
    dagData = pasTempoToeOpDag(dagData, commitmentUren);
  }

  // Founder-overrides toepassen, zelfde patroon als dashboard.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overrideMap = await haalOverrides(supabase as any, [dag]);
  dagData = pasOverrideToe(dagData, overrideMap.get(dag) ?? null);

  // Nieuwe namespace-style overrides laden (sprint-dag, sprint-ui,
  // sprint-groet) en per-dag-content toepassen op dagData. Dit werkt
  // NAAST de oude playbook_overrides-tabel — bestaande edits in die
  // tabel blijven werken.
  const tekstOverrides = await haalTekstOverridesMulti(supabase, [
    "sprint-dag",
    "sprint-ui",
    "sprint-groet",
  ]);
  dagData = pasSprintDagOverridesToe(
    dagData,
    tekstOverrides.get("sprint-dag"),
  );
  const uiOverrides = namespaceAlsRecord(tekstOverrides, "sprint-ui");
  const groetOverrides = namespaceAlsRecord(
    tekstOverrides,
    "sprint-groet",
  );

  // Media-blokken (video/afbeelding/pdf) op 5 vaste posities. Server
  // genereert signed URLs voor upload-types; we serialiseren de Map
  // naar Record voor server→client prop-passing.
  const paginaBlokkenMap = await haalPaginaBlokken(
    supabase,
    "sprint-dag",
    String(dag),
  );
  const paginaBlokken = blokkenAlsRecord(paginaBlokkenMap);

  // Voltooide taken voor deze dag (uit het al opgehaalde set filteren)
  const voltooidIds = (
    (alleVoltooiingen as Array<{ dag_nummer: number; taak_id: string }>) || []
  )
    .filter((v) => v.dag_nummer === dag)
    .map((v) => v.taak_id);

  // Eerder geschreven inline-zinnen (edification etc.)
  const slugs = dagData.vandaagDoen
    .map((t) => t.inlineActie?.slug)
    .filter((s): s is string => !!s);
  const initialZinnen: Record<string, string> = {};
  if (slugs.length > 0) {
    const { data: zinnen } = await supabase
      .from("eigen_zinnen")
      .select("slug, waarde")
      .eq("user_id", user.id)
      .in("slug", slugs);
    for (const r of (zinnen as Array<{ slug: string; waarde: string }>) ||
      []) {
      initialZinnen[r.slug] = r.waarde;
    }
  }

  const voornaam =
    ((profile as { full_name?: string | null } | null)?.full_name ?? "")
      .split(" ")[0] || user.email?.split("@")[0] || "";

  // (isFounder is hierboven al gezet voor de dag-berekening)

  return (
    <VandaagFlow
      dag={dagData}
      voltooidIds={voltooidIds}
      initialZinnen={initialZinnen}
      voornaam={voornaam}
      isFounder={isFounder}
      uiOverrides={uiOverrides}
      groetOverrides={groetOverrides}
      paginaBlokken={paginaBlokken}
      commitmentUren={commitmentUren}
      radarItems={radarItems}
      radarInitieelAfgevinkt={Array.from(afvinkSets.vandaagAfgevinkt)}
    />
  );
}

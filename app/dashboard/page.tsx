import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { differenceInDays, format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import Link from "next/link";
import { DagelijkseStat, Herinnering, WhyProfile } from "@/lib/supabase/types";
// DagStatForm verwijderd van dashboard, handmatig stats invullen
// hoort op /statistieken (en wordt straks automatisch gevuld door
// pipeline-veranderingen).
// TesterToolbar is verhuisd naar FounderTopStrip (AppShell), dus dashboard
// importeert 'm niet meer rechtstreeks.
import { AutoNaarVandaag } from "@/components/dashboard/AutoNaarVandaag";
import { HerinnerLaterKnop } from "@/components/playbook/HerinnerLaterKnop";
import { DAGEN } from "@/lib/playbook/dagen";
import { haalOverrides, pasOverrideToe } from "@/lib/playbook/overrides";
import { pasTempoToeOpDag } from "@/lib/playbook/tempo-aware";
import { genereerWeekritmeDag } from "@/lib/playbook/weekritme";
import { berekenHuidigeDag } from "@/lib/playbook/bereken-dag";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import type { CommitmentUren } from "@/lib/dagdoelen";
import { pakTopRadar, type ProspectInput } from "@/lib/radar/volgende-beste-actie";
import { RadarBalk } from "@/components/vandaag/RadarBalk";
import { haalRadarAfvinkSets } from "@/lib/radar/carry-over";
import { getServerTaal, v } from "@/lib/i18n/server";
import { pakDagdeelGroet } from "@/lib/util/dagdeel-groet";
import { Locale } from "date-fns";
import { TijdslijnStrip } from "@/components/layout/TijdslijnStrip";
import { MijlpaalDetector } from "@/components/celebrations/MijlpaalDetector";
import { EerstePartnerVieringTegel } from "@/components/dashboard/EerstePartnerVieringTegel";
import { AvatarFoto } from "@/components/ui/AvatarFoto";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

export default async function DashboardPagina({
  searchParams,
}: {
  searchParams?: Promise<{ vier?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Modus-check: het dashboard is voor 60-day Run (sprint) gebruikers.
  // Core-gebruikers gaan naar /welkom-core, Pro naar /welkom-pro, en
  // wie nog geen modus heeft gekozen naar /welkom-keuze.
  //
  // Als de kolom 'modus' nog niet bestaat (migratie niet gerund), geeft
  // de query een error en blijft modus undefined, dan door naar dashboard.
  const { data: modusProfiel, error: modusError } = await supabase
    .from("profiles")
    .select("modus")
    .eq("id", user.id)
    .maybeSingle();
  let huidigeModus: "sprint" | "core" | "pro" | null = null;
  if (!modusError) {
    const modus = (modusProfiel as { modus?: string | null } | null)?.modus;
    if (modus === "pro") redirect("/welkom-pro");
    if (modus === null || modus === undefined) {
      redirect("/welkom-keuze");
    }
    huidigeModus = modus === "core" ? "core" : "sprint";
  }

  const taal = await getServerTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;
  const vandaagStr = new Date().toISOString().split("T")[0];

  const [
    { data: profile },
    { data: whyProfile },
    { data: vandaagStats },
    { data: herinneringen },
    { data: pipelineCounts },
    { data: dagVoltooiingen },
    { data: filmViewsRecent },
    { data: testsRecent },
    { data: openHerinneringenAlle },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, run_startdatum, sprint_startdatum, core_startdatum, created_at, modus, role, is_tester, dagelijkse_push_aan, dagelijkse_push_uur, sponsor_id").eq("id", user.id).maybeSingle(),
    supabase.from("why_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("dagelijkse_stats").select("*").eq("user_id", user.id).eq("stat_datum", vandaagStr).maybeSingle(),
    supabase.from("herinneringen").select("*, prospect:prospects(id, volledige_naam)").eq("user_id", user.id).lte("vervaldatum", vandaagStr).eq("voltooid", false).order("vervaldatum", { ascending: true }).limit(5),
    // Prospects-query incl. gekozen_aanpak voor mini-ELEVA/3-weg-routing
    // in de radar-scoring. Het aparte 'klaar voor 3-weg'-blok is verwijderd
    // (8 mei 2026), die info loopt nu mee in de Volgende Beste Actie-radar
    // hieronder met expliciete reden.
    supabase
      .from("prospects")
      .select(
        "id, volledige_naam, telefoon, pipeline_fase, laatste_contact, gekozen_aanpak",
      )
      .eq("user_id", user.id)
      .eq("gearchiveerd", false),
    // Alle voltooide playbook-taken voor deze user, gebruikt voor de
    // 'Vandaag is dag X'-tegel én voor de admin-reminders van vorige dagen.
    supabase.from("dag_voltooiingen").select("dag_nummer, taak_id").eq("user_id", user.id),
    // Voor radar: prospect-films afgekeken in de laatste 7 dagen.
    // Faalt stil als de tabel nog niet bestaat (migratie nog niet gerund).
    supabase
      .from("prospect_film_views")
      .select("prospect_id, afgekeken_op")
      .eq("member_user_id", user.id)
      .not("afgekeken_op", "is", null)
      .gte(
        "afgekeken_op",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    // Productadvies-tests die in de laatste 7 dagen zijn ingevuld.
    supabase
      .from("productadvies_tests")
      .select("prospect_id, ingevuld_op")
      .eq("user_id", user.id)
      .eq("status", "ingevuld")
      .not("ingevuld_op", "is", null)
      .gte(
        "ingevuld_op",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    // Alle open herinneringen per prospect (oudste vervaldatum eerst)
    supabase
      .from("herinneringen")
      .select("prospect_id, vervaldatum")
      .eq("user_id", user.id)
      .eq("voltooid", false)
      .not("prospect_id", "is", null)
      .order("vervaldatum", { ascending: true }),
  ]);

  const isLeider = (profile as any)?.role === "leider";
  const isFounder = (profile as any)?.role === "founder";
  const isTester = (profile as any)?.is_tester === true;
  const pushAan = (profile as any)?.dagelijkse_push_aan ?? false;
  const pushUur = (profile as any)?.dagelijkse_push_uur ?? 7;

  // ============================================================
  // RADAR: bouw input voor pakTopRadar() uit de zojuist opgehaalde data.
  // Per prospect verzamelen we recente signalen + oudste open herinnering.
  // ============================================================
  const prospectsRijk =
    (pipelineCounts as Array<{
      id: string;
      volledige_naam: string;
      telefoon: string | null;
      pipeline_fase: string;
      laatste_contact: string | null;
      gekozen_aanpak: "drieweg" | "mini_eleva" | null;
    }>) || [];

  const filmAfgekekenPerProspect = new Map<string, string>(); // prospectId → ISO date
  for (const v of (filmViewsRecent as Array<{
    prospect_id: string;
    afgekeken_op: string;
  }>) || []) {
    const bestaand = filmAfgekekenPerProspect.get(v.prospect_id);
    if (!bestaand || v.afgekeken_op > bestaand) {
      filmAfgekekenPerProspect.set(v.prospect_id, v.afgekeken_op);
    }
  }

  const testIngevuldPerProspect = new Map<string, string>();
  for (const t of (testsRecent as Array<{
    prospect_id: string;
    ingevuld_op: string;
  }>) || []) {
    if (!t.prospect_id) continue;
    const bestaand = testIngevuldPerProspect.get(t.prospect_id);
    if (!bestaand || t.ingevuld_op > bestaand) {
      testIngevuldPerProspect.set(t.prospect_id, t.ingevuld_op);
    }
  }

  const oudsteHerinneringPerProspect = new Map<string, string>();
  for (const h of (openHerinneringenAlle as Array<{
    prospect_id: string;
    vervaldatum: string;
  }>) || []) {
    if (!h.prospect_id) continue;
    if (!oudsteHerinneringPerProspect.has(h.prospect_id)) {
      oudsteHerinneringPerProspect.set(h.prospect_id, h.vervaldatum);
    }
  }

  function dagenVanaf(iso: string | undefined): number | null {
    if (!iso) return null;
    const ms = Date.now() - new Date(iso).getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  const radarInput: ProspectInput[] = prospectsRijk.map((p) => ({
    id: p.id,
    volledige_naam: p.volledige_naam,
    telefoon: p.telefoon,
    pipeline_fase: p.pipeline_fase,
    laatste_contact: p.laatste_contact,
    oudsteHerinneringDatum: oudsteHerinneringPerProspect.get(p.id) ?? null,
    dagenSindsFilmAfgekeken: dagenVanaf(filmAfgekekenPerProspect.get(p.id)),
    dagenSindsTestIngevuld: dagenVanaf(testIngevuldPerProspect.get(p.id)),
    gekozenAanpak: p.gekozen_aanpak ?? null,
  }));

  // Top-5 (was 3) sinds 8 mei: het aparte 3-weg-blok is verwijderd, dus
  // de radar is nu de single-source-of-truth voor 'wie pak ik vandaag op'.
  // Wat ruimer zodat 3-weg- én mini-ELEVA-rijpe prospects allebei zichtbaar
  // worden. Bij geen of weinig signalen blijft 'ie automatisch korter.
  const topRadar = pakTopRadar(radarInput, 5);

  // Tel hoeveel radar-items vandaag NIET zijn afgevinkt. Dat getal
  // staat op de RadarTeaser zodat de member weet hoeveel open staat.
  const radarAfvinkSetsDash = await haalRadarAfvinkSets(supabase, user.id);
  const aantalRadarOpen = topRadar.filter(
    (item) => !radarAfvinkSetsDash.vandaagAfgevinkt.has(item.prospect.id),
  ).length;

  // Huidige dag = voortgang-gebaseerd voor members (eerste niet-voltooide
  // dag), kalender-gebaseerd voor testers/founders zodat de spring-toolbar
  // blijft werken. Iemand die dag 16 doet en 4 dagen mist, opent ELEVA
  // opnieuw en staat op dag 17, niet op dag 20.
  // Per-modus startdatum als anker (zelfde helper als AppShell en /vandaag).
  // Voorkomt mismatch tussen Topbar-cirkel, dashboard-titel en /vandaag-flow.
  const dashboardModus: "sprint" | "core" | "pro" =
    huidigeModus === "core" ? "core" : "sprint";
  const dashboardModusStartIso = startdatumVoorModus(
    {
      sprint_startdatum: (profile as any)?.sprint_startdatum ?? null,
      core_startdatum: (profile as any)?.core_startdatum ?? null,
      run_startdatum: (profile as any)?.run_startdatum ?? null,
      created_at: (profile as any)?.created_at ?? null,
    },
    dashboardModus,
  );
  const dag = berekenHuidigeDag(
    (dagVoltooiingen as Array<{ dag_nummer: number; taak_id: string }>) || [],
    dashboardModusStartIso ? dashboardModusStartIso.toISOString().slice(0, 10) : null,
    { isTester: isTester || isFounder },
  );

  const stats = vandaagStats as DagelijkseStat | null;
  const herinneringenLijst = (herinneringen as (Herinnering & { prospect: { id: string; volledige_naam: string } | null })[]) || [];
  const why = whyProfile as WhyProfile | null;

  const faseCounts: Record<string, number> = {};
  (pipelineCounts || []).forEach((p: { pipeline_fase: string }) => {
    faseCounts[p.pipeline_fase] = (faseCounts[p.pipeline_fase] || 0) + 1;
  });

  // Voltooiingen-set voor snelle lookup
  const voltooidSet = new Set(
    ((dagVoltooiingen as Array<{ dag_nummer: number; taak_id: string }>) || [])
      .map((v) => `${v.dag_nummer}|${v.taak_id}`),
  );

  // Auto-afvinken op dag 1: voorkomt dubbel werk voor dingen die de
  // member al in de onboarding heeft gedaan.
  // - dag1-onboarding   → automatisch klaar als profile.onboarding_klaar
  // - dag1-why          → automatisch klaar als WHY al gemaakt is
  // Idempotent: alleen INSERT als rij nog niet bestaat. Zo schrijven we
  // eenmalig naar DB en blijft de bevestiging consistent, handig voor
  // de stilte-detectie (laatste activiteit baseert op voltooid_op).
  const autoVinken: string[] = [];
  if ((profile as any)?.onboarding_klaar && !voltooidSet.has("1|dag1-onboarding")) {
    autoVinken.push("dag1-onboarding");
  }
  if (whyProfile && !voltooidSet.has("1|dag1-why")) {
    autoVinken.push("dag1-why");
  }
  if (autoVinken.length > 0) {
    await supabase.from("dag_voltooiingen").upsert(
      autoVinken.map((taakId) => ({
        user_id: user.id,
        dag_nummer: 1,
        taak_id: taakId,
        voltooid_op: new Date().toISOString(),
      })),
      { onConflict: "user_id,dag_nummer,taak_id" },
    );
    autoVinken.forEach((t) => voltooidSet.add(`1|${t}`));
  }

  // Streak-berekening, hoeveel dagen op rij heeft de member iets
  // afgevinkt? Telt vanaf de dag VOOR de huidige terug (huidige is per
  // definitie nog niet-voltooid in voortgang-modus). Géén stilte-dagen
  // tussendoor. Voor motivatie-tegel "🔥 X dagen op rij".
  const voltooidPerDag = new Map<number, boolean>();
  for (const v of (dagVoltooiingen as Array<{
    dag_nummer: number;
    taak_id: string;
  }>) || []) {
    voltooidPerDag.set(v.dag_nummer, true);
  }
  let streak = 0;
  // Begin bij dag-1: dag zelf is nog onderweg (voortgang-modus) of
  // mogelijk net begonnen (kalender-modus voor testers). De vorige
  // dag is de eerste die volledig 'achter ons' ligt om mee te tellen.
  for (let i = dag - 1; i >= 1; i--) {
    if (voltooidPerDag.has(i)) streak++;
    else break;
  }
  // Plus 1 als de huidige dag óók al iets voltooid heeft (telt mee als
  // 'bezig vandaag'). Dat geeft een fijner cijfer als iemand een dag
  // halverwege is.
  if (voltooidPerDag.has(dag)) streak++;

  // Mijlpaal-detectie: net vandaag dag 7 / 14 / 21 voltooid?
  // We checken of ALLE verplichte taken van die mijlpaal-dag gedaan zijn.
  function mijlpaalVoltooid(mijlpaalDag: number): boolean {
    if (dag < mijlpaalDag) return false;
    const mijlpaalData = DAGEN.find((d) => d.nummer === mijlpaalDag);
    if (!mijlpaalData) return false;
    const verplichteTaken = mijlpaalData.vandaagDoen.filter((t) => t.verplicht);
    return verplichteTaken.every((t) =>
      voltooidSet.has(`${mijlpaalDag}|${t.id}`),
    );
  }
  const week1Klaar = mijlpaalVoltooid(7);
  const week2Klaar = mijlpaalVoltooid(14);
  const week3Klaar = mijlpaalVoltooid(21);

  // Tempo lezen voor zowel dag 1-21 (tempo-aware vervanging) als
  // dag 22-60 (weekritme-generator).
  const ruwUrenDashboard = Number(
    (user.user_metadata as { commitment_uren?: unknown } | undefined)
      ?.commitment_uren,
  );
  const commitmentUrenDashboard: CommitmentUren | null =
    ruwUrenDashboard === 2 ||
    ruwUrenDashboard === 4 ||
    ruwUrenDashboard === 6
      ? ruwUrenDashboard
      : null;

  // Huidige dag-data. Voor dag 1-21: uit het statische DAGEN-array,
  // Eerste-partner-viering: triggert via ?vier=eerste-partner OF
  // wanneer de mijlpaal in afgelopen 24u is geregistreerd.
  type VieringPersoon = { fullName: string; telefoon: string | null; fotoUrl: string | null };
  let eerstePartnerViering: {
    eerstePartner: VieringPersoon | null;
    eigenSponsor: VieringPersoon | null;
    triggerConfetti: boolean;
  } | null = null;

  const { data: recenteMijlpaal } = await supabase
    .from("partner_mijlpalen")
    .select("partner_id, gevierd_op")
    .eq("user_id", user.id)
    .eq("type", "eerste-partner")
    .gte("gevierd_op", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();

  if (recenteMijlpaal || sp.vier === "eerste-partner") {
    // Haal eerste-partner-naam + telefoon + foto op
    let eerstePartner: VieringPersoon | null = null;
    if (recenteMijlpaal) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("full_name, telefoon, foto_url")
        .eq("id", (recenteMijlpaal as { partner_id: string }).partner_id)
        .maybeSingle();
      if (pData) {
        eerstePartner = {
          fullName: (pData as { full_name: string }).full_name,
          telefoon: (pData as { telefoon: string | null }).telefoon ?? null,
          fotoUrl: (pData as { foto_url: string | null }).foto_url ?? null,
        };
      }
    }

    // Haal eigen sponsor op
    let eigenSponsor: VieringPersoon | null = null;
    const profSponsor = profile as { sponsor_id?: string | null } | null;
    if (profSponsor?.sponsor_id) {
      const { data: sData } = await supabase
        .from("profiles")
        .select("full_name, telefoon, foto_url")
        .eq("id", profSponsor.sponsor_id)
        .maybeSingle();
      if (sData) {
        eigenSponsor = {
          fullName: (sData as { full_name: string }).full_name,
          telefoon: (sData as { telefoon: string | null }).telefoon ?? null,
          fotoUrl: (sData as { foto_url: string | null }).foto_url ?? null,
        };
      }
    }

    eerstePartnerViering = {
      eerstePartner,
      eigenSponsor,
      triggerConfetti: sp.vier === "eerste-partner",
    };
  }

  // met tempo-aware vervanging + override-pass. Voor dag 22-60: via
  // genereerWeekritmeDag (synthetisch dag-object op basis van
  // run-weekdag). Beide trajecten leveren een Dag-object op met
  // titel + vandaagDoen, zodat de "Vandaag is dag X"-CTA-tile en
  // AutoNaarVandaag voor het hele 1-60 bereik werken.
  let huidigeDagData;
  if (dag <= 21) {
    huidigeDagData = DAGEN.find((d) => d.nummer === dag) ?? null;
    if (huidigeDagData) {
      huidigeDagData = pasTempoToeOpDag(
        huidigeDagData,
        commitmentUrenDashboard,
      );
      // Override toepassen, founders kunnen via /instellingen/playbook
      // teksten aanpassen zonder code-deploy. haalOverrides faalt
      // stilletjes als de tabel nog niet bestaat (returnt lege map).
      const overrideMap = await haalOverrides(supabase as any, [dag]);
      huidigeDagData = pasOverrideToe(
        huidigeDagData,
        overrideMap.get(dag) ?? null,
      );
    }
  } else if (dag <= 60) {
    // Weekritme-modus: synthetisch dag-object. Geen override-pass
    // (synthetische dagen krijgen geen founder-edits).
    huidigeDagData = genereerWeekritmeDag(dag, commitmentUrenDashboard);
  } else {
    huidigeDagData = null;
  }
  const huidigeDagVoltooidIds = huidigeDagData
    ? huidigeDagData.vandaagDoen
        .filter((t) => voltooidSet.has(`${dag}|${t.id}`))
        .map((t) => t.id)
    : [];

  // (Inline-zinnen worden voortaan exclusief in /vandaag geladen, niet
  // meer hier; dashboard toont geen afvinklijst meer.)

  // Reminders voor onvoltooide ADMIN-taken van vorige dagen, krediet,
  // webshop, teams-admin, bestellinks. Eric Worre tip is geen reminder
  // (doorlopend, geen one-shot taak). We tonen ook missed verplichte
  // taken alleen voor admin-stappen, niet alle gemiste invites etc.
  // Mapping admin-taak → emoji + 'kale' titel zonder emoji-prefix
  // (zo voorkomen we een unicode-regex die niet in alle TS-versies werkt).
  const ADMIN_TAKEN: Record<string, { emoji: string; kort: string }> = {
    "dag2-webshop": { emoji: "🛒", kort: "Lifeplus webshop aanmaken" },
    "dag2-krediet": { emoji: "✅", kort: "Kredietformulier invullen" },
    "dag3-teams-admin": { emoji: "📋", kort: "Teams-administratiesysteem aanmaken" },
    "dag4-bestellinks": { emoji: "🔗", kort: "Bestellinks koppelen aan ELEVA" },
  };
  type OpenReminder = {
    dagNummer: number;
    taakId: string;
    label: string;
    emoji: string;
  };
  const openAdminReminders: OpenReminder[] = [];
  for (const d of DAGEN) {
    if (d.nummer >= dag) break; // alleen verleden dagen
    for (const taak of d.vandaagDoen) {
      const meta = ADMIN_TAKEN[taak.id];
      if (!meta) continue;
      if (voltooidSet.has(`${d.nummer}|${taak.id}`)) continue;
      openAdminReminders.push({
        dagNummer: d.nummer,
        taakId: taak.id,
        label: meta.kort,
        emoji: meta.emoji,
      });
    }
  }

  const faseKleuren: Record<string, string> = {
    prospect: "text-[#CCCCCC]", in_gesprek: "text-[#D4A574]",
    uitgenodigd: "text-[#4A9EDB]", one_pager: "text-[#7A6ADB]",
    presentatie: "text-[#9A6ADB]", followup: "text-cm-gold",
    not_yet: "text-[#DB6A6A]", shopper: "text-[#4ACB6A]",
    member: "text-[#E8C96B]",
  };

  const voornaam = ((profile as any)?.full_name ?? "").split(" ")[0] ?? "";

  // Sponsor-naam voor de mens-eerst-strip onder de welkom-header.
  // Zelfde patroon als op prospect-detail-pagina: probeer eerst de
  // gekoppelde sponsor, anders fallback op leiders, anders "Ramon Sant".
  const sponsorIdDash = (profile as any)?.sponsor_id ?? null;
  const eigenRolDash = (profile as any)?.role ?? null;
  let sponsorNaamDash = "";
  let sponsorFotoDash: string | null = null;
  if (sponsorIdDash) {
    const { data: sp } = await supabase
      .from("profiles")
      .select("full_name, foto_url")
      .eq("id", sponsorIdDash)
      .single();
    sponsorNaamDash = (sp as { full_name?: string } | null)?.full_name ?? "";
    sponsorFotoDash = (sp as { foto_url?: string | null } | null)?.foto_url ?? null;
  } else if (eigenRolDash === "leider") {
    sponsorNaamDash = "Ramon Sant";
  } else {
    const { data: leiders } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("role", "leider")
      .order("created_at", { ascending: true })
      .limit(2);
    if (leiders && leiders.length > 0) {
      sponsorNaamDash = (leiders as Array<{ full_name: string }>)
        .map((l) => l.full_name)
        .join(" / ");
    } else {
      sponsorNaamDash = "Ramon Sant";
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Onzichtbare detector: triggert bij eerste keer een Sprint week-
          mijlpaal (dag 7/14/21) wordt bereikt een groot vuurwerk. */}
      <MijlpaalDetector
        week1Klaar={week1Klaar}
        week2Klaar={week2Klaar}
        week3Klaar={week3Klaar}
      />
      {/* Persoonlijke welkom in mockup-4 stijl: italic groet + serif heading
          met dag-nummer. Daaronder de datum, dempler. */}
      <div>
        <p className="text-cm-white/60 text-sm italic">
          {dag === 1
            ? "Daar gaan we, "
            : "Mooi dat je er bent vandaag, "}
          {voornaam ? `${voornaam},` : ""}
        </p>
        <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white mt-1 leading-tight">
          {dag === 1 ? (
            <>
              <span className="text-cm-gold">Dag 1</span>
              {huidigeModus === "core"
                ? " van je Core-traject. 💟"
                : " van je 60-dagen reis. 🚀"}
            </>
          ) : huidigeModus === "core" ? (
            <>
              Core dag <span className="text-cm-gold">{dag}</span>
            </>
          ) : (
            <>
              {v("dashboard.dag", taal)}{" "}
              <span className="text-cm-gold">{dag}</span>{" "}
              {v("dashboard.van_60", taal)}.
            </>
          )}
        </h1>
        <p className="text-cm-white/50 text-xs mt-2">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: datumLocale })}
        </p>
      </div>

      {/* Eerste-partner-viering: eenmalige tegel die verschijnt zodra
          de member zijn eerste directe partner heeft, met confetti
          en drie hands-on acties (WhatsApp partner + WhatsApp sponsor +
          Academy-link). Geen AI-tussenkomst, alle berichten leeg. */}
      {eerstePartnerViering && (
        <EerstePartnerVieringTegel
          eerstePartner={eerstePartnerViering.eerstePartner}
          eigenSponsor={eerstePartnerViering.eigenSponsor}
          triggerConfetti={eerstePartnerViering.triggerConfetti}
        />
      )}

      {/* Sponsor-info-strip (neutraal, mockup-4 element). Toont met avatar
          + naam wie jouw sponsor is. Geen 'kijkt mee'-tekst, dat voelde als
          surveillance. Klik = naar team-pagina. */}
      {sponsorNaamDash && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-cm-border bg-cm-surface-2/40 glow-gold-soft">
          <AvatarFoto naam={sponsorNaamDash} fotoUrl={sponsorFotoDash} maat="sm" />
          <div className="flex-1 min-w-0 text-cm-white/80 text-sm leading-snug">
            <span className="text-cm-white font-medium">{sponsorNaamDash}</span>{" "}
            <span className="text-cm-white/60">is je sponsor.</span>
          </div>
        </div>
      )}

      {/* Voortgang als subtiele tijdslijn-strip. Sprint: 60 dagen.
          Core: 40 dagen opstart (lifetime daarna heeft geen einde). */}
      {huidigeModus === "core" ? (
        <div>
          <TijdslijnStrip
            totaal={40}
            huidig={Math.min(dag, 40)}
            label="Jouw 40-dagen opstart"
          />
          <div className="flex items-center justify-between text-xs text-cm-white/50 mt-2">
            <span>
              {dag <= 40
                ? `Opstart-fase, ${Math.round((dag / 40) * 100)}% voltooid`
                : "Opstart voltooid · Lifetime DMO actief"}
            </span>
            <span>
              {dag <= 40 ? `${40 - dag} dagen tot lifetime-ritme` : ""}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <TijdslijnStrip
            totaal={60}
            huidig={dag}
            label="Voortgang door je 60 dagen"
          />
          <div className="flex items-center justify-between text-xs text-cm-white/50 mt-2">
            <span>{Math.round((dag / 60) * 100)}% voltooid</span>
            <span>{60 - dag} {v("dashboard.dagen_te_gaan", taal)}</span>
          </div>
        </div>
      )}

      {/* Reminder-tegel: open admin-stappen van VORIGE dagen die nog
          niet zijn afgevinkt. Verschijnt elke dag opnieuw zolang er
          nog admin-werk te doen is. */}
      {openAdminReminders.length > 0 && (
        <div className="card border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              ⚠️ Open setup-stappen
            </h2>
            <span className="text-cm-white text-xs opacity-60">{openAdminReminders.length} open</span>
          </div>
          <p className="text-cm-white text-xs opacity-70 mb-3 leading-relaxed">
            Deze stappen heb je nog niet afgevinkt. Tik om naar de juiste dag in het playbook te gaan.
          </p>
          <div className="space-y-2">
            {openAdminReminders.map((r) => (
              <Link
                key={`${r.dagNummer}-${r.taakId}`}
                href={`/playbook?dag=${r.dagNummer}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-cm-surface-2 border border-cm-border hover:border-cm-gold-dim transition-colors"
              >
                <span className="text-xl">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-cm-white text-sm font-medium truncate">
                    {r.label}
                  </p>
                  <p className="text-cm-white text-xs opacity-50">
                    Dag {r.dagNummer}
                  </p>
                </div>
                <span className="text-cm-white opacity-50 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Auto-redirect bij eerste bezoek per dag → /vandaag (guided
          flow). Daarna niet meer voor die dag; dashboard wordt dan de
          hoofdpagina. Geldt voor iedereen, testers springen sowieso
          tussen dagen, dus elke nieuwe dag krijgt een eigen redirect.
          Member die via push naar /herinneringen wordt geleid, doet
          daar z'n ding, en wordt pas bij dashboard-bezoek doorgestuurd
          naar /vandaag (zo niet onderbreken halverwege een actie). */}
      {huidigeDagData && (
        <AutoNaarVandaag dagNummer={dag} redirectActief={true} />
      )}

      {/* Prominente CTA naar vandaag-flow, handig voor wanneer je
          via de browser-knop terugkomt op dashboard maar nog niet alle
          taken hebt gedaan. Verbergt automatisch als alles voltooid. */}
      {huidigeDagData &&
        huidigeDagVoltooidIds.length < huidigeDagData.vandaagDoen.length && (
          <div className="space-y-2">
            <Link
              href="/vandaag"
              className="block rounded-xl bg-gradient-to-br from-cm-gold/20 to-cm-gold/5 border-2 border-cm-gold/40 px-5 py-4 hover:border-cm-gold transition-colors"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                    📋 Vandaag is dag {dag}
                  </p>
                  <p className="text-cm-white text-base font-display font-semibold mt-0.5">
                    {huidigeDagData.titel}
                  </p>
                  <p className="text-cm-white opacity-70 text-xs mt-1">
                    {huidigeDagVoltooidIds.length} van{" "}
                    {huidigeDagData.vandaagDoen.length} stappen klaar, pak 'm
                    stap voor stap →
                  </p>
                </div>
                <span className="text-cm-gold font-bold text-lg">→</span>
              </div>
            </Link>
            <div className="flex justify-end">
              <HerinnerLaterKnop
                dagNummer={dag}
                variant="tekstlink"
                label="Herinner me later vandaag"
              />
            </div>
          </div>
        )}

      {/* Academy-tegel: pas zichtbaar NA dag 21. Idee (afspraak Raoul,
          2026-05-13): in de eerste 21 Sprint-dagen moeten mensen niet
          afgeleid worden met training, focus blijft op de playbook.
          Daarna mag de uitnodiging naar diepere social-media-training
          komen, in eigen tempo, optioneel. */}
      {dag > 21 && (
        <Link
          href="/academy/social-media"
          className="block rounded-xl bg-gradient-to-br from-purple-900/30 to-cm-surface border-2 border-purple-500/40 px-5 py-4 hover:border-purple-400/60 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">📚</span>
            <div className="flex-1">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">
                Klaar voor verdieping?
              </p>
              <p className="text-cm-white text-base font-display font-semibold mt-0.5">
                Open de Academy, social media zonder spam
              </p>
              <p className="text-cm-white/70 text-xs mt-1 leading-relaxed">
                14 modules, 42 lessen, eigen tempo. Bouw een rustige
                aanwezigheid op socials, vind nieuwe mensen zonder pitches.
              </p>
            </div>
            <span className="text-purple-300 font-bold text-lg self-center">→</span>
          </div>
        </Link>
      )}

      {/* Radar-balk inline op /dashboard: uitklap-component met afvinkbare
          acties direct hier, geen sprong naar /vandaag meer nodig.
          Afvinken syncrt via /api/radar/afvinken naar dezelfde tabel die
          /vandaag leest, dus daar verdwijnt 't ook automatisch. Verbergt
          zich bij 0 items. */}
      {aantalRadarOpen > 0 && (
        <RadarBalk
          items={topRadar}
          initieelAfgevinkt={Array.from(radarAfvinkSetsDash.vandaagAfgevinkt)}
          huidigeDag={dag}
        />
      )}

      {/* Streak + mijlpaal-vieringen. Compact, alleen zichtbaar bij
          relevante getallen (geen lege tegels). */}
      {(streak >= 2 || week1Klaar || week2Klaar || week3Klaar) && (
        <div className="flex flex-wrap gap-2">
          {streak >= 2 && (
            <div className="flex-1 min-w-[160px] rounded-lg border border-orange-500/40 bg-orange-900/20 px-3 py-2.5">
              <p className="text-orange-300 text-xs font-semibold uppercase tracking-wider">
                🔥 Streak
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                <strong className="text-orange-300 text-base">{streak}</strong>{" "}
                dagen op rij, hou vol!
              </p>
            </div>
          )}
          {week3Klaar ? (
            <div className="flex-1 min-w-[200px] rounded-lg border border-cm-gold/60 bg-cm-gold/15 px-3 py-2.5">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                🏆 21 dagen klaar!
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                Te gek, week 1 t/m 3 voltooid. Dit is je startlijn voor de
                volgende 40 dagen.
              </p>
            </div>
          ) : week2Klaar ? (
            <div className="flex-1 min-w-[200px] rounded-lg border border-cm-gold/60 bg-cm-gold/15 px-3 py-2.5">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                🏁 Halverwege!
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                Twee weken in, jij hoort bij de 20% die doorzet. Door zo!
              </p>
            </div>
          ) : week1Klaar ? (
            <div className="flex-1 min-w-[200px] rounded-lg border border-cm-gold/60 bg-cm-gold/15 px-3 py-2.5">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                🎉 Eerste week klaar!
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                Top, week 1 zit erop. Het ritme zit er nu in. Op naar week 2!
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Tester-toolbar zit nu bovenaan in FounderTopStrip (zie AppShell),
          dus hier niet meer een tweede dezelfde balk. */}

      {/* Daily tasks staan EXCLUSIEF in /vandaag, niet meer dubbel op
          het dashboard. De gouden CTA hierboven is de enige entry naar
          de flow; afvinken doe je daar. Houdt het dashboard rustig. */}

      {/* Het aparte 'Wie is klaar voor 3-weg?'-blok is op 8 mei 2026
          verwijderd. Die signalen lopen nu mee in 'Volgende beste acties'
          hierboven, met expliciete reden 'Klaar voor 3-weg of Mini-ELEVA'.
          Geeft één geconsolideerd overzicht ipv twee versnipperde lijstjes. */}

      {/* Leider banner */}
      {isLeider && (
        <div className="flex items-center justify-between bg-cm-gold/10 border border-cm-gold/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">👑</span>
            <div>
              <p className="text-cm-gold text-sm font-semibold">Jij bent Leider</p>
              <p className="text-cm-white text-xs opacity-60">Je hebt extra bevoegdheden via de Team pagina</p>
            </div>
          </div>
          <a href="/team" className="text-cm-gold text-xs hover:text-cm-gold-light">
            Team →
          </a>
        </div>
      )}

      {/* Playbook-preview banner verplaatst naar /instellingen,
          dezelfde plek als de onboarding-preview. */}

      {/* Dashboard-cleanup: snelle acties (Scripts/Statistieken/Mentor/
          Nieuw) zaten dubbel met het hoofdmenu en zijn weggehaald. De
          'Vandaag bijhouden'-stat-form en de pipeline-grid zijn ook weg.
          die data hoort op /statistieken (zit daar al), en wordt straks
          automatisch gevuld door pipeline-veranderingen ipv handmatig
          tellen op het dashboard. */}

      <div className="space-y-4">
          {/* WHY kaart, ingeklapt (details/summary), user klapt uit om te lezen */}
          {why?.why_samenvatting && (
            <details className="card border-gold-subtle group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-cm-gold">🎯</span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider">
                      {v("dashboard.jouw_why", taal)}
                    </h2>
                    <p className="text-cm-white text-[11px] opacity-60 mt-0.5">
                      Jouw opgeslagen why, bekijk &lsquo;m regelmatig
                    </p>
                  </div>
                </div>
                <span className="text-cm-gold text-xs transition-transform group-open:rotate-180 ml-2 flex-shrink-0">
                  ▼
                </span>
              </summary>
              <div className="mt-3 pt-3 border-t border-gold-subtle">
                <p className="text-cm-white text-sm leading-relaxed italic">
                  &ldquo;{why.why_samenvatting}&rdquo;
                </p>
                <Link
                  href="/mijn-why"
                  className="inline-block mt-3 text-cm-white text-xs hover:text-cm-gold"
                >
                  {v("dashboard.aanpassen", taal)}
                </Link>
              </div>
            </details>
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
                {herinneringenLijst.map((her) => {
                  const dagenTeLaat = differenceInDays(new Date(vandaagStr), new Date(her.vervaldatum));
                  const isVerlopen = dagenTeLaat > 0;
                  return (
                    <div
                      key={her.id}
                      className={`bg-cm-surface-2 rounded-lg p-3 border-l-2 ${
                        isVerlopen ? "border-red-500 bg-red-500/5" : "border-cm-gold"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-cm-white text-sm font-medium">{her.titel}</p>
                        {isVerlopen && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {dagenTeLaat === 1 ? "1 dag te laat" : `${dagenTeLaat} dagen te laat`}
                          </span>
                        )}
                      </div>
                      {her.prospect && (
                        <Link href={`/namenlijst/${her.prospect.id}`} className="text-cm-gold text-xs mt-0.5 hover:text-cm-gold-light flex items-center gap-1 w-fit">
                          👤 {her.prospect.volledige_naam} →
                        </Link>
                      )}
                      <p className={`text-xs mt-1 ${isVerlopen ? "text-red-400" : "text-cm-gold"}`}>
                        {her.vervaldatum === vandaagStr ? v("algemeen.vandaag", taal) : her.vervaldatum}
                      </p>
                    </div>
                  );
                })}
                <Link href="/herinneringen" className="block text-center text-cm-gold text-sm hover:text-cm-gold-light mt-2">
                  {v("dashboard.alle_herinneringen", taal)} →
                </Link>
              </div>
            )}
          </div>
      </div>

      {/* Instellingen, compacte status-regel. Eén bron van waarheid (/instellingen). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <Link
          href="/instellingen"
          className="card flex items-center gap-3 py-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-lg">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="text-cm-white font-semibold text-sm">
              {v("push.master_label", taal)}
            </p>
            <p className="text-cm-gold text-xs">
              {pushAan
                ? `${v("algemeen.aan", taal)} · ${String(pushUur).padStart(2, "0")}:00`
                : v("algemeen.uit", taal)}
            </p>
          </div>
          <span className="text-cm-gold text-xs">→</span>
        </Link>
        <Link
          href="/instellingen"
          className="card flex items-center gap-3 py-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-lg">📧</span>
          <div className="flex-1 min-w-0">
            <p className="text-cm-white font-semibold text-sm">E-mail herinneringen</p>
            <p className="text-cm-gold text-xs">
              Instellen via Instellingen
            </p>
          </div>
          <span className="text-cm-gold text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}

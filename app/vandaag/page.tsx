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
import {
  genereerVerankeringsDag,
  genereerLifetimeDag,
} from "@/lib/playbook/core-dagen";
// Core member-flow draait sinds 2026-05-30 op V9. De live ankerstappen
// (Builder als rode draad, side-flows, drie-soorten-DM-scripts, webshop-
// pivot, FORM-verdieping, etc.) zitten in core-dagen-v9.ts. Verankering
// (dag 22-40) en lifetime (41+) blijven uit core-dagen.ts.
import { CORE_V9_STAPPEN } from "@/lib/playbook/core-dagen-v9";
import { detecteerEnVierEerstePartner } from "@/lib/team/mijlpaal-detector";
import { pakTopRadar, type ProspectInput } from "@/lib/radar/volgende-beste-actie";
import { haalRadarAfvinkSets } from "@/lib/radar/carry-over";
import { bracketVoorDTT, type DTTInput } from "@/lib/dtt/advies";
import { genereerDMOStappen } from "@/lib/dtt/dmo-stappen";
import { haalAlleVoltooiingenVoorUser, type Modus } from "@/lib/onboarding/voltooiingen";
import { TAAK_NAAR_CROSS_MODUS_SLUG } from "@/lib/onboarding/taak-cross-modus";
import type { CommitmentUren } from "@/lib/dagdoelen";
import { VandaagFlow } from "./vandaag-flow";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { SetupPopup } from "@/components/setup/SetupPopup";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { dagVoorModus, startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { ModusSwitchBanner } from "@/components/vandaag/ModusSwitchBanner";
import { WatNuKnop } from "@/components/core/WatNuKnop";
import { SideflowGate } from "@/components/vandaag/SideflowBanner";

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
    .select(
      "run_startdatum, sprint_startdatum, core_startdatum, created_at, full_name, role, is_tester, modus, core_dtt, core_eigen_resultaat",
    )
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
    (isFounder || isTester) && sp.dag ? Number.parseInt(sp.dag, 10) : NaN;
  const dagOverride =
    Number.isFinite(dagParam) && dagParam >= 1 && dagParam <= 60
      ? dagParam
      : null;

  // Modus eerst afleiden, want de dag-teller is modus-specifiek.
  const modusVoorDagTeller: Modus =
    ((profile as any)?.modus as string | null) === "core"
      ? "core"
      : ((profile as any)?.modus as string | null) === "pro"
        ? "pro"
        : "sprint";

  // Per 2026-05-19: Pro heeft geen /vandaag-flow in deze pilot. Stuur
  // Pro-gebruikers naar hun eigen leerpad-overzicht in plaats van
  // terug te vallen op Sprint-content.
  if (modusVoorDagTeller === "pro") redirect("/welkom-pro");

  // Modus-specifieke startdatum als anker voor berekenHuidigeDag, met
  // fallback op de legacy run_startdatum voor bestaande Sprint-leden.
  const profielDatumVelden = {
    sprint_startdatum: (profile as any)?.sprint_startdatum ?? null,
    core_startdatum: (profile as any)?.core_startdatum ?? null,
    run_startdatum: (profile as any)?.run_startdatum ?? null,
    created_at: (profile as any)?.created_at ?? null,
  };
  const modusStartDatum = startdatumVoorModus(
    profielDatumVelden,
    modusVoorDagTeller,
  );
  const modusStartIso = modusStartDatum
    ? modusStartDatum.toISOString().slice(0, 10)
    : null;

  const dag =
    dagOverride ??
    berekenHuidigeDag(
      (alleVoltooiingen as Array<{ dag_nummer: number; taak_id: string }>) ||
        [],
      modusStartIso,
      { isTester: isTester || isFounder, modus: modusVoorDagTeller },
    );

  // Buiten dag 1-60 → terug naar dashboard
  if (dag < 1 || dag > 60) {
    redirect("/dashboard");
  }

  // ============================================================
  // SIDE-FLOW BANNER-LOGICA (Core V9, herzien 2026-05-31).
  //
  // Op stap 1 maakt de member een post-keuze (pre-post of 21-dagen-
  // resultaat-post) via de prepost-keuze-embed. Die keuze wordt
  // opgeslagen op profiles.core_eigen_resultaat (boolean of null).
  //
  // Bewust GEEN hard-redirect meer: dag 1 mag niet onderbroken worden,
  // en de member moet ook zelf kunnen kiezen wanneer 'r de sideflow
  // doet (of voor nu wil overslaan).
  //
  // In plaats daarvan: vanaf dag 2, als 'r een keuze is en de
  // bijbehorende sideflow nog niet is afgerond, tonen we een
  // keuze-banner bovenaan /vandaag met "open nu" + "sla over voor
  // nu" (dismiss-knop, sessionStorage). Voor pre-post-leden komt
  // vanaf dag 14 ook de 21-dagen-resultaat-post als banner.
  // ============================================================
  let sideflowAanRaad: { slug: "pre-post" | "21-dagen-post"; titel: string } | null = null;
  if (modusVoorDagTeller === "core" && dag >= 2) {
    const eigenResultaat = (profile as { core_eigen_resultaat?: boolean | null } | null)?.core_eigen_resultaat;
    if (eigenResultaat !== null && eigenResultaat !== undefined) {
      const eersteSlug: "pre-post" | "21-dagen-post" = eigenResultaat
        ? "21-dagen-post"
        : "pre-post";
      const eersteAfrondTaakId = eigenResultaat
        ? "core-v9-sideflow-21dagen-12-afronden"
        : "core-v9-sideflow-prepost-11-afronden";

      let eersteAfgerond = false;
      try {
        const { data: voltooidEerste } = await supabase
          .from("core_v6_substep_voltooiingen")
          .select("taak_id")
          .eq("user_id", user.id)
          .eq("taak_id", eersteAfrondTaakId)
          .maybeSingle();
        eersteAfgerond = !!voltooidEerste;
      } catch {
        // tabel bestaat misschien nog niet, sla 'r dan over
      }

      if (!eersteAfgerond) {
        sideflowAanRaad = {
          slug: eersteSlug,
          titel:
            eersteSlug === "21-dagen-post"
              ? "21-dagen-resultaat-post"
              : "pre-post",
        };
      } else if (!eigenResultaat && dag >= 14) {
        // Pre-post-leden krijgen vanaf dag 14 de tweede sideflow-trigger.
        try {
          const { data: voltooid21d } = await supabase
            .from("core_v6_substep_voltooiingen")
            .select("taak_id")
            .eq("user_id", user.id)
            .eq("taak_id", "core-v9-sideflow-21dagen-12-afronden")
            .maybeSingle();
          if (!voltooid21d) {
            sideflowAanRaad = {
              slug: "21-dagen-post",
              titel: "21-dagen-resultaat-post",
            };
          }
        } catch {
          // ignore
        }
      }
    }
  }

  // Tempo-aware vervanging: lees commitment_uren uit user_metadata
  // en pas tempo-specifieke taken toe.
  const ruwUren = Number(
    (user.user_metadata as { commitment_uren?: unknown } | undefined)
      ?.commitment_uren,
  );
  const commitmentUren: CommitmentUren | null =
    ruwUren === 2 || ruwUren === 4 || ruwUren === 6 ? ruwUren : null;

  // Modus-detectie voor universele /vandaag-route.
  // sprint = standaard (zoals voorheen).
  // core   = laad Core-content uit lib/playbook/core-dagen.ts.
  // pro    = bovenaan al via redirect afgehandeld, komt hier niet door.
  const modus: Modus = modusVoorDagTeller;

  const coreDtt: DTTInput | null = (profile as any)?.core_dtt ?? null;
  const coreBracket = bracketVoorDTT(coreDtt);
  const crossModusVoltooiingenMap = await haalAlleVoltooiingenVoorUser(
    supabase,
    user.id,
  );
  // Voor server-naar-client serialisatie omzetten naar plain object.
  const crossModusVoltooiingen: Record<
    string,
    { voltooid: boolean; modus: Modus | null; datum: string | null }
  > = {};
  crossModusVoltooiingenMap.forEach((v, k) => {
    crossModusVoltooiingen[k] = v;
  });

  let dagData;
  if (modus === "core") {
    // Core: 21 V9-ankerstappen (skill-fase) + 19 verankering + lifetime.
    if (dag <= 21) {
      dagData = CORE_V9_STAPPEN.find((s) => s.nummer === dag) ?? null;
    } else if (dag <= 40) {
      dagData = genereerVerankeringsDag(dag);
    } else {
      dagData = genereerLifetimeDag(dag);
    }
    if (!dagData) redirect("/dashboard");

    // Voeg DMO-stappen toe als afvinkbare taken TUSSEN skill-stappen en
    // afsluit-stappen (sponsor-checkin/momentum-radar/partner-check).
    // Zo zijn DMO-acties echte stappen met actie-routes, niet alleen
    // info in een uitklap-zone. V9 gebruikt prefix "core-v9-stap${N}",
    // verankering/lifetime gebruiken nog "core-dag${N}".
    const dmoTaken = genereerDMOStappen(dag, coreBracket, {
      bestellinksGekoppeld: dag >= 4,
      eersteKlantenStapVoorbij: dag >= 12,
    });
    const corePrefix = dag <= 21 ? "core-v9-stap" : "core-dag";
    const afsluitPrefixen = [
      `${corePrefix}${dag}-sponsor-checkin`,
      `${corePrefix}${dag}-momentum-radar`,
      `${corePrefix}${dag}-partner-check`,
    ];
    const skillStappen = dagData.vandaagDoen.filter(
      (t) => !afsluitPrefixen.includes(t.id),
    );
    const afsluitTaken = dagData.vandaagDoen.filter((t) =>
      afsluitPrefixen.includes(t.id),
    );
    dagData = {
      ...dagData,
      vandaagDoen: [...skillStappen, ...dmoTaken, ...afsluitTaken],
    };
  } else if (dag >= 22) {
    // Sprint dag 22-60: weekritme-modus.
    dagData = genereerWeekritmeDag(dag, commitmentUren);
    if (!dagData) redirect("/dashboard");
  } else {
    // Sprint dag 1-21: statische basis uit DAGEN[].
    dagData = DAGEN.find((d) => d.nummer === dag);
    if (!dagData) redirect("/dashboard");
    dagData = pasTempoToeOpDag(dagData, commitmentUren);
  }

  // Founder-overrides toepassen. BELANGRIJK: playbook_overrides en
  // de "sprint-dag" namespace zijn historisch alleen voor Sprint
  // gebruikt. Core skill-dagen (1-21) draaien sinds 2026-05-30 op V9
  // en gebruiken namespace "core-v9-stap". Verankering/lifetime
  // (dag 22+) blijven op "core-dag". Pro werkt nu nog niet via deze
  // route.
  const dagNamespace =
    modus === "core"
      ? dag <= 21
        ? "core-v9-stap"
        : "core-dag"
      : "sprint-dag";

  if (modus !== "core") {
    // playbook_overrides is een platte tabel zonder modus-veld, dus
    // we passen 'm alleen toe op Sprint (de oorspronkelijke gebruiker).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overrideMap = await haalOverrides(supabase as any, [dag]);
    dagData = pasOverrideToe(dagData, overrideMap.get(dag) ?? null);
  }

  // Namespace-style overrides laden. Core leest core-dag, Sprint
  // leest sprint-dag. Beide gebruiken pasSprintDagOverridesToe omdat
  // die functie generiek op een Map<string,string> werkt; de naam is
  // historisch en zegt niets over de modus.
  const tekstOverrides = await haalTekstOverridesMulti(supabase, [
    dagNamespace,
    "sprint-ui",
    "sprint-groet",
  ]);
  dagData = pasSprintDagOverridesToe(
    dagData,
    tekstOverrides.get(dagNamespace),
  );
  const uiOverrides = namespaceAlsRecord(tekstOverrides, "sprint-ui");
  const groetOverrides = namespaceAlsRecord(
    tekstOverrides,
    "sprint-groet",
  );

  // Cross-modus skip: taken waarvan de cross-modus slug al in een andere
  // modus is afgevinkt, verbergen we vandaag. Member die Sprint→Core (of
  // omgekeerd) switcht ziet die taken niet meer in dag 1 van de nieuwe
  // modus, want het werk is al gedaan. Mapping leeft sinds 2026-05-20
  // centraal in lib/onboarding/taak-cross-modus.ts (B5-fix).

  // Lege-widget filter: als er geen partners en geen momentum-acties
  // zijn, slaan we die taken helemaal over. Geen 'kijk maar je hebt
  // geen partners'-tussenscherm, gewoon niet zichtbaar.
  const heeftRadarItems = radarItems.length > 0;
  const { count: partnerCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("sponsor_id", user.id);
  const heeftPartners = (partnerCount ?? 0) > 0;

  dagData = {
    ...dagData,
    vandaagDoen: dagData.vandaagDoen.filter((t) => {
      const slug = TAAK_NAAR_CROSS_MODUS_SLUG[t.id];
      if (slug && crossModusVoltooiingenMap.get(slug)?.voltooid) return false;
      if (t.inlineEmbed === "momentum-radar" && !heeftRadarItems) return false;
      if (t.inlineEmbed === "partner-check" && !heeftPartners) return false;
      return true;
    }),
  };

  // Media-blokken (video/afbeelding/pdf) op 5 vaste posities. Server
  // genereert signed URLs voor upload-types; we serialiseren de Map
  // naar Record voor server→client prop-passing.
  const paginaBlokkenMap = await haalPaginaBlokken(
    supabase,
    dagNamespace,
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

  // Admin-rail status berekenen voor SetupPopup. Aantal items waarvan
  // de slug nog NIET in onboarding_voltooiingen staat.
  const adminOpen = ADMIN_ITEMS.filter(
    (it) => !crossModusVoltooiingenMap.get(it.slug)?.voltooid,
  ).length;
  const setupPopupOverrides = await haalTekstOverrides(
    supabase,
    "setup-popup",
  );

  // Modus-keuze check. Voor Sprint = commitment_uren (zit in user_metadata,
  // NIET in profiles), voor Core = profiles.core_dtt.
  // Drie scenario's:
  //   - Keuze mist, modus is nieuw (geen startdatum)        → redirect naar /onboarding
  //   - Keuze mist, modus was eerder al actief              → kleine banner met oppakken/opnieuw-keuze
  //   - Keuze al gemaakt                                     → niets, /vandaag laadt normaal
  // Pro slaat deze check over.
  const sprintTempoIngevuld = commitmentUren !== null;
  const coreDttIngevuld = !!(profile as any)?.core_dtt;
  const modusKeuzeMist =
    (modus === "core" && !coreDttIngevuld) ||
    (modus === "sprint" && !sprintTempoIngevuld);
  const hadEerderDezeModus =
    modus === "core"
      ? !!(profile as any)?.core_startdatum
      : !!(profile as any)?.sprint_startdatum;

  // Pre-day-1-redirect alleen voor NIEUWE gebruikers (onboarding_stap < 99).
  // Bestaande pilot-leden die nooit door de nieuwe pre-day-1 zijn gelopen
  // hebben modus-keuze leeg maar onboarding_stap = 99 (oude flow). Voor
  // hen géén redirect, anders ontstaat een loop tussen /vandaag en
  // /onboarding (onboarding zelf stuurt onboarding_stap >= 99 ook terug
  // naar /vandaag). Voor bestaande leden volstaat de banner.
  const onboardingStapNum = Number(
    (user.user_metadata as { onboarding_stap?: number } | undefined)
      ?.onboarding_stap ?? 1,
  );
  if (
    modusKeuzeMist &&
    (modus === "sprint" || modus === "core") &&
    !hadEerderDezeModus &&
    onboardingStapNum < 99
  ) {
    redirect("/onboarding");
  }

  const modusSwitchOverrides = await haalTekstOverrides(
    supabase,
    "modus-switch",
  );

  return (
    <>
      {modusKeuzeMist && (modus === "sprint" || modus === "core") && (
        <ModusSwitchBanner
          modus={modus}
          hadEerderDezeModus={hadEerderDezeModus}
          laatsteDagInDezeModus={hadEerderDezeModus ? dag : null}
          isFounder={isFounder}
          overrides={modusSwitchOverrides}
        />
      )}
      {adminOpen > 0 && (
        <SetupPopup
          aantalOpen={adminOpen}
          isFounder={isFounder}
          overrides={setupPopupOverrides}
        />
      )}
      {/* Side-flow tussen-scherm. Vanaf dag 2 voor Core members met
          openstaande sideflow blokkeert 'r de dag-content totdat 'r
          een bewuste keuze wordt gemaakt (open of bewust overslaan).
          Overslaan = sessionStorage-vlag, komt volgend bezoek terug. */}
      <SideflowGate aanRaad={sideflowAanRaad}>
        <VandaagFlow
          dag={dagData}
          voltooidIds={voltooidIds}
          initialZinnen={initialZinnen}
          voornaam={voornaam}
          isFounder={isFounder}
          isTester={isTester}
          uiOverrides={uiOverrides}
          groetOverrides={groetOverrides}
          paginaBlokken={paginaBlokken}
          commitmentUren={commitmentUren}
          radarItems={radarItems}
          radarInitieelAfgevinkt={Array.from(afvinkSets.vandaagAfgevinkt)}
          modus={modus}
          coreBracket={coreBracket}
          crossModusVoltooiingen={crossModusVoltooiingen}
        />
      </SideflowGate>
      {/* Dag-flow draait zonder AppShell, dus de Wat nu?-knop hier apart
          mounten. Geen sidebar in deze flow, dus links in het vrije vlak. */}
      <WatNuKnop />
    </>
  );
}

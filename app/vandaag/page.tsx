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
  CORE_DAGEN,
  genereerVerankeringsDag,
  genereerLifetimeDag,
} from "@/lib/playbook/core-dagen";
import { detecteerEnVierEerstePartner } from "@/lib/team/mijlpaal-detector";
import { pakTopRadar, type ProspectInput } from "@/lib/radar/volgende-beste-actie";
import { haalRadarAfvinkSets } from "@/lib/radar/carry-over";
import { bracketVoorDTT, type DTTInput } from "@/lib/dtt/advies";
import { genereerDMOStappen } from "@/lib/dtt/dmo-stappen";
import { haalAlleVoltooiingenVoorUser, type Modus } from "@/lib/onboarding/voltooiingen";
import type { CommitmentUren } from "@/lib/dagdoelen";
import { VandaagFlow } from "./vandaag-flow";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { SetupPopup } from "@/components/setup/SetupPopup";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { dagVoorModus, startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { ModusSwitchBanner } from "@/components/vandaag/ModusSwitchBanner";

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
      "run_startdatum, sprint_startdatum, core_startdatum, created_at, full_name, role, is_tester, modus, core_dtt, core_eigen_resultaat, commitment_uren",
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
    isFounder && sp.dag ? Number.parseInt(sp.dag, 10) : NaN;
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

  // Modus-detectie voor universele /vandaag-route.
  // sprint = standaard (zoals voorheen).
  // core   = laad Core-content uit lib/playbook/core-dagen.ts.
  // pro    = nog niet gemigreerd, valt terug op sprint-content.
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
    // Core: 21 skill-dagen + 19 verankering + lifetime daarna.
    if (dag <= 21) {
      dagData = CORE_DAGEN.find((d) => d.nummer === dag) ?? null;
    } else if (dag <= 40) {
      dagData = genereerVerankeringsDag(dag);
    } else {
      dagData = genereerLifetimeDag(dag);
    }
    if (!dagData) redirect("/dashboard");

    // Voeg DMO-stappen toe als afvinkbare taken TUSSEN skill-stappen en
    // afsluit-stappen (sponsor-checkin/momentum-radar/partner-check).
    // Zo zijn DMO-acties echte stappen met actie-routes, niet alleen
    // info in een uitklap-zone.
    const dmoTaken = genereerDMOStappen(dag, coreBracket, {
      bestellinksGekoppeld: dag >= 4,
      eersteKlantenStapVoorbij: dag >= 12,
    });
    const afsluitPrefixen = [
      `core-dag${dag}-sponsor-checkin`,
      `core-dag${dag}-momentum-radar`,
      `core-dag${dag}-partner-check`,
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
  // gebruikt. Core krijgt een eigen namespace "core-dag" zodat
  // Sprint-edits niet over Core dag 1 heen schuiven (en omgekeerd).
  // Pro werkt nu nog niet via deze route.
  const dagNamespace = modus === "core" ? "core-dag" : "sprint-dag";

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
  // modus, want het werk is al gedaan.
  const taakNaarCrossModusSlug: Record<string, string> = {
    "dag1-vcard": "vcard-import-gedaan",
    "dag1-sponsor": "sponsor-eerste-bericht",
    "core-dag1-vcard-import": "vcard-import-gedaan",
    "core-dag1-sponsor-bericht": "sponsor-eerste-bericht",
  };

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
      const slug = taakNaarCrossModusSlug[t.id];
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

  // Modus-keuze check. Voor Sprint = commitment_uren, voor Core = core_dtt.
  // Drie scenario's:
  //   - Keuze mist, modus is nieuw (geen startdatum)        → redirect naar /onboarding
  //   - Keuze mist, modus was eerder al actief              → kleine banner met oppakken/opnieuw-keuze
  //   - Keuze al gemaakt                                     → niets, /vandaag laadt normaal
  // Pro slaat deze check over.
  const profCommitment = Number((profile as any)?.commitment_uren ?? NaN);
  const sprintTempoIngevuld =
    profCommitment === 2 || profCommitment === 4 || profCommitment === 6;
  const coreDttIngevuld = !!(profile as any)?.core_dtt;
  const modusKeuzeMist =
    (modus === "core" && !coreDttIngevuld) ||
    (modus === "sprint" && !sprintTempoIngevuld);
  const hadEerderDezeModus =
    modus === "core"
      ? !!(profile as any)?.core_startdatum
      : !!(profile as any)?.sprint_startdatum;

  if (modusKeuzeMist && (modus === "sprint" || modus === "core") && !hadEerderDezeModus) {
    // Nieuwe modus, modus-keuze ontbreekt: stuur de gebruiker eerst door
    // pre-day-1 naar de modus-keuze. Geen banner-overlap meer op /vandaag.
    redirect("/onboarding");
  }

  const modusSwitchOverrides = await haalTekstOverrides(
    supabase,
    "modus-switch",
  );

  return (
    <>
      {modusKeuzeMist && (modus === "sprint" || modus === "core") && hadEerderDezeModus && (
        <ModusSwitchBanner
          modus={modus}
          hadEerderDezeModus={hadEerderDezeModus}
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
        modus={modus}
        coreBracket={coreBracket}
        crossModusVoltooiingen={crossModusVoltooiingen}
      />
    </>
  );
}

import { createClient } from "@/lib/supabase/server";
import { differenceInDays, format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import Link from "next/link";
import { DagelijkseStat, Herinnering, WhyProfile } from "@/lib/supabase/types";
// DagStatForm verwijderd van dashboard — handmatig stats invullen
// hoort op /statistieken (en wordt straks automatisch gevuld door
// pipeline-veranderingen).
import { PlaybookDagTile } from "@/components/playbook/PlaybookDagTile";
import { DailyFocusModal } from "@/components/playbook/DailyFocusModal";
import { TesterToolbar } from "@/components/tester/TesterToolbar";
import { DAGEN } from "@/lib/playbook/dagen";
import { haalOverrides, pasOverrideToe } from "@/lib/playbook/overrides";
import { getServerTaal, v } from "@/lib/i18n/server";
import { Locale } from "date-fns";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

function berekenDag(runStartdatum: string | null): number {
  const start = runStartdatum ? new Date(runStartdatum) : new Date();
  const dag = differenceInDays(new Date(), start) + 1;
  return Math.max(1, Math.min(60, dag));
}

export default async function DashboardPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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
    { data: klaarVoorDrieweg },
  ] = await Promise.all([
    supabase.from("profiles").select("run_startdatum, role, is_tester, dagelijkse_push_aan, dagelijkse_push_uur").eq("id", user.id).maybeSingle(),
    supabase.from("why_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("dagelijkse_stats").select("*").eq("user_id", user.id).eq("stat_datum", vandaagStr).maybeSingle(),
    supabase.from("herinneringen").select("*, prospect:prospects(id, volledige_naam)").eq("user_id", user.id).lte("vervaldatum", vandaagStr).eq("voltooid", false).order("vervaldatum", { ascending: true }).limit(5),
    supabase.from("prospects").select("pipeline_fase").eq("user_id", user.id).eq("gearchiveerd", false),
    // Alle voltooide playbook-taken voor deze user — gebruikt voor de
    // 'Vandaag is dag X'-tegel én voor de admin-reminders van vorige dagen.
    supabase.from("dag_voltooiingen").select("dag_nummer, taak_id").eq("user_id", user.id),
    // Auto-trigger 3-weg: prospects die klaar zijn voor een 3-weg-gesprek.
    // Criteria: pipeline_fase 'presentatie' OF 'one_pager' (= test bekeken
    // / ingevuld), niet gearchiveerd, gesorteerd op laatste-update.
    supabase
      .from("prospects")
      .select("id, volledige_naam, pipeline_fase, updated_at")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false)
      .in("pipeline_fase", ["presentatie", "one_pager"])
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const dag = berekenDag((profile as any)?.run_startdatum ?? null);
  const isLeider = (profile as any)?.role === "leider";
  const isFounder = (profile as any)?.role === "founder";
  const isTester = (profile as any)?.is_tester === true;
  const pushAan = (profile as any)?.dagelijkse_push_aan ?? false;
  const pushUur = (profile as any)?.dagelijkse_push_uur ?? 7;

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
  // eenmalig naar DB en blijft de bevestiging consistent — handig voor
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

  // Streak-berekening — hoeveel dagen op rij heeft de member iets
  // afgevinkt? Telt vanaf vandaag terug. Géén stilte-dagen tussendoor.
  // Voor motivatie-tegel "🔥 X dagen op rij".
  const voltooidPerDag = new Map<number, boolean>();
  for (const v of (dagVoltooiingen as Array<{
    dag_nummer: number;
    taak_id: string;
  }>) || []) {
    voltooidPerDag.set(v.dag_nummer, true);
  }
  let streak = 0;
  for (let i = dag; i >= 1; i--) {
    if (voltooidPerDag.has(i)) streak++;
    else break;
  }

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

  // Huidige dag-data uit het 21-daagse playbook (alleen relevant voor
  // dag 1-21 — daarna draait de gebruiker op weekritme).
  let huidigeDagData = dag <= 21
    ? DAGEN.find((d) => d.nummer === dag) ?? null
    : null;
  // Override toepassen — founders kunnen via /instellingen/playbook
  // teksten aanpassen zonder code-deploy. haalOverrides faalt stilletjes
  // als de tabel nog niet bestaat (returnt lege map), zodat de tile
  // gewoon de hardcoded versie blijft tonen.
  if (huidigeDagData) {
    const overrideMap = await haalOverrides(supabase as any, [dag]);
    huidigeDagData = pasOverrideToe(
      huidigeDagData,
      overrideMap.get(dag) ?? null,
    );
  }
  const huidigeDagVoltooidIds = huidigeDagData
    ? huidigeDagData.vandaagDoen
        .filter((t) => voltooidSet.has(`${dag}|${t.id}`))
        .map((t) => t.id)
    : [];

  // Eerder geschreven inline-zinnen voor de huidige dag voorladen,
  // zodat /mijn-zinnen-content meteen in de tile zichtbaar is.
  const huidigeInlineSlugs = huidigeDagData
    ? huidigeDagData.vandaagDoen
        .map((t) => t.inlineActie?.slug)
        .filter((s): s is string => !!s)
    : [];
  let huidigeInitialZinnen: Record<string, string> = {};
  if (huidigeInlineSlugs.length > 0) {
    const { data: zinnen } = await supabase
      .from("eigen_zinnen")
      .select("slug, waarde")
      .eq("user_id", user.id)
      .in("slug", huidigeInlineSlugs);
    for (const r of (zinnen as Array<{ slug: string; waarde: string }>) || []) {
      huidigeInitialZinnen[r.slug] = r.waarde;
    }
  }

  // Reminders voor onvoltooide ADMIN-taken van vorige dagen — krediet,
  // webshop, teams-admin, bestellinks. Eric Worre tip is geen reminder
  // (doorlopend, geen one-shot taak). We tonen ook missed verplichte
  // taken alleen voor admin-stappen — niet alle gemiste invites etc.
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
    prospect: "text-[#CCCCCC]", uitgenodigd: "text-[#4A9EDB]",
    one_pager: "text-[#7A6ADB]", presentatie: "text-[#9A6ADB]",
    followup: "text-cm-gold", not_yet: "text-[#DB6A6A]",
    shopper: "text-[#4ACB6A]", member: "text-[#E8C96B]",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header — warme groet, dag-nummer prominent */}
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {dag === 1 ? (
            <>Daar gaan we! 🚀 — <span className="text-cm-gold">Dag 1</span></>
          ) : dag <= 21 ? (
            <>Goedemorgen! ☀️ — {v("dashboard.dag", taal)}{" "}
              <span className="text-cm-gold">{dag}</span>{" "}
              {v("dashboard.van_60", taal)}
            </>
          ) : (
            <>{v("dashboard.dag", taal)}{" "}
              <span className="text-cm-gold">{dag}</span>{" "}
              {v("dashboard.van_60", taal)}
            </>
          )}
        </h1>
        <p className="text-cm-white mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: datumLocale })}
        </p>
      </div>

      {/* Voortgang */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            {v("dashboard.voortgang", taal)}
          </h2>
          <span className="text-cm-gold text-sm font-semibold">{Math.round((dag / 60) * 100)}%</span>
        </div>
        <div className="h-3 bg-cm-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-gold rounded-full transition-all duration-1000" style={{ width: `${(dag / 60) * 100}%` }} />
        </div>
        <p className="text-cm-white text-xs mt-2">{60 - dag} {v("dashboard.dagen_te_gaan", taal)}</p>
      </div>

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

      {/* Daily-focus modal — opent bij eerste bezoek van de dag met
          alleen de essentie (titel + checklist + 'Aan de slag'-knop)
          om overweldiging te voorkomen. Sluiten = vandaag niet meer
          tonen (per localStorage flag). */}
      {huidigeDagData && (
        <DailyFocusModal
          key={`focus-${dag}`}
          dag={huidigeDagData}
          voltooidAantal={huidigeDagVoltooidIds.length}
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
                dagen op rij — hou vol!
              </p>
            </div>
          )}
          {week3Klaar ? (
            <div className="flex-1 min-w-[200px] rounded-lg border border-cm-gold/60 bg-cm-gold/15 px-3 py-2.5">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                🏆 21 dagen klaar!
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                Te gek — fase 1 t/m 3 voltooid. Dit is je startlijn voor de
                volgende 40 dagen.
              </p>
            </div>
          ) : week2Klaar ? (
            <div className="flex-1 min-w-[200px] rounded-lg border border-cm-gold/60 bg-cm-gold/15 px-3 py-2.5">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                🏁 Halverwege!
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                Twee weken in — jij hoort bij de 20% die doorzet. Door zo!
              </p>
            </div>
          ) : week1Klaar ? (
            <div className="flex-1 min-w-[200px] rounded-lg border border-cm-gold/60 bg-cm-gold/15 px-3 py-2.5">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                🎉 Eerste week klaar!
              </p>
              <p className="text-cm-white text-sm font-medium mt-0.5">
                Top — week 1 zit erop. Het ritme zit er nu in. Op naar fase 2!
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Tester-toolbar — alleen voor pilot-testers + founders.
          Verzet run_startdatum zodat je virtueel op een andere dag zit
          en zo door alle 21 dagen kan klikken voor bug-rapporten. */}
      {(isTester || isFounder) && dag <= 21 && (
        <TesterToolbar huidigeDag={dag} />
      )}

      {/* Vandaag is dag X — playbook-tegel met checklist + films.
          key={dag} forceert een remount bij dag-wissel (bv. via tester-
          toolbar) zodat actueleTekst-state mee-resync't met de nieuwe
          dag-prop ipv blijft hangen op de oude waarden. */}
      {huidigeDagData && (
        <PlaybookDagTile
          key={`dag-${dag}`}
          dag={huidigeDagData}
          initialVoltooidIds={huidigeDagVoltooidIds}
          initialZinnen={huidigeInitialZinnen}
          isFounder={isFounder}
        />
      )}

      {/* Auto-trigger 3-weg — prospects in pipeline-fase 'one_pager' of
          'presentatie' wachten op een 3-weg-gesprek. Inklapbare details/
          summary zodat het op het dashboard niet gelijk veel ruimte
          inneemt. Klik op een naam → naar prospect-kaart, waar de
          3-weg-balk pulseert (zie /namenlijst/[id]/page).
          Geen kandidaten = tegel verbergt automatisch. */}
      {Array.isArray(klaarVoorDrieweg) && klaarVoorDrieweg.length > 0 && (
        <details className="card border-l-4 border-cm-gold/60 group">
          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
            <div className="flex-1 min-w-0">
              <h3 className="text-cm-gold font-semibold flex items-center gap-2">
                🤝 Wie is klaar voor een 3-weg gesprek?
              </h3>
              <p className="text-cm-white opacity-60 text-xs mt-1">
                {klaarVoorDrieweg.length} prospect
                {klaarVoorDrieweg.length === 1 ? "" : "s"} — open om te zien wie
              </p>
            </div>
            <span className="text-cm-gold text-xs transition-transform group-open:rotate-180 flex-shrink-0">
              ▼
            </span>
          </summary>
          <div className="mt-3 pt-3 border-t border-cm-border space-y-2">
            <p className="text-cm-white opacity-60 text-xs">
              Klik op een prospect — op zijn kaart pulseert de 3-weg-balk om
              je naar de juiste plek te brengen. Eenmaal het 3-weg-gesprek
              gehad? Verplaats hem in de pipeline (bv. naar "Shopper", "Member"
              of "Not yet") — dan verdwijnt hij hier automatisch.
            </p>
            {(klaarVoorDrieweg as Array<{
              id: string;
              volledige_naam: string;
              pipeline_fase: string;
            }>).map((p) => (
              <Link
                key={p.id}
                href={`/namenlijst/${p.id}?actie=drieweg`}
                className="flex items-center justify-between gap-3 bg-cm-surface-2 hover:bg-cm-surface-3 rounded-lg px-3 py-2.5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-cm-white text-sm font-medium truncate">
                    {p.volledige_naam}
                  </p>
                  <p className="text-cm-white text-xs opacity-50 capitalize">
                    {p.pipeline_fase === "one_pager"
                      ? "info bekeken"
                      : "presentatie gehad"}
                  </p>
                </div>
                <span className="text-cm-gold text-xs whitespace-nowrap">
                  Start 3-weg →
                </span>
              </Link>
            ))}
          </div>
        </details>
      )}

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
          'Vandaag bijhouden'-stat-form en de pipeline-grid zijn ook weg —
          die data hoort op /statistieken (zit daar al), en wordt straks
          automatisch gevuld door pipeline-veranderingen ipv handmatig
          tellen op het dashboard. */}

      <div className="space-y-4">
          {/* WHY kaart — ingeklapt (details/summary), user klapt uit om te lezen */}
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
                      Jouw opgeslagen why — bekijk &lsquo;m regelmatig
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

      {/* Instellingen — compacte status-regel. Eén bron van waarheid (/instellingen). */}
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

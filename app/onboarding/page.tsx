"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PushNotificationToggle } from "@/components/pwa/PushNotificationToggle";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { MediaBlokkenClient } from "@/components/cms/MediaBlokkenClient";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { AlGedaanLabel } from "@/components/onboarding/AlGedaanLabel";
import { Stap4ModusKeuze } from "@/components/onboarding/Stap4ModusKeuze";
import { NamenForm } from "@/components/vandaag/inline-embeds/NamenForm";
import type { Modus } from "@/lib/onboarding/voltooiingen";

const SPONSOR_TEL = "https://wa.me/31612345678"; // fallback, wordt dynamisch geladen

// De oude Stap4NamenlijstInline (5 namen verplicht in onboarding) is per
// 2026-05-13 weggehaald. Dat dubbelde met dag 1 + dag 2 in het 21-daagse
// playbook (5 namen op dag 1, 20 namen op dag 2). Onboarding gaat nu in
// 5 stappen: Welkom+app, WHY, Run-uitleg, Script, Dagdoelen+Mentor.

export default function OnboardingPagina() {
  const [stap, setStap] = useState(1);
  const [laden, setLaden] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  // commitmentUren = het tempo dat de gebruiker kiest in stap 5 (Fundament/
  // Bouwen/Doorbreken = 2/4/6 uur per dag). Daaruit leiden we de concrete
  // dagdoelen af via berekenDagdoelen() in lib/dagdoelen.ts. Lichte
  // backwards-compat: oudere users kunnen nog losse dagdoel-velden in
  // user_metadata hebben - die negeren we, want de nieuwe waarheid is
  // commitment_uren.
  const [bezig, setBezig] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sponsorNaam, setSponsorNaam] = useState("");
  const [sponsorWaLink, setSponsorWaLink] = useState("");
  const [modus, setModus] = useState<Modus>("sprint");
  const [dttAlIngevuld, setDttAlIngevuld] = useState(false);
  const [voltooiingen, setVoltooiingen] = useState<
    Record<string, { voltooid: boolean; modus: string | null; datum: string | null }>
  >({});
  // Founder-edit state: ophalen via /api/cms/overrides bij mount.
  // Members krijgen lege map + isFounder=false → niets visueel.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [isFounder, setIsFounder] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Founder-overrides ophalen bij mount (1× fetch voor alle EditableTekst)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms/overrides?namespace=onboarding")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.overrides) setOverrides(data.overrides);
        if (data.isFounder) setIsFounder(true);
      })
      .catch(() => {
        // tabel ontbreekt of netwerk-fout, gewoon members-mode
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview") === "true";
    setIsPreview(preview);

    // ?stap=N, directe deeplink. Range 1-4 (was 1-5 toen scripts er nog
    // in zaten, 1-6 toen ook namenlijst er in zat, en 1-11 toen ook de
    // admin-stappen erin zaten; scripts staat nu in dag 2 van het
    // playbook, namen + admin in dag 1-4).
    const stapParam = Number(params.get("stap"));
    const directeStap =
      Number.isFinite(stapParam) && stapParam >= 1 && stapParam <= 4
        ? stapParam
        : null;

    async function laadGegevens() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      if (user?.user_metadata?.full_name) {
        setGebruikersnaam(user.user_metadata.full_name.split(" ")[0]);
      } else if (user?.email) {
        setGebruikersnaam(user.email.split("@")[0]);
      }

      // Modus + sponsor + DTT-status laden uit profiles
      const { data: prof } = await supabase
        .from("profiles")
        .select("modus, sponsor_id, core_dtt")
        .eq("id", user.id)
        .maybeSingle();
      const profData = (prof as {
        modus?: string | null;
        sponsor_id?: string | null;
        core_dtt?: unknown;
      } | null) ?? {};

      // Per 2026-05-19 (fase 3b): geen impliciete Sprint-fallback meer.
      // Gebruikers zonder modus moeten eerst expliciet kiezen via
      // /welkom-keuze. Anders glipt iemand impliciet de Sprint-flow in
      // (K2).
      if (!profData.modus) {
        router.push("/welkom-keuze");
        return;
      }
      const m = profData.modus === "core" ? "core" : "sprint";
      setModus(m);
      setDttAlIngevuld(!!profData.core_dtt);

      if (profData.sponsor_id) {
        const { data: sponsor } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", profData.sponsor_id)
          .single();
        if (sponsor) {
          const s = sponsor as { full_name: string };
          setSponsorNaam(s.full_name);
          setSponsorWaLink(
            `https://wa.me/?text=Hoi%20${encodeURIComponent(s.full_name)}%2C%20ik%20heb%20een%20vraag%20over%20de%20setup`,
          );
        }
      }

      // Cross-modus voltooiingen ophalen voor skip-detectie (stap 1-3)
      try {
        const r = await fetch("/api/onboarding/markeer-voltooid");
        if (r.ok) {
          const data = await r.json();
          if (data?.voltooiingen) setVoltooiingen(data.voltooiingen);
        }
      } catch {
        // netwerk-fout, gewoon geen skip-detectie
      }

      const huidigStap = Number(user?.user_metadata?.onboarding_stap || 1);
      // Alleen redirecten naar dashboard als gebruiker al klaar is EN
      // GEEN expliciete ?stap=N is meegegeven.
      if (huidigStap >= 99 && !preview && directeStap === null) {
        router.push("/vandaag");
        return;
      }

      // Prioriteit: ?stap (deeplink) > preview-modus (start bij 1) > opgeslagen huidigStap
      setStap(directeStap ?? (preview ? 1 : huidigStap));
      setLaden(false);
    }
    laadGegevens();
  }, []);

  async function slaVoortgangOp(velden: Record<string, boolean>) {
    if (isPreview || !userId) return;
    await supabase
      .from("onboarding_voortgang")
      .upsert({ user_id: userId, ...velden, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  }

  async function stuurPushNaarSponsor(stapNaam: string) {
    if (isPreview) return;
    try {
      await fetch("/api/onboarding/stap-voltooid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stap: stapNaam }),
      });
    } catch (e) { /* stil falen */ }
  }

  /**
   * Verplaats de gebruiker naar de volgende stap.
   *
   * @param nieuweStap  Stap-nummer waar we heen gaan.
   * @param voltooid    True = de huidige stap is écht voltooid (zet
   *                    boolean op true, stuurt push naar sponsor).
   *                    False = stap is overgeslagen ("doe ik later").
   *                    Boolean blijft false zodat dashboard-tegel hem
   *                    later als open taak kan tonen.
   */
  async function gaNaarStap(nieuweStap: number, voltooid: boolean = true) {
    setBezig(true);
    if (!isPreview) {
      await supabase.auth.updateUser({ data: { onboarding_stap: nieuweStap } });

      // Mapping: WANNEER je naar stap N gaat, dan was stap N-1 (deze actie)
      // dus zojuist afgerond. Veldnaam = welke kolom in onboarding_voortgang
      // hoort bij die stap. Push-naam = wat de sponsor in zijn bel ziet.
      // Onboarding telt 4 stappen. Eerder geverhuisde inhoud:
      // - Namenlijst (5 namen) -> dag 1 van het playbook
      // - Scripts (Honest Conversation) -> dag 2, samen met sponsor-call
      // - Admin (webshop, kredietformulier, Teams, bestellinks) -> dag 2-4
      // De finale stap is nu 'tempo kiezen' (commitment_uren) en daarna
      // doorrollen naar dag 1 in /vandaag. DB-veldnamen ongewijzigd voor
      // backwards-compat (stap_3_namen is historisch zo genoemd).
      // Push-teksten zijn modus-bewust. Stap 4 was eerst "begrijpt de
      // 60-dagenrun" (Sprint-only). Nu een neutralere zin die voor
      // Sprint, Core én Pro past.
      const stapActies: Record<number, { veld?: string; pushNaam: string }> = {
        2: { veld: "stap_1_welkom", pushNaam: "heeft de app geïnstalleerd 📱" },
        3: { veld: "stap_2_run",    pushNaam: "heeft de eerste 5 namen op de lijst gezet ✍️" },
        4: {
          veld: "stap_3_namen",
          pushNaam:
            modus === "core"
              ? "is klaar voor dag 1 in Core 🚶"
              : "is klaar voor dag 1 in Sprint 🏃",
        },
      };

      if (stapActies[nieuweStap]) {
        const { veld, pushNaam } = stapActies[nieuweStap];
        if (veld) {
          // Bij voltooid: true. Bij overgeslagen: false (zodat dashboard
          // 'm als open taak kan tonen).
          await slaVoortgangOp({ [veld]: voltooid });
        }
        if (voltooid) {
          await stuurPushNaarSponsor(pushNaam);
        }
      }
    }
    setStap(nieuweStap);
    setBezig(false);
    scrollNaarBoven();
  }

  function scrollNaarBoven() {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Stap 4 (modus-keuze + opslag) is verhuisd naar de Stap4ModusKeuze-
  // component (zowel Sprint-tempo-cards als Core-DTT-form). De oude
  // slaDoelOp() is daarmee overbodig en weggehaald.


  // In preview-modus: toon sponsor-blokken altijd (met voorbeeldnaam als er geen sponsor is)
  const toonSponsorNaam = sponsorNaam || (isPreview ? "jouw sponsor" : "");
  const toonSponsorLink = sponsorWaLink || (isPreview ? "#" : "");

  if (laden) {
    return (
      <div className="min-h-screen bg-cm-black flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce delay-100" />
          <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce delay-200" />
        </div>
      </div>
    );
  }

  const totaalStappen = 4;
  const voortgang = stap <= totaalStappen ? ((stap - 1) / totaalStappen) * 100 : 100;

  return (
    <EditModeProvider>
    <div className="min-h-screen bg-cm-black flex flex-col">
      {/* Header */}
      <div className="border-b border-cm-border p-4 flex items-center justify-between sticky top-0 bg-cm-black z-10">
        <div className="flex items-center gap-3">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-8 w-8" />
          <div>
            <h1 className="text-lg eleva-brand">ELEVA</h1>
            <p className="text-cm-white text-[10px] opacity-60 -mt-0.5">Project Meer Tijd en Vrijheid · Setup</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPreview && (
            <span className="text-xs bg-amber-900/40 border border-amber-600/30 text-amber-400 px-2 py-1 rounded-full">Preview</span>
          )}
          {stap <= totaalStappen && (
            <span className="text-sm text-cm-white opacity-60">Stap {stap} van {totaalStappen}</span>
          )}
        </div>
      </div>

      {/* Founder edit-modus toggle */}
      {isFounder && (
        <div className="px-4 pt-3 max-w-2xl mx-auto w-full">
          <EditModeToggle isFounder={isFounder} />
        </div>
      )}

      {/* Progress bar */}
      {stap <= totaalStappen && (
        <div className="h-1 bg-cm-surface">
          <div className="h-1 bg-cm-gold transition-all duration-500" style={{ width: `${voortgang}%` }} />
        </div>
      )}

      {/* Stap bollen */}
      {stap <= totaalStappen && (
        <div className="flex justify-center gap-2 py-4 px-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              n < stap ? "bg-cm-gold text-cm-black" : n === stap ? "bg-cm-gold/20 border-2 border-cm-gold text-cm-gold" : "bg-cm-surface border border-cm-border text-cm-white opacity-40"
            }`}>
              {n < stap ? "✓" : n}
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 pb-16">

          {/* ───── STAP 1: WELKOM + APP + PUSH ───── */}
          {stap === 1 && (
            <div className="space-y-6">
              <MediaBlokkenClient
                paginaNamespace="onboarding-stap"
                paginaId="stap-1"
                positie="boven-titel"
                isFounder={isFounder}
              />
              {voltooiingen["app-geinstalleerd"]?.voltooid &&
                voltooiingen["app-geinstalleerd"].modus &&
                voltooiingen["app-geinstalleerd"].modus !== modus && (
                  <AlGedaanLabel
                    modus={
                      (voltooiingen["app-geinstalleerd"].modus ?? "sprint") as Modus
                    }
                    datum={voltooiingen["app-geinstalleerd"].datum}
                  />
                )}
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-3xl font-display font-bold text-cm-white mb-2">
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap1.welkom"
                    standaard="Welkom"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="span"
                    hint="Het 'Welkom'-woord, naam wordt er automatisch achter geplakt"
                  />
                  , {gebruikersnaam}!
                </h2>
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap1.intro"
                  standaard="In vier rustige stappen leggen we samen je fundament."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white opacity-60 text-sm"
                  multiline
                  rows={2}
                />
              </div>

              {/* App installeren */}
              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📱</span>
                  <div className="flex-1">
                    <EditableTekst
                      namespace="onboarding"
                      sleutel="stap1.app_install.titel"
                      standaard="Installeer de app op je telefoon"
                      overrides={overrides}
                      isFounder={isFounder}
                      as="p"
                      className="text-[#D4AF37] font-bold text-base"
                      hint="Titel van het app-install-blok"
                    />
                    <EditableTekst
                      namespace="onboarding"
                      sleutel="stap1.app_install.subtitel"
                      standaard="Doe dit nu, zo ontvang je ook meldingen"
                      overrides={overrides}
                      isFounder={isFounder}
                      as="p"
                      className="text-cm-white text-xs opacity-60"
                      hint="Subtitel van het app-install-blok"
                    />
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap1.app_install.iphone.titel"
                    standaard="📱 iPhone (Safari):"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-cm-white text-sm font-semibold"
                    hint="Titel iPhone-stappen"
                  />
                  <EditableBlok
                    namespace="onboarding"
                    sleutel="stap1.app_install.iphone.stappen"
                    standaard="1. Tik op het deel-icoontje onderaan (vierkantje met pijl omhoog)\n2. Kies 'Zet op beginscherm'\n3. Tik op 'Voeg toe'\n4. Open de app daarna vanuit je beginscherm"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="div"
                    className="text-cm-white text-sm opacity-80 whitespace-pre-line"
                    rows={5}
                    hint="iPhone-installatiestappen (1 per regel)"
                  />
                </div>
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap1.app_install.android.titel"
                    standaard="🌟 Android (Chrome):"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-cm-white text-sm font-semibold"
                    hint="Titel Android-stappen"
                  />
                  <EditableBlok
                    namespace="onboarding"
                    sleutel="stap1.app_install.android.stappen"
                    standaard="1. Tik op de drie puntjes rechtsboven\n2. Kies 'Toevoegen aan startscherm'\n3. Tik op 'Toevoegen'"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="div"
                    className="text-cm-white text-sm opacity-80 whitespace-pre-line"
                    rows={4}
                    hint="Android-installatiestappen (1 per regel)"
                  />
                </div>
              </div>

              {/* Push notificaties */}
              <div className="card space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔔</span>
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap1.push.titel"
                    standaard="Schakel meldingen in"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="h3"
                    className="text-cm-gold font-semibold"
                    hint="Titel van het push-notificatie-blok"
                  />
                </div>
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap1.push.uitleg"
                  standaard="Zo mis je geen follow-up herinneringen en kan je sponsor je op de hoogte houden van activiteiten in je team. Dit werkt alleen vanuit de geïnstalleerde app."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm opacity-80 leading-relaxed"
                  rows={3}
                  hint="Uitleg waarom meldingen aan zetten"
                />
                <PushNotificationToggle />
              </div>

              {/* Wat je gaat doen */}
              <div className="card space-y-3">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap1.checklijst.titel"
                  standaard="Wat komt er nog na deze setup?"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h3"
                  className="text-cm-gold font-semibold"
                  hint="Titel boven de checklijst in stap 1"
                />
                <ul className="space-y-2">
                  {[
                    { icoon: "💛", sleutel: "stap1.checklijst.item1", standaard: "Je ontdekt jouw persoonlijke WHY" },
                    { icoon: "📖", sleutel: "stap1.checklijst.item2", standaard: "Je legt je eerste 5 namen vast" },
                    {
                      icoon: "🎯",
                      sleutel: "stap1.checklijst.item3",
                      standaard:
                        modus === "core"
                          ? "Je vult je Doel-Tijd-Termijn in"
                          : "Je kiest jouw tempo voor de komende periode",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-cm-white">
                      <span className="text-xl">{item.icoon}</span>
                      <EditableTekst
                        namespace="onboarding"
                        sleutel={item.sleutel}
                        standaard={item.standaard}
                        overrides={overrides}
                        isFounder={isFounder}
                        as="span"
                        className=""
                        hint={`Checklist-item ${i + 1} in stap 1`}
                      />
                    </li>
                  ))}
                </ul>
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap1.checklijst.uitleg"
                  standaard="Deze setup is het eerste deel van dag 1. Zodra je hier doorheen bent, rol je direct door naar de echte taken van dag 1 (je eerste namen toevoegen, een berichtje naar je sponsor). Samen ben je vandaag goed binnen het uur klaar."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-xs opacity-50 pt-1"
                  rows={3}
                  hint="Uitleg onder de checklijst in stap 1 (dat de onboarding deel van dag 1 is)"
                />
              </div>

              <button onClick={() => gaNaarStap(2)} disabled={bezig} className="btn-gold w-full py-4 text-base font-bold">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap1.knop"
                  standaard="App geïnstalleerd, aan de slag →"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="span"
                  hint="Tekst van de knop onderaan stap 1 (door-naar-stap-2)"
                />
              </button>
            </div>
          )}

          {/* ───── STAP 2: JOUW WHY ───── */}
          {stap === 2 && (
            <div className="space-y-6">
              <MediaBlokkenClient
                paginaNamespace="onboarding-stap"
                paginaId="stap-2"
                positie="boven-titel"
                isFounder={isFounder}
              />
              {voltooiingen["why"]?.voltooid &&
                (voltooiingen["why"].modus &&
                voltooiingen["why"].modus !== modus ? (
                  // WHY eerder gedaan in andere modus.
                  <AlGedaanLabel
                    modus={(voltooiingen["why"].modus ?? "sprint") as Modus}
                    datum={voltooiingen["why"].datum}
                    bekijkRoute="/mijn-why?via=onboarding"
                  />
                ) : (
                  // WHY net in deze sessie afgerond.
                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-emerald-300 font-semibold text-sm">
                        ✓ WHY opgeslagen
                      </p>
                      <p className="text-cm-white text-xs opacity-70 mt-0.5">
                        Verder naar de volgende stap hieronder.
                      </p>
                    </div>
                    <a
                      href="/mijn-why?via=onboarding"
                      className="text-xs bg-cm-surface border border-cm-border text-cm-white px-3 py-1.5 rounded-lg whitespace-nowrap"
                    >
                      Bekijk opnieuw
                    </a>
                  </div>
                ))}
              <div className="text-center">
                <div className="text-6xl mb-4">💛</div>
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap2.titel"
                  standaard="Ontdek jouw WHY"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h2"
                  className="text-2xl font-display font-bold text-cm-white mb-2"
                />
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap2.intro"
                  standaard="Het fundament van alles. Sla deze stap niet over."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white opacity-60 text-sm"
                  multiline
                  rows={2}
                />
              </div>

              {/* Waarom cruciaal */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap2.waarom_titel"
                  standaard="⚡ Waarom deze stap cruciaal is"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-amber-300 font-semibold text-sm flex items-center gap-2"
                  hint="Titel van het waarom-cruciaal-blok in stap 2"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap2.waarom_cruciaal"
                  standaard="Mensen die hun WHY helder hebben gaan veel langer door als het moeilijk wordt. Je WHY is niet 'meer geld verdienen', maar wat dat geld betekent voor jou en je gezin. Als je WHY sterk genoeg is, vind je altijd de weg."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm leading-relaxed opacity-90"
                  rows={4}
                  hint="Waarom-cruciaal-blok van stap 2 (WHY)"
                />
              </div>

              <div className="card space-y-3">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap2.how_titel"
                  standaard="Hoe werkt het WHY-gesprek?"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h3"
                  className="text-cm-gold font-semibold"
                  hint="Titel van het 'hoe werkt het WHY-gesprek'-blok"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap2.how_it_works"
                  standaard="Een ELEVA Mentor stelt je de juiste vragen om jouw echte motivatie boven water te krijgen, net zoals een echte persoonlijke coach dat zou doen. Geen formulier invullen, maar een echt gesprek.\n\nNa afloop wordt er een persoonlijke WHY-samenvatting voor je gemaakt. Die staat daarna altijd op je dashboard als motivatie-anker."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="div"
                  className="text-cm-white text-sm leading-relaxed opacity-80 whitespace-pre-line"
                  rows={5}
                  hint="Uitleg van hoe het WHY-gesprek werkt"
                />
              </div>

              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-3">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap2.cta_titel"
                  standaard="Klaar om jouw WHY te ontdekken?"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-[#D4AF37] font-bold"
                  hint="Titel boven de WHY-CTA-knop"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap2.cta_uitleg"
                  standaard="Het gesprek opent in dit scherm. Kom daarna terug naar deze pagina, je gaat automatisch verder bij stap 3."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm opacity-70 leading-relaxed"
                  rows={2}
                  hint="Uitleg boven de WHY-CTA-knop"
                />
                <Link href={isPreview ? "/mijn-why?preview=true&via=onboarding" : "/mijn-why?via=onboarding"} className="btn-gold w-full py-3 text-center block font-bold">
                  {isPreview ? "Preview: WHY-gesprek (slaat niets op)" : (
                    <EditableTekst
                      namespace="onboarding"
                      sleutel="stap2.cta_knop"
                      standaard="Start het WHY-gesprek →"
                      overrides={overrides}
                      isFounder={isFounder}
                      as="span"
                      hint="Tekst van de start-WHY-gesprek-knop"
                    />
                  )}
                </Link>
              </div>

              {/* Sponsor contact */}
              {toonSponsorNaam && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-blue-300 font-semibold text-sm mb-1">Twijfel je? Neem contact op met {toonSponsorNaam}</p>
                      <p className="text-cm-white text-sm opacity-80 mb-2">Je sponsor heeft dit zelf ook doorgemaakt en kan je helpen als je vastloopt.</p>
                      <a href={toonSponsorLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 Stuur {toonSponsorNaam} een WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => gaNaarStap(3)}
                disabled={bezig || (!isFounder && !voltooiingen["why"]?.voltooid)}
                className="btn-gold w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {voltooiingen["why"]?.voltooid ? (
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap2.knop"
                    standaard="WHY-gesprek gedaan, verder naar stap 3 →"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="span"
                    hint="Tekst van de knop onderaan stap 2 (door-naar-stap-3)"
                  />
                ) : isFounder ? (
                  <span>Door naar stap 3 (founder-skip) →</span>
                ) : (
                  <span>Doe eerst je WHY-gesprek hierboven</span>
                )}
              </button>
            </div>
          )}

          {/* ───── STAP 3: EERSTE 5 NAMEN ─────
              Voorheen was stap 3 de run-uitleg ("3 blokken"). Die uitleg
              is per 2026-05-18 verhuisd naar stap 4 (boven de tempo/DTT-
              keuze), modus-eigen. Stap 3 is nu de gedeelde 5-namen-stap
              voor Sprint en Core. */}
          {stap === 3 && (
            <div className="space-y-6">
              <MediaBlokkenClient
                paginaNamespace="onboarding-stap"
                paginaId="stap-3"
                positie="boven-titel"
                isFounder={isFounder}
              />
              <div className="text-center">
                <div className="text-6xl mb-3">📲</div>
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap3.titel"
                  standaard="Schrijf 5 namen op die spontaan in je hoofd opkomen"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h2"
                  className="text-2xl font-display font-bold text-cm-white mb-2"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap3.intro"
                  standaard={
                    "Stel jezelf de vraag: 'Wie komt er nu spontaan in mijn hoofd op als ik denk aan mensen die ik dit zou gunnen?' De eerste 5 namen die opkomen, schrijf je hieronder op.\n\nNiet filteren, niet bedenken 'die past niet'. Iedereen mag erop, zij beslissen zelf.\n\nDit zijn jouw eerste warm-warme contacten, een bewust gekozen lijst. Zo word je vertrouwd met het denken in jouw netwerk. Morgen bouw je dit uit naar meer namen."
                  }
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white opacity-70 text-sm leading-relaxed whitespace-pre-line"
                  rows={8}
                />
              </div>

              {voltooiingen["eerste-5-namen"]?.voltooid ? (
                voltooiingen["eerste-5-namen"].modus &&
                voltooiingen["eerste-5-namen"].modus !== modus ? (
                  // Cross-modus voltooid (eerder al gedaan in andere modus).
                  <AlGedaanLabel
                    modus={(voltooiingen["eerste-5-namen"].modus ?? "sprint") as Modus}
                    datum={voltooiingen["eerste-5-namen"].datum}
                    bekijkRoute="/namenlijst"
                  />
                ) : (
                  // Net afgevinkt in deze sessie / huidige modus.
                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-4 py-3">
                    <p className="text-emerald-300 font-semibold text-sm">
                      ✓ Top 5 namen ingevuld, goed zo!
                    </p>
                    <p className="text-cm-white text-xs opacity-70 mt-0.5">
                      Verder naar de volgende stap hieronder.
                    </p>
                  </div>
                )
              ) : (
                <NamenForm
                  doel={5}
                  alVoltooid={false}
                  alleenHandmatig
                  opVoltooid={() => {
                    setVoltooiingen((v) => ({
                      ...v,
                      "eerste-5-namen": {
                        voltooid: true,
                        modus: modus,
                        datum: new Date().toISOString(),
                      },
                    }));
                  }}
                />
              )}

              <button
                onClick={() => gaNaarStap(4)}
                disabled={
                  bezig || (!isFounder && !voltooiingen["eerste-5-namen"]?.voltooid)
                }
                className="btn-gold w-full py-3 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {voltooiingen["eerste-5-namen"]?.voltooid
                  ? "Verder naar stap 4 →"
                  : isFounder
                    ? "Door naar stap 4 (founder-skip) →"
                    : "Vul eerst 5 namen hierboven in"}
              </button>
            </div>
          )}

          {/* ───── STAP 4: MODUS-BEWUSTE KEUZE (Sprint=tempo / Core=DTT) ─────
              Oude run-uitleg ("3 blokken") + oude tempo-cards zijn per
              2026-05-18 vervangen door de gedeelde Stap4ModusKeuze-
              component. Sprint krijgt daar de tempo-cards (2/4/6 uur)
              en Core krijgt de DTT-form. Beide schrijven onboarding_stap
              = 99 en redirecten naar /vandaag. */}
          {stap === 4 && (
            <Stap4ModusKeuze
              modus={modus}
              isPreview={isPreview}
              isFounder={isFounder}
              overrides={overrides}
              dttAlIngevuld={dttAlIngevuld}
            />
          )}

        </div>
      </div>
    </div>
    </EditModeProvider>
  );
}

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
import {
  type CommitmentUren,
  STANDAARD_COMMITMENT,
  berekenDagdoelen,
  bouwblokkenVoorTempo,
  tempoNaam,
} from "@/lib/dagdoelen";

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
  const [commitmentUren, setCommitmentUren] = useState<CommitmentUren | null>(null);
  const [bezig, setBezig] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sponsorNaam, setSponsorNaam] = useState("");
  const [sponsorWaLink, setSponsorWaLink] = useState("");
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

      // Laad sponsor info
      const sponsorId = user?.user_metadata?.sponsor_id;
      if (sponsorId) {
        const { data: sponsor } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", sponsorId)
          .single();
        if (sponsor) {
          setSponsorNaam(sponsor.full_name);
          setSponsorWaLink(`https://wa.me/?text=Hoi%20${encodeURIComponent(sponsor.full_name)}%2C%20ik%20heb%20een%20vraag%20over%20de%20setup`);
        }
      }

      const huidigStap = Number(user?.user_metadata?.onboarding_stap || 1);
      // Alleen redirecten naar dashboard als gebruiker al klaar is EN
      // GEEN expliciete ?stap=N is meegegeven (anders willen we juist
      // terug naar die specifieke open admin-stap).
      if (huidigStap >= 99 && !preview && directeStap === null) {
        router.push("/dashboard");
        return;
      }

      // Prioriteit: ?stap (deeplink) > preview-modus (start bij 1) > opgeslagen huidigStap
      setStap(directeStap ?? (preview ? 1 : huidigStap));
      // Hydrateer eerder gekozen tempo, indien aanwezig. Zo blijft de
      // keuze zichtbaar gemarkeerd als iemand terug-navigeert naar
      // stap 5 om aan te passen.
      const opgeslagenUren = Number(user?.user_metadata?.commitment_uren);
      if (opgeslagenUren === 2 || opgeslagenUren === 4 || opgeslagenUren === 6) {
        setCommitmentUren(opgeslagenUren);
      }
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
      const stapActies: Record<number, { veld?: string; pushNaam: string }> = {
        2: { veld: "stap_1_welkom", pushNaam: "heeft de app geïnstalleerd 📱" },
        3: { veld: "stap_2_run",    pushNaam: "heeft zijn/haar WHY gemaakt 💛" },
        4: { veld: "stap_3_namen",  pushNaam: "begrijpt de 60-dagenrun 📖" },
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

  async function slaDoelOp() {
    if (!commitmentUren) {
      // Defensieve check, knop is disabled tot er gekozen is. Maar niet
      // crashen als iemand toch klikt.
      return;
    }
    setBezig(true);
    if (!isPreview) {
      // Afgeleide dagdoelen meteen meeschrijven naar user_metadata zodat
      // bestaande code die direct user.user_metadata.dagdoel_contacten
      // leest (dashboard, vandaag-flow) gewoon blijft werken. De
      // commitment_uren is de waarheid, de losse velden zijn cache.
      const dd = berekenDagdoelen(commitmentUren);
      await supabase.auth.updateUser({
        data: {
          onboarding_stap: 99,
          commitment_uren: commitmentUren,
          dagdoel_contacten: dd.contacten,
          dagdoel_uitnodigingen: dd.uitnodigingen,
          dagdoel_followups: dd.followups,
        },
      });
      await slaVoortgangOp({ stap_5_doelen: true });
      await stuurPushNaarSponsor(
        `heeft het tempo '${tempoNaam(commitmentUren)}' (± ${commitmentUren} uur per dag) gekozen en is klaar voor dag 1! 🎉`,
      );
    }
    setBezig(false);
    // Direct doorrollen naar dag 1 in /vandaag (geen tussenstop bij
    // de coach). De onboarding is bewust opgezet als 'eerste deel van
    // dag 1', dus iemand moet zich het laatste stuk van dag 1 (eerste
    // namen + sponsor-bericht) als natuurlijk vervolg ervaren, niet
    // als 'een nieuwe dag'. De ?via=onboarding query-param zorgt dat
    // /vandaag een welkomstbanner kan tonen die deze continuiteit
    // expliciet bevestigt.
    router.push("/vandaag?via=onboarding");
    router.refresh();
  }

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
                  standaard="We zetten je in 5 stappen klaar voor de 60-dagenrun."
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
                    { icoon: "📖", sleutel: "stap1.checklijst.item2", standaard: "Je leert hoe de 60-dagenrun werkt" },
                    { icoon: "🎯", sleutel: "stap1.checklijst.item3", standaard: "Je kiest jouw tempo voor de komende 60 dagen" },
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
                <Link href={isPreview ? "/mijn-why?preview=true" : "/mijn-why"} className="btn-gold w-full py-3 text-center block font-bold">
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

              <button onClick={() => gaNaarStap(3)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap2.knop"
                  standaard="WHY-gesprek gedaan, verder naar stap 3 →"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="span"
                  hint="Tekst van de knop onderaan stap 2 (door-naar-stap-3)"
                />
              </button>
            </div>
          )}

          {/* ───── STAP 3: HOE WERKT DE RUN ───── */}
          {stap === 3 && (
            <div className="space-y-6">
              <MediaBlokkenClient
                paginaNamespace="onboarding-stap"
                paginaId="stap-3"
                positie="boven-titel"
                isFounder={isFounder}
              />
              <div>
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap3.titel"
                  standaard="Hoe werkt de 60-dagenrun?"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h2"
                  className="text-2xl font-display font-bold text-cm-white mb-1"
                />
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap3.intro"
                  standaard="Lees dit goed, dit is je speelplan voor de komende 60 dagen."
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
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap cruciaal is</p>
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap3.waarom_cruciaal"
                  standaard="Mensen die het systeem begrijpen, presteren beter dan mensen die maar wat doen. De run heeft een structuur, en die structuur werkt. Je moet hem kennen om hem te kunnen volgen."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm leading-relaxed opacity-90"
                  rows={3}
                  hint="Waarom-cruciaal-blok van stap 3 (run-uitleg)"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">De 3 blokken</h3>
                <div className="card border-l-4 border-[#4A9EDB]">
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap3.blok1.titel"
                    standaard="Blok 1 · Dag 1–20: Fundament"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-[#4A9EDB] font-semibold text-sm mb-1"
                    hint="Titel van Blok 1 in stap 3"
                  />
                  <EditableBlok
                    namespace="onboarding"
                    sleutel="stap3.blok1.tekst"
                    standaard="Je bouwt je netwerk-overzicht op. Je begint bij de mensen die je al goed kent, daar mag je direct uitnodigen. Daarnaast leer je hoe je oudere contacten weer warm maakt en hoe je op een rustige manier zichtbaar wordt in je omgeving."
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-cm-white text-sm leading-relaxed opacity-80"
                    rows={3}
                    hint="Uitleg van Blok 1 (dag 1-20)"
                  />
                </div>
                <div className="card border-l-4 border-[#C9A84C]">
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap3.blok2.titel"
                    standaard="Blok 2 · Dag 21–40: Verdiepen"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-[#C9A84C] font-semibold text-sm mb-1"
                    hint="Titel van Blok 2 in stap 3"
                  />
                  <EditableBlok
                    namespace="onboarding"
                    sleutel="stap3.blok2.tekst"
                    standaard="Je eerste resultaten komen binnen. Je leert van de eerste gesprekken en scherpt je aanpak aan. Je opvolgwerk wordt belangrijker, want de meeste mensen zeggen niet bij het eerste contact ja. Hier zit het echte verschil."
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-cm-white text-sm leading-relaxed opacity-80"
                    rows={3}
                    hint="Uitleg van Blok 2 (dag 21-40)"
                  />
                </div>
                <div className="card border-l-4 border-[#4ACB6A]">
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap3.blok3.titel"
                    standaard="Blok 3 · Dag 41–60: Oogsten en bouwen"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-[#4ACB6A] font-semibold text-sm mb-1"
                    hint="Titel van Blok 3 in stap 3"
                  />
                  <EditableBlok
                    namespace="onboarding"
                    sleutel="stap3.blok3.tekst"
                    standaard="Je lijst is gevuld, je ritme zit erin. Nu rond je gesprekken af, begeleid je je eerste partners en help je hen op weg. De gewoontes uit de eerste 40 dagen dragen nu vrucht."
                    overrides={overrides}
                    isFounder={isFounder}
                    as="p"
                    className="text-cm-white text-sm leading-relaxed opacity-80"
                    rows={3}
                    hint="Uitleg van Blok 3 (dag 41-60)"
                  />
                </div>
              </div>

              <div className="bg-gold-subtle border border-gold-subtle rounded-xl p-4">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap3.gouden_regel_titel"
                  standaard="✦ De gouden regel"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-gold font-semibold text-sm mb-1 text-center"
                  hint="Titel van de gouden-regel-quote in stap 3"
                />
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap3.gouden_regel_quote"
                  standaard='"Consistentie slaat motivatie altijd. Doe elke dag iets, ook als je het niet voelt."'
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm text-center leading-relaxed italic"
                  multiline
                  rows={2}
                  hint="De gouden-regel-quote zelf"
                />
              </div>

              <button onClick={() => gaNaarStap(4)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap3.knop"
                  standaard="Begrepen, volgende stap →"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="span"
                  hint="Tekst van de knop onderaan stap 3 (door-naar-stap-4)"
                />
              </button>
            </div>
          )}

          {/* ───── STAP 4: KIES JE TEMPO (was 5, daarna FINALE) ─────
              De voormalige stap 4 ("scripts" met Honest Conversation
              voorbeelden) is verplaatst naar dag 2 van het playbook,
              waar 'ie samen met de sponsor-call landt (de eerste echte
              uitnodigingen doe je samen met je sponsor, daar horen de
              scripts ook).

              Oude stap 5 (tempo-keuze) is nu de finale stap 4. DB-sleutels
              (paginaId="stap-6", stap6.*) blijven ongewijzigd voor
              founder-override-compat. */}
          {stap === 4 && (
            <div className="space-y-6">
              <MediaBlokkenClient
                paginaNamespace="onboarding-stap"
                paginaId="stap-6"
                positie="boven-titel"
                isFounder={isFounder}
              />
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap6.titel"
                  standaard="Kies jouw tempo voor 60 dagen"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h2"
                  className="text-2xl font-display font-bold text-cm-white mb-2"
                />
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap6.intro"
                  standaard="Wees eerlijk met jezelf. Liever 2 uur volhouden, dan 6 beloven en stoppen na tien dagen."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white opacity-60 text-sm"
                  multiline
                  rows={2}
                />
              </div>

              {/* Korte intro waarom dit een keuze is en geen losse getallen */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap6.waarom_tempo_titel"
                  standaard="⚡ Waarom je tempo kiest, geen losse getallen"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-amber-300 font-semibold text-sm flex items-center gap-2"
                  hint="Titel van het waarom-tempo-blok"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap6.waarom_tempo_tekst1"
                  standaard="Mensen die zelf met losse getallen rommelen, zetten ze óf veel te laag (dan gebeurt er niets) óf veel te hoog (dan stoppen ze). Met een tempo kies je een ritme dat past bij jouw leven nu. De aantallen volgen automatisch."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm leading-relaxed opacity-90"
                  rows={3}
                  hint="Eerste alinea waarom tempo-keuze"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap6.waarom_tempo_tekst2"
                  standaard="🎯 Je kunt later in Instellingen altijd switchen, bijvoorbeeld als je meer ruimte krijgt. Dat is geen falen, dat is luisteren naar jezelf."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm opacity-80"
                  rows={2}
                  hint="Tweede alinea waarom tempo-keuze (over later switchen)"
                />
              </div>

              {/* De drie tempo-cards */}
              <div className="space-y-4">
                {([2, 4, 6] as const).map((uren) => {
                  const dd = berekenDagdoelen(uren);
                  const blokken = bouwblokkenVoorTempo(uren);
                  const isGekozen = commitmentUren === uren;
                  const meta: Record<
                    CommitmentUren,
                    { emoji: string; pastBij: string }
                  > = {
                    2: {
                      emoji: "🌱",
                      pastBij:
                        "Je hebt een drukke baan, een gezin, of bouwt dit naast alles wat je al hebt. Liever rustig en consistent dan groot beginnen en stoppen.",
                    },
                    4: {
                      emoji: "🔥",
                      pastBij:
                        "Je hebt ruimte gemaakt. Je gezin weet dat dit jouw 60 dagen worden. Je wilt er serieus voor gaan zonder jezelf op te branden.",
                    },
                    6: {
                      emoji: "⚡",
                      pastBij:
                        "Je hebt geen ander werk, of je hebt deze 60 dagen echt vrijgemaakt. Je wilt er alles uithalen en bent bereid het als hoofdactiviteit te behandelen.",
                    },
                  };
                  const m = meta[uren];
                  return (
                    <button
                      key={uren}
                      type="button"
                      onClick={() => setCommitmentUren(uren)}
                      className={`w-full text-left rounded-xl border-2 transition-all overflow-hidden ${
                        isGekozen
                          ? "border-cm-gold bg-cm-gold/[0.08] shadow-gold-lg"
                          : "border-cm-border bg-cm-surface hover:border-cm-gold/40 hover:bg-cm-surface-2"
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Header van de card */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-cm-white/50 mb-1">
                              ± {uren} uur per dag
                            </p>
                            <h3 className="text-xl font-display font-bold text-cm-white flex items-center gap-2">
                              <span className="text-2xl">{m.emoji}</span>
                              {tempoNaam(uren)}
                            </h3>
                          </div>
                          {isGekozen && (
                            <span className="text-xs bg-cm-gold text-cm-on-gold font-bold px-3 py-1 rounded-full whitespace-nowrap">
                              ✓ Gekozen
                            </span>
                          )}
                        </div>

                        {/* Past dit bij jou? Korte herkennings-beschrijving
                            zodat mensen direct voelen of dit hun tempo is.
                            Bewerkbaar per tempo zodat founder de tekst kan
                            bijschaven na pilot-feedback. */}
                        <EditableBlok
                          namespace="onboarding"
                          sleutel={`stap6.tempo${uren}.past_bij`}
                          standaard={m.pastBij}
                          overrides={overrides}
                          isFounder={isFounder}
                          as="p"
                          className="text-sm text-cm-white/85 leading-relaxed"
                          rows={3}
                          hint={`Beschrijving voor wie bij het tempo van ${uren}u/dag past`}
                        />

                        {/* Dagdoelen-samenvatting, in alledaagse woorden */}
                        <div className="bg-cm-surface-2 rounded-lg p-3 space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-cm-white/50">
                            Elke dag
                          </p>
                          <div className="grid grid-cols-1 gap-y-1 text-sm text-cm-white">
                            <span>📲 {dd.contacten} nieuwe namen toevoegen</span>
                            <span>💬 {dd.contacten} eerste berichten sturen</span>
                            <span>📨 {dd.uitnodigingen} mensen uitnodigen om iets te bekijken</span>
                            <span>🔄 Openstaande follow-ups doen (variabel)</span>
                            <span>📱 1 tot 3 momenten uit je dag delen (geen verkoop)</span>
                          </div>
                        </div>

                        {/* Uitklap: wat doe je per dag concreet? Alleen tonen
                            als deze card gekozen is, anders wordt 't te druk. */}
                        {isGekozen && (
                          <div className="border-t border-cm-border pt-3 space-y-2">
                            <p className="text-xs uppercase tracking-wider text-cm-white/50">
                              Wat doe je op zo'n dag?
                            </p>
                            <ul className="space-y-2">
                              {blokken.map((b) => (
                                <li
                                  key={b.naam}
                                  className="text-xs text-cm-white/80 flex gap-2 leading-relaxed"
                                >
                                  <span className="flex-shrink-0 mt-0.5">{b.emoji}</span>
                                  <span>
                                    <strong className="text-cm-white">
                                      {b.naam}
                                    </strong>
                                    <span className="text-cm-white/60">
                                      {". "}{b.beschrijving}
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <p className="text-[11px] text-cm-white/55 italic pt-1 leading-relaxed">
                              💡 Je hoeft dit niet in één blok te doen. Korte stukjes door je dag heen werkt vaak beter, tussendoor in de auto, na het eten, in de wachtkamer. Zo wordt het een ritme in plaats van een verplichting.
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Twijfel-hulp */}
              <div className="card border-l-4 border-emerald-500 space-y-2">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap6.twijfel_titel"
                  standaard="💡 Twijfel?"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h3"
                  className="text-emerald-300 font-semibold text-sm"
                  hint="Titel van het twijfel-hulp-blok"
                />
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap6.twijfel_tekst"
                  standaard="Begin bij Fundament. Je kunt later in instellingen altijd opschalen als je merkt dat je meer ruimte hebt. Andersom kan ook: liever even terugschakelen dan helemaal stoppen."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm leading-relaxed opacity-85"
                  rows={3}
                  hint="Twijfel-hulp-tekst onder de tempo-cards"
                />
              </div>

              {/* ELEVA Mentor intro */}
              <div className="card space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌟</span>
                  <EditableTekst
                    namespace="onboarding"
                    sleutel="stap6.mentor_titel"
                    standaard="Jouw ELEVA Mentor staat klaar"
                    overrides={overrides}
                    isFounder={isFounder}
                    as="h3"
                    className="text-cm-gold font-semibold"
                    hint="Titel van het Mentor-intro-blok"
                  />
                </div>
                <EditableBlok
                  namespace="onboarding"
                  sleutel="stap6.mentor_uitleg"
                  standaard="De ELEVA Mentor is gebouwd op basis van 60 jaar gecombineerde ervaring in aanbevelingsmarketing. Na het opslaan van je doelen open je de ELEVA Mentor direct, jouw krachtigste hulpmiddel naast je sponsor."
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white text-sm leading-relaxed opacity-80"
                  rows={3}
                  hint="Uitleg-tekst over de ELEVA Mentor"
                />
                <ul className="space-y-1.5">
                  {[
                    { sleutel: "stap6.mentor_punt1", standaard: "Klaarstaande DM-teksten voor elk type contact" },
                    { sleutel: "stap6.mentor_punt2", standaard: "Hulp bij bezwaren ('ik heb geen tijd', 'is dit een pyramid?')" },
                    { sleutel: "stap6.mentor_punt3", standaard: "Follow-up strategieën voor prospects" },
                    { sleutel: "stap6.mentor_punt4", standaard: "Motivatie als je een moeilijke dag hebt" },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-80">
                      <span className="text-cm-gold flex-shrink-0">✦</span>
                      <EditableTekst
                        namespace="onboarding"
                        sleutel={item.sleutel}
                        standaard={item.standaard}
                        overrides={overrides}
                        isFounder={isFounder}
                        as="span"
                        className=""
                        hint={`Mentor-bullet ${i + 1}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-3">
                <EditableTekst
                  namespace="onboarding"
                  sleutel="stap6.setup_compleet_titel"
                  standaard="Jouw setup is compleet 🎉"
                  overrides={overrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-[#D4AF37] font-bold"
                  hint="Titel van het setup-compleet-blok onderaan stap 4"
                />
                <p className="text-cm-white text-sm opacity-70 leading-relaxed">
                  {commitmentUren
                    ? `Je hebt voor ${tempoNaam(commitmentUren)} (± ${commitmentUren} uur per dag) gekozen. Direct door naar de rest van dag 1.`
                    : "Kies eerst hierboven jouw tempo. Daarna rol je direct door naar de rest van dag 1."}
                </p>
              </div>

              {/* 'Je eerste 24 uur'-blok is verwijderd. Reden: het zegt
                  dingen die dag 1 zelf al opvolgt (sponsor-bericht, namen
                  toevoegen, WHY teruglezen). De gebruiker rolt nu meteen
                  door naar /vandaag voor dag 1 zodra 'ie z'n tempo heeft
                  gekozen, dus geen tussenstop met dubbele instructies. */}

              <button
                onClick={slaDoelOp}
                disabled={bezig || !commitmentUren}
                className="btn-gold w-full py-4 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {bezig
                  ? "Laden..."
                  : commitmentUren
                  ? `Te gek, door naar de rest van dag 1 →`
                  : "Kies eerst je tempo hierboven"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
    </EditModeProvider>
  );
}

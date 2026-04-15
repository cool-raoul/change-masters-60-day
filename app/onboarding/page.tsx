"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPagina() {
  const [stap, setStap] = useState(1);
  const [laden, setLaden] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [dagdoelContacten, setDagdoelContacten] = useState(5);
  const [dagdoelUitnodigingen, setDagdoelUitnodigingen] = useState(2);
  const [dagdoelFollowups, setDagdoelFollowups] = useState(3);
  const [bezig, setBezig] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview") === "true";
    setIsPreview(preview);

    async function laadGegevens() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      if (user?.user_metadata?.full_name) {
        setGebruikersnaam(user.user_metadata.full_name.split(" ")[0]);
      } else if (user?.email) {
        setGebruikersnaam(user.email.split("@")[0]);
      }

      const huidigStap = Number(user?.user_metadata?.onboarding_stap || 1);
      if (huidigStap >= 99 && !preview) { router.push("/dashboard"); return; }

      setStap(preview ? 1 : huidigStap);
      if (user?.user_metadata?.dagdoel_contacten) setDagdoelContacten(Number(user.user_metadata.dagdoel_contacten));
      if (user?.user_metadata?.dagdoel_uitnodigingen) setDagdoelUitnodigingen(Number(user.user_metadata.dagdoel_uitnodigingen));
      if (user?.user_metadata?.dagdoel_followups) setDagdoelFollowups(Number(user.user_metadata.dagdoel_followups));
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

  async function gaNaarStap(nieuweStap: number) {
    setBezig(true);
    if (!isPreview) {
      await supabase.auth.updateUser({ data: { onboarding_stap: nieuweStap } });
      const stapVelden: Record<number, string> = {
        2: "stap_1_welkom",
        3: "stap_2_why",
        4: "stap_3_run",
        5: "stap_4_namen",
        6: "stap_5_doelen"
      };
      if (stapVelden[nieuweStap]) await slaVoortgangOp({ [stapVelden[nieuweStap]]: true });
    }
    setStap(nieuweStap);
    setBezig(false);
    // Scroll naar boven van de content container
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function slaDoelOp() {
    setBezig(true);
    if (!isPreview) {
      await supabase.auth.updateUser({
        data: { onboarding_stap: 7, dagdoel_contacten: dagdoelContacten, dagdoel_uitnodigingen: dagdoelUitnodigingen, dagdoel_followups: dagdoelFollowups },
      });
      await slaVoortgangOp({ stap_5_doelen: true });
    }
    setBezig(false);
    setStap(7);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function startDashboard() {
    if (!isPreview) {
      setBezig(true);
      await supabase.auth.updateUser({ data: { onboarding_stap: 99 } });
    }
    router.push("/dashboard");
    router.refresh();
  }

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

  const totaalStappen = 6;
  const voortgang = stap < 7 ? ((stap - 1) / totaalStappen) * 100 : 100;

  return (
    <div className="min-h-screen bg-cm-black flex flex-col">
      {/* Header */}
      <div className="border-b border-cm-border p-4 flex items-center justify-between sticky top-0 bg-cm-black z-10">
        <div className="flex items-center gap-3">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-8 w-8" />
          <div>
            <h1 className="text-lg eleva-brand">ELEVA</h1>
            <p className="text-cm-white text-[10px] opacity-60 -mt-0.5">60 Dagen Run Setup</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPreview && (
            <span className="text-xs bg-amber-900/40 border border-amber-600/30 text-amber-400 px-2 py-1 rounded-full">
              Preview
            </span>
          )}
          {stap < 7 && (
            <span className="text-sm text-cm-white opacity-60">Stap {stap} van {totaalStappen}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {stap < 7 && (
        <div className="h-1 bg-cm-surface">
          <div className="h-1 bg-cm-gold transition-all duration-500" style={{ width: `${voortgang}%` }} />
        </div>
      )}

      {/* Stap bollen */}
      {stap < 7 && (
        <div className="flex justify-center gap-2 py-4 px-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
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

          {/* STAP 1: WELKOM + APP INSTALLEREN */}
          {stap === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-3xl font-display font-bold text-cm-white mb-2">Welkom, {gebruikersnaam}!</h2>
                <p className="text-cm-white opacity-60 text-sm">We zetten je in 6 stappen klaar voor de 60-dagenrun.</p>
              </div>

              {/* App installeren */}
              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📱</span>
                  <div>
                    <p className="text-[#D4AF37] font-bold text-base">Stap 0: Installeer de app</p>
                    <p className="text-cm-white text-xs opacity-60">Doe dit nu — dan ontvang je ook meldingen</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <p className="text-cm-white text-sm font-semibold">📱 iPhone (Safari):</p>
                  <ol className="text-cm-white text-sm opacity-80 space-y-1 list-decimal list-inside">
                    <li>Tik op het deel-icoontje onderaan</li>
                    <li>Kies "Zet op beginscherm"</li>
                    <li>Tik op "Voeg toe"</li>
                    <li>Open de app daarna vanuit je beginscherm</li>
                  </ol>
                </div>
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <p className="text-cm-white text-sm font-semibold">🤖 Android (Chrome):</p>
                  <ol className="text-cm-white text-sm opacity-80 space-y-1 list-decimal list-inside">
                    <li>Tik op de drie puntjes rechtsboven</li>
                    <li>Kies "Toevoegen aan startscherm"</li>
                    <li>Tik op "Toevoegen"</li>
                  </ol>
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold">Wat doe je in deze setup?</h3>
                <ul className="space-y-2">
                  {[
                    { icoon: "💛", tekst: "Je ontdekt jouw persoonlijke WHY" },
                    { icoon: "📖", tekst: "Je leert hoe de 60-dagenrun werkt" },
                    { icoon: "📝", tekst: "Je voegt je eerste namen toe" },
                    { icoon: "💬", tekst: "Je leest je eerste uitnodigingsscript" },
                    { icoon: "🎯", tekst: "Je stelt je persoonlijke dagdoelen in" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-cm-white">
                      <span className="text-xl">{item.icoon}</span>{item.tekst}
                    </li>
                  ))}
                </ul>
                <p className="text-cm-white text-xs opacity-50 pt-1">Dit kost je ongeveer 15 minuten.</p>
              </div>

              <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🤝</span>
                  <div>
                    <p className="text-amber-400 font-semibold text-sm mb-1">Doe je eerste uitnodigingen samen met je sponsor</p>
                    <p className="text-cm-white text-sm leading-relaxed opacity-80">
                      De meeste stappen doe je zelfstandig. Maar je <strong className="text-cm-white">eerste uitnodigingen</strong> doe je het beste samen met je sponsor. Plan dit zodra je setup klaar is.
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => gaNaarStap(2)} disabled={bezig} className="btn-gold w-full py-3 text-base">App geïnstalleerd — aan de slag →</button>
            </div>
          )}

          {/* STAP 2: JOUW WHY */}
          {stap === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">💛</div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-2">Ontdek jouw WHY</h2>
                <p className="text-cm-white opacity-60 text-sm">Dit is het fundament van alles. Zonder een sterke WHY stop je als het moeilijk wordt.</p>
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold">Waarom is dit zo belangrijk?</h3>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  Je WHY is de diepste reden waarom je dit doet. Niet "meer geld verdienen" — maar wat dat geld betekent voor jou en je gezin. Als je WHY sterk genoeg is, vind je altijd de weg.
                </p>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  Een AI-coach stelt je de juiste vragen om jouw echte motivatie boven water te krijgen. Dit duurt 5–10 minuten.
                </p>
              </div>

              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-4">
                <p className="text-[#D4AF37] font-bold">Klaar om jouw WHY te ontdekken?</p>
                <p className="text-cm-white text-sm opacity-70">Het gesprek opent in een nieuw scherm. Kom daarna hier terug om verder te gaan.</p>
                <Link
                  href="/mijn-why"
                  className="btn-gold w-full py-3 text-center block"
                >
                  Start het WHY-gesprek →
                </Link>
              </div>

              <div className="space-y-2">
                <button onClick={() => gaNaarStap(3)} disabled={bezig} className="btn-gold w-full py-3 text-base">WHY gedaan — verder →</button>
                <button onClick={() => gaNaarStap(3)} disabled={bezig} className="btn-secondary w-full py-2 text-sm opacity-60">Doe ik later — nu verder</button>
              </div>
            </div>
          )}

          {/* STAP 3: HOE WERKT DE RUN */}
          {stap === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Hoe werkt de 60-dagenrun?</h2>
                <p className="text-cm-white opacity-60 text-sm">Lees dit goed — dit is je speelplan voor de komende 60 dagen.</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">De 3 fasen</h3>
                <div className="card border-l-4 border-[#4A9EDB]">
                  <p className="text-[#4A9EDB] font-semibold text-sm mb-1">Fase 1 · Dag 1–20: Bouwen</p>
                  <p className="text-cm-white text-sm leading-relaxed opacity-80">Je legt de basis. Elke dag contacten aanspreken, uitnodigingen sturen, namen toevoegen aan je lijst. Focus volledig op je warme markt — mensen die je al kent.</p>
                </div>
                <div className="card border-l-4 border-[#C9A84C]">
                  <p className="text-[#C9A84C] font-semibold text-sm mb-1">Fase 2 · Dag 21–40: Versnellen</p>
                  <p className="text-cm-white text-sm leading-relaxed opacity-80">Je eerste resultaten komen binnen. Je verdubbelt je activiteit. Follow-ups worden crucialer. Je leert van de eerste gesprekken en scherpt je aanpak aan.</p>
                </div>
                <div className="card border-l-4 border-[#4ACB6A]">
                  <p className="text-[#4ACB6A] font-semibold text-sm mb-1">Fase 3 · Dag 41–60: Oogsten</p>
                  <p className="text-cm-white text-sm leading-relaxed opacity-80">Je pipeline staat vol. Je sluit deals, begeleidt je eerste partners en bouwt een team. De gewoontes die je hebt opgebouwd dragen nu vruchten.</p>
                </div>
              </div>
              <div className="card space-y-4">
                <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">Jouw dagelijkse minimums</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[{ getal: "5+", label: "Contacten" }, { getal: "2+", label: "Uitnodigingen" }, { getal: "3+", label: "Follow-ups" }].map((item) => (
                    <div key={item.label} className="bg-cm-surface-2 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-cm-gold">{item.getal}</p>
                      <p className="text-cm-white text-xs opacity-70 mt-0.5">{item.label} per dag</p>
                    </div>
                  ))}
                </div>
                <p className="text-cm-white text-xs opacity-50 text-center">Run loopt van <span className="text-cm-gold">12 april</span> t/m <span className="text-cm-gold">11 juni 2026</span></p>
              </div>
              <div className="bg-gold-subtle border border-gold-subtle rounded-xl p-4">
                <p className="text-cm-gold font-semibold text-sm mb-1 text-center">✦ De gouden regel</p>
                <p className="text-cm-white text-sm text-center leading-relaxed italic">"Consistentie slaat motivatie altijd. Doe elke dag iets, ook als je het niet voelt."</p>
              </div>
              <button onClick={() => gaNaarStap(4)} disabled={bezig} className="btn-gold w-full py-3 text-base">Begrepen — volgende stap →</button>
            </div>
          )}

          {/* STAP 4: WARME MARKT */}
          {stap === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Bouw je warme markt</h2>
                <p className="text-cm-white opacity-60 text-sm">Jouw eerste lijst met namen — dit is je startpunt.</p>
              </div>
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Wat is je warme markt?</h3>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">Iedereen die jij kent is een potentieel contact: vrienden, familie, collega's, buren, sportmaatjes, oud-klasgenoten. Je warme markt is de basis van je eerste 20 dagen.</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-80"><strong className="text-cm-white">Oordeel niet vooraf</strong> over wie wel of niet geïnteresseerd is. Dat is niet jouw taak. Jouw taak is uitnodigen — zij beslissen.</p>
              </div>
              <div className="border-2 border-cm-gold/40 rounded-xl p-5 space-y-4 bg-gold-subtle">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="text-cm-gold font-semibold mb-1">Jouw actie nu</p>
                    <p className="text-cm-white text-sm leading-relaxed opacity-90">Voeg minimaal <strong className="text-cm-white">10–20 namen</strong> toe aan de namenlijst. Zet ze in de fase "Prospect".</p>
                  </div>
                </div>
                <Link href="/namenlijst" target="_blank" className="btn-gold w-full py-3 text-center block text-sm">→ Open namenlijst (nieuw tabblad)</Link>
              </div>
              <div className="space-y-2">
                <button onClick={() => gaNaarStap(5)} disabled={bezig} className="btn-gold w-full py-3 text-base">Namen toegevoegd — verder →</button>
                <button onClick={() => gaNaarStap(5)} disabled={bezig} className="btn-secondary w-full py-2 text-sm">Doe ik later — nu verder</button>
              </div>
            </div>
          )}

          {/* STAP 5: UITNODIGINGSSCRIPT */}
          {stap === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Je eerste uitnodigingsscript</h2>
                <p className="text-cm-white opacity-60 text-sm">Lees dit door, oefen het hardop, gebruik het.</p>
              </div>
              <div className="bg-cm-surface-2 border border-cm-gold/30 rounded-xl p-5 space-y-4">
                <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">✦ DM Script — Warme markt (WhatsApp / Instagram)</p>
                <div className="space-y-3 text-cm-white text-sm leading-relaxed border-l-2 border-cm-gold/30 pl-4">
                  <p>Hey [naam] 👋</p>
                  <p>Ik ben net gestart met iets nieuws en ik dacht meteen aan jou. Ik heb een manier gevonden om online extra inkomsten op te bouwen naast mijn gewone werk — zonder investering, zonder risico.</p>
                  <p>Ik ben er super enthousiast over en wil het graag even met je delen.</p>
                  <p>Heb je de komende dagen 20 minuten? Dan leg ik je alles uit in een video-gesprekje.</p>
                  <p className="text-cm-gold font-medium">Laat het me weten! 😊</p>
                </div>
              </div>
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Hoe gebruik je dit?</h3>
                <ul className="space-y-2">
                  {["Vervang [naam] door de echte naam", "Stuur via WhatsApp, Instagram DM of ander platform", "Wacht rustig op reactie — dring nooit aan", "Zeggen ze ja? Plan het gesprekje met je sponsor erbij", "Meer scripts vind je in de Scripts bibliotheek"].map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-80">
                      <span className="text-cm-gold flex-shrink-0 mt-0.5">✓</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => gaNaarStap(6)} disabled={bezig} className="btn-gold w-full py-3 text-base">Gelezen en begrepen →</button>
            </div>
          )}

          {/* STAP 6: DAGDOEL */}
          {stap === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Stel je dagdoel in</h2>
                <p className="text-cm-white opacity-60 text-sm">Wat ga jij elke dag minimaal doen? Wees realistisch.</p>
              </div>
              <div className="card">
                <p className="text-cm-white text-sm leading-relaxed opacity-80">Begin conservatief. Je kunt altijd meer doen. Het gaat erom dat je <strong className="text-cm-white">elke dag</strong> haalt wat je hier invult.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "👥 Contacten per dag", sub: "Mensen aanspreken, een DM sturen, reageren op stories", val: dagdoelContacten, setVal: setDagdoelContacten },
                  { label: "📨 Uitnodigingen per dag", sub: "Het script sturen, iemand uitnodigen voor een gesprek", val: dagdoelUitnodigingen, setVal: setDagdoelUitnodigingen },
                  { label: "🔄 Follow-ups per dag", sub: "Nabellen, terugkomen op een gesprek, opvolgen", val: dagdoelFollowups, setVal: setDagdoelFollowups },
                ].map((item) => (
                  <div key={item.label} className="card">
                    <p className="text-cm-white font-semibold text-sm mb-0.5">{item.label}</p>
                    <p className="text-cm-white text-xs opacity-50 mb-3">{item.sub}</p>
                    <div className="flex items-center gap-4">
                      <button onClick={() => item.setVal(Math.max(1, item.val - 1))} className="w-11 h-11 rounded-full border border-cm-border text-cm-white hover:border-cm-gold transition-colors text-xl">−</button>
                      <span className="text-4xl font-bold text-cm-gold w-16 text-center">{item.val}</span>
                      <button onClick={() => item.setVal(item.val + 1)} className="w-11 h-11 rounded-full border border-cm-border text-cm-white hover:border-cm-gold transition-colors text-xl">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={slaDoelOp} disabled={bezig} className="btn-gold w-full py-3 text-base disabled:opacity-50">
                {bezig ? "Opslaan..." : "Opslaan en verder →"}
              </button>
            </div>
          )}

          {/* STAP 7: KLAAR! */}
          {stap === 7 && (
            <div className="space-y-6 text-center">
              <div>
                <div className="text-7xl mb-4">🎉</div>
                <h2 className="text-3xl font-display font-bold text-cm-white mb-2">Je bent er helemaal klaar voor!</h2>
                <p className="text-cm-white opacity-70">Setup afgerond. Nu begint de echte run.</p>
              </div>
              <div className="card text-left space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">Jouw dagdoelen</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[{ getal: dagdoelContacten, label: "Contacten" }, { getal: dagdoelUitnodigingen, label: "Uitnodigingen" }, { getal: dagdoelFollowups, label: "Follow-ups" }].map((item) => (
                    <div key={item.label} className="bg-cm-surface-2 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-cm-gold">{item.getal}</p>
                      <p className="text-cm-white text-xs opacity-70 mt-0.5">{item.label}/dag</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card text-left space-y-2">
                <h3 className="text-cm-gold font-semibold text-sm mb-3">Wat je hebt gedaan</h3>
                {["App geïnstalleerd", "WHY-gesprek voltooid", "60-dagenrun begrepen", "Eerste namen toegevoegd", "Uitnodigingsscript gelezen", "Dagdoelen ingesteld"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-cm-white opacity-80">
                    <span className="text-cm-gold text-base">✓</span>{item}
                  </div>
                ))}
              </div>
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-5 text-left">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🤝</span>
                  <div>
                    <p className="text-amber-400 font-semibold mb-1">Eerste actie: plan een sessie met je sponsor</p>
                    <p className="text-cm-white text-sm leading-relaxed opacity-80">Stuur je sponsor een berichtje dat je klaar bent. Plan een moment om samen je eerste uitnodigingen te versturen.</p>
                  </div>
                </div>
              </div>
              {isPreview ? (
                <button onClick={() => router.push("/dashboard")} className="btn-secondary w-full py-3 text-base">← Terug naar dashboard</button>
              ) : (
                <button onClick={startDashboard} disabled={bezig} className="btn-gold w-full py-4 text-lg font-bold disabled:opacity-50">
                  {bezig ? "Laden..." : "Start dag 1 van mijn 60-dagenrun →"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

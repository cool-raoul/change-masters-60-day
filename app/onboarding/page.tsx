"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PushNotificationToggle } from "@/components/pwa/PushNotificationToggle";

const SPONSOR_TEL = "https://wa.me/31612345678"; // fallback — wordt dynamisch geladen

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
  const [sponsorNaam, setSponsorNaam] = useState("");
  const [sponsorWaLink, setSponsorWaLink] = useState("");
  const [coachVraag, setCoachVraag] = useState("");
  const [coachAntwoord, setCoachAntwoord] = useState("");
  const [coachBezig, setCoachBezig] = useState(false);
  const [coachGedaan, setCoachGedaan] = useState(false);
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

  async function gaNaarStap(nieuweStap: number) {
    setBezig(true);
    if (!isPreview) {
      await supabase.auth.updateUser({ data: { onboarding_stap: nieuweStap } });

      // DB + push notificatie per stap
      const stapActies: Record<number, { veld: string; pushNaam: string }> = {
        2: { veld: "stap_1_welkom", pushNaam: "Stap 1: Welkom & app geïnstalleerd" },
        3: { veld: "stap_2_run",    pushNaam: "Stap 2: WHY ingevuld" },
        4: { veld: "stap_3_namen",  pushNaam: "Stap 3: Run begrepen" },
        5: { veld: "stap_4_script", pushNaam: "Stap 4: Namenlijst aangemaakt" },
        6: { veld: "stap_4_script", pushNaam: "Stap 5: Script gelezen" },
        7: { veld: "stap_4_script", pushNaam: "Stap 6: AI Coach ontdekt" },
      };

      if (stapActies[nieuweStap]) {
        const { veld, pushNaam } = stapActies[nieuweStap];
        await slaVoortgangOp({ [veld]: true });
        await stuurPushNaarSponsor(pushNaam);
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
    setBezig(true);
    if (!isPreview) {
      await supabase.auth.updateUser({
        data: { onboarding_stap: 8, dagdoel_contacten: dagdoelContacten, dagdoel_uitnodigingen: dagdoelUitnodigingen, dagdoel_followups: dagdoelFollowups },
      });
      await slaVoortgangOp({ stap_5_doelen: true });
      await stuurPushNaarSponsor("Stap 7: Dagdoelen ingesteld — setup klaar! 🎉");
    }
    setBezig(false);
    setStap(8);
    scrollNaarBoven();
  }

  async function startDashboard() {
    if (!isPreview) {
      setBezig(true);
      await supabase.auth.updateUser({ data: { onboarding_stap: 99 } });
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function stelCoachVraag(vraag: string) {
    setCoachVraag(vraag);
    setCoachBezig(true);
    setCoachAntwoord("");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          berichten: [{ role: "user", content: vraag }],
        }),
      });
      if (!response.ok) throw new Error("Coach niet bereikbaar");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let tekst = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        tekst += decoder.decode(value, { stream: true });
        setCoachAntwoord(tekst);
      }
      setCoachGedaan(true);
    } catch (e) {
      setCoachAntwoord("De coach is even niet bereikbaar. Ga toch verder — je kunt altijd een vraag stellen vanuit het dashboard.");
      setCoachGedaan(true);
    } finally {
      setCoachBezig(false);
    }
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

  const totaalStappen = 7;
  const voortgang = stap < 8 ? ((stap - 1) / totaalStappen) * 100 : 100;

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
            <span className="text-xs bg-amber-900/40 border border-amber-600/30 text-amber-400 px-2 py-1 rounded-full">Preview</span>
          )}
          {stap < 8 && (
            <span className="text-sm text-cm-white opacity-60">Stap {stap} van {totaalStappen}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {stap < 8 && (
        <div className="h-1 bg-cm-surface">
          <div className="h-1 bg-cm-gold transition-all duration-500" style={{ width: `${voortgang}%` }} />
        </div>
      )}

      {/* Stap bollen */}
      {stap < 8 && (
        <div className="flex justify-center gap-2 py-4 px-6">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
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
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-3xl font-display font-bold text-cm-white mb-2">Welkom, {gebruikersnaam}!</h2>
                <p className="text-cm-white opacity-60 text-sm">We zetten je in 7 stappen klaar voor de 60-dagenrun.</p>
              </div>

              {/* App installeren */}
              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📱</span>
                  <div>
                    <p className="text-[#D4AF37] font-bold text-base">Installeer de app op je telefoon</p>
                    <p className="text-cm-white text-xs opacity-60">Doe dit nu — zo ontvang je ook meldingen</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <p className="text-cm-white text-sm font-semibold">📱 iPhone (Safari):</p>
                  <ol className="text-cm-white text-sm opacity-80 space-y-1 list-decimal list-inside">
                    <li>Tik op het deel-icoontje onderaan (vierkantje met pijl omhoog)</li>
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

              {/* Push notificaties */}
              <div className="card space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔔</span>
                  <h3 className="text-cm-gold font-semibold">Schakel meldingen in</h3>
                </div>
                <p className="text-cm-white text-sm opacity-80 leading-relaxed">
                  Zo mis je geen follow-up herinneringen en kan je sponsor je op de hoogte houden van activiteiten in je team.
                  <strong className="text-cm-white"> Dit werkt alleen vanuit de geïnstalleerde app.</strong>
                </p>
                <PushNotificationToggle />
              </div>

              {/* Wat je gaat doen */}
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold">Wat doe je in deze 7 stappen?</h3>
                <ul className="space-y-2">
                  {[
                    { icoon: "💛", tekst: "Je ontdekt jouw persoonlijke WHY" },
                    { icoon: "📖", tekst: "Je leert hoe de 60-dagenrun werkt" },
                    { icoon: "📝", tekst: "Je voegt je eerste namen toe" },
                    { icoon: "💬", tekst: "Je leest je uitnodigingsscript" },
                    { icoon: "🤖", tekst: "Je ervaart de AI coach" },
                    { icoon: "🎯", tekst: "Je stelt je persoonlijke dagdoelen in" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-cm-white">
                      <span className="text-xl">{item.icoon}</span>{item.tekst}
                    </li>
                  ))}
                </ul>
                <p className="text-cm-white text-xs opacity-50 pt-1">Dit kost je ongeveer 15–20 minuten.</p>
              </div>

              <button onClick={() => gaNaarStap(2)} disabled={bezig} className="btn-gold w-full py-4 text-base font-bold">
                App geïnstalleerd — aan de slag →
              </button>
            </div>
          )}

          {/* ───── STAP 2: JOUW WHY ───── */}
          {stap === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">💛</div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-2">Ontdek jouw WHY</h2>
                <p className="text-cm-white opacity-60 text-sm">Het fundament van alles. Sla deze stap niet over.</p>
              </div>

              {/* Waarom cruciaal */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap cruciaal is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  De cijfers liegen niet: mensen die hun WHY helder hebben gaan <strong className="text-cm-white">3× zo lang door</strong> als het moeilijk wordt.
                  Je WHY is niet "meer geld verdienen" — maar wat dat geld betekent voor jou en je gezin.
                  Als je WHY sterk genoeg is, vind je altijd de weg.
                </p>
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold">Hoe werkt het WHY-gesprek?</h3>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  Een AI-coach stelt je de juiste vragen om jouw echte motivatie boven water te krijgen — net zoals een echte persoonlijke coach dat zou doen. Geen formulier invullen, maar een echt gesprek. Dit duurt 5–10 minuten.
                </p>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  Na afloop wordt er een persoonlijke WHY-samenvatting voor je gemaakt. Die staat daarna altijd op je dashboard als motivatie-anker.
                </p>
              </div>

              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-3">
                <p className="text-[#D4AF37] font-bold">Klaar om jouw WHY te ontdekken?</p>
                <p className="text-cm-white text-sm opacity-70 leading-relaxed">
                  Het gesprek opent in dit scherm. <strong className="text-cm-white">Kom daarna terug naar deze pagina</strong> — je gaat automatisch verder bij stap 3.
                </p>
                <Link href="/mijn-why" className="btn-gold w-full py-3 text-center block font-bold">
                  Start het WHY-gesprek →
                </Link>
              </div>

              {/* Sponsor contact */}
              {sponsorNaam && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-blue-300 font-semibold text-sm mb-1">Twijfel je? Neem contact op met {sponsorNaam}</p>
                      <p className="text-cm-white text-sm opacity-80 mb-2">Je sponsor heeft dit zelf ook doorgemaakt en kan je helpen als je vastloopt.</p>
                      <a href={sponsorWaLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 Stuur {sponsorNaam} een WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => gaNaarStap(3)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                WHY-gesprek gedaan — verder naar stap 3 →
              </button>
            </div>
          )}

          {/* ───── STAP 3: HOE WERKT DE RUN ───── */}
          {stap === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Hoe werkt de 60-dagenrun?</h2>
                <p className="text-cm-white opacity-60 text-sm">Lees dit goed — dit is je speelplan voor de komende 60 dagen.</p>
              </div>

              {/* Waarom cruciaal */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap cruciaal is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Mensen die het systeem begrijpen presteren 5× beter dan mensen die "maar wat doen". De run heeft een structuur — en die structuur werkt. Je moet hem kennen om hem te kunnen volgen.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">De 3 fasen</h3>
                <div className="card border-l-4 border-[#4A9EDB]">
                  <p className="text-[#4A9EDB] font-semibold text-sm mb-1">Fase 1 · Dag 1–20: Bouwen</p>
                  <p className="text-cm-white text-sm leading-relaxed opacity-80">Je legt de basis. Elke dag contacten aanspreken, uitnodigingen sturen, namen toevoegen. Focus volledig op je warme markt — mensen die je al kent.</p>
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

              <button onClick={() => gaNaarStap(4)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                Begrepen — volgende stap →
              </button>
            </div>
          )}

          {/* ───── STAP 4: WARME MARKT ───── */}
          {stap === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Bouw je warme markt</h2>
                <p className="text-cm-white opacity-60 text-sm">Jouw eerste lijst met namen — dit is je startpunt.</p>
              </div>

              {/* Waarom cruciaal */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap cruciaal is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Geen namen = geen business. De namenlijst is je <strong className="text-cm-white">motor</strong>. Hoe meer namen, hoe meer gesprekken, hoe meer resultaten. Stel dit niet uit — elke naam telt.
                </p>
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Wie zet je op de lijst?</h3>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">Iedereen die jij kent is een potentieel contact. Denk aan vrienden, familie, collega's, buren, sportmaatjes, oud-klasgenoten, mensen van social media.</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90 font-medium">Maar ook:</p>
                <ul className="space-y-2 mt-1">
                  {[
                    "Mensen waarvan je weet dat ze op zoek zijn naar extra inkomen",
                    "Mensen die altijd praten over meer vrijheid willen of hun leven veranderen",
                    "Mensen die hun eigen baas willen zijn",
                    "Mensen waarvan je hun WHY al kent — je weet waarom dit voor hen zou werken",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-85">
                      <span className="text-cm-gold flex-shrink-0 mt-0.5">✦</span>{tip}
                    </li>
                  ))}
                </ul>
                <p className="text-cm-white text-sm leading-relaxed opacity-80 pt-2">
                  <strong className="text-cm-white">Oordeel niet vooraf</strong> over wie wel of niet geïnteresseerd is. Dat is niet jouw taak. Jouw taak is uitnodigen — zij beslissen.
                </p>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  Op de namenlijst mag je ook mensen toevoegen die het leuk vinden om producten te gebruiken — die worden dan klant. Schrijf iedereen op die in je hoofd opkomt.
                </p>
              </div>

              <div className="border-2 border-cm-gold/40 rounded-xl p-5 space-y-4 bg-gold-subtle">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="text-cm-gold font-semibold mb-1">Jouw actie nu</p>
                    <p className="text-cm-white text-sm leading-relaxed opacity-90 mb-2">
                      Voeg minimaal <strong className="text-cm-white">10–20 namen</strong> toe. Zet ze als "Prospect". Je kunt altijd meer toevoegen.
                    </p>
                    <p className="text-cm-white text-xs opacity-70">
                      👉 Na het toevoegen van namen: tik op "Terug naar setup" bovenaan de namenlijst om hier verder te gaan.
                    </p>
                  </div>
                </div>
                <Link href="/namenlijst?setup=true" className="btn-gold w-full py-3 text-center block text-sm font-bold">
                  → Open mijn namenlijst
                </Link>
              </div>

              {/* Sponsor contact */}
              {sponsorNaam && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-blue-300 font-semibold text-sm mb-1">Weet je niet wie je op de lijst moet zetten? Vraag {sponsorNaam}</p>
                      <p className="text-cm-white text-sm opacity-80 mb-2">Je sponsor kan je helpen met je eerste namen en de juiste aanpak.</p>
                      <a href={sponsorWaLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 WhatsApp {sponsorNaam}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => gaNaarStap(5)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                Namen toegevoegd — verder →
              </button>
            </div>
          )}

          {/* ───── STAP 5: UITNODIGINGSSCRIPT ───── */}
          {stap === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Je eerste uitnodigingsscript</h2>
                <p className="text-cm-white opacity-60 text-sm">Lees dit door, oefen het hardop, gebruik het.</p>
              </div>

              {/* Waarom cruciaal */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap cruciaal is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Wat je zegt maakt het verschil. Een goed script neemt de twijfel weg — bij jou én bij de ander. Je hoeft niets te verzinnen, je gebruikt een beproefd bericht dat werkt.
                </p>
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
                  {[
                    "Vervang [naam] door de echte naam",
                    "Stuur via WhatsApp, Instagram DM of ander platform",
                    "Wacht rustig op reactie — dring nooit aan",
                    "Zeggen ze ja? Plan het gesprekje met je sponsor erbij",
                    "Meer scripts vind je in de Scripts bibliotheek",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-80">
                      <span className="text-cm-gold flex-shrink-0 mt-0.5">✓</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sponsor contact */}
              {sponsorNaam && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-blue-300 font-semibold text-sm mb-1">Plan nu al een sessie met {sponsorNaam}</p>
                      <p className="text-cm-white text-sm opacity-80 mb-2">Je eerste uitnodigingen doe je het beste <strong className="text-cm-white">samen</strong> met je sponsor. Stuur nu al een berichtje om dit in te plannen.</p>
                      <a href={sponsorWaLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 Plan sessie met {sponsorNaam}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => gaNaarStap(6)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                Gelezen en begrepen →
              </button>
            </div>
          )}

          {/* ───── STAP 6: AI COACH ───── */}
          {stap === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-2">Maak kennis met jouw AI Coach</h2>
                <p className="text-cm-white opacity-60 text-sm">Jouw persoonlijke coach, 24/7 beschikbaar.</p>
              </div>

              {/* Over de AI Coach */}
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold">Wat is de AI Coach?</h3>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  De AI Coach is gebouwd op basis van de trainingen van de allerbeste trainers in aanbevelingsmarketing — met ruim <strong className="text-cm-white">30 jaar gecombineerde ervaring</strong>. Denk aan methodes van Eric Worre en Fraser Brooks.
                </p>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  De coach kent jouw WHY, je doelen en je pipeline. Samen met je sponsor is dit jouw krachtigste hulpmiddel. Gebruik hem voor:
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Klaarstaande DM-teksten voor elk type contact",
                    "Hulp bij bezwaren ('ik heb geen tijd', 'is dit een pyramid?')",
                    "Follow-up strategieën voor prospects",
                    "Motivatie als je een moeilijke dag hebt",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-80">
                      <span className="text-cm-gold flex-shrink-0">✦</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mini chat */}
              <div className="card space-y-4">
                <h3 className="text-cm-gold font-semibold text-sm">Stel nu je eerste vraag</h3>
                <p className="text-cm-white text-xs opacity-60">Kies een vraag of typ je eigen vraag:</p>

                {!coachVraag && !coachBezig && (
                  <div className="space-y-2">
                    {[
                      "Hoe reageer ik als iemand zegt 'is dit een pyramide'?",
                      "Geef me een WhatsApp DM voor iemand die ik al een tijdje niet heb gesproken.",
                      "Wat zeg ik als iemand zegt 'ik heb geen tijd'?",
                    ].map((vraag, i) => (
                      <button
                        key={i}
                        onClick={() => stelCoachVraag(vraag)}
                        className="w-full text-left p-3 rounded-xl bg-cm-surface-2 border border-cm-border text-cm-white text-sm hover:border-cm-gold transition-colors"
                      >
                        💬 {vraag}
                      </button>
                    ))}
                  </div>
                )}

                {coachVraag && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-cm-gold/20 border border-cm-gold/30 rounded-xl px-4 py-2.5">
                        <p className="text-cm-white text-sm">{coachVraag}</p>
                      </div>
                    </div>

                    {(coachBezig || coachAntwoord) && (
                      <div className="flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full bg-cm-gold/20 border border-cm-gold/40 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">🤖</div>
                        <div className="flex-1 bg-cm-surface-2 rounded-xl px-4 py-3">
                          {coachBezig && !coachAntwoord && (
                            <div className="flex gap-1 items-center">
                              <div className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce delay-100" />
                              <div className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce delay-200" />
                            </div>
                          )}
                          {coachAntwoord && (
                            <p className="text-cm-white text-sm leading-relaxed whitespace-pre-wrap">{coachAntwoord}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {coachGedaan && (
                <button onClick={() => gaNaarStap(7)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                  Top — verder naar mijn dagdoelen →
                </button>
              )}
              {!coachGedaan && !coachVraag && (
                <button onClick={() => gaNaarStap(7)} disabled={bezig} className="btn-secondary w-full py-2.5 text-sm opacity-70">
                  Sla over — ga door zonder vraag
                </button>
              )}
            </div>
          )}

          {/* ───── STAP 7: DAGDOEL ───── */}
          {stap === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Stel je dagdoel in</h2>
                <p className="text-cm-white opacity-60 text-sm">Wat ga jij elke dag minimaal doen? Wees realistisch.</p>
              </div>

              {/* Waarom cruciaal */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap cruciaal is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Doelen zonder getallen zijn wensen. Getallen zonder doelen zijn druk. Stel in wat je <strong className="text-cm-white">realistisch elke dag</strong> kunt halen — dan wordt het een gewoonte, geen last.
                </p>
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
                {bezig ? "Opslaan..." : "Opslaan en naar de finish →"}
              </button>
            </div>
          )}

          {/* ───── STAP 8: KLAAR! ───── */}
          {stap === 8 && (
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
                <h3 className="text-cm-gold font-semibold text-sm mb-3">Wat je hebt afgerond</h3>
                {[
                  "✓ App geïnstalleerd",
                  "✓ WHY-gesprek voltooid",
                  "✓ 60-dagenrun begrepen",
                  "✓ Eerste namen toegevoegd",
                  "✓ Uitnodigingsscript gelezen",
                  "✓ AI Coach ontdekt",
                  "✓ Dagdoelen ingesteld",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-cm-white opacity-80">
                    <span className="text-cm-gold text-base">✓</span>{item.replace("✓ ", "")}
                  </div>
                ))}
              </div>

              <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-5 text-left">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🤝</span>
                  <div>
                    <p className="text-amber-400 font-semibold mb-1">
                      Eerste actie: plan een sessie met {sponsorNaam || "je sponsor"}
                    </p>
                    <p className="text-cm-white text-sm leading-relaxed opacity-80 mb-2">
                      Stuur je sponsor een berichtje dat je klaar bent. Plan een moment om samen je eerste uitnodigingen te versturen.
                    </p>
                    {sponsorNaam && (
                      <a href={sponsorWaLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 Stuur {sponsorNaam} een WhatsApp
                      </a>
                    )}
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

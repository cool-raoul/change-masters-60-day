"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PushNotificationToggle } from "@/components/pwa/PushNotificationToggle";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { ONBOARDING_FILM_SLUGS } from "@/lib/films/embed";

const SPONSOR_TEL = "https://wa.me/31612345678"; // fallback — wordt dynamisch geladen

function Stap4NamenlijstInline({
  userId,
  onVerder,
  bezig,
  sponsorNaam,
  sponsorWaLink,
  isPreview,
}: {
  userId: string | null;
  onVerder: () => void;
  bezig: boolean;
  sponsorNaam: string;
  sponsorWaLink: string;
  isPreview: boolean;
}) {
  const [naam, setNaam] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [toegevoegd, setToegevoegd] = useState<{ naam: string; telefoon: string }[]>([]);
  const [bezig2, setBezig2] = useState(false);
  const supabase = createClient();

  async function voegToe(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim() || !userId) return;
    setBezig2(true);

    // In preview-modus: sla niets op in de database
    if (!isPreview) {
      const { error } = await supabase.from("prospects").insert({
        user_id: userId,
        volledige_naam: naam.trim(),
        telefoon: telefoon.trim() || null,
        pipeline_fase: "prospect",
        bron: "warm",
      });
      if (error) {
        console.error("Prospect opslaan mislukt:", error);
        alert("Opslaan mislukt: " + error.message);
        setBezig2(false);
        return;
      }
    }

    setToegevoegd((prev) => [...prev, { naam: naam.trim(), telefoon: telefoon.trim() }]);
    setNaam("");
    setTelefoon("");
    setBezig2(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-cm-white mb-1">Bouw je warme markt</h2>
        <p className="text-cm-white opacity-60 text-sm">Jouw eerste lijst met namen — dit is je startpunt.</p>
      </div>

      <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
        <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom minimaal 5 namen verplicht zijn</p>
        <p className="text-cm-white text-sm leading-relaxed opacity-90">
          Geen namen = geen business. Wie met minder dan 5 namen begint, staat na dag 3 stil. De statistieken zijn duidelijk: teamleden die met 20+ namen starten hebben <strong className="text-cm-white">4× meer kans</strong> op succes in de eerste 30 dagen. Begin breed — jij beslist niet voor ze, zij beslissen zelf.
        </p>
        <p className="text-cm-white text-sm opacity-80">
          🎯 Doel: zo veel mogelijk namen. Minimaal 5 om verder te gaan — maar 20 is beter.
        </p>
      </div>

      <div className="card space-y-3">
        <h3 className="text-cm-gold font-semibold text-sm">Wie zet je op de lijst?</h3>
        <p className="text-cm-white text-sm leading-relaxed opacity-90">Iedereen die jij kent: vrienden, familie, collega&apos;s, buren, sportmaatjes, oud-klasgenoten, social media contacten.</p>
        <p className="text-cm-white text-sm font-medium text-white opacity-95">Maar ook:</p>
        <ul className="space-y-2 mt-1">
          {[
            "Mensen die op zoek zijn naar extra inkomen",
            "Mensen die praten over meer vrijheid of hun leven veranderen",
            "Mensen die hun eigen baas willen zijn",
            "Mensen waarvan je hun WHY al kent",
          ].map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-cm-white opacity-85">
              <span className="text-cm-gold flex-shrink-0">✦</span>{tip}
            </li>
          ))}
        </ul>
        <p className="text-cm-white text-sm opacity-80 pt-1">
          <strong className="text-cm-white">Oordeel niet vooraf.</strong> Schrijf iedereen op. Zij beslissen zelf.
        </p>
      </div>

      {/* Inline add form */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-cm-gold font-semibold text-sm">Voeg namen toe</h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${toegevoegd.length >= 5 ? "bg-green-900/40 border-green-600/30 text-green-400" : "bg-amber-900/30 border-amber-600/30 text-amber-300"}`}>
            {toegevoegd.length}/5 minimum
          </span>
        </div>

        <p className="text-cm-white text-xs opacity-60 -mt-1">
          Naam en telefoonnummer is genoeg voor nu. Je kunt later meer informatie toevoegen (e-mail, notities, platform) via de namenlijst.
        </p>

        <form onSubmit={voegToe} className="space-y-3">
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Voor- en achternaam"
            className="input-cm w-full"
            required
          />
          <input
            type="tel"
            value={telefoon}
            onChange={(e) => setTelefoon(e.target.value)}
            placeholder="Telefoonnummer (optioneel)"
            className="input-cm w-full"
          />
          <button
            type="submit"
            disabled={bezig2 || !naam.trim()}
            className="btn-gold w-full py-2.5 text-sm disabled:opacity-50"
          >
            {bezig2 ? "Toevoegen..." : "+ Toevoegen aan lijst"}
          </button>
        </form>

        {toegevoegd.length > 0 && (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pt-1">
            {toegevoegd.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm py-1.5 border-b border-cm-border/50 last:border-0">
                <span className="text-cm-gold text-xs">✓</span>
                <span className="text-cm-white">{item.naam}</span>
                {item.telefoon && <span className="text-cm-white opacity-40 text-xs ml-auto">{item.telefoon}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {sponsorNaam && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
          <div className="flex gap-3 items-start">
            <span className="text-2xl flex-shrink-0">💬</span>
            <div>
              <p className="text-blue-300 font-semibold text-sm mb-1">Weet je niet wie je op de lijst moet zetten? Vraag {sponsorNaam}</p>
              <a href={sponsorWaLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                💬 WhatsApp {sponsorNaam}
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {toegevoegd.length < 5 && (
          <div className="flex gap-1.5 justify-center">
            {[1,2,3,4,5].map((n) => (
              <div key={n} className={`h-2 flex-1 rounded-full transition-all ${n <= toegevoegd.length ? "bg-cm-gold" : "bg-cm-surface-2"}`} />
            ))}
          </div>
        )}
        <button
          onClick={onVerder}
          disabled={bezig || toegevoegd.length < 5}
          className="btn-gold w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {toegevoegd.length < 5
            ? `Nog ${5 - toegevoegd.length} naam${5 - toegevoegd.length !== 1 ? "en" : ""} nodig`
            : `${toegevoegd.length} namen toegevoegd — verder →`}
        </button>
        {toegevoegd.length >= 5 && toegevoegd.length < 20 && (
          <p className="text-center text-xs text-cm-white opacity-50">💡 Tip: meer namen = meer kans op succes. Je kunt altijd doorgaan via de namenlijst.</p>
        )}
      </div>
    </div>
  );
}

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
      // veld is optioneel — alleen gevuld bij stappen waarvoor we al een
      // boolean kolom hebben in onboarding_voortgang. De nieuwe Lifeplus-
      // admin-stappen (6 t/m 10) hebben (nog) geen DB-veld; daar volstaat
      // de onboarding_stap-update + push.
      const stapActies: Record<number, { veld?: string; pushNaam: string }> = {
        2:  { veld: "stap_1_welkom", pushNaam: "heeft de app geïnstalleerd 📱" },
        3:  { veld: "stap_2_run",    pushNaam: "heeft zijn/haar WHY gemaakt 💛" },
        4:  { veld: "stap_3_namen",  pushNaam: "begrijpt de 60-dagenrun 📖" },
        5:  { veld: "stap_4_script", pushNaam: "heeft de namenlijst aangemaakt 📝" },
        6:  { veld: "stap_4_script", pushNaam: "heeft het uitnodigingsscript gelezen 💬" },
        7:  {                         pushNaam: "heeft de Lifeplus webshop aangemaakt 🛒" },
        8:  {                         pushNaam: "heeft Teams-administratie ingediend 📋" },
        9:  {                         pushNaam: "heeft het kredietformulier ingevuld ✅" },
        10: {                         pushNaam: "heeft bestellinks ingesteld 🔗" },
        11: {                         pushNaam: "is gestart met Eric Worre's Seven Skills 🎧" },
      };

      if (stapActies[nieuweStap]) {
        const { veld, pushNaam } = stapActies[nieuweStap];
        if (veld) await slaVoortgangOp({ [veld]: true });
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
        data: { onboarding_stap: 99, dagdoel_contacten: dagdoelContacten, dagdoel_uitnodigingen: dagdoelUitnodigingen, dagdoel_followups: dagdoelFollowups },
      });
      await slaVoortgangOp({ stap_5_doelen: true });
      await stuurPushNaarSponsor("heeft de volledige setup afgerond en is klaar voor dag 1! 🎉");
    }
    setBezig(false);
    router.push("/coach");
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

  const totaalStappen = 6;
  const voortgang = stap <= totaalStappen ? ((stap - 1) / totaalStappen) * 100 : 100;

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
          {stap <= totaalStappen && (
            <span className="text-sm text-cm-white opacity-60">Stap {stap} van {totaalStappen}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {stap <= totaalStappen && (
        <div className="h-1 bg-cm-surface">
          <div className="h-1 bg-cm-gold transition-all duration-500" style={{ width: `${voortgang}%` }} />
        </div>
      )}

      {/* Stap bollen */}
      {stap <= totaalStappen && (
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

          {/* ───── STAP 1: WELKOM + APP + PUSH ───── */}
          {stap === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-3xl font-display font-bold text-cm-white mb-2">Welkom, {gebruikersnaam}!</h2>
                <p className="text-cm-white opacity-60 text-sm">We zetten je in 11 stappen klaar voor de 60-dagenrun.</p>
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
                    <li>Kies &quot;Zet op beginscherm&quot;</li>
                    <li>Tik op &quot;Voeg toe&quot;</li>
                    <li>Open de app daarna vanuit je beginscherm</li>
                  </ol>
                </div>
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <p className="text-cm-white text-sm font-semibold">🌟 Android (Chrome):</p>
                  <ol className="text-cm-white text-sm opacity-80 space-y-1 list-decimal list-inside">
                    <li>Tik op de drie puntjes rechtsboven</li>
                    <li>Kies &quot;Toevoegen aan startscherm&quot;</li>
                    <li>Tik op &quot;Toevoegen&quot;</li>
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
                <h3 className="text-cm-gold font-semibold">Wat doe je in deze 11 stappen?</h3>
                <ul className="space-y-2">
                  {[
                    { icoon: "💛", tekst: "Je ontdekt jouw persoonlijke WHY" },
                    { icoon: "📖", tekst: "Je leert hoe de 60-dagenrun werkt" },
                    { icoon: "📝", tekst: "Je voegt je eerste namen toe" },
                    { icoon: "💬", tekst: "Je leest je uitnodigingsscript" },
                    { icoon: "🛒", tekst: "Je opent je Lifeplus webshop" },
                    { icoon: "📋", tekst: "Je vult je Teams-administratie in" },
                    { icoon: "✅", tekst: "Je tekent het kredietformulier" },
                    { icoon: "🔗", tekst: "Je koppelt je bestellinks aan ELEVA" },
                    { icoon: "🎧", tekst: "Je start met Eric Worre's Seven Skills" },
                    { icoon: "🎯", tekst: "Je stelt je dagdoelen in en opent de ELEVA Mentor" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-cm-white">
                      <span className="text-xl">{item.icoon}</span>{item.tekst}
                    </li>
                  ))}
                </ul>
                <p className="text-cm-white text-xs opacity-50 pt-1">De setup-stappen kosten ~15-20 minuten. De admin-stappen 6-9 doe je idealiter in de eerste week — niet alles hoeft per se vandaag.</p>
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
                  Je WHY is niet &quot;meer geld verdienen&quot; — maar wat dat geld betekent voor jou en je gezin.
                  Als je WHY sterk genoeg is, vind je altijd de weg.
                </p>
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold">Hoe werkt het WHY-gesprek?</h3>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  Een ELEVA Mentor stelt je de juiste vragen om jouw echte motivatie boven water te krijgen — net zoals een echte persoonlijke coach dat zou doen. Geen formulier invullen, maar een echt gesprek. Dit duurt 5–10 minuten.
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
                <Link href={isPreview ? "/mijn-why?preview=true" : "/mijn-why"} className="btn-gold w-full py-3 text-center block font-bold">
                  {isPreview ? "Preview: WHY-gesprek (slaat niets op)" : "Start het WHY-gesprek →"}
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
                  Mensen die het systeem begrijpen presteren 5× beter dan mensen die &quot;maar wat doen&quot;. De run heeft een structuur — en die structuur werkt. Je moet hem kennen om hem te kunnen volgen.
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
                <p className="text-cm-white text-sm text-center leading-relaxed italic">&quot;Consistentie slaat motivatie altijd. Doe elke dag iets, ook als je het niet voelt.&quot;</p>
              </div>

              <button onClick={() => gaNaarStap(4)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                Begrepen — volgende stap →
              </button>
            </div>
          )}

          {/* ───── STAP 4: WARME MARKT (inline form) ───── */}
          {stap === 4 && (
            <Stap4NamenlijstInline userId={userId} onVerder={() => gaNaarStap(5)} bezig={bezig} sponsorNaam={toonSponsorNaam} sponsorWaLink={toonSponsorLink} isPreview={isPreview} />
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

              {/* Script 1 — Persoonlijk */}
              <div className="bg-cm-surface-2 border border-cm-gold/30 rounded-xl p-5 space-y-3">
                <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">✦ Script 1 — Persoonlijk (bellen of voice memo)</p>
                <div className="space-y-3 text-cm-white text-sm leading-relaxed border-l-2 border-cm-gold/30 pl-4 italic">
                  <p>"Hey [naam], ik moest even aan je denken en daarom bel ik je.</p>
                  <p>Ik ga over twee weken starten met iets waar ik 60 dagen echt vol voor ga. Een soort sprint, maar dan wel eentje waar ik echt impact mee wil maken.</p>
                  <p>En toen ik nadacht met wie ik dat zou willen doen… kwam jij in me op.</p>
                  <p>Ik weet niet of het bij je past. Maar ik weet wel dat jij iemand bent die dingen voor elkaar krijgt.</p>
                  <p>Dus voordat ik het straks overal ga delen… wilde ik jou als eerste even meenemen.</p>
                  <p className="not-italic text-cm-gold font-medium">Zullen we even samen zitten? Koffie, lunch of even via Zoom?"</p>
                </div>
              </div>

              {/* Script 2 — DM / WhatsApp */}
              <div className="bg-cm-surface-2 border border-cm-gold/30 rounded-xl p-5 space-y-3">
                <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">✦ Script 2 — Direct & Eerlijk (WhatsApp / DM)</p>
                <div className="space-y-3 text-cm-white text-sm leading-relaxed border-l-2 border-cm-gold/30 pl-4 italic">
                  <p>"Oké, ik ga gewoon eerlijk zijn.</p>
                  <p>Ik ga de komende 60 dagen iets neerzetten waar ik vol voor ga. En toen ik nadacht met wie ik dat zou willen doen… kwam jij meteen in me op.</p>
                  <p>Omdat jij niet iemand bent die een beetje aanklooit. Als jij iets doet, doe je het goed.</p>
                  <p>Ik ga je alles laten zien — de producten, het plan, hoe het werkt… dat komt allemaal. Maar eerst wil ik eigenlijk één ding weten:</p>
                  <p className="not-italic text-cm-gold font-medium">Stel dat alles klopt, stel dat je voelt: dit past bij mij — zou je dan zeggen: hier wil ik bij zijn?"</p>
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Hoe gebruik je dit?</h3>
                <ul className="space-y-2">
                  {[
                    "Vervang [naam] door de echte naam — persoonlijk werkt altijd beter",
                    "Bellen of voice memo werkt sterker dan tekst",
                    "Wacht rustig op reactie — dring nooit aan",
                    "Zeggen ze ja? Plan het gesprekje samen met je sponsor",
                    "De ELEVA Mentor schrijft een persoonlijk DM voor elk contact op je lijst",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-80">
                      <span className="text-cm-gold flex-shrink-0 mt-0.5">✓</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sponsor contact */}
              {toonSponsorNaam && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-blue-300 font-semibold text-sm mb-1">Plan nu al een sessie met {toonSponsorNaam}</p>
                      <p className="text-cm-white text-sm opacity-80 mb-2">Je eerste uitnodigingen doe je het beste <strong className="text-cm-white">samen</strong> met je sponsor. Stuur nu al een berichtje om dit in te plannen.</p>
                      <a href={toonSponsorLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 Plan sessie met {toonSponsorNaam}
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

          {/* ───── STAP 6: LIFEPLUS WEBSHOP AANMAKEN ───── */}
          {stap === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">🛒 Open je Lifeplus webshop</h2>
                <p className="text-cm-white opacity-60 text-sm">Je eigen gratis shop — waar prospects bestellen en jij de bonus krijgt.</p>
              </div>

              {/* Waarom belangrijk */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap belangrijk is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Zonder eigen shop-link kun je geen bestellingen ontvangen die aan jou gekoppeld zijn. Dit is een eenmalige opzet — daarna staat je shop levenslang.
                </p>
              </div>

              {/* Film via CMS — leider beheert via /instellingen/films */}
              <div className="card space-y-3">
                <FilmInBlok
                  slug={ONBOARDING_FILM_SLUGS.STAP_6_WEBSHOP}
                  fallbackTitel="📹 Bekijk de video: Lifeplus webshop in 5 minuten"
                  fallbackTekst="Film volgt — vraag je sponsor om mee te kijken bij het opzetten."
                />
              </div>

              {/* Wat je nodig hebt */}
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Wat je nodig hebt</h3>
                <ul className="space-y-2">
                  {[
                    "Je Lifeplus inloggegevens",
                    "Een profielfoto (vierkant, minimaal 500x500px)",
                    "Een idee voor je shop-naam (bv. je voornaam-achternaam)",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-85">
                      <span className="text-cm-gold flex-shrink-0">✦</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sponsor contact */}
              {toonSponsorNaam && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-blue-300 font-semibold text-sm mb-1">Vraag {toonSponsorNaam} om mee te kijken</p>
                      <p className="text-cm-white text-sm opacity-80 mb-2">Heb je hulp nodig met je shop-naam of profielfoto? Stuur even een berichtje.</p>
                      <a href={toonSponsorLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-900/40 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                        💬 Stuur {toonSponsorNaam} een WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => gaNaarStap(7)} disabled={bezig} className="btn-gold flex-1 py-3 text-base">
                  Webshop staat — verder →
                </button>
                <button onClick={() => gaNaarStap(7)} disabled={bezig} className="btn-secondary py-3 text-sm whitespace-nowrap">
                  Doe ik later
                </button>
              </div>
            </div>
          )}

          {/* ───── STAP 7: TEAMS-ADMINISTRATIE ───── */}
          {stap === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">📋 Vul je Teams-administratie in</h2>
                <p className="text-cm-white opacity-60 text-sm">Eenmalige registratie als zelfstandig Lifeplus Partner.</p>
              </div>

              {/* Waarom belangrijk */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap belangrijk is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Zonder voltooide Teams-administratie kun je geen commissie ontvangen. Doe dit zo snel mogelijk — verwerking duurt 1-2 werkdagen.
                </p>
              </div>

              {/* Film via CMS */}
              <div className="card space-y-3">
                <FilmInBlok
                  slug={ONBOARDING_FILM_SLUGS.STAP_7_TEAMS_ADMIN}
                  fallbackTitel="📹 Bekijk de video: Teams-administratie stap-voor-stap"
                  fallbackTekst="Film volgt — neem alvast je BSN, bankgegevens en ID-bewijs erbij."
                />
              </div>

              {/* Wat je bij de hand wilt hebben */}
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Wat heb je bij de hand?</h3>
                <ul className="space-y-2">
                  {[
                    "Je BSN (of KvK-nummer als je een eigen onderneming hebt)",
                    "Bankgegevens voor uitbetaling van commissie",
                    "Geldig identiteitsbewijs (paspoort of ID-kaart, foto/scan)",
                    "Een rustig moment van ~15 minuten",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-85">
                      <span className="text-cm-gold flex-shrink-0">✦</span>{item}
                    </li>
                  ))}
                </ul>
                <p className="text-cm-white text-xs opacity-60 italic pt-1">
                  Tip: doe dit ergens privé — je deelt persoonlijke info en uploadt een ID.
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => gaNaarStap(8)} disabled={bezig} className="btn-gold flex-1 py-3 text-base">
                  Administratie ingediend — verder →
                </button>
                <button onClick={() => gaNaarStap(8)} disabled={bezig} className="btn-secondary py-3 text-sm whitespace-nowrap">
                  Doe ik later
                </button>
              </div>
            </div>
          )}

          {/* ───── STAP 8: KREDIETFORMULIER ───── */}
          {stap === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">✅ Vul het kredietformulier in</h2>
                <p className="text-cm-white opacity-60 text-sm">Korte verklaring voor betalingsvoorwaarden — duurt ~5 minuten.</p>
              </div>

              {/* Waarom belangrijk */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap belangrijk is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Veel mensen vergeten deze stap en lopen tegen problemen aan bij hun eerste bestelling. Doe het direct — dan is het geregeld.
                </p>
              </div>

              {/* Film via CMS */}
              <div className="card space-y-3">
                <FilmInBlok
                  slug={ONBOARDING_FILM_SLUGS.STAP_8_KREDIETFORMULIER}
                  fallbackTitel="📹 Bekijk de video: kredietformulier in 5 minuten"
                  fallbackTekst="Film volgt — directe link naar het formulier komt bij de video."
                />
              </div>

              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">Wat staat erin?</h3>
                <ul className="space-y-2">
                  {[
                    "Persoonsgegevens (al bekend uit Teams-administratie)",
                    "Akkoord met betalingsvoorwaarden",
                    "Voorkeur voor automatische incasso (sterk aangeraden — geen onderbrekingen)",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-85">
                      <span className="text-cm-gold flex-shrink-0">✦</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => gaNaarStap(9)} disabled={bezig} className="btn-gold flex-1 py-3 text-base">
                  Formulier ingevuld — verder →
                </button>
                <button onClick={() => gaNaarStap(9)} disabled={bezig} className="btn-secondary py-3 text-sm whitespace-nowrap">
                  Doe ik later
                </button>
              </div>
            </div>
          )}

          {/* ───── STAP 9: BESTELLINKS INSTELLEN ───── */}
          {stap === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">🔗 Koppel je bestellinks aan ELEVA</h2>
                <p className="text-cm-white opacity-60 text-sm">Niet verplicht — wel sterk aangeraden voor de productadvies-flow.</p>
              </div>

              {/* Waarom belangrijk */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom deze stap aangeraden is</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Met bestellinks kunnen prospects direct vanuit hun productadvies bestellen — via jouw shop, dus jij krijgt de bonus. Zonder bestellinks moet je elke keer handmatig je shop-URL doorsturen.
                </p>
              </div>

              {/* Film via CMS */}
              <div className="card space-y-3">
                <FilmInBlok
                  slug={ONBOARDING_FILM_SLUGS.STAP_9_BESTELLINKS}
                  fallbackTitel="📹 Bekijk de video: bestellinks instellen"
                  fallbackTekst="Film volgt — voor nu kun je via de knop hieronder direct naar de instellingen."
                />
              </div>

              <Link href={isPreview ? "/instellingen?preview=true" : "/instellingen"} className="btn-gold w-full py-3 text-center block font-bold">
                Open instellingen → bestellinks
              </Link>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => gaNaarStap(10)} disabled={bezig} className="btn-gold flex-1 py-3 text-base">
                  Bestellinks ingesteld — verder →
                </button>
                <button onClick={() => gaNaarStap(10)} disabled={bezig} className="btn-secondary py-3 text-sm whitespace-nowrap">
                  Doe ik later
                </button>
              </div>
            </div>
          )}

          {/* ───── STAP 10: ERIC WORRE — SEVEN SKILLS ───── */}
          {stap === 10 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-1">🎧 Eric Worre — Seven Skills</h2>
                <p className="text-cm-white opacity-60 text-sm">Wereldwijd de meest gerespecteerde trainer in network marketing.</p>
              </div>

              {/* Waarom */}
              <div className="bg-amber-900/25 border border-amber-500/40 rounded-xl p-4 space-y-2">
                <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">⚡ Waarom luisteren?</p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  De 7 vaardigheden die elke succesvolle netwerker beheerst. Niet één keer doorkijken — <strong className="text-cm-white">herhalend aanhoren</strong>.
                  Wat Eric vertelt landt na de 4e of 5e keer pas écht. Onze aanbeveling: dagelijks luisteren in de auto, tijdens werk of op een wandeling.
                </p>
              </div>

              {/* Spotify embed */}
              <div className="rounded-xl overflow-hidden border border-cm-border">
                <iframe
                  style={{ borderRadius: "12px" }}
                  src="https://open.spotify.com/embed/album/3pX4DrWPVsjW8GCE2XYd7D?utm_source=generator&theme=0"
                  width="100%"
                  height="380"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Eric Worre — Seven Skills van Network Marketing Pro's"
                />
              </div>

              {/* De 7 skills */}
              <div className="card space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm">De 7 Skills</h3>
                <ul className="space-y-2">
                  {[
                    "Discover the Possibilities — wat is écht mogelijk in dit vak",
                    "Develop a Personal Vision — een visie zo helder dat hij je dagelijks trekt",
                    "Master the 7 Slight Edge Skills — kleine dagelijkse acties die alles veranderen",
                    "Build the Right Team — wie je sponsort bepaalt je toekomst",
                    "Develop a Lifestyle of Personal Development — je eigen ontwikkeling staat centraal",
                    "Create Massive Action — méér actie ondernemen dan je gewend bent",
                    "Be a Leader Worth Following — leiderschap = het waard zijn om gevolgd te worden",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cm-white opacity-85">
                      <span className="text-cm-gold flex-shrink-0 font-bold">{i + 1}.</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={() => gaNaarStap(11)} disabled={bezig} className="btn-gold w-full py-3 text-base">
                Ik ga deze week luisteren — verder →
              </button>
            </div>
          )}

          {/* ───── STAP 11: DAGDOELEN + AI COACH FINALE (was stap 6) ───── */}
          {stap === 11 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-display font-bold text-cm-white mb-2">Stel je dagdoelen in</h2>
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

              {/* ELEVA Mentor intro */}
              <div className="card space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌟</span>
                  <h3 className="text-cm-gold font-semibold">Jouw ELEVA Mentor staat klaar</h3>
                </div>
                <p className="text-cm-white text-sm leading-relaxed opacity-80">
                  De ELEVA Mentor is gebouwd op basis van 60 jaar gecombineerde ervaring in aanbevelingsmarketing. Na het opslaan van je doelen open je de ELEVA Mentor direct — jouw krachtigste hulpmiddel naast je sponsor.
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

              <div className="bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-xl p-5 text-center space-y-3">
                <p className="text-[#D4AF37] font-bold">Jouw setup is compleet 🎉</p>
                <p className="text-cm-white text-sm opacity-70 leading-relaxed">
                  Sla je dagdoelen op — de coach opent en je bent klaar om dag 1 te starten.
                </p>
              </div>

              <button onClick={slaDoelOp} disabled={bezig} className="btn-gold w-full py-4 text-lg font-bold disabled:opacity-50">
                {bezig ? "Laden..." : "Opslaan en open de ELEVA Mentor →"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

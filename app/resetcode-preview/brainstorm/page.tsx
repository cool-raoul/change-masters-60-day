// File: app/resetcode-preview/brainstorm/page.tsx
//
// Design-brainstorm voor de Resetcode-klantomgeving (feedback
// Raoul 10 juli: "echt out of the box"). Vijf totaal
// verschillende richtingen, elk als levende mini-mockup in een
// telefoon-frame. Raoul wijst de richting aan (of een combi),
// daarna wordt de hele klantomgeving in die stijl gebouwd.
// Toegang: founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResetcodeBrainstorm() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as { role?: string | null; is_tester?: boolean | null } | null;
  if (!(p?.role === "founder" || p?.is_tester === true)) redirect("/dashboard");

  return (
    <main
      className="mx-auto max-w-6xl px-4 py-8 min-h-screen"
      style={{ backgroundColor: "#FAF6EF" }}
    >
      <style>{`
        @keyframes zweef { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes wieg { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
        @keyframes pols { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.15); opacity: .85 } }
        @keyframes glinster { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
        @keyframes ring { from { stroke-dashoffset: 220 } to { stroke-dashoffset: 60 } }
        @keyframes groei { from { transform: scaleY(.7); opacity:.6 } to { transform: scaleY(1); opacity:1 } }
        .zweef { animation: zweef 3.5s ease-in-out infinite }
        .wieg { animation: wieg 4s ease-in-out infinite; transform-origin: bottom center }
        .pols { animation: pols 2s ease-in-out infinite }
        .glinster { animation: glinster 2.6s ease-in-out infinite }
      `}</style>

      <header className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-stone-400">
          Brainstorm · klantomgeving
        </p>
        <h1 className="font-serif-warm text-4xl text-stone-800 mt-2">
          Vijf richtingen, kies jouw wauw
        </h1>
        <p className="text-stone-500 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          Elk telefoontje hieronder is een andere wereld voor dezelfde
          Resetcode. Wijs aan welke het wordt, of zeg &quot;A met het
          knopje van D&quot;. Daarna bouw ik de hele omgeving in die stijl.
        </p>
        <Link
          href="/resetcode-preview"
          className="inline-block mt-3 text-xs font-semibold text-stone-400 hover:text-stone-600"
        >
          ← Terug naar de huidige preview
        </Link>
      </header>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
        {/* ================= A · HET GROEIPAD ================= */}
        <section className="w-full max-w-sm">
          <div
            className="rounded-[2.6rem] overflow-hidden shadow-xl border-8 border-stone-900 mx-auto"
            style={{ width: 320, height: 600, background: "linear-gradient(180deg,#BDE3F0 0%,#DFF2D8 45%,#8FC98B 100%)" }}
          >
            <div className="px-5 pt-8 text-center">
              <p className="text-[10px] font-extrabold tracking-[0.2em] text-emerald-900/60 uppercase">Holistic Reset</p>
              <h3 className="font-serif-warm text-2xl text-emerald-950">Jouw pad omhoog</h3>
            </div>
            {/* slingerend pad */}
            <div className="relative mt-2" style={{ height: 430 }}>
              <svg viewBox="0 0 320 430" className="absolute inset-0 h-full w-full">
                <path d="M160 415 C 40 380, 280 330, 160 290 C 40 250, 280 200, 160 160 C 60 125, 260 90, 160 50"
                  fill="none" stroke="#ffffff" strokeWidth="26" strokeLinecap="round" opacity="0.7" />
                <path d="M160 415 C 40 380, 280 330, 160 290 C 40 250, 280 200, 160 160 C 60 125, 260 90, 160 50"
                  fill="none" stroke="#5C9E58" strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" />
              </svg>
              {/* stations op het pad */}
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 20 }}>
                <div className="h-14 w-14 rounded-full bg-white/60 border-4 border-dashed border-emerald-700/40 flex items-center justify-center text-2xl">🌳</div>
              </div>
              <div className="absolute" style={{ top: 120, left: 52 }}>
                <div className="h-14 w-14 rounded-full bg-white/60 border-4 border-dashed border-emerald-700/40 flex items-center justify-center text-2xl">⚖️</div>
              </div>
              <div className="absolute" style={{ top: 205, right: 48 }}>
                <div className="h-16 w-16 rounded-full bg-amber-400 border-4 border-white shadow-lg flex items-center justify-center text-3xl pols">🔥</div>
                <p className="text-[10px] font-bold text-emerald-950 text-center mt-1 bg-white/80 rounded-full px-2">JIJ · dag 8</p>
              </div>
              <div className="absolute" style={{ top: 300, left: 55 }}>
                <div className="h-14 w-14 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center text-2xl">😋<span className="absolute -top-1 -right-1 bg-white rounded-full text-xs h-5 w-5 flex items-center justify-center">✓</span></div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 385 }}>
                <div className="h-12 w-12 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center text-xl">📸<span className="absolute -top-1 -right-1 bg-white rounded-full text-xs h-5 w-5 flex items-center justify-center">✓</span></div>
              </div>
              <span className="absolute text-2xl zweef" style={{ top: 60, left: 30 }}>☁️</span>
              <span className="absolute text-xl zweef" style={{ top: 150, right: 25, animationDelay: "1s" }}>🦋</span>
              <span className="absolute text-lg glinster" style={{ top: 250, left: 28 }}>✨</span>
            </div>
            <div className="mx-4 rounded-2xl bg-white/85 backdrop-blur px-4 py-2.5 text-center shadow">
              <p className="text-xs font-bold text-emerald-900">Dag 8 van fase 2 · nog 13 te gaan 💪</p>
            </div>
          </div>
          <h2 className="font-bold text-stone-800 text-lg mt-4 text-center">A · Het Groeipad</h2>
          <p className="text-sm text-stone-500 text-center leading-relaxed mt-1">
            Je reis als speels wandelpad de berg op (Duolingo-gevoel). Elke dag
            een stapje op het pad, afgeronde fases krijgen een vinkje, jouw
            plek pulseert. Voortgang die je VOELT.
          </p>
        </section>

        {/* ================= B · DAG-RINGEN ================= */}
        <section className="w-full max-w-sm">
          <div
            className="rounded-[2.6rem] overflow-hidden shadow-xl border-8 border-stone-900 mx-auto"
            style={{ width: 320, height: 600, background: "linear-gradient(160deg,#1E2B4A 0%,#2E4370 60%,#7A5A9E 100%)" }}
          >
            <div className="px-6 pt-9">
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Goedemorgen Marieke ☀️</p>
              <h3 className="font-serif-warm text-2xl text-white mt-1">Jouw dag in één oogopslag</h3>
            </div>
            <div className="flex justify-center mt-5">
              <div className="relative h-44 w-44">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff22" strokeWidth="7" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#4ADE80" strokeWidth="7" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="70" />
                  <circle cx="50" cy="50" r="34" fill="none" stroke="#ffffff22" strokeWidth="7" />
                  <circle cx="50" cy="50" r="34" fill="none" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" strokeDasharray="214" strokeDashoffset="90" />
                  <circle cx="50" cy="50" r="23" fill="none" stroke="#ffffff22" strokeWidth="7" />
                  <circle cx="50" cy="50" r="23" fill="none" stroke="#FBBF24" strokeWidth="7" strokeLinecap="round" strokeDasharray="145" strokeDashoffset="30" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black text-white">8</p>
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">dag · fase 2</p>
                </div>
              </div>
            </div>
            <div className="px-6 mt-3 space-y-1.5">
              <p className="text-xs text-white/80">🟢 Dagregels &nbsp;·&nbsp; 3 van 4 gedaan</p>
              <p className="text-xs text-white/80">🔵 Water &nbsp;·&nbsp; 1,0 van 1,5 liter</p>
              <p className="text-xs text-white/80">🟡 Producten &nbsp;·&nbsp; ochtend ✓ &nbsp;avond ⬜</p>
            </div>
            <div className="mx-5 mt-4 rounded-2xl bg-white/10 backdrop-blur px-4 py-3">
              <p className="text-[11px] text-white/90 leading-relaxed">💬 <b>Mentor:</b> &quot;Weegschaal stond stil vannacht? Vocht. Hoort erbij. Vandaag gewoon door, jij bent goed bezig.&quot;</p>
            </div>
            <div className="flex justify-center mt-4">
              <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-lg pols">🎙️</div>
            </div>
          </div>
          <h2 className="font-bold text-stone-800 text-lg mt-4 text-center">B · De Dag-ringen</h2>
          <p className="text-sm text-stone-500 text-center leading-relaxed mt-1">
            Fitness-app-gevoel: elke dag drie ringen sluiten (dagregels, water,
            producten). Diep gekleurd, premium, verslavend afvinkbaar. De
            Mentor spreekt je elke ochtend kort toe.
          </p>
        </section>

        {/* ================= C · GLOSSY MAGAZINE ================= */}
        <section className="w-full max-w-sm">
          <div
            className="rounded-[2.6rem] overflow-hidden shadow-xl border-8 border-stone-900 mx-auto relative"
            style={{ width: 320, height: 600, background: "linear-gradient(165deg,#F4A26B 0%,#E4653F 45%,#8E2F3C 100%)" }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 80% 15%, white 0%, transparent 45%)" }} />
            <div className="relative px-7 pt-10 h-full flex flex-col">
              <p className="text-[10px] font-bold tracking-[0.35em] text-white/70 uppercase">De Resetcode · Hoofdstuk 3</p>
              <h3 className="font-serif-warm text-white leading-[0.95] mt-4" style={{ fontSize: 54 }}>
                De<br />Omscha-<br />keling
              </h3>
              <p className="text-white/85 text-sm mt-4 leading-relaxed italic">
                &quot;Drie weken die alles veranderen. Puur eten, veel rust en
                elke dag een beetje lichter.&quot;
              </p>
              <div className="mt-auto mb-8 space-y-2.5">
                <div className="rounded-full bg-white text-[#8E2F3C] text-center py-3 text-sm font-extrabold tracking-wide shadow-lg">
                  BEGIN MET LEZEN →
                </div>
                <div className="flex justify-between text-white/70 text-[10px] font-semibold tracking-wider uppercase">
                  <span>21 dagen</span>
                  <span>·</span>
                  <span>6 pagina&apos;s</span>
                  <span>·</span>
                  <span>1 video</span>
                </div>
              </div>
            </div>
          </div>
          <h2 className="font-bold text-stone-800 text-lg mt-4 text-center">C · Het Glossy Magazine</h2>
          <p className="text-sm text-stone-500 text-center leading-relaxed mt-1">
            Elke fase een adembenemende cover met enorme typografie, alsof je
            door een prachtig lifestyle-magazine bladert. Jullie documenten
            worden opgemaakte &quot;artikelen&quot; met grote koppen en beeld.
          </p>
        </section>

        {/* ================= D · MENTOR-WERELD ================= */}
        <section className="w-full max-w-sm">
          <div
            className="rounded-[2.6rem] overflow-hidden shadow-xl border-8 border-stone-900 mx-auto flex flex-col"
            style={{ width: 320, height: 600, background: "#0F1B17" }}
          >
            <div className="px-5 pt-8 pb-3 text-center border-b border-white/10">
              <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center text-2xl pols" style={{ background: "radial-gradient(circle,#34D399 0%,#059669 100%)" }}>🌿</div>
              <p className="text-white font-bold text-sm mt-2">Je Mentor</p>
              <p className="text-emerald-400/80 text-[10px]">altijd wakker · kent jouw hele reis</p>
            </div>
            <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5">
                <p className="text-[12px] text-white/90 leading-relaxed">Goedemorgen! Dag 8 alweer. Hoe sliep je? 😴</p>
              </div>
              <div className="max-w-[70%] ml-auto rounded-2xl rounded-tr-sm bg-emerald-600 px-3.5 py-2.5">
                <p className="text-[12px] text-white">🎙️ &quot;Goed! Maar mag ik vandaag tomaat in de salade?&quot;</p>
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5">
                <p className="text-[12px] text-white/90 leading-relaxed">Check even je fase 2-lijst, die is de baas 😉 Ik heb &apos;m voor je klaargezet:</p>
                <div className="mt-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 px-3 py-2">
                  <p className="text-[11px] font-bold text-emerald-300">📋 Fase 2-lijst · groente</p>
                  <p className="text-[10px] text-white/60 mt-0.5">Tomaat ✓ mag &nbsp;·&nbsp; ongelimiteerd van de lijst</p>
                </div>
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5">
                <p className="text-[12px] text-white/90">Zal ik je vanavond herinneren aan je producten? 🔔</p>
              </div>
            </div>
            <div className="px-5 pb-7 flex items-center justify-center gap-4">
              <span className="text-white/40 text-xs">typ</span>
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl shadow-2xl pols" style={{ background: "radial-gradient(circle,#34D399 0%,#047857 100%)" }}>🎙️</div>
              <span className="text-white/40 text-xs">praat</span>
            </div>
          </div>
          <h2 className="font-bold text-stone-800 text-lg mt-4 text-center">D · De Mentor-wereld</h2>
          <p className="text-sm text-stone-500 text-center leading-relaxed mt-1">
            De omgeving ÍS het gesprek: geen pagina&apos;s maar één warme chat
            waarin lijsten, video&apos;s en voortgang als kaartjes verschijnen.
            Praten staat centraal, de grote microfoon is het hart.
          </p>
        </section>

        {/* ================= E · DE BLOEIENDE REIS ================= */}
        <section className="w-full max-w-sm">
          <div
            className="rounded-[2.6rem] overflow-hidden shadow-xl border-8 border-stone-900 mx-auto relative"
            style={{ width: 320, height: 600, background: "linear-gradient(180deg,#FDF6EA 0%,#F3E8D3 100%)" }}
          >
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-50" style={{ background: "#F0D9A8" }} />
            <div className="absolute top-24 -left-14 h-36 w-36 rounded-full opacity-40" style={{ background: "#CFE3C0" }} />
            <div className="relative px-6 pt-10 text-center">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: "#8A6D3B" }}>Jouw reset bloeit</p>
              <h3 className="font-serif-warm text-3xl mt-1" style={{ color: "#4A3B28" }}>Week 2 · de knop opent</h3>
            </div>
            {/* de groeiende plant */}
            <div className="relative flex justify-center" style={{ height: 300 }}>
              <div className="absolute bottom-0 flex flex-col items-center wieg">
                <span className="text-5xl">🌸</span>
                <span className="text-4xl -mt-2">🌿</span>
                <span className="text-4xl -mt-3">🌿</span>
                <div className="h-24 w-2 rounded-full" style={{ background: "linear-gradient(180deg,#7FA968,#5C7F49)" }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-10 w-40 rounded-t-full" style={{ background: "#B48A5A" }} />
              <span className="absolute text-xl glinster" style={{ top: 30, left: 60 }}>✨</span>
              <span className="absolute text-xl glinster" style={{ top: 70, right: 55, animationDelay: ".8s" }}>✨</span>
              <span className="absolute text-2xl zweef" style={{ top: 45, right: 90 }}>🐝</span>
            </div>
            <div className="relative mx-5 rounded-3xl bg-white/90 backdrop-blur px-5 py-4 shadow" style={{ borderRadius: "2rem 2rem 2.4rem 2.4rem" }}>
              <p className="text-[11px] leading-relaxed" style={{ color: "#4A3B28" }}>
                Elke dag die je afrondt laat je plant groeien: van zaadje
                (voorbereiding) tot volle bloei (Logisch Leven). Vandaag
                erbij: <b>een nieuw blaadje</b> 🌱
              </p>
              <div className="mt-2.5 flex gap-1">
                {["🌰", "🌱", "🌿", "🌸", "🌳"].map((s, i) => (
                  <span key={i} className={`text-lg ${i <= 2 ? "" : "opacity-25 grayscale"}`}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <h2 className="font-bold text-stone-800 text-lg mt-4 text-center">E · De Bloeiende Reis</h2>
          <p className="text-sm text-stone-500 text-center leading-relaxed mt-1">
            Zacht, organisch en poëtisch: jouw programma als plant die per dag
            groeit en per fase een nieuwe vorm krijgt. Warm, natuurlijk,
            on-Nederlands mooi. Past bij het holistische verhaal.
          </p>
        </section>

        {/* ================= combi-kaart ================= */}
        <section className="w-full max-w-sm flex flex-col justify-center">
          <div
            className="rounded-[2.6rem] mx-auto flex flex-col items-center justify-center text-center px-8"
            style={{ width: 320, height: 600, background: "repeating-linear-gradient(45deg,#FAF6EF,#FAF6EF 12px,#F3EDE2 12px,#F3EDE2 24px)", border: "3px dashed #D6CBB8" }}
          >
            <span className="text-5xl">🎨</span>
            <h3 className="font-serif-warm text-2xl text-stone-700 mt-4">Of mix &amp; match</h3>
            <p className="text-sm text-stone-500 leading-relaxed mt-3">
              &quot;Het Groeipad als thuisscherm, de Mentor-wereld als
              chat, en de ringen voor mijn dag-afvinken.&quot;
            </p>
            <p className="text-xs text-stone-400 mt-4 leading-relaxed">
              Zeg gewoon welke letters, dan smeed ik ze om tot één geheel en
              bouw ik de volledige omgeving zo.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

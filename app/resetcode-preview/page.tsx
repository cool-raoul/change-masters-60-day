// File: app/resetcode-preview/page.tsx
//
// De Resetcode-klantomgeving, keuze-scherm. Twee LOSSE
// programma's (feedback Raoul 10 juli): de klant kiest wat hij
// of zij doet; combinaties lopen via de begeleider. Eigen
// frisse klant-look, geen zes-stappen-lijn meer.
// Founder-preview: toegang alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RESET_PROGRAMMAS } from "@/lib/resetcode/programma";

export const dynamic = "force-dynamic";

export default async function ResetcodeKeuze() {
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
  const magKijken = p?.role === "founder" || p?.is_tester === true;
  if (!magKijken) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Preview-strip (alleen zichtbaar voor founders/testers) */}
      <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-amber-800 text-sm font-semibold">
          🔭 Founder-preview, nog niet live
        </p>
        <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">
          Dit is de klantomgeving zoals een klant &apos;m straks op een
          persoonlijke link ziet, zonder inlog. De look hieronder is de
          eerste, brave versie.
        </p>
        <Link
          href="/resetcode-preview/brainstorm"
          className="mt-2 inline-block rounded-full bg-amber-500 text-white text-xs font-bold px-4 py-2 hover:bg-amber-600"
        >
          🎨 Bekijk de 5 out-of-the-box design-richtingen →
        </Link>
      </div>

      <header className="text-center mb-10">
        <p
          className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
          style={{ color: "#2F7A4D" }}
        >
          De Resetcode
        </p>
        <h1 className="font-serif-warm text-4xl text-stone-800">
          Welkom bij jouw programma
        </h1>
        <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-md mx-auto">
          Jij en je begeleider hebben samen gekozen wat bij jou past. Kies
          hieronder jouw programma, dan zie je altijd precies de fase waar
          je nu bent. Niet meer, niet minder.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {RESET_PROGRAMMAS.map((prog) => (
          <Link
            key={prog.slug}
            href={`/resetcode-preview/${prog.slug}/${prog.stations[0].slug}`}
            className="group rounded-3xl bg-white border border-stone-200/70 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Kleurige kop */}
            <div
              className="px-6 pt-8 pb-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${prog.kleur.zacht} 0%, white 100%)`,
              }}
            >
              <span className="text-5xl block group-hover:scale-110 transition-transform">
                {prog.emoji}
              </span>
              <h2
                className="font-serif-warm text-2xl mt-3"
                style={{ color: prog.kleur.diep }}
              >
                {prog.naam}
              </h2>
              <p
                className="text-xs font-semibold mt-1"
                style={{ color: prog.kleur.hoofd }}
              >
                {prog.duur}
              </p>
            </div>
            <div className="px-6 pb-6">
              <p className="text-sm text-stone-600 leading-relaxed text-center">
                {prog.payoff}
              </p>
              {/* Mini reis-lijn */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {prog.stations.map((s, i) => (
                  <span key={s.slug} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          i === 0 ? prog.kleur.hoofd : prog.kleur.zacht,
                        border: `1.5px solid ${prog.kleur.hoofd}`,
                      }}
                    />
                    {i < prog.stations.length - 1 && (
                      <span
                        className="h-0.5 w-4 rounded"
                        style={{ backgroundColor: prog.kleur.zacht }}
                      />
                    )}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 text-center mt-1.5">
                {prog.stations.length} stappen, één tegelijk
              </p>
              <div
                className="mt-4 rounded-full py-2.5 text-center text-sm font-bold text-white"
                style={{ backgroundColor: prog.kleur.hoofd }}
              >
                Dit is mijn programma →
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-stone-400 leading-relaxed max-w-md mx-auto">
        Doe je straks allebei de programma&apos;s, of twijfel je wat bij je
        past? Je begeleider denkt met je mee en zet de juiste route voor je
        klaar.
      </p>
    </main>
  );
}

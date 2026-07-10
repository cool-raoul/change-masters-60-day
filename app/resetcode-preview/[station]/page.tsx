// File: app/resetcode-preview/[station]/page.tsx
//
// Eén station van de Resetcode zoals de KLANT het straks ziet:
// waar sta ik, wat is nu belangrijk, wel/niet-lijsten, tips,
// veelgestelde vragen, document- en videoslots (leeg, Raoul
// vult later), het contactmoment met de begeleider en de
// werkende Mentor-chat met klant/member-stem-schakelaar.
// Toegang: alleen founders en testers (preview).

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  RESET_STATIONS,
  stationVoor,
  buurStations,
} from "@/lib/resetcode/programma";
import ResetMentorChat from "@/components/resetcode/ResetMentorChat";

export const dynamic = "force-dynamic";

export default async function ResetcodeStationPagina({
  params,
}: {
  params: Promise<{ station: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as {
    role?: string | null;
    is_tester?: boolean | null;
    full_name?: string | null;
  } | null;
  const magKijken = p?.role === "founder" || p?.is_tester === true;
  if (!magKijken) redirect("/dashboard");

  const { station: slug } = await params;
  const station = stationVoor(slug);
  if (!station) notFound();

  const { vorige, volgende } = buurStations(slug);
  const begeleider = (p?.full_name ?? "").split(" ")[0] || "je begeleider";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      {/* Preview-strip */}
      <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-2.5">
        <p className="text-amber-300 text-xs font-semibold">
          🔭 Preview: zo ziet de klant dit station
        </p>
        <Link
          href="/resetcode-preview"
          className="text-xs text-cm-gold hover:underline flex-shrink-0"
        >
          ← Alle stations
        </Link>
      </div>

      {/* Waar sta ik: mini-tijdlijn */}
      <div className="mb-6 flex items-center gap-1.5 flex-wrap">
        {RESET_STATIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/resetcode-preview/${s.slug}`}
            title={s.naam}
            className={`h-2.5 rounded-full transition-all ${
              s.slug === station.slug
                ? "w-10 bg-cm-gold"
                : s.nummer < station.nummer
                  ? "w-5 bg-cm-gold/40"
                  : "w-5 bg-white/10 hover:bg-white/20"
            }`}
          />
        ))}
        <span className="text-cm-muted text-xs ml-2">
          Station {station.nummer} van {RESET_STATIONS.length}
        </span>
      </div>

      <header className="mb-6">
        <h1 className="font-serif-warm text-3xl text-cm-white">
          {station.emoji} {station.naam}
        </h1>
        <p className="text-cm-gold/80 text-sm mt-1">{station.duur}</p>
        <p className="mt-3 text-cm-white/85 text-sm leading-relaxed">
          {station.welkom}
        </p>
      </header>

      {/* Nu belangrijk */}
      {station.vandaagBelangrijk.length > 0 && (
        <section className="card mb-4">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            ✅ Dit is nu belangrijk
          </h2>
          <ul className="space-y-2">
            {station.vandaagBelangrijk.map((regel, i) => (
              <li
                key={i}
                className="text-sm text-cm-white/85 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-cm-gold"
              >
                {regel}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Wel / niet naast elkaar */}
      {(station.welLijst.length > 0 || station.nietLijst.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          {station.welLijst.length > 0 && (
            <section className="card">
              <h2 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-3">
                🥦 Mag lekker wel
              </h2>
              <ul className="space-y-1.5">
                {station.welLijst.map((item, i) => (
                  <li key={i} className="text-sm text-cm-white/80 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {station.nietLijst.length > 0 && (
            <section className="card">
              <h2 className="text-rose-400 font-semibold text-sm uppercase tracking-wider mb-3">
                🚫 Even niet
              </h2>
              <ul className="space-y-1.5">
                {station.nietLijst.map((item, i) => (
                  <li key={i} className="text-sm text-cm-white/80 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Tips */}
      {station.tips.length > 0 && (
        <section className="card mb-4">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            💡 Tips van mensen die je voorgingen
          </h2>
          <ul className="space-y-2">
            {station.tips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-cm-white/80 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-cm-gold"
              >
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contactmoment met begeleider */}
      {station.contactMoment && (
        <section className="card mb-4 border-cm-gold/40">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
            🤝 Samen met {begeleider}
          </h2>
          <p className="text-sm text-cm-white/85 leading-relaxed">
            {station.contactMoment}
          </p>
          <button
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600/90 px-4 py-2 text-sm font-semibold text-white opacity-70 cursor-not-allowed"
            title="Werkt straks: opent WhatsApp naar de begeleider"
          >
            📱 Stuur {begeleider} een appje
            <span className="text-[10px] font-normal opacity-80">(straks)</span>
          </button>
        </section>
      )}

      {/* Documenten-slots */}
      {station.documenten.length > 0 && (
        <section className="card mb-4">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            📂 Documenten bij deze fase
          </h2>
          <div className="space-y-2">
            {station.documenten.map((doc, i) => (
              <div
                key={i}
                className="rounded-lg border border-dashed border-cm-border px-3 py-2.5"
              >
                <p className="text-sm text-cm-white/85 font-medium">
                  {doc.titel}
                </p>
                <p className="text-xs text-cm-muted mt-0.5">
                  {doc.omschrijving}
                </p>
                <p className="text-[10px] text-amber-300/80 mt-1">
                  Lege plek: hier hang jij straks het echte document in.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video-slots */}
      {station.videoSlots.length > 0 && (
        <section className="card mb-4">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            🎬 Video&apos;s bij deze fase
          </h2>
          <div className="space-y-2">
            {station.videoSlots.map((titel, i) => (
              <div
                key={i}
                className="rounded-lg border border-dashed border-cm-border px-3 py-6 text-center"
              >
                <p className="text-sm text-cm-white/70">▶️ {titel}</p>
                <p className="text-[10px] text-amber-300/80 mt-1">
                  Lege plek: hier komt jouw video.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Veelgestelde vragen */}
      {station.veelgesteld.length > 0 && (
        <section className="card mb-4">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            ❓ Vaak gevraagd in deze fase
          </h2>
          <div className="space-y-3">
            {station.veelgesteld.map((v, i) => (
              <div key={i}>
                <p className="text-sm text-cm-white font-medium">{v.vraag}</p>
                <p className="text-sm text-cm-white/75 leading-relaxed mt-1">
                  {v.antwoord}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* De Mentor */}
      <div className="mb-4">
        <ResetMentorChat station={station.slug} />
      </div>

      {/* Navigatie */}
      <div className="flex justify-between items-center gap-3 mt-8">
        {vorige ? (
          <Link
            href={`/resetcode-preview/${vorige.slug}`}
            className="text-sm text-cm-gold hover:underline"
          >
            ← {vorige.naam}
          </Link>
        ) : (
          <span />
        )}
        {volgende ? (
          <Link
            href={`/resetcode-preview/${volgende.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-cm-gold text-cm-bg px-5 py-2.5 text-sm font-bold hover:opacity-90"
          >
            Volgende: {volgende.naam} →
          </Link>
        ) : (
          <Link
            href="/resetcode-preview"
            className="text-sm text-cm-gold hover:underline"
          >
            Terug naar het overzicht
          </Link>
        )}
      </div>
    </main>
  );
}

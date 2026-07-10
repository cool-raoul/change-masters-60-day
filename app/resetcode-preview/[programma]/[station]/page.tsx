// File: app/resetcode-preview/[programma]/[station]/page.tsx
//
// Eén station van een Resetcode-programma zoals de KLANT het
// straks ziet, in de eigen frisse klant-look: reis-lijn, de
// regels van nu, wel/niet, tips, FAQ, document- en videoslots,
// contactmoment en de Mentor (typen én praten). Fase 4 bevat de
// eerste document-graphic: de LOGI-piramide als in-app visual.
// Founder-preview: toegang alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  programmaVoor,
  stationVoor,
  buurStations,
} from "@/lib/resetcode/programma";
import ResetMentorChat from "@/components/resetcode/ResetMentorChat";

export const dynamic = "force-dynamic";

const LOGI_LAGEN = [
  { label: "ZELDEN", inhoud: "zoet, gebak, fastfood", breedte: "30%", kleur: "#E4A3A3" },
  { label: "MET MATE", inhoud: "granen en volkoren", breedte: "52%", kleur: "#EBC98A" },
  { label: "REGELMATIG", inhoud: "vis, vlees, eieren, zuivel", breedte: "74%", kleur: "#A8C686" },
  { label: "VAAK", inhoud: "groente en fruit", breedte: "96%", kleur: "#7FB069" },
];

export default async function ResetcodeStationPagina({
  params,
}: {
  params: Promise<{ programma: string; station: string }>;
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

  const { programma: programmaSlug, station: stationSlug } = await params;
  const programma = programmaVoor(programmaSlug);
  const station = stationVoor(programmaSlug, stationSlug);
  if (!programma || !station) notFound();

  const { vorige, volgende } = buurStations(programmaSlug, stationSlug);
  const begeleider = (p?.full_name ?? "").split(" ")[0] || "je begeleider";
  const kleur = programma.kleur;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {/* Preview-strip */}
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2">
        <p className="text-amber-800 text-xs font-semibold">
          🔭 Preview: zo ziet de klant dit
        </p>
        <Link
          href="/resetcode-preview"
          className="text-xs font-semibold flex-shrink-0"
          style={{ color: kleur.hoofd }}
        >
          ← Programma-keuze
        </Link>
      </div>

      {/* Kleurige kop met reis-lijn */}
      <header
        className="rounded-3xl px-6 py-7 mb-5 text-center"
        style={{
          background: `linear-gradient(150deg, ${kleur.zacht} 0%, #ffffff 85%)`,
          border: `1px solid ${kleur.zacht}`,
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: kleur.hoofd }}
        >
          {programma.emoji} {programma.naam}
        </p>
        <h1
          className="font-serif-warm text-3xl mt-2"
          style={{ color: kleur.diep }}
        >
          {station.emoji} {station.naam}
        </h1>
        <p className="text-xs font-semibold mt-1" style={{ color: kleur.hoofd }}>
          {station.duur}
        </p>

        {/* Reis-lijn */}
        <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
          {programma.stations.map((s, i) => (
            <span key={s.slug} className="flex items-center gap-1.5">
              <Link
                href={`/resetcode-preview/${programma.slug}/${s.slug}`}
                title={s.naam}
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-transform hover:scale-110"
                style={
                  s.slug === station.slug
                    ? { backgroundColor: kleur.hoofd, color: "white" }
                    : s.nummer < station.nummer
                      ? { backgroundColor: kleur.zacht, color: kleur.diep }
                      : {
                          backgroundColor: "white",
                          color: "#a8a29e",
                          border: "1.5px dashed #d6d3d1",
                        }
                }
              >
                {s.nummer < station.nummer ? "✓" : s.emoji}
              </Link>
              {i < programma.stations.length - 1 && (
                <span
                  className="h-0.5 w-5 rounded"
                  style={{
                    backgroundColor:
                      s.nummer < station.nummer ? kleur.hoofd : "#e7e5e4",
                  }}
                />
              )}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-stone-400 mt-2">
          Stap {station.nummer} van {programma.stations.length}
        </p>
      </header>

      {/* Welkom */}
      <p className="text-stone-600 text-[15px] leading-relaxed mb-5 px-1">
        {station.welkom}
      </p>

      {/* Nu belangrijk */}
      {station.vandaagBelangrijk.length > 0 && (
        <section className="rounded-3xl bg-white border border-stone-200/70 shadow-sm p-5 mb-4">
          <h2
            className="font-bold text-base mb-3 flex items-center gap-2"
            style={{ color: kleur.diep }}
          >
            <span className="text-xl">✅</span> Dit is nu belangrijk
          </h2>
          <ul className="space-y-2.5">
            {station.vandaagBelangrijk.map((regel, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-stone-600 leading-relaxed">
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: kleur.hoofd }}
                />
                {regel}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Wel / niet */}
      {(station.welLijst.length > 0 || station.nietLijst.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          {station.welLijst.length > 0 && (
            <section
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: "#F0F7EE", borderColor: "#CBE3C6" }}
            >
              <h2 className="font-bold text-base mb-3 text-[#2F7A4D]">
                🥦 Mag lekker wel
              </h2>
              <ul className="space-y-1.5">
                {station.welLijst.map((item, i) => (
                  <li key={i} className="text-sm text-stone-600 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {station.nietLijst.length > 0 && (
            <section
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: "#FBEFEC", borderColor: "#EFCFC7" }}
            >
              <h2 className="font-bold text-base mb-3 text-[#B4553C]">
                🚫 Even niet
              </h2>
              <ul className="space-y-1.5">
                {station.nietLijst.map((item, i) => (
                  <li key={i} className="text-sm text-stone-600 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* LOGI-piramide: eerste document-graphic (vervangt het losse plaatje) */}
      {station.graphic === "logi-piramide" && (
        <section className="rounded-3xl bg-white border border-stone-200/70 shadow-sm p-5 mb-4">
          <h2
            className="font-bold text-base mb-1 flex items-center gap-2"
            style={{ color: kleur.diep }}
          >
            <span className="text-xl">🔺</span> Jouw 80/20-kompas
          </h2>
          <p className="text-xs text-stone-400 mb-4">
            De LOGI-piramide: hoe lager in de piramide, hoe vaker op je bord.
          </p>
          <div className="flex flex-col items-center gap-1.5">
            {LOGI_LAGEN.map((laag) => (
              <div
                key={laag.label}
                className="rounded-xl py-2.5 px-3 text-center"
                style={{ width: laag.breedte, backgroundColor: laag.kleur }}
              >
                <p className="text-[11px] font-extrabold tracking-wider text-white/95">
                  {laag.label}
                </p>
                <p className="text-xs text-white/90">{laag.inhoud}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      {station.tips.length > 0 && (
        <section className="rounded-3xl bg-white border border-stone-200/70 shadow-sm p-5 mb-4">
          <h2
            className="font-bold text-base mb-3 flex items-center gap-2"
            style={{ color: kleur.diep }}
          >
            <span className="text-xl">💡</span> Tips van mensen die je voorgingen
          </h2>
          <ul className="space-y-2.5">
            {station.tips.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-stone-600 leading-relaxed">
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: kleur.hoofd }}
                />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contactmoment */}
      {station.contactMoment && (
        <section
          className="rounded-3xl p-5 mb-4 border"
          style={{ backgroundColor: kleur.zacht, borderColor: kleur.zacht }}
        >
          <h2 className="font-bold text-base mb-1.5" style={{ color: kleur.diep }}>
            🤝 Samen met {begeleider}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {station.contactMoment}
          </p>
          <button
            className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white opacity-60 cursor-not-allowed"
            style={{ backgroundColor: "#25D366" }}
            title="Werkt straks: opent WhatsApp naar de begeleider"
          >
            📱 Stuur {begeleider} een appje
            <span className="text-[10px] font-normal">(straks)</span>
          </button>
        </section>
      )}

      {/* Documenten-slots */}
      {station.documenten.length > 0 && (
        <section className="rounded-3xl bg-white border border-stone-200/70 shadow-sm p-5 mb-4">
          <h2
            className="font-bold text-base mb-3 flex items-center gap-2"
            style={{ color: kleur.diep }}
          >
            <span className="text-xl">📂</span> Bij deze fase
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {station.documenten.map((doc, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-dashed border-stone-200 px-4 py-3"
              >
                <p className="text-sm text-stone-700 font-semibold">{doc.titel}</p>
                <p className="text-xs text-stone-400 mt-0.5">{doc.omschrijving}</p>
                <p className="text-[10px] text-amber-600/80 mt-1.5">
                  Wordt een mooie in-app pagina of graphic
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video-slots */}
      {station.videoSlots.length > 0 && (
        <section className="rounded-3xl bg-white border border-stone-200/70 shadow-sm p-5 mb-4">
          <h2
            className="font-bold text-base mb-3 flex items-center gap-2"
            style={{ color: kleur.diep }}
          >
            <span className="text-xl">🎬</span> Video&apos;s bij deze fase
          </h2>
          <div className="space-y-2.5">
            {station.videoSlots.map((titel, i) => (
              <div
                key={i}
                className="rounded-2xl px-4 py-8 text-center"
                style={{ backgroundColor: "#F5F0E8" }}
              >
                <p className="text-sm text-stone-500 font-medium">▶️ {titel}</p>
                <p className="text-[10px] text-amber-600/80 mt-1">
                  Lege plek: hier komt jouw video
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Veelgesteld */}
      {station.veelgesteld.length > 0 && (
        <section className="rounded-3xl bg-white border border-stone-200/70 shadow-sm p-5 mb-4">
          <h2
            className="font-bold text-base mb-3 flex items-center gap-2"
            style={{ color: kleur.diep }}
          >
            <span className="text-xl">❓</span> Vaak gevraagd in deze fase
          </h2>
          <div className="space-y-3.5">
            {station.veelgesteld.map((v, i) => (
              <div key={i}>
                <p className="text-sm text-stone-800 font-semibold">{v.vraag}</p>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  {v.antwoord}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vervolg-kaart aan het einde van het programma */}
      {!volgende && (
        <section
          className="rounded-3xl p-5 mb-4 text-center border"
          style={{ backgroundColor: kleur.zacht, borderColor: kleur.zacht }}
        >
          <p className="text-2xl mb-1">🎉</p>
          <h2 className="font-bold text-base" style={{ color: kleur.diep }}>
            En daarna?
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed mt-1.5 max-w-md mx-auto">
            {programma.vervolg}
          </p>
        </section>
      )}

      {/* De Mentor */}
      <div className="mb-4">
        <ResetMentorChat
          programma={programma.slug}
          station={station.slug}
          accent={kleur.hoofd}
        />
      </div>

      {/* Navigatie */}
      <div className="flex justify-between items-center gap-3 mt-8 mb-4">
        {vorige ? (
          <Link
            href={`/resetcode-preview/${programma.slug}/${vorige.slug}`}
            className="text-sm font-semibold"
            style={{ color: kleur.hoofd }}
          >
            ← {vorige.naam}
          </Link>
        ) : (
          <span />
        )}
        {volgende ? (
          <Link
            href={`/resetcode-preview/${programma.slug}/${volgende.slug}`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: kleur.hoofd }}
          >
            Volgende: {volgende.naam} →
          </Link>
        ) : (
          <Link
            href="/resetcode-preview"
            className="text-sm font-semibold"
            style={{ color: kleur.hoofd }}
          >
            Terug naar de programma-keuze
          </Link>
        )}
      </div>
    </main>
  );
}

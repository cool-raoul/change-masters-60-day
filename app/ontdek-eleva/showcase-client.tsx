"use client";

// File: app/ontdek-eleva/showcase-client.tsx
//
// Client-component voor de showcase. Bevat de visuele layout en alle
// EditableTekst-velden. Server-component levert de MediaBlokken aan
// als React-nodes per feature.

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { EditableTekst } from "@/components/cms/EditableTekst";
import { useEditModus } from "@/components/cms/EditModeContext";
import { FEATURES } from "./features";

const NS = "ontdek-eleva";

function T({
  sleutel,
  standaard,
  overrides,
  isFounder,
  as = "span",
  className,
  multiline,
}: {
  sleutel: string;
  standaard: string;
  overrides: Record<string, string>;
  isFounder: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span" | "li";
  className?: string;
  multiline?: boolean;
}) {
  const { editModusAan } = useEditModus();
  return (
    <EditableTekst
      namespace={NS}
      sleutel={sleutel}
      standaard={standaard}
      overrides={overrides}
      isFounder={isFounder}
      editModusAan={editModusAan}
      as={as}
      className={className}
      multiline={multiline}
    />
  );
}

export function ShowcaseClient({
  tekstOverrides: ov,
  isFounder,
  screenshotsPerFeature,
  heroSlot,
}: {
  tekstOverrides: Record<string, string>;
  isFounder: boolean;
  screenshotsPerFeature: Record<string, ReactNode>;
  heroSlot: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] overflow-x-hidden">
      {/* Decoratieve achtergrond-orbs */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: "radial-gradient(circle, #c9a961 0%, transparent 70%)" }}
      />

      <div className="relative">

        {/* ============ NAV ============ */}
        <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-[#c9a961]/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
              <Image
                src="/eleva-icon.png"
                alt="ELEVA"
                width={36}
                height={36}
                priority
                className="h-9 w-9 rounded-lg"
              />
              <span className="text-[#f5f5f5] font-bold tracking-wider text-sm">
                ELEVA
              </span>
            </Link>
            <div className="flex items-center gap-5 text-xs text-[#f5f5f5]/60">
              <Link href="#features" className="hover:text-[#c9a961] transition">
                Features
              </Link>
              <Link href="#cta" className="hover:text-[#c9a961] transition">
                Aan de slag
              </Link>
            </div>
          </div>
        </nav>

        {/* ============ HERO ============ */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <T
              sleutel="hero.tag"
              standaard="Project Meer Tijd en Vrijheid"
              overrides={ov}
              isFounder={isFounder}
              as="div"
              className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a961] mb-6 px-4 py-1.5 rounded-full border border-[#c9a961]/30"
            />
            <T
              sleutel="hero.titel"
              standaard="Het complete bouw-systeem voor je netwerk-business"
              overrides={ov}
              isFounder={isFounder}
              as="h1"
              className="block text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 bg-gradient-to-br from-white via-[#f5e9c4] to-[#c9a961] bg-clip-text text-transparent"
              multiline
            />
            <T
              sleutel="hero.subtitel"
              standaard="Sprint, Core, Pro. ELEVA Mentor. Namenlijst, pijplijn, freebies, scripts, Academy. Alles wat jij en je team nodig hebben, in één plek, in jullie stem 🥰"
              overrides={ov}
              isFounder={isFounder}
              as="p"
              className="block text-lg sm:text-xl text-[#f5f5f5]/70 leading-relaxed mb-10 max-w-2xl mx-auto"
              multiline
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/registreer"
                className="inline-block px-6 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #c9a961 0%, #ead8a0 50%, #c9a961 100%)",
                  color: "#0a0a0a",
                  boxShadow: "0 8px 24px rgba(201, 169, 97, 0.3)",
                }}
              >
                Start je 60 Day Run →
              </Link>
              <Link
                href="#features"
                className="inline-block px-6 py-3 rounded-full font-bold text-sm border border-[#c9a961]/40 text-[#f5f5f5]/90 hover:bg-[#c9a961]/10 transition"
              >
                Ontdek alles
              </Link>
            </div>
          </div>

          {/* Hero-screenshot */}
          <div className="mt-16 sm:mt-24 max-w-5xl mx-auto">
            {heroSlot}
          </div>
        </section>

        {/* ============ FEATURES INTRO ============ */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <T
              sleutel="features.tag"
              standaard="Wat zit er allemaal in"
              overrides={ov}
              isFounder={isFounder}
              as="div"
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a961] mb-4"
            />
            <T
              sleutel="features.titel"
              standaard="15 features die samen één systeem zijn"
              overrides={ov}
              isFounder={isFounder}
              as="h2"
              className="block text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-5"
            />
            <T
              sleutel="features.subtitel"
              standaard="Geen losse losse tools. Wel een samenhangend ritme, van eerste stap tot duurzaam team. Hieronder zie je elke laag, met een korte uitleg waarvoor het er is."
              overrides={ov}
              isFounder={isFounder}
              as="p"
              className="block text-base sm:text-lg text-[#f5f5f5]/70 leading-relaxed"
              multiline
            />
          </div>

          {/* ============ FEATURE-KAARTEN ============ */}
          <div className="space-y-24">
            {FEATURES.map((feature, i) => {
              const omgekeerd = i % 2 === 1;
              return (
                <article
                  key={feature.sleutel}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
                >
                  {/* Tekst */}
                  <div className={omgekeerd ? "lg:order-2" : ""}>
                    <div className="inline-flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-3xl">{feature.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#c9a961]">
                        Feature {String(i + 1).padStart(2, "0")}
                      </span>
                      {feature.binnenkort && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200 bg-purple-700/40 border border-purple-500/50 rounded-full px-2.5 py-0.5">
                          🚧 Binnenkort
                        </span>
                      )}
                    </div>
                    <T
                      sleutel={`feature.${feature.sleutel}.titel`}
                      standaard={feature.titel}
                      overrides={ov}
                      isFounder={isFounder}
                      as="h3"
                      className="block text-2xl sm:text-4xl font-extrabold leading-tight mb-4"
                    />
                    <T
                      sleutel={`feature.${feature.sleutel}.pitch`}
                      standaard={feature.pitch}
                      overrides={ov}
                      isFounder={isFounder}
                      as="p"
                      className="block text-base sm:text-lg text-[#f5f5f5]/75 leading-relaxed mb-4"
                      multiline
                    />
                    <div className="mt-6 pl-4 border-l-2 border-[#c9a961]/40">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#c9a961] mb-2">
                        Waarom dit anders is
                      </div>
                      <T
                        sleutel={`feature.${feature.sleutel}.waarom`}
                        standaard={feature.waarom}
                        overrides={ov}
                        isFounder={isFounder}
                        as="p"
                        className="block text-sm sm:text-base text-[#f5f5f5]/70 leading-relaxed italic"
                        multiline
                      />
                    </div>
                  </div>

                  {/* Screenshot */}
                  <div className={omgekeerd ? "lg:order-1" : ""}>
                    {screenshotsPerFeature[feature.sleutel]}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section id="cta" className="max-w-5xl mx-auto px-6 py-24">
          <div
            className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center"
            style={{
              background:
                "linear-gradient(135deg, #1a1a1a 0%, #2a2110 50%, #1a1a1a 100%)",
              border: "1px solid rgba(201, 169, 97, 0.3)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{ background: "#c9a961" }}
            />
            <div className="relative">
              <T
                sleutel="cta.tag"
                standaard="Klaar om te bouwen?"
                overrides={ov}
                isFounder={isFounder}
                as="div"
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a961] mb-4"
              />
              <T
                sleutel="cta.titel"
                standaard="Eerst samen bouwen. Daarna samen vermenigvuldigen."
                overrides={ov}
                isFounder={isFounder}
                as="h2"
                className="block text-3xl sm:text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white to-[#c9a961] bg-clip-text text-transparent"
                multiline
              />
              <T
                sleutel="cta.subtitel"
                standaard="Geen contract, geen inkoop, geen risico. Wel een systeem dat al 35 jaar staat, een community die elkaar draagt, en een persoonlijk plan dat we samen op jou afstemmen 🥰"
                overrides={ov}
                isFounder={isFounder}
                as="p"
                className="block text-base sm:text-lg text-[#f5f5f5]/75 leading-relaxed mb-8 max-w-2xl mx-auto"
                multiline
              />
              <Link
                href="/60-day-run"
                className="inline-block px-8 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #c9a961 0%, #ead8a0 50%, #c9a961 100%)",
                  color: "#0a0a0a",
                  boxShadow: "0 12px 32px rgba(201, 169, 97, 0.4)",
                }}
              >
                Lees het hele verhaal →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#c9a961]/10 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs text-[#f5f5f5]/40">
            ELEVA · Change Masters · {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
}

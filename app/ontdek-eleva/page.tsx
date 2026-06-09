// File: app/ontdek-eleva/page.tsx
//
// Publieke feature-showcase voor ELEVA, in stijl vergelijkbaar met
// thesaga.app/frazer/. Doel: nieuwe bouwers, prospects, partners
// een visueel overzicht geven van wat het systeem allemaal kan.
//
// Per feature een MediaBlokken-slot zodat founder later screenshots
// kan toevoegen via edit-modus.

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { ShowcaseClient } from "./showcase-client";
import { VerseShareKnop } from "./VerseShareKnop";
import { FEATURES } from "./features";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://change-masters-60-day-q25o.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ELEVA, het aanbevelingsmarketing-systeem van de toekomst",
  description:
    "Een AI gedreven systeem dat je dagelijks bij de hand neemt, in jouw eigen tempo. Met scripts in jouw stem, een coach in je broekzak, en alles wat je team nodig heeft.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ontdek-eleva`,
    title: "ELEVA, het aanbevelingsmarketing-systeem van de toekomst",
    description: "Een AI gedreven systeem dat je dagelijks bij de hand neemt, in jouw eigen tempo. Werken met AI terwijl je authenticiteit behoudt.",
    siteName: "ELEVA",
    locale: "nl_NL",
  },
};

const NAMESPACE = "ontdek-eleva";
const PAGINA_ID = "publiek";


export default async function OntdekElevaPagina() {
  const supabase = await createClient();

  // Founder-check voor edit-modus
  const { data: { user } } = await supabase.auth.getUser();
  let isFounder = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isFounder = (profile as { role?: string } | null)?.role === "founder";
  }

  // Tekst-overrides
  const overridesPerNamespace = await haalTekstOverridesMulti(supabase, [NAMESPACE]);
  const tekstOverrides = namespaceAlsRecord(overridesPerNamespace, NAMESPACE);

  // MediaBlokken per feature ophalen
  const blokkenMap = await haalPaginaBlokken(supabase, NAMESPACE, PAGINA_ID);

  // Voor elke feature een screenshot-slot bouwen
  const screenshotsPerFeature: Record<string, React.ReactNode> = {};
  for (const feature of FEATURES) {
    const positie = `screenshot-${feature.sleutel}`;
    const blokken = blokkenMap.get(positie) ?? [];
    screenshotsPerFeature[feature.sleutel] = (
      <ScreenshotSlot
        paginaNamespace={NAMESPACE}
        paginaId={PAGINA_ID}
        positie={positie}
        blokken={blokken}
        isFounder={isFounder}
        emoji={feature.emoji}
      />
    );
  }

  const heroBlokken = blokkenMap.get("hero") ?? [];
  const heroSlot = (
    <ScreenshotSlot
      paginaNamespace={NAMESPACE}
      paginaId={PAGINA_ID}
      positie="hero"
      blokken={heroBlokken}
      isFounder={isFounder}
      emoji="✨"
      hero
    />
  );

  return (
    <EditModeProvider>
      {isFounder && (
        <div className="bg-purple-950/90 border-b border-purple-700/40 px-4 py-2 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap justify-between">
            <span className="text-purple-200 text-xs font-semibold uppercase tracking-wider">
              👑 Founder
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <VerseShareKnop />
              <EditModeToggle isFounder={true} />
            </div>
          </div>
        </div>
      )}
      <ShowcaseClient
        tekstOverrides={tekstOverrides}
        isFounder={isFounder}
        screenshotsPerFeature={screenshotsPerFeature}
        heroSlot={heroSlot}
      />
    </EditModeProvider>
  );
}

function ScreenshotSlot({
  paginaNamespace,
  paginaId,
  positie,
  blokken,
  isFounder,
  emoji,
  hero,
}: {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
  blokken: Blok[];
  isFounder: boolean;
  emoji: string;
  hero?: boolean;
}) {
  if (blokken.length === 0 && !isFounder) {
    // Geen screenshot, geen founder, render een mooi placeholder
    return (
      <div
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2a2110] to-[#1a1a1a] border border-[#c9a961]/20 flex items-center justify-center ${hero ? "aspect-[16/10]" : "aspect-video"}`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] flex items-center justify-center text-[200px]"
        >
          {emoji}
        </div>
        <div className="relative text-center px-6 py-8">
          <div className="text-6xl mb-3">{emoji}</div>
          <div className="text-[#c9a961] text-xs font-bold uppercase tracking-widest">
            Screenshot komt hier
          </div>
        </div>
      </div>
    );
  }

  if (blokken.length === 0 && isFounder) {
    return (
      <div className={`rounded-2xl overflow-hidden bg-[#1a1a1a]/50 border border-[#c9a961]/20 p-4 ${hero ? "min-h-[400px]" : "min-h-[260px]"}`}>
        <div className="text-[#c9a961] text-xs font-bold uppercase tracking-widest mb-2">
          {emoji} Voeg screenshot toe (founder-modus aan)
        </div>
        <MediaBlokken
          paginaNamespace={paginaNamespace}
          paginaId={paginaId}
          positie={positie}
          blokken={blokken}
          isFounder={isFounder}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-[#1a1a1a]/40 border border-[#c9a961]/20 p-2">
      <MediaBlokken
        paginaNamespace={paginaNamespace}
        paginaId={paginaId}
        positie={positie}
        blokken={blokken}
        isFounder={isFounder}
      />
    </div>
  );
}

// File: app/reset-check/page.tsx
//
// Publieke Reset-check freebie. Geen auth nodig om de quiz te doen.
// Ingelogde founder ziet een edit-toggle om films/verhalen toe te voegen.
//
// MediaBlokken-posities (founder beheert via /reset-check zelf in edit-mode):
// - "teaser" — korte film bovenaan stap 1
// - "verdieping" — verdiepende film helemaal onderaan stap 5
// - "testimonials" — verhalen van mensen (video/quote/audio), boven film

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { ResetCheckFlow } from "./flow";

export const dynamic = "force-dynamic";

const SITE_URL = "https://change-masters-60-day-q25o.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Klopt de Reset bij jou?",
  description:
    "Een korte persoonlijke check, met meteen tips & tricks om vandaag al toe te passen. Plus persoonlijke afstemming op jouw situatie.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/reset-check`,
    title: "Klopt de Reset bij jou?",
    description:
      "Een korte persoonlijke check, met meteen tips & tricks om vandaag al toe te passen.",
    siteName: "Change Masters",
    locale: "nl_NL",
  },
};

const NAMESPACE = "reset-check";
const PAGINA_ID = "publiek";

export default async function ResetCheckPage() {
  const supabase = await createClient();

  // Founder-check (alleen ingelogde users met role=founder krijgen edit-mode)
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

  const blokkenMap = await haalPaginaBlokken(supabase, NAMESPACE, PAGINA_ID);
  const teaserBlokken = blokkenMap.get("teaser") ?? [];
  const verdiepingBlokken = blokkenMap.get("verdieping") ?? [];
  const testimonialsBlokken = blokkenMap.get("testimonials") ?? [];

  const teaserSlot = (
    <MediaSlot
      paginaNamespace={NAMESPACE}
      paginaId={PAGINA_ID}
      positie="teaser"
      blokken={teaserBlokken}
      isFounder={isFounder}
      lege="Hier komt straks de korte teaser-video (1 tot 2 minuten)"
    />
  );

  const verdiepingSlot = (
    <MediaSlot
      paginaNamespace={NAMESPACE}
      paginaId={PAGINA_ID}
      positie="verdieping"
      blokken={verdiepingBlokken}
      isFounder={isFounder}
      lege="Hier komt straks de verdiepende video (3 tot 5 minuten)"
    />
  );

  const testimonialSlot =
    testimonialsBlokken.length > 0 || isFounder ? (
      <MediaSlot
        paginaNamespace={NAMESPACE}
        paginaId={PAGINA_ID}
        positie="testimonials"
        blokken={testimonialsBlokken}
        isFounder={isFounder}
        lege="Hier komen straks de verhalen van mensen (video, quote of audio). Klik op + media hier in edit-mode."
      />
    ) : null;

  return (
    <EditModeProvider>
      {isFounder && (
        <div className="fixed top-4 right-4 z-50">
          <EditModeToggle isFounder={true} />
        </div>
      )}
      <ResetCheckFlow
        teaserFilm={teaserSlot}
        verdiepingFilm={verdiepingSlot}
        testimonialBlok={testimonialSlot}
      />
    </EditModeProvider>
  );
}

function MediaSlot({
  paginaNamespace,
  paginaId,
  positie,
  blokken,
  isFounder,
  lege,
}: {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
  blokken: Blok[];
  isFounder: boolean;
  lege: string;
}) {
  if (blokken.length === 0 && !isFounder) {
    return (
      <div className="bg-[#1c1c1c] text-[#c9a961] rounded-xl aspect-video flex items-center justify-center text-center p-4 text-sm">
        🎬 {lege}
      </div>
    );
  }
  return (
    <MediaBlokken
      paginaNamespace={paginaNamespace}
      paginaId={paginaId}
      positie={positie}
      blokken={blokken}
      isFounder={isFounder}
    />
  );
}

// File: app/bot/reset-check/[token]/page.tsx
//
// Per-member token-route voor Holistic Reset persoonlijke check.
// Members delen hun eigen URL via /instellingen/mijn-tracking-links.
// Leads komen automatisch in hun pijplijn (/namenlijst).

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  haalPaginaBlokken,
  type Blok,
} from "@/lib/cms/pagina-blokken";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { leesHerkomstUitSearchParams } from "@/lib/freebie-bots/herkomst";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { ResetCheckFlow } from "./flow";

export const dynamic = "force-dynamic";

const NAMESPACE = "reset-check";
const PAGINA_ID = "publiek";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("member_id")
    .eq("token", token)
    .maybeSingle();

  let memberVoornaam = "iemand";
  if (row?.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", row.member_id)
      .maybeSingle();
    memberVoornaam =
      ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";
  }

  const titel = "Klopt de Reset bij jou?";
  const beschrijving = `Een korte persoonlijke check met meteen tips & tricks. Klaargezet door ${memberVoornaam} en het team.`;

  return {
    title: titel,
    description: beschrijving,
    openGraph: { title: titel, description: beschrijving, images: [] },
    twitter: { card: "summary", title: titel, description: beschrijving },
  };
}

export default async function ResetCheckTokenPagina({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const herkomst = leesHerkomstUitSearchParams(sp);
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("member_id, bot_slug")
    .eq("token", token)
    .maybeSingle();

  if (!row || row.bot_slug !== "reset-check") {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";
  const isFounder = (profile as { role?: string } | null)?.role === "founder";

  // MediaBlokken voor de 3 posities (teaser, testimonials, verdieping)
  const blokkenMap = await haalPaginaBlokken(supabase, NAMESPACE, PAGINA_ID);
  const teaserBlokken = blokkenMap.get("teaser") ?? [];
  const verdiepingBlokken = blokkenMap.get("verdieping") ?? [];
  const testimonialsBlokken = blokkenMap.get("testimonials") ?? [];

  const overridesPerNamespace = await haalTekstOverridesMulti(supabase, [NAMESPACE]);
  const tekstOverrides = namespaceAlsRecord(overridesPerNamespace, NAMESPACE);

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
        lege="Hier komen straks de verhalen van mensen. Klik op + media hier in edit-mode."
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
        token={token}
        memberId={row.member_id}
        memberVoornaam={memberVoornaam}
        herkomst={herkomst}
        teaserFilm={teaserSlot}
        verdiepingFilm={verdiepingSlot}
        testimonialBlok={testimonialSlot}
        tekstOverrides={tekstOverrides}
        isFounder={isFounder}
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

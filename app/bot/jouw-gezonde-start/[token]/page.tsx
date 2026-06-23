// File: app/bot/jouw-gezonde-start/[token]/page.tsx
//
// Per-member token-route voor "Jouw gezonde start" (algemene podcast-freebie).
// Leads komen automatisch in de pijplijn van het lid (/namenlijst).

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { WelkomstfilmSpeler } from "@/components/freebies/WelkomstfilmSpeler";
import { GezondeStartFlow } from "./flow";

export const dynamic = "force-dynamic";

const NAMESPACE = "jouw-gezonde-start";
const PAGINA_ID = "publiek";

export async function generateMetadata(): Promise<Metadata> {
  const titel = "Jouw gezonde start";
  const beschrijving =
    "Een korte check met meteen een persoonlijk start-advies. Welkom.";
  return {
    title: titel,
    description: beschrijving,
    openGraph: { title: titel, description: beschrijving, images: [] },
    twitter: { card: "summary", title: titel, description: beschrijving },
  };
}

export default async function GezondeStartTokenPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("member_id, bot_slug, welkomstfilm_soort, welkomstfilm_url")
    .eq("token", token)
    .maybeSingle();

  if (!row || row.bot_slug !== NAMESPACE) {
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

  // Is de ingelogde bezoeker de eigenaar van deze freebie (lid/founder)? Dan
  // tonen we een knop om de welkomstfilm in te stellen. Prospects (niet
  // ingelogd) zien alleen de film.
  const sessieClient = await createClient();
  const {
    data: { user: ingelogd },
  } = await sessieClient.auth.getUser();
  const isEigenaar = !!ingelogd && ingelogd.id === row.member_id;

  // Welkomstfilm: eigen film van dit lid, anders de algemene default
  // (= de welkomstfilm van het default-account / de podcast-landing).
  let welkomSoort =
    (row as { welkomstfilm_soort?: string | null }).welkomstfilm_soort ?? null;
  let welkomUrl =
    (row as { welkomstfilm_url?: string | null }).welkomstfilm_url ?? null;
  if (!welkomUrl) {
    const { data: def } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "raoulzeewijk@hotmail.com")
      .maybeSingle();
    if (def?.id && def.id !== row.member_id) {
      const { data: defTok } = await supabase
        .from("freebie_bot_member_tokens")
        .select("welkomstfilm_soort, welkomstfilm_url")
        .eq("member_id", def.id)
        .eq("bot_slug", NAMESPACE)
        .maybeSingle();
      welkomSoort =
        (defTok as { welkomstfilm_soort?: string | null } | null)
          ?.welkomstfilm_soort ?? null;
      welkomUrl =
        (defTok as { welkomstfilm_url?: string | null } | null)
          ?.welkomstfilm_url ?? null;
    }
  }

  const blokkenMap = await haalPaginaBlokken(supabase, NAMESPACE, PAGINA_ID);
  const infoBlokken = blokkenMap.get("info") ?? [];

  const welkomFilm = (
    <div className="space-y-2">
      <WelkomstfilmSpeler soort={welkomSoort} url={welkomUrl} />
      {isEigenaar && (
        <Link
          href="/instellingen/welkomstfilm"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1f] hover:text-[#5a4710] transition-colors"
        >
          ✏️ Welkomstfilm instellen of wijzigen →
        </Link>
      )}
    </div>
  );

  const infoFilm = (
    <MediaSlot
      paginaNamespace={NAMESPACE}
      paginaId={PAGINA_ID}
      positie="info"
      blokken={infoBlokken}
      isFounder={isFounder}
      lege="Hier komt straks de informatie-film"
    />
  );

  return (
    <EditModeProvider>
      {isFounder && (
        <div className="fixed top-4 right-4 z-50">
          <EditModeToggle isFounder={true} />
        </div>
      )}
      <GezondeStartFlow
        token={token}
        memberVoornaam={memberVoornaam}
        welkomFilm={welkomFilm}
        infoFilm={infoFilm}
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

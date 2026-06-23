// File: app/bot/jouw-gezonde-start/[token]/page.tsx
//
// Per-member token-route voor "Jouw gezonde start" (algemene podcast-freebie).
// Leads komen automatisch in de pijplijn van het lid (/namenlijst).

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
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
    .select("member_id, bot_slug")
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

  const blokkenMap = await haalPaginaBlokken(supabase, NAMESPACE, PAGINA_ID);
  const welkomBlokken = blokkenMap.get("welkom") ?? [];
  const infoBlokken = blokkenMap.get("info") ?? [];

  const welkomFilm = (
    <MediaSlot
      paginaNamespace={NAMESPACE}
      paginaId={PAGINA_ID}
      positie="welkom"
      blokken={welkomBlokken}
      isFounder={isFounder}
      lege="Hier komt straks de welkomstfilm"
    />
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

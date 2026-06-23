// File: app/bot/jouw-gezonde-start/[token]/page.tsx
//
// Per-member token-route voor "Jouw gezonde start" (algemene podcast-freebie).
// Leads komen automatisch in de pijplijn van het lid (/namenlijst).
//
// Twee films:
//  - Welkomstfilm: per lid in te stellen (eigen film, anders de algemene).
//  - Informatiefilm (in de uitkomst): één algemene film voor iedereen,
//    alleen door de founder in te stellen. Komt van het default-account.

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { WelkomstfilmSpeler } from "@/components/freebies/WelkomstfilmSpeler";
import { GezondeStartFlow } from "./flow";

export const dynamic = "force-dynamic";

const NAMESPACE = "jouw-gezonde-start";
const DEFAULT_ACCOUNT_EMAIL = "raoulzeewijk@hotmail.com";

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

type FilmRij = {
  welkomstfilm_soort?: string | null;
  welkomstfilm_url?: string | null;
  informatiefilm_soort?: string | null;
  informatiefilm_url?: string | null;
};

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
    .select("full_name")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

  // Is de ingelogde bezoeker de eigenaar van deze freebie (lid/founder)? Dan
  // tonen we een knop om de welkomstfilm in te stellen. Prospects (niet
  // ingelogd) zien alleen de film.
  const sessieClient = await createClient();
  const {
    data: { user: ingelogd },
  } = await sessieClient.auth.getUser();
  const isEigenaar = !!ingelogd && ingelogd.id === row.member_id;

  // Algemene films komen van het default-account (de podcast-landing / founder).
  const { data: def } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", DEFAULT_ACCOUNT_EMAIL)
    .maybeSingle();

  let defWelkomSoort: string | null = null;
  let defWelkomUrl: string | null = null;
  let infoSoort: string | null = null;
  let infoUrl: string | null = null;
  if (def?.id) {
    const { data: defTok } = await supabase
      .from("freebie_bot_member_tokens")
      .select(
        "welkomstfilm_soort, welkomstfilm_url, informatiefilm_soort, informatiefilm_url",
      )
      .eq("member_id", def.id)
      .eq("bot_slug", NAMESPACE)
      .maybeSingle();
    const t = (defTok as FilmRij | null) ?? null;
    defWelkomSoort = t?.welkomstfilm_soort ?? null;
    defWelkomUrl = t?.welkomstfilm_url ?? null;
    infoSoort = t?.informatiefilm_soort ?? null;
    infoUrl = t?.informatiefilm_url ?? null;
  }

  // Welkomstfilm: eigen film van dit lid, anders de algemene default.
  const welkomSoort =
    (row as FilmRij).welkomstfilm_soort ?? defWelkomSoort;
  const welkomUrl = (row as FilmRij).welkomstfilm_url ?? defWelkomUrl;

  const welkomFilm = (
    <div className="space-y-2">
      <WelkomstfilmSpeler soort={welkomSoort} url={welkomUrl} />
      {isEigenaar && (
        <Link
          href="/instellingen/mijn-tracking-links"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6d1f] hover:text-[#5a4710] transition-colors"
        >
          ✏️ Welkomstfilm instellen of wijzigen →
        </Link>
      )}
    </div>
  );

  // Informatiefilm: alleen tonen als de founder er één heeft ingesteld
  // (de flow rendert 'm watch-aware en vuurt de "film-bekeken"-trigger).
  return (
    <GezondeStartFlow
      token={token}
      memberVoornaam={memberVoornaam}
      welkomFilm={welkomFilm}
      infoFilmSoort={infoSoort}
      infoFilmUrl={infoUrl}
    />
  );
}

// Leesbare, persoonlijke freebie-link: my-eleva.com/gezonde-start/<woord>
//
// Het woord (publieke_slug) is uniek en gekoppeld aan het token van één lid.
// We resolven het naar dat token en tonen exact dezelfde freebie als de
// token-route, zodat de leesbare URL in de adresbalk blijft staan.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  RenderGezondeStart,
  NAMESPACE,
} from "@/app/bot/jouw-gezonde-start/[token]/render";

export const dynamic = "force-dynamic";

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

export default async function GezondeStartSlugPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("token, bot_slug")
    .eq("publieke_slug", slug.toLowerCase())
    .maybeSingle();

  if (!row || row.bot_slug !== NAMESPACE || !row.token) {
    notFound();
  }

  return <RenderGezondeStart token={row.token} />;
}

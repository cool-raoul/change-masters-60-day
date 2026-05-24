// File: app/bot/tweede-lente/[token]/page.tsx
//
// Server-component die de token uit de URL valideert via admin-client
// (RLS-bypass nodig omdat dit een publieke route is). Bij ongeldige
// token: notFound() zodat we naar /bot/tweede-lente kunnen redirecten
// via de notFound-handler, of een eigen 404.
//
// Bij geldige token: rendert <TweedeLenteFlow /> met member-context.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { TweedeLenteFlow } from "./tweede-lente-flow";

export const dynamic = "force-dynamic";

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

  const titel = "Tweede Lente, een korte spiegel voor jouw fase";
  const beschrijving = `Vijf minuten, zeven vragen, een rustige spiegel. Klaargezet door ${memberVoornaam} en haar team.`;

  return {
    title: titel,
    description: beschrijving,
    openGraph: { title: titel, description: beschrijving, images: [] },
    twitter: { card: "summary", title: titel, description: beschrijving },
    icons: { icon: undefined, apple: undefined },
  };
}

export default async function TweedeLenteTokenPagina({
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

  if (!row || row.bot_slug !== "tweede-lente") {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

  // Bestellinks voor de drie hormoonbalans-pakketten van de member.
  // Deze drie matchen exact het Tweede Lente product-blok in de bot.
  // Als een member geen bestellink heeft ingesteld, toont blok-opt-in
  // de fallback "vraag {memberVoornaam} voor een bestellink".
  const { data: bestellinks } = await supabase
    .from("member_bestellinks")
    .select("pakket_key, url")
    .eq("user_id", row.member_id)
    .in("pakket_key", [
      "hormoonbalans-essential",
      "hormoonbalans-plus",
      "hormoonbalans-complete",
    ]);

  const linksMap: Record<string, string> = {};
  for (const b of (bestellinks ?? []) as Array<{
    pakket_key: string;
    url: string | null;
  }>) {
    if (b.url) linksMap[b.pakket_key] = b.url;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/50">
      {/* Subtiele decoratieve blossoms ver in de achtergrond */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-20 -left-10 text-9xl opacity-[0.04] rotate-12 select-none"
      >
        🌸
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-32 -right-12 text-9xl opacity-[0.04] -rotate-12 select-none"
      >
        🌷
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/2 right-10 text-7xl opacity-[0.03] select-none"
      >
        🌿
      </div>

      <div className="relative">
        <TweedeLenteFlow
          token={token}
          memberId={row.member_id}
          memberVoornaam={memberVoornaam}
          bestellinks={linksMap}
        />
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <TweedeLenteFlow
        token={token}
        memberId={row.member_id}
        memberVoornaam={memberVoornaam}
      />
    </div>
  );
}

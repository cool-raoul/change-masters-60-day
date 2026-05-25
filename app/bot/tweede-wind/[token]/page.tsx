// File: app/bot/tweede-wind/[token]/page.tsx
//
// Server-component die de token uit de URL valideert via admin-client.
// Bij ongeldige token of bot-slug-mismatch: notFound().
//
// Bij geldige token: rendert <TweedeWindFlow /> met member-context +
// bestellinks voor energie/focus-pakketten.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { TweedeWindFlow } from "./tweede-wind-flow";

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

  const titel = "Tweede Wind, een persoonlijk overzicht voor energie en focus";
  const beschrijving = `Vijf minuten, zeven vragen, een persoonlijk overzicht. Klaargezet door ${memberVoornaam} en het team.`;

  return {
    title: titel,
    description: beschrijving,
    openGraph: { title: titel, description: beschrijving, images: [] },
    twitter: { card: "summary", title: titel, description: beschrijving },
    icons: { icon: undefined, apple: undefined },
  };
}

export default async function TweedeWindTokenPagina({
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

  if (!row || row.bot_slug !== "tweede-wind") {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

  // Bestellinks voor de drie energie-focus pakketten van de member.
  const { data: bestellinks } = await supabase
    .from("member_bestellinks")
    .select("pakket_key, url")
    .eq("user_id", row.member_id)
    .in("pakket_key", [
      "energie-focus-essential",
      "energie-focus-plus",
      "energie-focus-complete",
    ]);

  const linksMap: Record<string, string> = {};
  for (const b of (bestellinks ?? []) as Array<{
    pakket_key: string;
    url: string | null;
  }>) {
    if (b.url) linksMap[b.pakket_key] = b.url;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50/50">
      <div
        aria-hidden
        className="pointer-events-none fixed top-20 -left-10 text-9xl opacity-[0.04] rotate-12 select-none"
      >
        ⚡
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-32 -right-12 text-9xl opacity-[0.04] -rotate-12 select-none"
      >
        🌬️
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/2 right-10 text-7xl opacity-[0.03] select-none"
      >
        🎯
      </div>

      <div className="relative">
        <TweedeWindFlow
          token={token}
          memberId={row.member_id}
          memberVoornaam={memberVoornaam}
          bestellinks={linksMap}
        />
      </div>
    </div>
  );
}

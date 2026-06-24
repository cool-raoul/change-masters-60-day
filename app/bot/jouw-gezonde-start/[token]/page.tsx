// File: app/bot/jouw-gezonde-start/[token]/page.tsx
//
// Per-member token-route voor "Jouw gezonde start" (algemene podcast-freebie).
// Rendert via de gedeelde RenderGezondeStart, zodat de leesbare slug-route
// (/start/<woord>) exact hetzelfde toont.

import type { Metadata } from "next";
import { RenderGezondeStart } from "./render";

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

export default async function GezondeStartTokenPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RenderGezondeStart token={token} />;
}

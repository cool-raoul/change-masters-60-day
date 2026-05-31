// File: app/core-v9/sideflow/[slug]/page.tsx
//
// Sinds 2026-05-31 alleen nog een redirect naar /sideflow/[slug] om
// oude bookmarks en de prepost-keuze-link te behouden. De echte
// sideflow leeft nu op /sideflow/[slug] zonder V9-prefix.

import { redirect, notFound } from "next/navigation";
import { type CoreV9SideflowSlug } from "@/lib/playbook/core-sideflows-v9";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

const GELDIGE_SLUGS: CoreV9SideflowSlug[] = ["pre-post", "21-dagen-post"];

export default async function CoreV9SideflowRedirect({
  params,
}: {
  params: Params;
}) {
  const { slug: slugStr } = await params;
  if (!GELDIGE_SLUGS.includes(slugStr as CoreV9SideflowSlug)) {
    notFound();
  }
  redirect(`/sideflow/${slugStr}`);
}

// /nieuw: de domein-pagina's van de nieuwe layout (thuis, mensen, leren,
// meer). De SCHIL zelf (rail + onderbalk) komt uit AppShell, die per
// account schakelt tussen oud en nieuw via profiles.nieuwe_layout. Deze
// layout doet alleen de preview-gate: founders en testers.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function NieuwLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();
  const p = profiel as { role?: string | null; is_tester?: boolean | null } | null;
  if (p?.role !== "founder" && p?.is_tester !== true) redirect("/dashboard");

  return <AppShell>{children}</AppShell>;
}

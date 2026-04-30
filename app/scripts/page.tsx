import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { haalScriptsMetOverrides } from "@/lib/scripts/overrides";
import { ScriptsOverview } from "./scripts-overview";

// ============================================================
// /scripts — overzichtspagina van alle scripts.
//
// Server-component die per request de scripts-met-overrides ophaalt en
// doorgeeft aan de client-component voor zoeken/filteren/✏️.
// ============================================================

export const dynamic = "force-dynamic";

export default async function ScriptsPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder =
    (profiel as { role?: string | null } | null)?.role === "founder";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scripts = await haalScriptsMetOverrides(supabase as any);

  return <ScriptsOverview scripts={scripts} isFounder={isFounder} />;
}

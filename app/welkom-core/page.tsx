import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ============================================================
// /welkom-core, legacy route.
//
// Per 2026-05-18: Core gebruikt nu de gedeelde pre-day-1 in /onboarding.
// Deze pagina blijft als redirect voor backward-compat en oude
// bookmarks. Logica per modus:
//   - core  -> /onboarding (gedeelde pre-day-1, modus-bewust)
//   - sprint -> /dashboard
//   - pro   -> /welkom-pro
//   - geen modus -> /welkom-keuze
// ============================================================

export const dynamic = "force-dynamic";

export default async function WelkomCorePagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("modus")
    .eq("id", user.id)
    .maybeSingle();

  const modus = (profile as { modus?: string | null } | null)?.modus ?? null;

  if (modus === "core") redirect("/onboarding");
  if (modus === "sprint") redirect("/dashboard");
  if (modus === "pro") redirect("/welkom-pro");
  redirect("/welkom-keuze");
}

// File: app/resetcode-kennis/page.tsx
//
// Founder-scherm van de Mentor kennis-lus: open klantvragen
// beantwoorden (de Mentor leert het direct) en zelf vraag+antwoord
// toevoegen. Alleen founders.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import KennisClient from "./kennis-client";

export const dynamic = "force-dynamic";

export default async function ResetcodeKennisPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string | null } | null)?.role !== "founder") {
    redirect("/dashboard");
  }
  return <KennisClient />;
}

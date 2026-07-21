// File: app/mijn-programma/page.tsx
//
// De eigen programma-Mentor van een member (akkoord Raoul 21 juli):
// een member die zelf een programma doet is gewoon klant van zijn
// sponsor. Bestaat er al een eigen omgeving, dan gaan we er direct
// heen; anders eerst het keuzescherm.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import ProgrammaKeuze from "./programma-keuze";

export const dynamic = "force-dynamic";

export default async function MijnProgrammaPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: bestaand } = await admin
    .from("resetcode_klant_links")
    .select("token")
    .eq("klant_user_id", user.id)
    .eq("status", "actief")
    .order("created_at", { ascending: false })
    .limit(1);
  const token = (bestaand as { token: string }[] | null)?.[0]?.token;
  if (token) redirect(`/k/${token}`);

  return <ProgrammaKeuze />;
}

// Founder-only TTS-proeftuin: spraak in, transcript, vertaling,
// ELEVA Mentor-stem uit. Voor pilot-team demo en als bouwsteen voor
// straks: founder-films vervangen door spraak + TTS.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SpraakMentorClient from "./spraak-mentor-client";

export const dynamic = "force-dynamic";

export default async function SpraakMentorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const rol = (profiel as { role?: string } | null)?.role;
  if (rol !== "founder") {
    redirect("/dashboard");
  }

  return <SpraakMentorClient />;
}

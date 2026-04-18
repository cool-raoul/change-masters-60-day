import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ChatVenster } from "@/components/coach/ChatVenster";

export default async function CoachGesprekPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: gesprek }, { data: prospects }] = await Promise.all([
    supabase
      .from("ai_gesprekken")
      .select("*, prospect:prospects(id, volledige_naam, pipeline_fase)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("prospects")
      .select("id, volledige_naam, pipeline_fase")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false)
      .order("volledige_naam"),
  ]);

  if (!gesprek) notFound();

  return (
    <ChatVenster
      gesprekId={id}
      gesprekTitel={gesprek.titel || ""}
      bestaandeBerichten={gesprek.berichten || []}
      prospect={gesprek.prospect || null}
      alleProspects={prospects || []}
      userId={user.id}
    />
  );
}

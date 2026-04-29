import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ChatVenster } from "@/components/coach/ChatVenster";

export default async function CoachGesprekPagina({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prefill?: string; submit?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const prefill = sp.prefill;
  const autoVerstuur = sp.submit === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: gesprek }, { data: prospects }, { data: eigenProfiel }] =
    await Promise.all([
      supabase
        .from("ai_gesprekken")
        .select(
          "*, prospect:prospects(id, volledige_naam, pipeline_fase, notities)",
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("prospects")
        .select("id, volledige_naam, pipeline_fase")
        .eq("user_id", user.id)
        .eq("gearchiveerd", false)
        .order("volledige_naam"),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);

  if (!gesprek) notFound();

  // Bestaande productadvies-test van de prospect (voor de Vragenlijst-actie
  // in de mentor — laat bestaande chip + refresh-knop werken net als op de
  // prospect-kaart).
  let productadviesTest: any = null;
  if (gesprek.prospect?.id) {
    const { data } = await supabase
      .from("productadvies_tests")
      .select(
        "token, status, trigger_60day, uitslag, ingevuld_op, darmvragenlijst_uitslag, darmvragenlijst_ingevuld_op",
      )
      .eq("prospect_id", gesprek.prospect.id)
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    productadviesTest = data;
  }

  return (
    <ChatVenster
      gesprekId={id}
      gesprekTitel={gesprek.titel || ""}
      bestaandeBerichten={gesprek.berichten || []}
      prospect={gesprek.prospect || null}
      prospectNotities={(gesprek.prospect as any)?.notities ?? null}
      productadviesTest={productadviesTest}
      memberNaam={(eigenProfiel as any)?.full_name ?? "je member"}
      alleProspects={prospects || []}
      userId={user.id}
      initialInvoer={
        prefill && (gesprek.berichten || []).length === 0 ? prefill : undefined
      }
      autoVerstuur={
        autoVerstuur && !!prefill && (gesprek.berichten || []).length === 0
      }
    />
  );
}

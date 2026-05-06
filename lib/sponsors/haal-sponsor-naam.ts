// ============================================================
// Hulpfunctie: haal sponsor-naam op voor de mens-eerst-strip.
//
// Drie-traps fallback (zelfde patroon als prospect-detail-pagina):
//   1. Als de gebruiker een gekoppelde sponsor heeft (sponsor_id), gebruik die.
//   2. Als de gebruiker zelf een leider is, val terug op "Ramon Sant".
//   3. Anders pak de eerste 1-2 leiders uit de stamboom.
//
// Werkt vanuit een server-component (zoals de dashboards) met een
// reeds-gemaakte Supabase server-client. Falls back op "Ramon Sant"
// als er ook geen leiders zijn (mag in een leeg systeem niet leeg
// blijven, anders verbergt de strip zich onbedoeld).
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupaClient = any;

export async function haalSponsorNaam(
  supabase: SupaClient,
  sponsorId: string | null,
  eigenRol: string | null,
): Promise<string> {
  if (sponsorId) {
    const { data: sp } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", sponsorId)
      .single();
    return (sp as { full_name?: string } | null)?.full_name ?? "";
  }

  if (eigenRol === "leider") {
    return "Ramon Sant";
  }

  const { data: leiders } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("role", "leider")
    .order("created_at", { ascending: true })
    .limit(2);

  if (leiders && leiders.length > 0) {
    return (leiders as Array<{ full_name: string }>)
      .map((l) => l.full_name)
      .join(" / ");
  }

  return "Ramon Sant";
}

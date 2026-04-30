// ============================================================
// cms/tekst-overrides — generieke server-helpers voor founder-bewerkbare
// teksten. Inzetbaar voor onboarding, welkom-popup, mentor-stijl, etc.
//
// Sleutelconventie:
//   namespace = feature (bv. 'onboarding', 'welkom-popup')
//   sleutel   = path binnen die feature (bv. 'stap1.titel')
//
// Faalt stilletjes als de tabel ontbreekt → componenten vallen terug
// op de hardcoded standaardtekst.
// ============================================================

export type TekstOverrideRij = {
  namespace: string;
  sleutel: string;
  waarde: string;
};

/**
 * Server-side: haal alle overrides voor één namespace.
 * Returnt een plain object {sleutel: waarde} zodat het probleemloos
 * van server naar client kan met JSON-serialisatie.
 */
export async function haalTekstOverrides(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  namespace: string,
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const { data, error } = await supabase
      .from("tekst_overrides")
      .select("sleutel, waarde")
      .eq("namespace", namespace);
    if (!error && data) {
      for (const r of data as { sleutel: string; waarde: string }[]) {
        map[r.sleutel] = r.waarde;
      }
    }
  } catch {
    // Tabel ontbreekt of RLS blokkeert — gebruik fallback
  }
  return map;
}

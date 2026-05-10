// ============================================================
// cms/tekst-overrides, generieke server-helpers voor founder-bewerkbare
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
    // Tabel ontbreekt of RLS blokkeert, gebruik fallback
  }
  return map;
}

// ============================================================
// Multi-namespace variant
//
// Gebruikt door /vandaag (Sprint) en straks /welkom-core (Core) die
// in één request meerdere namespaces tegelijk willen ophalen
// (bv. "sprint-dag", "sprint-ui", "sprint-groet"). Geeft een nested
// Map terug zodat de caller kan filteren op zowel namespace als
// individuele sleutel zonder N round-trips.
// ============================================================

export type TekstOverridesMulti = Map<string, Map<string, string>>;

/**
 * Server-side: haal overrides voor meerdere namespaces in één query.
 */
export async function haalTekstOverridesMulti(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  namespaces: string[],
): Promise<TekstOverridesMulti> {
  const result: TekstOverridesMulti = new Map();
  if (namespaces.length === 0) return result;
  try {
    const { data, error } = await supabase
      .from("tekst_overrides")
      .select("namespace, sleutel, waarde")
      .in("namespace", namespaces);
    if (!error && data) {
      for (const r of data as TekstOverrideRij[]) {
        let sub = result.get(r.namespace);
        if (!sub) {
          sub = new Map();
          result.set(r.namespace, sub);
        }
        sub.set(r.sleutel, r.waarde);
      }
    }
  } catch {
    // network/typing/anders, fail silently
  }
  return result;
}

/**
 * Comfort-helper: pak één namespace eruit als plain Record voor
 * gebruik in EditableTekst's `overrides`-prop. Lege Record als de
 * namespace niet bestond.
 */
export function namespaceAlsRecord(
  overrides: TekstOverridesMulti,
  namespace: string,
): Record<string, string> {
  const sub = overrides.get(namespace);
  if (!sub) return {};
  const obj: Record<string, string> = {};
  // Array.from omdat tsconfig-target geen for-of over Map.entries()
  // toestaat zonder --downlevelIteration. Werkt overal hetzelfde.
  Array.from(sub.entries()).forEach(([k, v]) => {
    obj[k] = v;
  });
  return obj;
}

import { DAGEN } from "@/lib/playbook/dagen";

// ============================================================
// Hulpmap: per inline-actie-slug terugvinden waar in het playbook
// die zin oorspronkelijk geschreven is. Wordt gebruikt op
// /mijn-zinnen om "← Hoort bij dag X" terug te linken.
// ============================================================

export type SlugContext = {
  slug: string;
  dagNummer: number;
  taakId: string;
  /** Default-label uit dagen.ts (kan door member overschreven zijn) */
  label: string;
  instructie?: string;
  placeholder?: string;
  maxTekens?: number;
  voorbeeld?: string;
};

export function buildSlugContextMap(): Map<string, SlugContext> {
  const map = new Map<string, SlugContext>();
  for (const dag of DAGEN) {
    for (const taak of dag.vandaagDoen) {
      if (!taak.inlineActie) continue;
      map.set(taak.inlineActie.slug, {
        slug: taak.inlineActie.slug,
        dagNummer: dag.nummer,
        taakId: taak.id,
        label: taak.inlineActie.label,
        instructie: taak.inlineActie.instructie,
        placeholder: taak.inlineActie.placeholder,
        maxTekens: taak.inlineActie.maxTekens,
        voorbeeld: taak.inlineActie.voorbeeld,
      });
    }
  }
  return map;
}

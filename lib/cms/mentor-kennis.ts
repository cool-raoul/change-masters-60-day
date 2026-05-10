// ============================================================
// mentor-kennis.ts, server-helper voor gevalideerde product-ervaringen.
//
// Geeft alle rijen terug uit mentor_kennis_supplementen waar
// gevalideerd=true. ELEVA Mentor consulteert deze data bij medische
// vragen, alleen via claim-vrije formuleringen + disclaimers.
//
// Gebruikt admin-client want de tabel-RLS staat founder-only en de
// coach-route draait als de ingelogde member.
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";

export type GevalideerdeKennisRij = {
  oorspronkelijke_term: string;
  zoekterm: string;
  basis_advies: string | null;
  aanvullende_producten: string[];
  leefstijl_tip: string | null;
};

/**
 * Haalt alle gevalideerde kennis-rijen op. Returnt lege array bij
 * fout (faalt stil zodat coach blijft werken).
 */
export async function haalGevalideerdeKennis(): Promise<
  GevalideerdeKennisRij[]
> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("mentor_kennis_supplementen")
      .select(
        "oorspronkelijke_term, zoekterm, basis_advies, aanvullende_producten, leefstijl_tip",
      )
      .eq("gevalideerd", true)
      .order("oorspronkelijke_term", { ascending: true });
    if (error || !data) return [];
    return data as GevalideerdeKennisRij[];
  } catch {
    return [];
  }
}

/**
 * Format kennis-rijen als compacte tekst voor injectie in de coach-
 * prompt. Lege string als geen rijen — voorkomt prompt-bloat.
 */
export function formatKennisVoorPrompt(
  rijen: GevalideerdeKennisRij[],
): string {
  if (rijen.length === 0) return "";

  const regels = rijen.map((r) => {
    const aanvul =
      r.aanvullende_producten && r.aanvullende_producten.length > 0
        ? ` + ${r.aanvullende_producten.join(", ")}`
        : "";
    const tip = r.leefstijl_tip ? ` | tip: ${r.leefstijl_tip}` : "";
    const basis = r.basis_advies ?? "";
    return `• ${r.oorspronkelijke_term}: ${basis}${aanvul}${tip}`;
  });

  return `\n\nINTERNE PRODUCT-ERVARINGS-KENNIS (gevalideerd door founder, intern gebruik):
Deze rijen komen uit jarenlange ELEVA-team-ervaring + Dr. McKee-adviezen.
Gebruik ze ALLEEN wanneer de member zélf een symptoom of ervaring inbrengt
(bv. "ik slaap slecht", "mijn moeder heeft last van haar gewrichten"). Als
je geen match ziet, improviseer je met je algemene Lifeplus-kennis.

GEBRUIK CLAIM-VRIJ:
- Nooit "dit product geneest X" of "behandelt Y". Wel: "veel mensen die
  hier last van hebben starten met... en merken dat...".
- Geef ALTIJD een arts-disclaimer.
- Gebruik basis-advies + aanvullende producten als richting; specifieke
  doseringen NIET noemen, verwijs naar de productadvies-test of sponsor.
- Bij twijfel of conflict tussen je eigen kennis en deze rijen: gebruik
  deze rijen, ze zijn door de founder gevalideerd voor 2026.

KENNIS-RIJEN:
${regels.join("\n")}`;
}

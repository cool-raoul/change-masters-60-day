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
(bv. "ik slaap slecht", "mijn moeder heeft last van haar gewrichten",
"vraag over Pfeiffer voor een vriend"). Als je geen match ziet,
improviseer je met je algemene Lifeplus-kennis.

REGELS BIJ MATCH (heel belangrijk, geen uitzonderingen):

1. NOEM ALLE PRODUCTEN UIT DE MATCH-RIJ. Niet selectief weglaten omdat
   een product je onbekend lijkt. De founder heeft ze allemaal expliciet
   gevalideerd voor 2026. Volgorde: eerst basis_advies, dan álle
   aanvullende_producten.

2. NOEM DE LEEFSTIJL-TIP ALTIJD APART als die er is. Format:
   "Naast de producten zijn er leefstijl-elementen die mensen ook noemen
    bij dit thema: [leefstijl_tip-tekst]."
   Als de tip niet-Lifeplus-suggesties bevat (kruiden, dieet,
   alternatieve middelen): noem ze NEUTRAAL als "wat mensen ook wel
   doen" zonder zelf advies te formuleren. Verwijs naar arts of
   orthomoleculair-deskundige voor de invulling daarvan.

3. CLAIM-VRIJ FORMULEREN:
   - Nooit "dit product geneest X" of "behandelt Y". Wel: "veel mensen
     die hier last van hebben starten met... en merken dat...".
   - Specifieke doseringen NIET noemen — verwijs naar de productadvies-
     test of sponsor.
   - ALTIJD de standaard arts-disclaimer eronder.

4. BIJ CONFLICT MET JE EIGEN KENNIS: gebruik de match-rij. Founder heeft
   die voor 2026 gevalideerd, jouw algemene kennis kan verouderd zijn.

5. NOOIT ZIEKTENAMEN INTRODUCEREN. Reageer alleen op termen die de
   member zelf gebruikt. Spiegel de term in je antwoord ("Bij Pfeiffer
   zien we ..."), maar zelf nooit beginnen met "heb je ook last van X".

KENNIS-RIJEN:
${regels.join("\n")}

BIJ MATCH: lees de hele rij door, vat op als één geïntegreerd advies,
en spiegel het terug in je antwoord — INCLUSIEF alle producten en de
tip. Niet selectief.`;
}

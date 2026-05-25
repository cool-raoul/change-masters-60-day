// File: lib/freebie-bots/stats.ts
//
// Server-side stats voor de freebies van de huidige member.
//
// Belangrijke nuance (Raoul, 2026-05-25): 'conversie' is niet 'ingevuld'.
// Conversie is wanneer een lead daadwerkelijk een KLANT wordt (pipeline-
// fase shopper of member). Daarom tonen we drie dingen:
//
//   1. Het funnel-pad: ingetekend → afgemaakt → klant
//   2. Pipeline-spreiding: waar zitten de leads NU in je pijplijn
//   3. Twee conversies: 'ingevuld %' (operationeel) en 'klant %' (echt)

import type { SupabaseClient } from "@supabase/supabase-js";
import { PIPELINE_FASEN, type PipelineFase } from "@/lib/supabase/types";

export type PipelineSpreiding = Record<PipelineFase, number>;

const LEGE_SPREIDING: PipelineSpreiding = {
  prospect: 0,
  in_gesprek: 0,
  uitgenodigd: 0,
  one_pager: 0,
  presentatie: 0,
  followup: 0,
  member: 0,
  shopper: 0,
  not_yet: 0,
};

const KLANT_FASES: PipelineFase[] = ["shopper", "member"];

export type ProductadviesStats = {
  totaalVerzonden: number;
  ingevuld: number;
  /** Prospects die via deze freebie binnenkwamen EN nu shopper/member zijn. */
  klanten: number;
  /** Ingevuld als percentage van verzonden. */
  ingevuldPct: number;
  /** Klant als percentage van verzonden (echte conversie). */
  klantPct: number;
  /** Hoeveelheden per pipeline-fase voor leads die via deze freebie kwamen. */
  pipelineSpreiding: PipelineSpreiding;
  /** Totaal aantal unieke prospects gekoppeld aan deze freebie. */
  totaalProspectsViaFreebie: number;
};

export type TweedeLenteStats = {
  totaalIngetekend: number;
  vragenlijstAfgemaakt: number;
  /** Prospects met 'Freebie: Tweede Lente' tag die nu shopper/member zijn. */
  klanten: number;
  contactGevraagd: number;
  /** Afgemaakt als percentage van ingetekend. */
  afgemaaktPct: number;
  /** Klant als percentage van ingetekend (echte conversie). */
  klantPct: number;
  /** Hoeveelheden per pipeline-fase voor leads via Tweede Lente. */
  pipelineSpreiding: PipelineSpreiding;
  /** Totaal aantal unieke prospects gekoppeld aan deze freebie. */
  totaalProspectsViaFreebie: number;
};

/**
 * Bouw spreiding-record uit lijst van prospects.
 */
function bouwSpreiding(
  prospects: Array<{ pipeline_fase: string | null }>,
): { spreiding: PipelineSpreiding; klanten: number; totaal: number } {
  const spreiding: PipelineSpreiding = { ...LEGE_SPREIDING };
  let klanten = 0;
  for (const p of prospects) {
    const f = (p.pipeline_fase ?? "prospect") as PipelineFase;
    if (f in spreiding) {
      spreiding[f] = (spreiding[f] ?? 0) + 1;
      if (KLANT_FASES.includes(f)) klanten++;
    }
  }
  return { spreiding, klanten, totaal: prospects.length };
}

export async function haalProductadviesStats(
  supabase: SupabaseClient,
  memberId: string,
): Promise<ProductadviesStats> {
  // Totaal verzonden + ingevuld via productadvies_tests
  const { count: totaalVerzonden } = await supabase
    .from("productadvies_tests")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("is_open_template", false);

  const { count: ingevuld } = await supabase
    .from("productadvies_tests")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("is_open_template", false)
    .eq("status", "ingevuld");

  // Prospects via deze freebie: ingezette_tools bevat
  // 'Productadvies-vragenlijst' (auto-gezet door submit-route) OF de
  // legacy waarde 'Productadvies-test'.
  const { data: prospectsArrA } = await supabase
    .from("prospects")
    .select("pipeline_fase")
    .eq("user_id", memberId)
    .contains("ingezette_tools", ["Productadvies-vragenlijst"]);
  const { data: prospectsArrB } = await supabase
    .from("prospects")
    .select("pipeline_fase")
    .eq("user_id", memberId)
    .contains("ingezette_tools", ["Productadvies-test"]);

  const alleProspects = [
    ...((prospectsArrA ?? []) as Array<{ pipeline_fase: string | null }>),
    ...((prospectsArrB ?? []) as Array<{ pipeline_fase: string | null }>),
  ];
  const { spreiding, klanten, totaal } = bouwSpreiding(alleProspects);

  const v = totaalVerzonden ?? 0;
  const i = ingevuld ?? 0;
  return {
    totaalVerzonden: v,
    ingevuld: i,
    klanten,
    ingevuldPct: v > 0 ? Math.round((i / v) * 100) : 0,
    klantPct: v > 0 ? Math.round((klanten / v) * 100) : 0,
    pipelineSpreiding: spreiding,
    totaalProspectsViaFreebie: totaal,
  };
}

export async function haalTweedeLenteStats(
  supabase: SupabaseClient,
  memberId: string,
): Promise<TweedeLenteStats> {
  // Freebie-id ophalen voor 'tweede-lente'
  const { data: freebie } = await supabase
    .from("freebies")
    .select("id")
    .eq("slug", "tweede-lente")
    .maybeSingle();

  if (!freebie) {
    return {
      totaalIngetekend: 0,
      vragenlijstAfgemaakt: 0,
      klanten: 0,
      contactGevraagd: 0,
      afgemaaktPct: 0,
      klantPct: 0,
      pipelineSpreiding: { ...LEGE_SPREIDING },
      totaalProspectsViaFreebie: 0,
    };
  }

  // Funnel-cijfers via opt-ins
  const { count: totaalIngetekend } = await supabase
    .from("freebie_opt_ins")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("freebie_id", (freebie as { id: string }).id);

  const { count: vragenlijstAfgemaakt } = await supabase
    .from("freebie_opt_ins")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("freebie_id", (freebie as { id: string }).id)
    .not("spiegel_tekst", "is", null);

  // Prospects via deze freebie: ingezette_tools bevat
  // 'Freebie: Tweede Lente' (auto-gezet door opt-in-route). Backwards
  // compat: oude 'Tweede Lente bot' tag wordt apart geteld en samengevoegd.
  const { data: prospectsArrA } = await supabase
    .from("prospects")
    .select("pipeline_fase, notities")
    .eq("user_id", memberId)
    .contains("ingezette_tools", ["Freebie: Tweede Lente"]);
  const { data: prospectsArrB } = await supabase
    .from("prospects")
    .select("pipeline_fase, notities")
    .eq("user_id", memberId)
    .contains("ingezette_tools", ["Tweede Lente bot"]);

  type ProspectRij = { pipeline_fase: string | null; notities: string | null };
  const alleProspects = [
    ...((prospectsArrA ?? []) as ProspectRij[]),
    ...((prospectsArrB ?? []) as ProspectRij[]),
  ];

  const { spreiding, klanten, totaal } = bouwSpreiding(alleProspects);

  // Contact-aanvragen: subset waarvan notitie 'VRAAGT PERSOONLIJK CONTACT' bevat
  const contactGevraagd = alleProspects.filter((p) =>
    (p.notities ?? "").includes("VRAAGT PERSOONLIJK CONTACT"),
  ).length;

  const t = totaalIngetekend ?? 0;
  const v = vragenlijstAfgemaakt ?? 0;
  return {
    totaalIngetekend: t,
    vragenlijstAfgemaakt: v,
    klanten,
    contactGevraagd,
    afgemaaktPct: t > 0 ? Math.round((v / t) * 100) : 0,
    klantPct: t > 0 ? Math.round((klanten / t) * 100) : 0,
    pipelineSpreiding: spreiding,
    totaalProspectsViaFreebie: totaal,
  };
}

/**
 * Helper voor weergave: lijst van pipeline-fases met aantal, alleen die
 * met aantal > 0. Volgorde matcht de standaard pipeline-volgorde.
 */
export function pipelineSpreidingZichtbaar(
  spreiding: PipelineSpreiding,
): Array<{ fase: PipelineFase; label: string; aantal: number; kleur: string }> {
  return PIPELINE_FASEN.map((p) => ({
    fase: p.fase,
    label: p.label,
    aantal: spreiding[p.fase] ?? 0,
    kleur: p.tekstkleur,
  })).filter((r) => r.aantal > 0);
}

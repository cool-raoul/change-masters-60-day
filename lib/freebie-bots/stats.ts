// File: lib/freebie-bots/stats.ts
//
// Server-side stats voor de freebies van de huidige member. Wordt gebruikt
// in /instellingen/mijn-tracking-links om een snel overzicht te geven van
// hoe de freebies presteren in de pilot.
//
// Geen schrijfwerk, alleen lezen + tellen.

import type { SupabaseClient } from "@supabase/supabase-js";

export type ProductadviesStats = {
  totaalVerzonden: number;
  ingevuld: number;
  conversie: number; // ingevuld / totaalVerzonden
};

export type TweedeLenteStats = {
  totaalIngetekend: number;
  vragenlijstAfgemaakt: number;
  contactGevraagd: number;
  conversie: number; // afgemaakt / ingetekend
};

export async function haalProductadviesStats(
  supabase: SupabaseClient,
  memberId: string,
): Promise<ProductadviesStats> {
  // Totaal verzonden: alle prospect-gebonden tests (open-template
  // uitgesloten want die wordt door iedereen 'verstuurd' = template-stand)
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

  const t = totaalVerzonden ?? 0;
  const i = ingevuld ?? 0;
  return {
    totaalVerzonden: t,
    ingevuld: i,
    conversie: t > 0 ? Math.round((i / t) * 100) : 0,
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
      contactGevraagd: 0,
      conversie: 0,
    };
  }

  // Totaal ingetekend: opt-ins voor deze (member, freebie)
  const { count: totaalIngetekend } = await supabase
    .from("freebie_opt_ins")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("freebie_id", (freebie as { id: string }).id);

  // Vragenlijst afgemaakt: opt-in heeft spiegel_tekst (= bot voltooid)
  const { count: vragenlijstAfgemaakt } = await supabase
    .from("freebie_opt_ins")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("freebie_id", (freebie as { id: string }).id)
    .not("spiegel_tekst", "is", null);

  // Contact-aanvragen: prospects met Freebie-tag + prioriteit hoog +
  // notitie bevat 'VRAAGT PERSOONLIJK CONTACT' (markeer-zin uit opt-in
  // notitie wanneer contactGewenst=true).
  const { data: contactRijen } = await supabase
    .from("prospects")
    .select("id")
    .eq("user_id", memberId)
    .contains("ingezette_tools", ["Freebie: Tweede Lente"])
    .ilike("notities", "%VRAAGT PERSOONLIJK CONTACT%");
  const contactGevraagd = contactRijen?.length ?? 0;

  const t = totaalIngetekend ?? 0;
  const v = vragenlijstAfgemaakt ?? 0;
  return {
    totaalIngetekend: t,
    vragenlijstAfgemaakt: v,
    contactGevraagd,
    conversie: t > 0 ? Math.round((v / t) * 100) : 0,
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// lib/radar/carry-over.ts
//
// Haalt prospect-IDs op die GISTEREN in de radar zaten en NIET
// zijn afgevinkt. Die IDs krijgen vandaag +25 scoring-bump in
// pakTopRadar zodat ze grote kans hebben bovenaan te staan.
//
// MVP-keuze: we slaan niet expliciet op welke prospects gisteren
// in de radar zaten — alleen welke ZIJN afgevinkt. carryOverBump
// is dus initieel leeg. De carry-over werkt via UI-zichtbaarheid
// (afgevinkt grijst uit, niet-afgevinkt blijft hoog in lijst door
// natuurlijke score-continuïteit van signalen). Als blijkt dat
// expliciete bump nodig is, kan dat later via een aparte tabel
// 'radar_aangeboden' worden uitgebreid — alle haakjes (opts.bumpIds
// in pakTopRadar) staan al klaar.
// ============================================================

export type AfvinkSets = {
  /** Prospect-IDs die VANDAAG zijn afgevinkt (grijst uit in UI). */
  vandaagAfgevinkt: Set<string>;
  /** Prospect-IDs die +25 scoring-bump krijgen. Voor MVP leeg. */
  carryOverBump: Set<string>;
};

export async function haalRadarAfvinkSets(
  supabase: SupabaseClient,
  userId: string,
): Promise<AfvinkSets> {
  const vandaag = new Date();
  const gisteren = new Date(vandaag);
  gisteren.setDate(gisteren.getDate() - 1);

  function isoDatum(d: Date): string {
    const jaar = d.getFullYear();
    const maand = String(d.getMonth() + 1).padStart(2, "0");
    const dag = String(d.getDate()).padStart(2, "0");
    return `${jaar}-${maand}-${dag}`;
  }

  const vandaagStr = isoDatum(vandaag);
  const gisterenStr = isoDatum(gisteren);

  const { data, error } = await supabase
    .from("radar_voltooiingen")
    .select("prospect_id, datum")
    .eq("user_id", userId)
    .in("datum", [vandaagStr, gisterenStr]);

  if (error) {
    console.warn("haalRadarAfvinkSets error:", error.message);
    return { vandaagAfgevinkt: new Set(), carryOverBump: new Set() };
  }

  const vandaagAfgevinkt = new Set<string>();

  for (const r of (data as Array<{ prospect_id: string; datum: string }> | null) ?? []) {
    if (r.datum === vandaagStr) vandaagAfgevinkt.add(r.prospect_id);
  }

  // MVP: carryOverBump leeg. Zie file-header voor motivatie.
  const carryOverBump = new Set<string>();

  return { vandaagAfgevinkt, carryOverBump };
}

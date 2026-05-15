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
  const vandaagStartIso = `${vandaagStr}T00:00:00Z`;

  // Drie parallelle queries voor de drie afvink-bronnen:
  //   1. radar_voltooiingen (manueel afgevinkt via "Vandaag opgepakt"-knop)
  //   2. herinneringen voltooid vandaag (auto-detect, via voltooid_op-trigger)
  //   3. prospects met laatste_contact = vandaag (auto-detect)
  const [
    { data: voltooiingen, error: voltooiingenError },
    { data: herinneringen },
    { data: aangerakkProspects },
  ] = await Promise.all([
    supabase
      .from("radar_voltooiingen")
      .select("prospect_id, datum")
      .eq("user_id", userId)
      .in("datum", [vandaagStr, gisterenStr]),
    supabase
      .from("herinneringen")
      .select("prospect_id")
      .eq("user_id", userId)
      .eq("voltooid", true)
      .gte("voltooid_op", vandaagStartIso),
    supabase
      .from("prospects")
      .select("id")
      .eq("user_id", userId)
      .eq("laatste_contact", vandaagStr),
  ]);

  if (voltooiingenError) {
    console.warn("haalRadarAfvinkSets voltooiingen error:", voltooiingenError.message);
  }

  const vandaagAfgevinkt = new Set<string>();

  // Bron 1: manueel afgevinkt vandaag
  for (const r of (voltooiingen as Array<{ prospect_id: string; datum: string }> | null) ?? []) {
    if (r.datum === vandaagStr) vandaagAfgevinkt.add(r.prospect_id);
  }

  // Bron 2: herinneringen vandaag voltooid (auto)
  for (const r of (herinneringen as Array<{ prospect_id: string | null }> | null) ?? []) {
    if (r.prospect_id) vandaagAfgevinkt.add(r.prospect_id);
  }

  // Bron 3: prospect-laatste_contact = vandaag (auto)
  for (const r of (aangerakkProspects as Array<{ id: string }> | null) ?? []) {
    vandaagAfgevinkt.add(r.id);
  }

  // MVP: carryOverBump leeg. Zie file-header voor motivatie.
  const carryOverBump = new Set<string>();

  return { vandaagAfgevinkt, carryOverBump };
}

import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Server-helpers voor de dagelijkse check-in (dagboek) van een
// Resetcode-klant-link. Motor achter "elke dag even inloggen",
// de voortgangs-kaart en de streak-kleuring op het Groeipad.
// ============================================================

export type CheckinRij = {
  datum: string;
  stemming: "top" | "gaatwel" | "zwaar" | null;
  gewicht: number | null;
  taille: number | null;
  heup: number | null;
  borst: number | null;
  notitie: string | null;
};

/** Datum van vandaag in Nederlandse tijd (YYYY-MM-DD). */
export function vandaagNL(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());
}

/** Alle check-ins van een link, oud → nieuw. */
export async function pakCheckins(linkId: string): Promise<CheckinRij[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("resetcode_checkin")
    .select("datum, stemming, gewicht, taille, heup, borst, notitie")
    .eq("link_id", linkId)
    .order("datum", { ascending: true });
  return (data ?? []) as CheckinRij[];
}

/** Is er vandaag al ingecheckt? */
export async function heeftVandaagIngecheckt(linkId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("resetcode_checkin")
    .select("id")
    .eq("link_id", linkId)
    .eq("datum", vandaagNL())
    .maybeSingle();
  return Boolean(data);
}

// File: lib/feature-flags/core-v9.ts
//
// Feature-flag helper voor Core V9. Tijdens de pilot leest 'ie
// profiles.core_v9_actief. Default returnt 'ie founders ook true, zodat
// Raoul + Gaby Core V9 kunnen zien zonder DB-migratie.

import { createClient } from "@/lib/supabase/server";

/** Returnt true als de huidige user Core V9 mag zien. */
export async function isCoreV9Actief(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role, core_v9_actief")
      .eq("id", userId)
      .maybeSingle();
    const profiel = (data ?? null) as {
      role?: string;
      core_v9_actief?: boolean;
    } | null;
    if (profiel?.role === "founder") return true;
    return Boolean(profiel?.core_v9_actief);
  } catch {
    return false;
  }
}

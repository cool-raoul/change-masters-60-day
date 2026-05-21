// File: lib/feature-flags/core-v6.ts
//
// Feature-flag helper voor Core V6. Leest profiles.core_v6_actief per
// user en returnt boolean. Default false als kolom nog niet bestaat
// (gracefull fallback, zodat builds slagen voordat de migration is gedraaid).

import { createClient } from "@/lib/supabase/server";

/** Returnt true als de huidige user Core V6 mag zien. False bij twijfel. */
export async function isCoreV6Actief(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("core_v6_actief")
      .eq("id", userId)
      .maybeSingle();
    return Boolean((data as { core_v6_actief?: boolean } | null)?.core_v6_actief);
  } catch {
    return false;
  }
}

/** Variant voor admin-checks per arbitrary userId. */
export async function isCoreV6ActiefVoorUser(userId: string): Promise<boolean> {
  return isCoreV6Actief(userId);
}

// File: lib/feature-flags/core-v9.ts
//
// Feature-flag helper voor Core V9. Founders zien V9 altijd zonder dat
// er een DB-migratie nodig is. De optionele core_v9_actief-kolom is
// puur voor latere pilot-uitrol naar andere users, en wordt graceful
// opgehaald (als de kolom nog niet bestaat, returnt 'ie false voor
// niet-founders).

import { createClient } from "@/lib/supabase/server";

/** Returnt true als de huidige user Core V9 mag zien. */
export async function isCoreV9Actief(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // STAP 1: role ophalen (kolom bestaat altijd). Founders zien V9 direct.
  let isFounder = false;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    isFounder = (data as { role?: string } | null)?.role === "founder";
  } catch {
    isFounder = false;
  }
  if (isFounder) return true;

  // STAP 2: optionele core_v9_actief-kolom voor niet-founders.
  // Faalt veilig als de kolom nog niet bestaat (geen migratie gedraaid).
  try {
    const { data } = await supabase
      .from("profiles")
      .select("core_v9_actief")
      .eq("id", userId)
      .maybeSingle();
    return Boolean(
      (data as { core_v9_actief?: boolean } | null)?.core_v9_actief,
    );
  } catch {
    return false;
  }
}

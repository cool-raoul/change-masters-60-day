import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Cross-modus onboarding-voltooiingen helper.
// Items als 'why', 'webshop-aangemaakt', 'fff-geleerd' worden
// gedeeld over Sprint/Core/Pro. Eenmaal voltooid = niet dubbel doen.
// ============================================================

export type Modus = "sprint" | "core" | "pro";

export type VoltooiingStatus = {
  voltooid: boolean;
  modus: Modus | null;
  datum: string | null;
};

export async function isReedsVoltooid(
  supabase: SupabaseClient,
  userId: string,
  itemSlug: string,
): Promise<VoltooiingStatus> {
  const { data } = await supabase
    .from("onboarding_voltooiingen")
    .select("modus_waarin, voltooid_op")
    .eq("user_id", userId)
    .eq("item_slug", itemSlug)
    .maybeSingle();

  if (!data) return { voltooid: false, modus: null, datum: null };

  const rij = data as { modus_waarin: Modus; voltooid_op: string };
  return {
    voltooid: true,
    modus: rij.modus_waarin,
    datum: rij.voltooid_op,
  };
}

export async function markeerVoltooid(
  supabase: SupabaseClient,
  userId: string,
  itemSlug: string,
  modusWaarin: Modus,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from("onboarding_voltooiingen").insert({
    user_id: userId,
    item_slug: itemSlug,
    modus_waarin: modusWaarin,
    metadata,
  });

  // Duplicate-key (23505) is no-op: al voltooid in andere modus, prima.
  if (error && error.code !== "23505") {
    console.warn("markeerVoltooid error:", error.message);
  }
}

export async function haalAlleVoltooiingenVoorUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, VoltooiingStatus>> {
  const { data } = await supabase
    .from("onboarding_voltooiingen")
    .select("item_slug, modus_waarin, voltooid_op")
    .eq("user_id", userId);

  const map = new Map<string, VoltooiingStatus>();
  for (const rij of (data as Array<{
    item_slug: string;
    modus_waarin: Modus;
    voltooid_op: string;
  }> | null) ?? []) {
    map.set(rij.item_slug, {
      voltooid: true,
      modus: rij.modus_waarin,
      datum: rij.voltooid_op,
    });
  }
  return map;
}

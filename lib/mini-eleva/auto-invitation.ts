// File: lib/mini-eleva/auto-invitation.ts
//
// Automatisch een mini-ELEVA-uitnodiging (product-spoor) aanmaken voor
// een freebie-lead, zodat de mail-sequence vanaf dag 1 een werkende
// omgeving-knop heeft.
//
// Gedrag:
//   - Bestaat er al een actieve, niet-verlopen uitnodiging voor deze
//     prospect → hergebruik die (geen dubbele tokens).
//   - Anders: nieuwe aanmaken met p-token, 14 dagen geldig, geen
//     sponsor (consistent met het bewuste-keuze-beleid van de
//     handmatige flow in /api/mini-eleva/uitnodiging).
//
// Token-formaat is identiek aan de handmatige route: 'p-' + 38 hex.
// Faalt veilig (null terug) als de tabel ontbreekt of insert faalt;
// de mail-templates laten het omgeving-blok dan stilletjes weg.

import type { SupabaseClient } from "@supabase/supabase-js";

function genereerProductToken(): string {
  const a = crypto.randomUUID().replace(/-/g, "");
  const b = crypto.randomUUID().replace(/-/g, "");
  return "p-" + (a + b).substring(0, 38);
}

export async function zorgVoorMiniElevaInvitation(
  admin: SupabaseClient,
  args: {
    prospectId: string;
    memberUserId: string;
  },
): Promise<{ token: string } | null> {
  try {
    // Bestaande actieve uitnodiging hergebruiken
    const { data: bestaande } = await admin
      .from("prospect_invitations")
      .select("token, status, expires_at")
      .eq("prospect_id", args.prospectId)
      .eq("status", "actief")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bestaande?.token) {
      return { token: bestaande.token as string };
    }

    const token = genereerProductToken();
    const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Eerst met soort-kolom, retry zonder als de migratie nog niet
    // gedraaid is (zelfde patroon als de handmatige route).
    const basis = {
      prospect_id: args.prospectId,
      member_user_id: args.memberUserId,
      sponsor_user_id: null,
      token,
      expires_at: expires.toISOString(),
      status: "actief",
    };

    const eerste = await admin
      .from("prospect_invitations")
      .insert({ ...basis, soort: "product" })
      .select("token")
      .maybeSingle();

    if (!eerste.error && eerste.data) {
      return { token };
    }
    if (
      eerste.error &&
      (eerste.error.code === "PGRST204" ||
        eerste.error.code === "42703" ||
        eerste.error.message?.includes("soort"))
    ) {
      const tweede = await admin
        .from("prospect_invitations")
        .insert(basis)
        .select("token")
        .maybeSingle();
      if (!tweede.error && tweede.data) return { token };
    }

    console.warn(
      "[auto-invitation] aanmaken mislukt:",
      eerste.error?.message ?? "onbekend",
    );
    return null;
  } catch (e) {
    console.warn(
      "[auto-invitation] exception:",
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

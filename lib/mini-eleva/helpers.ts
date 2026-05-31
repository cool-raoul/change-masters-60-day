import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Helpers voor de mini-ELEVA, met name token-validatie.
//
// Mini-ELEVA gebruikt geen Supabase-auth voor de prospect. De
// authenticatie is puur het token in de URL (/m/[token]). Server-side
// valideren we het token via de admin-client zodat we de RLS-policies
// kunnen omzeilen voor reads die we voor de prospect-pagina nodig
// hebben.
// ============================================================

export type MiniElevaContext = {
  invitationId: string;
  prospectId: string;
  prospectNaam: string;
  memberUserId: string;
  memberNaam: string | null;
  sponsorUserId: string | null;
  sponsorNaam: string | null;
  token: string;
  status: "actief" | "verlopen" | "ja_starter" | "nee_dichtgeklapt";
  expiresAt: string;
  isVerlopen: boolean;
  /**
   * Voor welke kant is deze prospect uitgenodigd?
   *   product  → alleen product/programma-inhoud, geen business
   *   business → product + business-uitleg + verdienmodel
   *
   * Bron: kolom prospect_invitations.soort als die bestaat, anders het
   * prefix van het token zelf ('p-' = product, 'b-' = business). Oude
   * tokens zonder prefix vallen terug op 'business' voor backward-
   * compat (dat was de enige flow voor 2026-05-31).
   */
  soort: "product" | "business";
};

function soortUitToken(token: string): "product" | "business" {
  if (token.startsWith("p-")) return "product";
  if (token.startsWith("b-")) return "business";
  return "business";
}

export async function pakMiniElevaContext(
  token: string,
): Promise<MiniElevaContext | null> {
  if (!token || token.length < 20) return null;

  const admin = createAdminClient();

  // Probeer eerst met soort-kolom (nieuw veld per 2026-05-31). Faalt
  // de query, dan herhalen we zonder zodat dit blijft werken in een
  // omgeving waar de migratie nog niet gedraaid is.
  type InvitationRow = {
    id: string;
    prospect_id: string;
    member_user_id: string;
    sponsor_user_id: string | null;
    token: string;
    status: "actief" | "verlopen" | "ja_starter" | "nee_dichtgeklapt";
    expires_at: string;
    soort?: string | null;
  };

  let invitation: InvitationRow | null = null;

  const eersteProbeer = await admin
    .from("prospect_invitations")
    .select(
      "id, prospect_id, member_user_id, sponsor_user_id, token, status, expires_at, soort",
    )
    .eq("token", token)
    .maybeSingle();

  if (!eersteProbeer.error && eersteProbeer.data) {
    invitation = eersteProbeer.data as unknown as InvitationRow;
  } else if (eersteProbeer.error && eersteProbeer.error.code === "42703") {
    // Kolom soort bestaat nog niet → fallback zonder
    const tweedeProbeer = await admin
      .from("prospect_invitations")
      .select(
        "id, prospect_id, member_user_id, sponsor_user_id, token, status, expires_at",
      )
      .eq("token", token)
      .maybeSingle();
    if (tweedeProbeer.data) {
      invitation = tweedeProbeer.data as unknown as InvitationRow;
    }
  }

  if (!invitation) return null;

  // Haal extra context op (prospect-naam, member-naam, sponsor-naam)
  const inv = invitation;

  const [prospectRes, memberRes, sponsorRes] = await Promise.all([
    admin
      .from("prospects")
      .select("volledige_naam")
      .eq("id", inv.prospect_id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("full_name")
      .eq("id", inv.member_user_id)
      .maybeSingle(),
    inv.sponsor_user_id
      ? admin
          .from("profiles")
          .select("full_name")
          .eq("id", inv.sponsor_user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isVerlopen =
    inv.status === "verlopen" ||
    new Date(inv.expires_at).getTime() < Date.now();

  return {
    invitationId: inv.id,
    prospectId: inv.prospect_id,
    prospectNaam:
      (prospectRes.data as { volledige_naam?: string } | null)
        ?.volledige_naam ?? "Welkom",
    memberUserId: inv.member_user_id,
    memberNaam:
      (memberRes.data as { full_name?: string } | null)?.full_name ?? null,
    sponsorUserId: inv.sponsor_user_id,
    sponsorNaam:
      (sponsorRes.data as { full_name?: string } | null)?.full_name ?? null,
    token: inv.token,
    status: inv.status,
    expiresAt: inv.expires_at,
    isVerlopen,
    soort:
      inv.soort === "product"
        ? "product"
        : inv.soort === "business"
          ? "business"
          : soortUitToken(inv.token),
  };
}

/**
 * Log een prospect-activiteit binnen mini-ELEVA. Wordt server-side
 * aangeroepen vanuit pagina's of API-routes. Faalt stilletjes als
 * tabel niet bestaat of token ongeldig.
 */
export async function logActiviteit(
  invitationId: string,
  module: string,
  detail?: string,
) {
  try {
    const admin = createAdminClient();
    await admin.from("mini_eleva_activiteit").insert({
      invitation_id: invitationId,
      module,
      detail: detail ?? null,
    });
    // Bijwerken van laatste_activiteit_op zodat member ziet of er
    // momentum is
    await admin
      .from("prospect_invitations")
      .update({ laatste_activiteit_op: new Date().toISOString() })
      .eq("id", invitationId);
  } catch {
    // negeer
  }
}

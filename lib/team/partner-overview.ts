import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// lib/team/partner-overview.ts
//
// Server-helper die de partner_overview_voor_sponsor-RPC aanroept
// en het resultaat transformeert naar een Client-vriendelijke shape.
// SECURITY DEFINER zit in de RPC zelf, dus deze helper hoeft geen
// extra autorisatie te doen — gewoon de auth-aware client doorgeven.
//
// Berekent ook is_urgent: >72u stil OF <30% taken voltooid afgelopen
// 7 dagen. Dat is een client-veld (visualisatie), niet iets dat we
// per-fetch herhalen op de DB.
// ============================================================

export type PartnerInfo = {
  userId: string;
  fullName: string;
  role: "lid" | "leider" | "founder" | string;
  modus: "sprint" | "core" | "pro" | null | string;
  huidigeDag: number;
  laatstGezienUren: number | null;
  takenVoltooidPct: number;
  isUrgent: boolean;
  isDirectePartner: boolean;
  viaPartnerNaam: string | null;
  fotoUrl: string | null;
};

export type PartnerOverview = {
  directe: PartnerInfo[];
  tweedeLaag: PartnerInfo[];
};

type RpcRij = {
  user_id: string;
  full_name: string;
  role: string;
  modus: string | null;
  huidige_dag: number;
  laatst_gezien_uren: number | null;
  taken_voltooid_pct: number;
  is_directe_partner: boolean;
  via_partner_naam: string | null;
  foto_url: string | null;
};

function isUrgent(rij: RpcRij): boolean {
  const tooStil = rij.laatst_gezien_uren !== null && rij.laatst_gezien_uren > 72;
  const tooWeinigTaken = rij.taken_voltooid_pct < 30;
  return tooStil || tooWeinigTaken;
}

export async function haalPartnerOverview(
  supabase: SupabaseClient,
  sponsorUserId: string,
): Promise<PartnerOverview> {
  const { data, error } = await supabase.rpc("partner_overview_voor_sponsor", {
    p_sponsor_id: sponsorUserId,
  });

  if (error) {
    console.error("haalPartnerOverview RPC error:", error);
    return { directe: [], tweedeLaag: [] };
  }

  const rijen = (data as RpcRij[] | null) ?? [];

  const directe: PartnerInfo[] = [];
  const tweedeLaag: PartnerInfo[] = [];

  for (const rij of rijen) {
    const info: PartnerInfo = {
      userId: rij.user_id,
      fullName: rij.full_name,
      role: rij.role,
      modus: rij.modus,
      huidigeDag: rij.huidige_dag,
      laatstGezienUren: rij.laatst_gezien_uren,
      takenVoltooidPct: rij.taken_voltooid_pct,
      isUrgent: isUrgent(rij),
      isDirectePartner: rij.is_directe_partner,
      viaPartnerNaam: rij.via_partner_naam,
      fotoUrl: rij.foto_url,
    };
    if (rij.is_directe_partner) {
      directe.push(info);
    } else {
      tweedeLaag.push(info);
    }
  }

  return { directe, tweedeLaag };
}

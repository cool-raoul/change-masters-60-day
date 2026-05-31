// File: app/api/sideflow/vink-substep/route.ts
//
// POST endpoint om een substep binnen een sideflow (pre-post of
// 21-dagen-post) af te vinken of weer ongedaan te maken. Slaat op in
// core_v6_substep_voltooiingen met ankerstap_nummer = 0 (sideflow-
// marker, onderscheidt zich van Core-ankerstappen 1-21).
//
// Verhuisd uit /api/core-v9/vink-substep op 2026-05-31, na verwijdering
// van /core-v9 member-routes. Bug-fix in deze verhuizing: de oude API
// rejecteerde ankerstap < 1, waardoor sideflow-vinking effectief faalde.

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SIDEFLOW_ANKERSTAP_MARKER = 0;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Niet ingelogd" },
      { status: 401 },
    );
  }

  let payload: { taakId?: string; voltooid?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ongeldige body" },
      { status: 400 },
    );
  }

  const taakId = String(payload.taakId ?? "");
  const voltooid = Boolean(payload.voltooid);

  if (!taakId) {
    return NextResponse.json(
      { ok: false, error: "taakId vereist" },
      { status: 400 },
    );
  }

  try {
    if (voltooid) {
      const { error } = await supabase
        .from("core_v6_substep_voltooiingen")
        .upsert(
          {
            user_id: user.id,
            ankerstap_nummer: SIDEFLOW_ANKERSTAP_MARKER,
            taak_id: taakId,
            voltooid_op: new Date().toISOString(),
          },
          { onConflict: "user_id,ankerstap_nummer,taak_id" },
        );
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabase
        .from("core_v6_substep_voltooiingen")
        .delete()
        .eq("user_id", user.id)
        .eq("ankerstap_nummer", SIDEFLOW_ANKERSTAP_MARKER)
        .eq("taak_id", taakId);
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 },
        );
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "onbekend" },
      { status: 500 },
    );
  }
}

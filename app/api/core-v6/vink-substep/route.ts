// File: app/api/core-v6/vink-substep/route.ts
//
// POST endpoint om een substep (taak) binnen een Core V6-ankerstap
// af te vinken of weer ongedaan te maken. Slaat op in
// core_v6_substep_voltooiingen.

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Niet ingelogd" }, { status: 401 });
  }

  let payload: { ankerstap?: number; taakId?: string; voltooid?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige body" }, { status: 400 });
  }

  const ankerstap = Number(payload.ankerstap);
  const taakId = String(payload.taakId ?? "");
  const voltooid = Boolean(payload.voltooid);

  if (!Number.isInteger(ankerstap) || ankerstap < 1 || ankerstap > 21 || !taakId) {
    return NextResponse.json({ ok: false, error: "Ongeldige parameters" }, { status: 400 });
  }

  try {
    if (voltooid) {
      const { error } = await supabase
        .from("core_v6_substep_voltooiingen")
        .upsert(
          {
            user_id: user.id,
            ankerstap_nummer: ankerstap,
            taak_id: taakId,
            voltooid_op: new Date().toISOString(),
          },
          { onConflict: "user_id,ankerstap_nummer,taak_id" },
        );
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from("core_v6_substep_voltooiingen")
        .delete()
        .eq("user_id", user.id)
        .eq("ankerstap_nummer", ankerstap)
        .eq("taak_id", taakId);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
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

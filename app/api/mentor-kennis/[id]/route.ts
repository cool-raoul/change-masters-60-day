import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// PATCH /api/mentor-kennis/[id]
// DELETE /api/mentor-kennis/[id]
//
// Founder-only API om kennis-rijen te bewerken/valideren/verwijderen.
// RLS-policy zorgt voor security; we doen extra role-check voor nette
// 403 ipv RLS-fout.
// ============================================================

async function checkFounder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ ok: boolean; userId: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, userId: null };
  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return {
    ok: (profiel as { role?: string } | null)?.role === "founder",
    userId: user.id,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await checkFounder(supabase);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.userId ? "Geen toegang" : "Niet ingelogd" },
        { status: auth.userId ? 403 : 401 },
      );
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    // Toegestane velden om te wijzigen
    if (typeof body.zoekterm === "string") updates.zoekterm = body.zoekterm;
    if (typeof body.basis_advies === "string")
      updates.basis_advies = body.basis_advies;
    if (Array.isArray(body.aanvullende_producten))
      updates.aanvullende_producten = body.aanvullende_producten;
    if (typeof body.leefstijl_tip === "string" || body.leefstijl_tip === null)
      updates.leefstijl_tip = body.leefstijl_tip;
    if (typeof body.notitie === "string" || body.notitie === null)
      updates.notitie = body.notitie;

    // Valideren-actie: zet gevalideerd-flag + door wie + wanneer
    if (body.gevalideerd === true) {
      updates.gevalideerd = true;
      updates.gevalideerd_door = auth.userId;
      updates.gevalideerd_op = new Date().toISOString();
    } else if (body.gevalideerd === false) {
      updates.gevalideerd = false;
      updates.gevalideerd_door = null;
      updates.gevalideerd_op = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Geen geldige velden om te wijzigen" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("mentor_kennis_supplementen")
      .update(updates)
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await checkFounder(supabase);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.userId ? "Geen toegang" : "Niet ingelogd" },
        { status: auth.userId ? 403 : 401 },
      );
    }

    const { error } = await supabase
      .from("mentor_kennis_supplementen")
      .delete()
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

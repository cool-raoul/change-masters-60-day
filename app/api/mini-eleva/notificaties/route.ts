import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// /api/mini-eleva/notificaties
//
// GET, telt ongelezen notificaties van de huidige gebruiker, evt.
// gefilterd op één invitation/prospect.
//
// POST, markeert notificaties als gelezen. Body kan:
//   - { invitationId } voor één uitnodiging
//   - { prospectId }   voor alle uitnodigingen van één prospect
//   - { alles: true }  voor alles van deze gebruiker
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const prospectId = req.nextUrl.searchParams.get("prospectId");
    const invitationId = req.nextUrl.searchParams.get("invitationId");

    let query = supabase
      .from("mini_eleva_notificaties")
      .select("id, invitation_id, type, titel, detail, gelezen, created_at", {
        count: "exact",
      })
      .eq("ontvanger_user_id", user.id)
      .eq("gelezen", false);

    if (invitationId) {
      query = query.eq("invitation_id", invitationId);
    } else if (prospectId) {
      // Sub-query via prospect_invitations
      const { data: invIds } = await supabase
        .from("prospect_invitations")
        .select("id")
        .eq("prospect_id", prospectId);
      const ids = (invIds as { id: string }[] | null)?.map((r) => r.id) ?? [];
      if (ids.length === 0) {
        return NextResponse.json({ ok: true, ongelezen: 0, items: [] });
      }
      query = query.in("invitation_id", ids);
    }

    const { data, count, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      // Tabel bestaat niet (migratie nog niet gerund)? Stilletjes
      // teruggeven als 0 — voorkomt dat het member-dashboard breekt.
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({ ok: true, ongelezen: 0, items: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      ongelezen: count ?? 0,
      items: data ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const invitationId = body.invitationId as string | undefined;
    const prospectId = body.prospectId as string | undefined;
    const alles = body.alles === true;

    let query = supabase
      .from("mini_eleva_notificaties")
      .update({ gelezen: true })
      .eq("ontvanger_user_id", user.id)
      .eq("gelezen", false);

    if (invitationId) {
      query = query.eq("invitation_id", invitationId);
    } else if (prospectId) {
      const { data: invIds } = await supabase
        .from("prospect_invitations")
        .select("id")
        .eq("prospect_id", prospectId);
      const ids = (invIds as { id: string }[] | null)?.map((r) => r.id) ?? [];
      if (ids.length === 0) {
        return NextResponse.json({ ok: true, gemarkeerd: 0 });
      }
      query = query.in("invitation_id", ids);
    } else if (!alles) {
      return NextResponse.json(
        { error: "Geef invitationId, prospectId of alles=true" },
        { status: 400 },
      );
    }

    // Update + select (zonder count param, die wordt door supabase-js
    // niet ondersteund op chained .select() na update). We tellen via
    // de teruggegeven array.
    const { error, data } = await query.select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      gemarkeerd: Array.isArray(data) ? data.length : 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/mini-eleva/lijst-voor-prospect?prospectId=...
//
// Lijst alle mini-ELEVA-uitnodigingen voor één prospect, met de
// info die de MiniElevaChatInklapbaar-component nodig heeft.
//
// Response per item:
//   - id, status, expires_at, isVerlopen
//   - prospectVoornaam (van eigenaar)
//   - sponsorVoornaam (kan null zijn)
//   - ongelezenAantal (mini_eleva_chats van prospect of sponsor sinds
//     laatst-gelezen-stempel van member)
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
    if (!prospectId) {
      return NextResponse.json(
        { error: "prospectId vereist" },
        { status: 400 },
      );
    }

    const { data: invitations, error: invErr } = await supabase
      .from("prospect_invitations")
      .select("id, status, expires_at, sponsor_user_id")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false });

    if (invErr) {
      // Tabel bestaat niet
      return NextResponse.json({ ok: true, items: [] });
    }

    type InvRow = {
      id: string;
      status: string;
      expires_at: string;
      sponsor_user_id: string | null;
    };
    const lijst = (invitations as InvRow[] | null) ?? [];
    if (lijst.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    // Prospect-naam ophalen
    const { data: prospect } = await supabase
      .from("prospects")
      .select("volledige_naam")
      .eq("id", prospectId)
      .maybeSingle();
    const prospectVoornaam =
      ((prospect as { volledige_naam?: string } | null)?.volledige_naam ?? "")
        .split(" ")[0] || "Prospect";

    // Sponsor-namen ophalen
    const sponsorIds = Array.from(
      new Set(lijst.map((i) => i.sponsor_user_id).filter(Boolean)),
    ) as string[];
    const sponsorMap = new Map<string, string>();
    if (sponsorIds.length > 0) {
      const { data: sponsors } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", sponsorIds);
      for (const s of (sponsors as { id: string; full_name: string }[] | null) ??
        []) {
        sponsorMap.set(s.id, (s.full_name ?? "").split(" ")[0] ?? "Sponsor");
      }
    }

    // Lees-stempels ophalen
    const { data: leesData } = await supabase
      .from("mini_eleva_leeskenmerk")
      .select("invitation_id, laatst_gelezen_op")
      .eq("user_id", user.id)
      .in(
        "invitation_id",
        lijst.map((i) => i.id),
      );
    const leesMap = new Map<string, string>();
    for (const l of (leesData as
      | { invitation_id: string; laatst_gelezen_op: string }[]
      | null) ?? []) {
      leesMap.set(l.invitation_id, l.laatst_gelezen_op);
    }

    // Per uitnodiging tellen hoeveel mens-berichten van de andere
    // partijen er sinds het laatst-gelezen-moment zijn (max 99)
    const items = await Promise.all(
      lijst.map(async (inv) => {
        const sinds = leesMap.get(inv.id) ?? "1970-01-01T00:00:00Z";
        const { count } = await supabase
          .from("mini_eleva_chats")
          .select("id", { count: "exact", head: true })
          .eq("invitation_id", inv.id)
          .eq("kanaal", "mens")
          .in("rol", ["prospect", "sponsor"])
          .gt("created_at", sinds);
        const isVerlopen =
          inv.status === "verlopen" ||
          new Date(inv.expires_at).getTime() < Date.now();
        return {
          id: inv.id,
          status: inv.status,
          expires_at: inv.expires_at,
          isVerlopen,
          prospectVoornaam,
          sponsorVoornaam: inv.sponsor_user_id
            ? (sponsorMap.get(inv.sponsor_user_id) ?? null)
            : null,
          ongelezenAantal: Math.min(count ?? 0, 99),
        };
      }),
    );

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

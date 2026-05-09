import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// /api/mini-eleva/chat-thread
//
// Eén doorlopende chat-thread per prospect, ongeacht hoeveel mini-
// ELEVA-uitnodigingen er voor 'm bestaan. Werkt zoals WhatsApp 1-op-1:
// alle berichten in chronologische volgorde, scrollbaar.
//
// GET ?prospectId=...
//   Voor member: alle 'mens'-kanaal berichten van alle uitnodigingen
//   die deze member heeft gemaakt voor deze prospect.
//
// POST { prospectId, tekst|audio_path|... }
//   Stuurt naar de meest recente actieve uitnodiging van deze member
//   voor deze prospect. Als er geen actieve is -> 410 (token verlopen,
//   maak een nieuwe uitnodiging aan of verleng).
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

    // Alle uitnodigingen ophalen van deze member voor deze prospect
    const { data: invitations } = await supabase
      .from("prospect_invitations")
      .select("id, expires_at, status")
      .eq("prospect_id", prospectId)
      .eq("member_user_id", user.id);

    type InvRow = { id: string; expires_at: string; status: string };
    const lijst = (invitations as InvRow[] | null) ?? [];
    if (lijst.length === 0) {
      return NextResponse.json({
        ok: true,
        berichten: [],
        actieveInvitationId: null,
        kanLezenSchrijven: false,
      });
    }

    const ids = lijst.map((i) => i.id);

    // Bepaal welke uitnodiging actief is voor verzenden (meest recente
    // niet-verlopen)
    const nu = Date.now();
    const actieve = lijst
      .filter(
        (i) =>
          i.status !== "verlopen" && new Date(i.expires_at).getTime() >= nu,
      )
      .sort(
        (a, b) =>
          new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime(),
      )[0];

    // Haal alle berichten op voor de hele prospect-chat-thread.
    // Admin-client want we joinen over meerdere invitations.
    const admin = createAdminClient();
    const { data: berichten } = await admin
      .from("mini_eleva_chats")
      .select(
        "id, invitation_id, rol, type, content, transcriptie, audio_path, duur_seconden, created_at",
      )
      .in("invitation_id", ids)
      .eq("kanaal", "mens")
      .in("rol", ["prospect", "member", "sponsor"])
      .not("content", "like", "🤝 [haal-erbij]%")
      .order("created_at", { ascending: true });

    type Bericht = {
      id: string;
      invitation_id: string;
      rol: string;
      type: string;
      content: string;
      transcriptie: string | null;
      audio_path: string | null;
      duur_seconden: number | null;
      created_at: string;
    };
    const lijstBerichten = (berichten as Bericht[] | null) ?? [];

    // Signed URLs voor spraakberichten
    const verrijkt = await Promise.all(
      lijstBerichten.map(async (b) => {
        if (!b.audio_path) return { ...b, audio_url: null };
        const { data: signed } = await admin.storage
          .from("mini-eleva-voice")
          .createSignedUrl(b.audio_path, 60 * 60);
        return { ...b, audio_url: signed?.signedUrl ?? null };
      }),
    );

    return NextResponse.json({
      ok: true,
      berichten: verrijkt,
      actieveInvitationId: actieve?.id ?? null,
      kanLezenSchrijven: !!actieve,
      eigen_rol: "member",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

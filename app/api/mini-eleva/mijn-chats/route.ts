import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// GET /api/mini-eleva/mijn-chats
//
// Geeft alle mini-ELEVA-mens-chats van de huidige member terug,
// gegroepeerd per prospect, gesorteerd op laatste activiteit.
//
// Per chat:
//   - prospectId, prospectNaam
//   - ongelezenAantal (berichten van prospect/sponsor sinds laatst-
//     gelezen-stempel)
//   - laatsteBericht (preview-tekst, max 80 tekens)
//   - laatsteBerichtRol (prospect/member/sponsor)
//   - laatsteBerichtType ('tekst' of 'spraak')
//   - laatsteBerichtTijd
//   - heeftActieveInvitatie (kan member nog reageren?)
//
// WhatsApp-stijl: lijst van gesprekken om het overzicht te houden.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Alle uitnodigingen van deze member
    const { data: invitations } = await supabase
      .from("prospect_invitations")
      .select("id, prospect_id, expires_at, status")
      .eq("member_user_id", user.id);

    type InvRow = {
      id: string;
      prospect_id: string;
      expires_at: string;
      status: string;
    };
    const lijst = (invitations as InvRow[] | null) ?? [];
    if (lijst.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const allInvIds = lijst.map((i) => i.id);
    const prospectIds = Array.from(new Set(lijst.map((i) => i.prospect_id)));

    // Prospect-namen ophalen
    const { data: prospects } = await supabase
      .from("prospects")
      .select("id, volledige_naam")
      .in("id", prospectIds);
    const prospectMap = new Map<string, string>();
    for (const p of (prospects as { id: string; volledige_naam: string }[] | null) ??
      []) {
      prospectMap.set(p.id, p.volledige_naam ?? "");
    }

    // Lees-stempel per uitnodiging
    const { data: leesData } = await supabase
      .from("mini_eleva_leeskenmerk")
      .select("invitation_id, laatst_gelezen_op")
      .eq("user_id", user.id)
      .in("invitation_id", allInvIds);
    const leesMap = new Map<string, string>();
    for (const l of (leesData as
      | { invitation_id: string; laatst_gelezen_op: string }[]
      | null) ?? []) {
      leesMap.set(l.invitation_id, l.laatst_gelezen_op);
    }

    // Alle mens-berichten over deze uitnodigingen, gesorteerd op tijd.
    // Admin-client want we joinen over meerdere invitations + we
    // hebben de RLS-bypass niet strikt nodig (de invitations zijn van
    // deze member, dus toegang is sowieso terecht).
    const admin = createAdminClient();
    const { data: berichten } = await admin
      .from("mini_eleva_chats")
      .select(
        "invitation_id, rol, type, content, transcriptie, created_at",
      )
      .in("invitation_id", allInvIds)
      .eq("kanaal", "mens")
      .in("rol", ["prospect", "member", "sponsor"])
      .not("content", "like", "🤝 [haal-erbij]%")
      .order("created_at", { ascending: false });

    type Bericht = {
      invitation_id: string;
      rol: string;
      type: string;
      content: string;
      transcriptie: string | null;
      created_at: string;
    };
    const alleBerichten = (berichten as Bericht[] | null) ?? [];

    // Groeperen per prospect
    const nu = Date.now();
    const perProspect = new Map<
      string,
      {
        prospectId: string;
        prospectNaam: string;
        prospectVoornaam: string;
        invIds: string[];
        heeftActieveInvitatie: boolean;
        laatsteBericht: string | null;
        laatsteBerichtRol: string | null;
        laatsteBerichtType: string | null;
        laatsteBerichtTijd: string | null;
        ongelezenAantal: number;
      }
    >();

    for (const inv of lijst) {
      const naam = prospectMap.get(inv.prospect_id) ?? "Onbekende prospect";
      const verlopen =
        inv.status === "verlopen" ||
        new Date(inv.expires_at).getTime() < nu;
      const bestaand = perProspect.get(inv.prospect_id);
      if (bestaand) {
        bestaand.invIds.push(inv.id);
        if (!verlopen) bestaand.heeftActieveInvitatie = true;
      } else {
        perProspect.set(inv.prospect_id, {
          prospectId: inv.prospect_id,
          prospectNaam: naam,
          prospectVoornaam: naam.split(" ")[0] || naam,
          invIds: [inv.id],
          heeftActieveInvitatie: !verlopen,
          laatsteBericht: null,
          laatsteBerichtRol: null,
          laatsteBerichtType: null,
          laatsteBerichtTijd: null,
          ongelezenAantal: 0,
        });
      }
    }

    // Per prospect: laatste bericht + ongelezen telling
    for (const groep of Array.from(perProspect.values())) {
      // Laatste bericht binnen deze prospect's invitations
      const eersteHit = alleBerichten.find((b) =>
        groep.invIds.includes(b.invitation_id),
      );
      if (eersteHit) {
        const preview =
          eersteHit.type === "spraak"
            ? eersteHit.transcriptie
              ? `🎤 ${eersteHit.transcriptie.substring(0, 60)}${eersteHit.transcriptie.length > 60 ? "..." : ""}`
              : "🎤 Spraakbericht"
            : eersteHit.content.substring(0, 80) +
              (eersteHit.content.length > 80 ? "..." : "");
        groep.laatsteBericht = preview;
        groep.laatsteBerichtRol = eersteHit.rol;
        groep.laatsteBerichtType = eersteHit.type;
        groep.laatsteBerichtTijd = eersteHit.created_at;
      }

      // Ongelezen: niet-eigen berichten na lees-stempel
      let ongelezen = 0;
      for (const invId of groep.invIds) {
        const sinds = leesMap.get(invId) ?? "1970-01-01T00:00:00Z";
        ongelezen += alleBerichten.filter(
          (b) =>
            b.invitation_id === invId &&
            b.rol !== "member" &&
            b.created_at > sinds,
        ).length;
      }
      groep.ongelezenAantal = Math.min(ongelezen, 99);
    }

    // Filter: alleen prospects met minstens 1 bericht óf actieve invitatie
    const items = Array.from(perProspect.values())
      .filter(
        (g) => g.laatsteBerichtTijd !== null || g.heeftActieveInvitatie,
      )
      .sort((a, b) => {
        // Eerst ongelezen bovenaan, dan op laatste-bericht-tijd
        if (a.ongelezenAantal !== b.ongelezenAantal) {
          return b.ongelezenAantal - a.ongelezenAantal;
        }
        const at = a.laatsteBerichtTijd
          ? new Date(a.laatsteBerichtTijd).getTime()
          : 0;
        const bt = b.laatsteBerichtTijd
          ? new Date(b.laatsteBerichtTijd).getTime()
          : 0;
        return bt - at;
      });

    const totaalOngelezen = items.reduce((s, i) => s + i.ongelezenAantal, 0);

    return NextResponse.json({
      ok: true,
      items,
      totaalOngelezen,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

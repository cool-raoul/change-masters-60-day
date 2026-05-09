import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// GET /api/mini-eleva/mijn-chats
//
// Geeft alle mini-ELEVA-mens-chats terug waar de huidige user bij
// betrokken is, in twee categorieën:
//   - 'eigen'    : member-chats met je eigen prospects
//   - 'sponsor'  : 3-weg-groepschats met members onder jou + hun
//                  prospects (je bent uitgenodigd als sponsor)
//
// Per item:
//   - prospectId, prospectNaam
//   - rol: 'eigen' | 'sponsor'
//   - memberNaam (alleen bij sponsor-chats relevant)
//   - ongelezenAantal
//   - laatsteBericht, laatsteBerichtRol, laatsteBerichtType, tijd
//   - heeftActieveInvitatie
//   - klikUrl (waar de user heen moet bij klik)
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

    // Alle uitnodigingen waar user member OF sponsor is
    const { data: invitations } = await supabase
      .from("prospect_invitations")
      .select(
        "id, prospect_id, member_user_id, sponsor_user_id, expires_at, status",
      )
      .or(`member_user_id.eq.${user.id},sponsor_user_id.eq.${user.id}`);

    type InvRow = {
      id: string;
      prospect_id: string;
      member_user_id: string;
      sponsor_user_id: string | null;
      expires_at: string;
      status: string;
    };
    const lijst = (invitations as InvRow[] | null) ?? [];
    if (lijst.length === 0) {
      return NextResponse.json({ ok: true, items: [], totaalOngelezen: 0 });
    }

    const allInvIds = lijst.map((i) => i.id);
    const prospectIds = Array.from(new Set(lijst.map((i) => i.prospect_id)));
    const memberIds = Array.from(
      new Set(lijst.map((i) => i.member_user_id)),
    );

    // Prospect- + member-namen ophalen
    const [{ data: prospects }, { data: profielen }] = await Promise.all([
      supabase
        .from("prospects")
        .select("id, volledige_naam")
        .in("id", prospectIds),
      memberIds.length
        ? supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", memberIds)
        : Promise.resolve({ data: [] }),
    ]);

    const prospectMap = new Map<string, string>();
    for (const p of (prospects as { id: string; volledige_naam: string }[] | null) ??
      []) {
      prospectMap.set(p.id, p.volledige_naam ?? "");
    }
    const memberMap = new Map<string, string>();
    for (const m of (profielen as { id: string; full_name: string }[] | null) ??
      []) {
      memberMap.set(m.id, m.full_name ?? "");
    }

    // Lees-stempel per uitnodiging voor deze user
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

    // Groeperen per (rol, prospect) — sponsor-chat van prospect X is
    // logisch een ander gesprek dan eigen chat met prospect X (kan
    // zelfs niet bestaan tegelijk, maar voor de zekerheid splitsen).
    type Groep = {
      key: string;
      prospectId: string;
      prospectNaam: string;
      prospectVoornaam: string;
      rol: "eigen" | "sponsor";
      memberNaam: string | null;
      memberVoornaam: string | null;
      invIds: string[];
      heeftActieveInvitatie: boolean;
      laatsteBericht: string | null;
      laatsteBerichtRol: string | null;
      laatsteBerichtType: string | null;
      laatsteBerichtTijd: string | null;
      ongelezenAantal: number;
      klikUrl: string;
    };

    const nu = Date.now();
    const groepen = new Map<string, Groep>();

    for (const inv of lijst) {
      const naam = prospectMap.get(inv.prospect_id) ?? "Onbekende prospect";
      const verlopen =
        inv.status === "verlopen" ||
        new Date(inv.expires_at).getTime() < nu;
      const isEigen = inv.member_user_id === user.id;
      const rol: "eigen" | "sponsor" = isEigen ? "eigen" : "sponsor";
      const key = `${rol}:${inv.prospect_id}`;

      // Bij sponsor-chat: link naar /sponsor/mini-eleva/[invId]
      // Bij eigen: link naar prospect-detail met chat auto-open
      const klikUrl = isEigen
        ? `/namenlijst/${inv.prospect_id}?chat=open#mini-eleva-chat`
        : `/sponsor/mini-eleva/${inv.id}`;

      const memberNaam = !isEigen
        ? (memberMap.get(inv.member_user_id) ?? null)
        : null;
      const memberVoornaam = memberNaam
        ? memberNaam.split(" ")[0] || memberNaam
        : null;

      const bestaand = groepen.get(key);
      if (bestaand) {
        bestaand.invIds.push(inv.id);
        if (!verlopen) bestaand.heeftActieveInvitatie = true;
        // Behoud meest recente klikUrl voor sponsor-chats (anders altijd
        // dezelfde uitnodiging openen)
        if (!isEigen && !verlopen) {
          bestaand.klikUrl = klikUrl;
        }
      } else {
        groepen.set(key, {
          key,
          prospectId: inv.prospect_id,
          prospectNaam: naam,
          prospectVoornaam: naam.split(" ")[0] || naam,
          rol,
          memberNaam,
          memberVoornaam,
          invIds: [inv.id],
          heeftActieveInvitatie: !verlopen,
          laatsteBericht: null,
          laatsteBerichtRol: null,
          laatsteBerichtType: null,
          laatsteBerichtTijd: null,
          ongelezenAantal: 0,
          klikUrl,
        });
      }
    }

    for (const groep of Array.from(groepen.values())) {
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

      let ongelezen = 0;
      for (const invId of groep.invIds) {
        const sinds = leesMap.get(invId) ?? "1970-01-01T00:00:00Z";
        // Voor 'eigen': ongelezen = berichten van NIET-member rol
        // Voor 'sponsor': ongelezen = berichten van NIET-sponsor rol
        const eigenRolNaam = groep.rol === "eigen" ? "member" : "sponsor";
        ongelezen += alleBerichten.filter(
          (b) =>
            b.invitation_id === invId &&
            b.rol !== eigenRolNaam &&
            b.created_at > sinds,
        ).length;
      }
      groep.ongelezenAantal = Math.min(ongelezen, 99);
    }

    const items = Array.from(groepen.values())
      .filter(
        (g) => g.laatsteBerichtTijd !== null || g.heeftActieveInvitatie,
      )
      .sort((a, b) => {
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

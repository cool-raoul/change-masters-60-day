import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { sendPushToUser } from "@/lib/push/sendPush";
import { sendPushToProspect } from "@/lib/mini-eleva/push-prospect";
import { notifeerVoorUitnodiging } from "@/lib/mini-eleva/notificaties";

// ============================================================
// /api/mini-eleva/bericht
//
// Drie-persoonschat-API tussen prospect, member en sponsor.
//
// AVG-Keuze A blijft van kracht voor de mentor-chat. Maar de mens-
// chat is een EXPLICIET tweezijdig gesprek waar de prospect bewust
// op de chat-tegel klikt, dus deze chat-berichten ZIJN zichtbaar
// voor de drie partijen (prospect ↔ member ↔ sponsor).
//
// Endpoints:
//   - POST: nieuw bericht, met optionele voice-velden
//   - GET:  geschiedenis ophalen
//
// Auth-pad: zelfde als voice-upload, ofwel via Supabase user
// (member/sponsor) ofwel via mini-ELEVA-token (prospect).
// ============================================================

export const dynamic = "force-dynamic";

type Rol = "prospect" | "member" | "sponsor";

async function authenticeer(req: NextRequest, body?: {
  token?: string;
  invitationId?: string;
}): Promise<
  | { ok: true; rol: Rol; invitationId: string; userId: string | null; ctx?: Awaited<ReturnType<typeof pakMiniElevaContext>> }
  | { ok: false; status: number; error: string }
> {
  const token =
    body?.token ?? req.nextUrl.searchParams.get("token") ?? null;
  const invitationId =
    body?.invitationId ?? req.nextUrl.searchParams.get("invitationId") ?? null;

  if (token) {
    const ctx = await pakMiniElevaContext(token);
    if (!ctx) return { ok: false, status: 401, error: "Ongeldige link" };
    if (ctx.isVerlopen)
      return { ok: false, status: 410, error: "Link verlopen" };
    return {
      ok: true,
      rol: "prospect",
      invitationId: ctx.invitationId,
      userId: null,
      ctx,
    };
  }

  if (invitationId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, status: 401, error: "Niet ingelogd" };

    const { data: inv } = await supabase
      .from("prospect_invitations")
      .select("id, member_user_id, sponsor_user_id")
      .eq("id", invitationId)
      .maybeSingle();
    if (!inv) return { ok: false, status: 404, error: "Niet gevonden" };
    const invRow = inv as {
      id: string;
      member_user_id: string;
      sponsor_user_id: string | null;
    };
    let rol: Rol;
    if (invRow.member_user_id === user.id) rol = "member";
    else if (invRow.sponsor_user_id === user.id) rol = "sponsor";
    else return { ok: false, status: 403, error: "Geen toegang" };
    return { ok: true, rol, invitationId, userId: user.id };
  }

  return { ok: false, status: 400, error: "token of invitationId vereist" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const auth = await authenticeer(req, body);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const tekst = (body.tekst as string | undefined)?.trim() ?? "";
    const audioPath = (body.audio_path as string | undefined) ?? null;
    const transcriptie = (body.transcriptie as string | undefined) ?? null;
    const duurSeconden = body.duur_seconden as number | undefined;

    // Type vaststellen: spraak als 'r een audio_path is, anders tekst
    const type: "tekst" | "spraak" = audioPath ? "spraak" : "tekst";

    if (type === "tekst" && !tekst) {
      return NextResponse.json(
        { error: "tekst of audio_path vereist" },
        { status: 400 },
      );
    }
    if (type === "tekst" && tekst.length > 4000) {
      return NextResponse.json(
        { error: "Bericht te lang (max 4000 tekens)" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Sla bericht op
    const insertRow: Record<string, unknown> = {
      invitation_id: auth.invitationId,
      rol: auth.rol,
      type,
      content: type === "spraak" ? transcriptie ?? "(spraakbericht)" : tekst,
      duur_seconden: duurSeconden ?? null,
      audio_path: audioPath,
      transcriptie,
    };

    const { data: nieuwBericht, error: insertErr } = await admin
      .from("mini_eleva_chats")
      .insert(insertRow)
      .select("id, created_at")
      .maybeSingle();

    if (insertErr) {
      console.error("[mini-eleva/bericht] insert error:", insertErr.message);
      return NextResponse.json(
        { error: "Opslaan mislukt: " + insertErr.message },
        { status: 500 },
      );
    }

    // Activiteit loggen + last-activiteit-stempel verfrissen
    await logActiviteit(
      auth.invitationId,
      "mens-chat",
      `${auth.rol} stuurde ${type}-bericht`,
    );

    // Push-meldingen
    // - Prospect stuurde iets → push naar member + sponsor (via in-app
    //   notificatie-helper, die ook de banner triggert op /namenlijst)
    // - Member of sponsor stuurde iets → push naar prospect (via prospect-
    //   subscriptions-tabel) + naar de andere mens-partij
    const pushTitel = ((): string => {
      if (auth.rol === "prospect") return "Nieuw bericht in mini-ELEVA";
      if (auth.rol === "member") return "Member heeft je iets gestuurd";
      return "Sponsor heeft je iets gestuurd";
    })();
    const korteTekst =
      type === "spraak"
        ? "🎤 Spraakbericht ontvangen"
        : tekst.length > 80
          ? tekst.substring(0, 80) + "..."
          : tekst;

    if (auth.rol === "prospect") {
      // Naar member + sponsor: prospect heeft expliciet via chat
      // gestuurd, dus content is OK om te previewen (consent)
      await notifeerVoorUitnodiging({
        invitationId: auth.invitationId,
        type: "mentor-bezoek", // hergebruiken bestaand type, semantiek
        // klopt niet 100% maar pragmatisch
        titel: auth.ctx
          ? `${auth.ctx.prospectNaam.split(" ")[0]} heeft je een bericht gestuurd`
          : pushTitel,
        detail: korteTekst,
        url: auth.ctx
          ? `/namenlijst/${auth.ctx.prospectId}#mini-eleva-chat`
          : undefined,
      });
    } else {
      // Member of sponsor stuurde iets → push naar prospect + naar de
      // andere mens-partij in de chat
      const { data: invRow } = await admin
        .from("prospect_invitations")
        .select("member_user_id, sponsor_user_id, prospect_id, token")
        .eq("id", auth.invitationId)
        .maybeSingle();
      const inv = invRow as {
        member_user_id: string;
        sponsor_user_id: string | null;
        prospect_id: string;
        token: string;
      } | null;

      if (inv) {
        // Push naar prospect via prospect-subscriptions
        await sendPushToProspect(auth.invitationId, {
          title: pushTitel,
          body: korteTekst,
          url: `/m/${inv.token}/chat`,
          tag: `mini-eleva-chat-${auth.invitationId}`,
        }).catch((e) => {
          console.warn("[mini-eleva/bericht] prospect-push faalde:", e);
        });

        // Push naar de andere mens (member ↔ sponsor)
        const andereUserId =
          auth.rol === "member" ? inv.sponsor_user_id : inv.member_user_id;
        if (andereUserId && andereUserId !== auth.userId) {
          await sendPushToUser(andereUserId, {
            title: pushTitel,
            body: korteTekst,
            url: `/sponsor/mini-eleva/${auth.invitationId}`,
            tag: `mini-eleva-mens-${auth.invitationId}`,
          }).catch((e) => {
            console.warn(
              "[mini-eleva/bericht] mens-push faalde:",
              e?.message ?? e,
            );
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      bericht: nieuwBericht,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("[mini-eleva/bericht] exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ============================================================
// PATCH /api/mini-eleva/bericht
//
// Transcriptie van een eigen spraakbericht corrigeren. De afzender
// (zichtbaar via auth-rol) mag z'n EIGEN spraakbericht-transcriptie
// bijwerken. Andere partijen niet, ook niet de inhoud van tekst-
// berichten (die zijn final).
//
// Body: { berichtId: string, transcriptie: string, token?, invitationId? }
// ============================================================

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const auth = await authenticeer(req, body);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const berichtId = body.berichtId as string | undefined;
    const transcriptie = (body.transcriptie as string | undefined)?.trim();

    if (!berichtId || transcriptie === undefined) {
      return NextResponse.json(
        { error: "berichtId en transcriptie vereist" },
        { status: 400 },
      );
    }
    if (transcriptie.length > 4000) {
      return NextResponse.json(
        { error: "Tekst te lang (max 4000 tekens)" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Haal bericht op + check dat 't bij dezelfde uitnodiging hoort,
    // EN dat de auth-rol matcht met de bericht-rol (alleen je eigen
    // spraak bewerken).
    const { data: huidig } = await admin
      .from("mini_eleva_chats")
      .select("id, invitation_id, rol, type, audio_path")
      .eq("id", berichtId)
      .maybeSingle();

    if (!huidig) {
      return NextResponse.json(
        { error: "Bericht niet gevonden" },
        { status: 404 },
      );
    }
    type ChatRow = {
      id: string;
      invitation_id: string;
      rol: string;
      type: string;
      audio_path: string | null;
    };
    const b = huidig as ChatRow;

    if (b.invitation_id !== auth.invitationId) {
      return NextResponse.json(
        { error: "Geen toegang tot dit bericht" },
        { status: 403 },
      );
    }
    if (b.rol !== auth.rol) {
      return NextResponse.json(
        { error: "Je kunt alleen je eigen berichten aanpassen" },
        { status: 403 },
      );
    }
    if (b.type !== "spraak") {
      return NextResponse.json(
        { error: "Alleen transcriptie van spraakberichten is aanpasbaar" },
        { status: 400 },
      );
    }

    // Update transcriptie + content (content is gelijk aan transcriptie
    // voor spraakberichten zodat het notificatie-detail klopt)
    const { error } = await admin
      .from("mini_eleva_chats")
      .update({
        transcriptie,
        content: transcriptie || "(spraakbericht)",
      })
      .eq("id", berichtId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, transcriptie });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticeer(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const admin = createAdminClient();
    const { data: berichten } = await admin
      .from("mini_eleva_chats")
      .select(
        "id, rol, type, content, transcriptie, audio_path, duur_seconden, created_at",
      )
      .eq("invitation_id", auth.invitationId)
      .in("rol", ["prospect", "member", "sponsor"])
      .order("created_at", { ascending: true });

    // Voor elk spraakbericht: signed URL voor audio-afspelen genereren
    type Bericht = {
      id: string;
      rol: string;
      type: string;
      content: string;
      transcriptie: string | null;
      audio_path: string | null;
      duur_seconden: number | null;
      created_at: string;
    };
    const lijst = (berichten as Bericht[] | null) ?? [];

    const verrijkt = await Promise.all(
      lijst.map(async (b) => {
        if (!b.audio_path) return { ...b, audio_url: null };
        const { data: signed } = await admin.storage
          .from("mini-eleva-voice")
          .createSignedUrl(b.audio_path, 60 * 60); // 1 uur geldig
        return {
          ...b,
          audio_url: signed?.signedUrl ?? null,
        };
      }),
    );

    return NextResponse.json({
      ok: true,
      berichten: verrijkt,
      eigen_rol: auth.rol,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakMiniElevaContext } from "@/lib/mini-eleva/helpers";

// ============================================================
// POST /api/mini-eleva/voice-upload
//
// Multipart form upload voor spraakberichten in mini-ELEVA.
//
// Body (multipart/form-data):
//   - audio: Blob (webm/ogg/mp4)
//   - invitationId: string  (member/sponsor-pad)
//   - token: string          (prospect-pad, vervangt auth)
//   - duurSeconden: string
//
// Server:
//   1. Auth check, ofwel via Supabase user (member/sponsor) ofwel
//      via mini-ELEVA-token (prospect)
//   2. Audio uploaden naar Supabase Storage bucket "mini-eleva-voice"
//   3. Whisper transcriptie via OpenAI
//   4. Response geeft audio_path + transcriptie + duur terug, zodat de
//      client deze kan inschieten in de berichten-API
//
// Triggert GEEN bericht-insert zelf, dat doet de berichten-API. Reden:
// scheidt opslag van bericht-flow zodat een mislukte transcriptie niet
// een half-bericht in de chat zet.
// ============================================================

export const maxDuration = 60;
const MAX_DUUR_SECONDEN = 180; // 3 minuten max
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ontbreekt" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio");
    const invitationId = formData.get("invitationId") as string | null;
    const token = formData.get("token") as string | null;
    const duurStr = formData.get("duurSeconden") as string | null;

    if (!(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "audio-veld vereist" },
        { status: 400 },
      );
    }
    if (audio.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Audio te groot (max 5MB)" },
        { status: 413 },
      );
    }
    const duur = duurStr ? parseInt(duurStr, 10) : 0;
    if (duur > MAX_DUUR_SECONDEN) {
      return NextResponse.json(
        { error: `Spraakbericht max ${MAX_DUUR_SECONDEN}s` },
        { status: 413 },
      );
    }

    // Auth-pad: token = prospect, geen token = member/sponsor via auth
    let resolvedInvitationId: string | null = null;
    let rol: "prospect" | "member" | "sponsor" | null = null;
    let userId: string | null = null;

    if (token) {
      const ctx = await pakMiniElevaContext(token);
      if (!ctx || ctx.isVerlopen) {
        return NextResponse.json(
          { error: "Ongeldige of verlopen link" },
          { status: 401 },
        );
      }
      resolvedInvitationId = ctx.invitationId;
      rol = "prospect";
    } else if (invitationId) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
      }
      // Verifieer dat user member of sponsor is van deze uitnodiging
      const { data: inv } = await supabase
        .from("prospect_invitations")
        .select("id, member_user_id, sponsor_user_id")
        .eq("id", invitationId)
        .maybeSingle();
      if (!inv) {
        return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
      }
      const invRow = inv as {
        id: string;
        member_user_id: string;
        sponsor_user_id: string | null;
      };
      if (invRow.member_user_id === user.id) {
        rol = "member";
      } else if (invRow.sponsor_user_id === user.id) {
        rol = "sponsor";
      } else {
        return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
      }
      resolvedInvitationId = invitationId;
      userId = user.id;
    } else {
      return NextResponse.json(
        { error: "token of invitationId vereist" },
        { status: 400 },
      );
    }

    // Upload naar Supabase Storage
    const admin = createAdminClient();
    const ext = audio.type.includes("wav")
      ? "wav"
      : audio.type.includes("webm")
        ? "webm"
        : audio.type.includes("ogg")
          ? "ogg"
          : audio.type.includes("mp4")
            ? "m4a"
            : "audio";
    const path = `${resolvedInvitationId}/${rol}/${Date.now()}.${ext}`;

    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    const { error: uploadErr } = await admin.storage
      .from("mini-eleva-voice")
      .upload(path, audioBuffer, {
        contentType: audio.type || "audio/wav",
        upsert: false,
      });
    if (uploadErr) {
      console.error("[voice-upload] storage error:", uploadErr.message);
      return NextResponse.json(
        { error: "Upload mislukt: " + uploadErr.message },
        { status: 500 },
      );
    }

    // Whisper transcriptie. Als 't faalt, blijft het bericht zonder
    // transcriptie staan, gebruiker kan altijd de audio afspelen.
    let transcriptie = "";
    try {
      const openai = new OpenAI({ apiKey });
      const file = new File([audioBuffer], `voice.${ext}`, {
        type: audio.type || "audio/wav",
      });
      const result = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
        language: "nl",
      });
      transcriptie = result.text || "";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "onbekend";
      console.warn("[voice-upload] transcriptie faalde:", msg);
    }

    return NextResponse.json({
      ok: true,
      audio_path: path,
      transcriptie,
      duur_seconden: duur,
      rol,
      invitation_id: resolvedInvitationId,
      // userId voor logging-doel meegeven (niet voor security gebruik
      // anders dan in client-state)
      user_id: userId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("[voice-upload] exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

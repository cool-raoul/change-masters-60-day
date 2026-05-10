import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakMiniElevaContext } from "@/lib/mini-eleva/helpers";

// ============================================================
// GET /api/mini-eleva/voice?berichtId=<uuid>[&token=<token>]
//
// Streamt een mini-ELEVA spraakbericht van Supabase Storage met
// correcte HTTP-headers voor <audio>-playback. Vervangt het direct
// geven van Supabase signed-URLs aan de browser.
//
// Waarom: signed-URLs kapten playback af op ~5 sec (zowel iOS Safari
// als Chrome desktop). De WAV-files zelf zijn 100% intact (geverifieerd
// met scripts/check-wav.mjs — RMS-energie aanwezig in elke seconde tot
// het einde). Het probleem zat in browser <-> Supabase Storage range-
// request communicatie. Door 't via onze eigen origin te streamen
// hebben we volledige controle over Content-Type, Content-Length,
// Accept-Ranges en Range-response, en gedraagt 't zich consistent.
//
// Auth: zelfde als voice-upload — sessie-user (member/sponsor) of
// prospect-token. Geeft 403 als niet bevoegd.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const berichtId = url.searchParams.get("berichtId");
  const token = url.searchParams.get("token");

  if (!berichtId) {
    return NextResponse.json({ error: "berichtId vereist" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Haal het bericht + uitnodiging op zodat we audio_path + access kunnen
  // bepalen
  const { data: bericht } = await admin
    .from("mini_eleva_chats")
    .select("audio_path, invitation_id")
    .eq("id", berichtId)
    .maybeSingle();

  if (!bericht) {
    return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 });
  }
  const berichtRow = bericht as { audio_path: string | null; invitation_id: string };
  if (!berichtRow.audio_path) {
    return NextResponse.json({ error: "Geen audio bij bericht" }, { status: 404 });
  }

  // Auth: token-pad voor prospect, sessie-pad voor member/sponsor
  let bevoegd = false;
  if (token) {
    const ctx = await pakMiniElevaContext(token);
    if (ctx && !ctx.isVerlopen && ctx.invitationId === berichtRow.invitation_id) {
      bevoegd = true;
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: inv } = await admin
        .from("prospect_invitations")
        .select("member_user_id, sponsor_user_id")
        .eq("id", berichtRow.invitation_id)
        .maybeSingle();
      const invRow = inv as {
        member_user_id: string;
        sponsor_user_id: string | null;
      } | null;
      if (
        invRow &&
        (invRow.member_user_id === user.id ||
          invRow.sponsor_user_id === user.id)
      ) {
        bevoegd = true;
      }
    }
  }

  if (!bevoegd) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  // Download het bestand uit Storage
  const { data: blob, error: dlErr } = await admin.storage
    .from("mini-eleva-voice")
    .download(berichtRow.audio_path);

  if (dlErr || !blob) {
    return NextResponse.json(
      { error: "Audio niet te laden: " + (dlErr?.message ?? "onbekend") },
      { status: 500 },
    );
  }

  // Bepaal content-type uit extensie
  const ext = berichtRow.audio_path.split(".").pop()?.toLowerCase() ?? "wav";
  const contentType =
    ext === "wav"
      ? "audio/wav"
      : ext === "webm"
        ? "audio/webm"
        : ext === "ogg"
          ? "audio/ogg"
          : ext === "m4a"
            ? "audio/mp4"
            : "application/octet-stream";

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const totalLength = bytes.byteLength;

  // Range-request afhandeling — iOS Safari + sommige browsers verwachten
  // dit bij <audio>-playback van grote bestanden. Zonder correcte 206-
  // response op Range-headers stoppen ze met afspelen na de eerste chunk.
  const range = req.headers.get("range");
  if (range) {
    const match = /^bytes=(\d+)-(\d+)?$/.exec(range);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : totalLength - 1;
      if (start >= 0 && end < totalLength && start <= end) {
        const slice = bytes.slice(start, end + 1);
        return new Response(slice, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(slice.byteLength),
            "Content-Range": `bytes ${start}-${end}/${totalLength}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "private, max-age=3600",
          },
        });
      }
    }
  }

  // Volledige response
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(totalLength),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

// Talking-video pipeline gesplitst in 3 stappen om binnen de 10s Vercel
// Hobby function-timeout te blijven:
//
//   1. POST /api/talking-video/audio
//      Genereert audio (OpenAI TTS) en upload naar Supabase Storage.
//      Return { audioUrl }. Duurt ~3-5s.
//
//   2. POST /api/talking-video  (deze file)
//      Submit aan D-ID Talks API met audioUrl + avatar.
//      Return { talkId }. Duurt ~1-2s.
//
//   3. GET /api/talking-video?id=<talkId>
//      Poll D-ID status één keer. Return { status, videoUrl?, fout? }.
//      Client polled deze elke 2s tot status === 'done' of error.

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// D-ID eist URLs die eindigen op .jpg/.jpeg/.png. Unsplash-URLs hebben
// query-strings dus we hosten de avatars in onze eigen Supabase Storage.
const AVATAR_URLS: Record<string, string> = {
  vrouw:
    "https://qwwhsoewajefainleajo.supabase.co/storage/v1/object/public/talking-temp/avatars/vrouw.jpg",
  man: "https://qwwhsoewajefainleajo.supabase.co/storage/v1/object/public/talking-temp/avatars/man.jpg",
};

function didAuthHeader(key: string): string {
  return `Basic ${Buffer.from(key + ":").toString("base64")}`;
}

async function checkFounder() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, fout: "Niet ingelogd", status: 401 };
  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profiel as { role?: string } | null)?.role !== "founder") {
    return { ok: false as const, fout: "Alleen founders", status: 403 };
  }
  return { ok: true as const, userId: user.id };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkFounder();
    if (!auth.ok) {
      return NextResponse.json({ fout: auth.fout }, { status: auth.status });
    }

    const didKey = process.env.DID_API_KEY;
    if (!didKey) {
      return NextResponse.json(
        {
          fout:
            "DID_API_KEY ontbreekt in Vercel env. Voeg 'm toe en redeploy.",
        },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const audioUrl = String(body.audioUrl ?? "").trim();
    const avatarKeuze = String(body.avatar ?? "vrouw");
    const sourceUrl = AVATAR_URLS[avatarKeuze] || AVATAR_URLS.vrouw;

    if (!audioUrl) {
      return NextResponse.json(
        { fout: "audioUrl ontbreekt (eerst /api/talking-video/audio aanroepen)" },
        { status: 400 },
      );
    }

    // Submit aan D-ID
    let submitData: any = {};
    try {
      const submitRes = await fetch("https://api.d-id.com/talks", {
        method: "POST",
        headers: {
          Authorization: didAuthHeader(didKey),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          script: {
            type: "audio",
            audio_url: audioUrl,
          },
          config: {
            stitch: true,
            result_format: "mp4",
          },
        }),
      });
      const ruwe = await submitRes.text();
      try {
        submitData = JSON.parse(ruwe);
      } catch {
        return NextResponse.json(
          {
            fout: `D-ID gaf onparseerbare response (HTTP ${submitRes.status}): ${ruwe.slice(0, 200)}`,
          },
          { status: 502 },
        );
      }
      if (!submitRes.ok || !submitData.id) {
        return NextResponse.json(
          {
            fout: `D-ID weigerde de opdracht: ${submitData.description || submitData.message || submitData.kind || JSON.stringify(submitData)}`,
          },
          { status: 502 },
        );
      }
    } catch (e: any) {
      return NextResponse.json(
        { fout: `D-ID submit faalde: ${e?.message || "onbekend"}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ talkId: submitData.id, audioUrl });
  } catch (err: any) {
    return NextResponse.json(
      { fout: err?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await checkFounder();
    if (!auth.ok) {
      return NextResponse.json({ fout: auth.fout }, { status: auth.status });
    }
    const didKey = process.env.DID_API_KEY;
    if (!didKey) {
      return NextResponse.json(
        { fout: "DID_API_KEY ontbreekt" },
        { status: 503 },
      );
    }
    const talkId = req.nextUrl.searchParams.get("id");
    if (!talkId) {
      return NextResponse.json({ fout: "id ontbreekt" }, { status: 400 });
    }
    const pollRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { Authorization: didAuthHeader(didKey) },
    });
    const ruwe = await pollRes.text();
    let data: any = {};
    try {
      data = JSON.parse(ruwe);
    } catch {
      return NextResponse.json(
        { fout: `D-ID gaf onparseerbare response: ${ruwe.slice(0, 200)}` },
        { status: 502 },
      );
    }
    if (data.status === "done" && data.result_url) {
      return NextResponse.json({ status: "done", videoUrl: data.result_url });
    }
    if (data.status === "error" || data.status === "rejected") {
      return NextResponse.json({
        status: data.status,
        fout: data.error?.description || data.error?.kind || "onbekend",
      });
    }
    return NextResponse.json({ status: data.status || "pending" });
  } catch (err: any) {
    return NextResponse.json(
      { fout: err?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}

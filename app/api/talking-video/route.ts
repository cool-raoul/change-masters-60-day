// Talking-video endpoint: 2 calls voor async polling vanuit de client,
// zodat we niet boven de Vercel function-timeout uitkomen.
//
// POST /api/talking-video
//   - Genereer audio (OpenAI TTS), upload naar Supabase Storage
//   - Submit aan D-ID Talks API
//   - Return { talkId } direct (~2-4 sec)
//
// GET /api/talking-video?id=<talkId>
//   - Poll D-ID status één keer
//   - Return { status, videoUrl?, fout? }
//
// Client polled GET elke 2 sec tot status === 'done' of error.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createDirectSupabase } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TOEGESTANE_STEMMEN = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;

const AVATAR_URLS: Record<string, string> = {
  vrouw:
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=800&fit=crop&crop=faces&q=85",
  man: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&h=800&fit=crop&crop=faces&q=85",
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
    const tekst = String(body.tekst ?? "").trim();
    const stem = String(body.stem ?? "nova");
    const snelheid = Number(body.snelheid ?? 1);
    const avatarKeuze = String(body.avatar ?? "vrouw");
    const sourceUrl = AVATAR_URLS[avatarKeuze] || AVATAR_URLS.vrouw;

    if (!tekst) return NextResponse.json({ fout: "Geen tekst" }, { status: 400 });
    if (tekst.length > 4000)
      return NextResponse.json(
        { fout: "Tekst te lang, max 4000 tekens" },
        { status: 400 },
      );

    const gekozenStem = (TOEGESTANE_STEMMEN as readonly string[]).includes(stem)
      ? stem
      : "nova";

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { fout: "OPENAI_API_KEY ontbreekt" },
        { status: 500 },
      );
    }

    // 1. Audio renderen
    const openai = new OpenAI({ apiKey: openaiKey });
    let audioBuf: Buffer;
    try {
      const ttsResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: gekozenStem as any,
        input: tekst,
        speed: Math.max(0.25, Math.min(4, snelheid)),
        response_format: "mp3",
      });
      audioBuf = Buffer.from(await ttsResponse.arrayBuffer());
    } catch (e: any) {
      return NextResponse.json(
        { fout: `OpenAI TTS faalde: ${e?.message || "onbekend"}` },
        { status: 502 },
      );
    }

    // 2. Upload publieke audio
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supaUrl) {
      return NextResponse.json(
        { fout: "Supabase service-key ontbreekt" },
        { status: 500 },
      );
    }
    const sbAdmin = createDirectSupabase(supaUrl, serviceKey);
    const pad = `${auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
    const { error: upErr } = await sbAdmin.storage
      .from("talking-temp")
      .upload(pad, audioBuf, {
        contentType: "audio/mpeg",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json(
        { fout: `Audio-upload faalde: ${upErr.message}` },
        { status: 500 },
      );
    }
    const { data: pubUrlData } = sbAdmin.storage
      .from("talking-temp")
      .getPublicUrl(pad);
    const audioUrl = pubUrlData.publicUrl;

    // 3. Submit aan D-ID
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

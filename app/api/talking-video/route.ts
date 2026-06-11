// Talking-video endpoint: genereert een pratende avatar-video via D-ID.
// Flow:
//   1. Server genereert audio via OpenAI TTS (zelfde stem als in /api/tts).
//   2. Upload mp3 naar Supabase Storage bucket 'talking-temp' (publiek).
//   3. POST aan D-ID Talks API met source_url (avatar-foto) + audio_url.
//   4. Poll D-ID elke 2s tot status === 'done', max ~50s (binnen Vercel
//      function-timeout 60s).
//   5. Return result_url (MP4).
//
// Founder-only, want D-ID is duur en buiten scope voor members.
//
// Vereiste env:
//   - OPENAI_API_KEY (al aanwezig voor TTS)
//   - DID_API_KEY (toevoegen in Vercel, anders nette 503-melding)

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createDirectSupabase } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 });
    }
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ fout: "Alleen founders" }, { status: 403 });
    }

    const didKey = process.env.DID_API_KEY;
    if (!didKey) {
      return NextResponse.json(
        {
          fout:
            "DID_API_KEY ontbreekt. Maak een D-ID account op d-id.com, kopieer je API-key en zet die in Vercel als env-variabele DID_API_KEY.",
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

    // 1. Audio genereren
    const openai = new OpenAI({ apiKey: openaiKey });
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: gekozenStem as any,
      input: tekst,
      speed: Math.max(0.25, Math.min(4, snelheid)),
      response_format: "mp3",
    });
    const audioBuf = Buffer.from(await ttsResponse.arrayBuffer());

    // 2. Upload naar talking-temp (publieke bucket). Pad-prefix met user-id
    // zodat we makkelijk per-user kunnen schoonmaken later.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supaUrl) {
      return NextResponse.json(
        { fout: "Supabase service-key ontbreekt" },
        { status: 500 },
      );
    }
    const sbAdmin = createDirectSupabase(supaUrl, serviceKey);
    const pad = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
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
    const authHeader = `Basic ${Buffer.from(didKey + ":").toString("base64")}`;
    const submitRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        Authorization: authHeader,
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
    const submitData = await submitRes.json();
    if (!submitRes.ok || !submitData.id) {
      return NextResponse.json(
        {
          fout: `D-ID weigerde de opdracht: ${submitData.description || submitData.message || JSON.stringify(submitData)}`,
        },
        { status: 502 },
      );
    }
    const talkId = submitData.id;

    // 4. Poll tot done. Max ~25 pogingen × 2s = 50s.
    let resultUrl: string | null = null;
    let laatsteStatus = "";
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: { Authorization: authHeader },
      });
      const pollData = await pollRes.json();
      laatsteStatus = pollData.status || "";
      if (pollData.status === "done" && pollData.result_url) {
        resultUrl = pollData.result_url;
        break;
      }
      if (pollData.status === "error" || pollData.status === "rejected") {
        return NextResponse.json(
          {
            fout: `D-ID rendering mislukt: ${pollData.error?.description || pollData.error?.kind || "onbekend"}`,
          },
          { status: 502 },
        );
      }
    }

    if (!resultUrl) {
      return NextResponse.json(
        {
          fout: `Video-rendering duurde te lang (status: ${laatsteStatus}). Probeer opnieuw of een kortere tekst.`,
        },
        { status: 504 },
      );
    }

    return NextResponse.json({ videoUrl: resultUrl, talkId });
  } catch (err: any) {
    return NextResponse.json(
      { fout: err?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}

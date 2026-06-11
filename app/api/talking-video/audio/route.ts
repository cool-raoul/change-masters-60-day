// Stap 1 van de talking-video pipeline: TTS + upload naar Supabase.
// Apart endpoint zodat we onder de 10s Vercel Hobby function-timeout
// blijven. Daarna roept de client /api/talking-video aan met de audioUrl.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createDirectSupabase } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOEGESTANE_STEMMEN = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 });
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ fout: "Alleen founders" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const tekst = String(body.tekst ?? "").trim();
    const stem = String(body.stem ?? "nova");
    const snelheid = Number(body.snelheid ?? 1);

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
      return NextResponse.json({ fout: "OPENAI_API_KEY ontbreekt" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: gekozenStem as any,
      input: tekst,
      speed: Math.max(0.25, Math.min(4, snelheid)),
      response_format: "mp3",
    });
    const audioBuf = Buffer.from(await ttsResponse.arrayBuffer());

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supaUrl) {
      return NextResponse.json({ fout: "Supabase-config ontbreekt" }, { status: 500 });
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

    return NextResponse.json({ audioUrl: pubUrlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json(
      { fout: err?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}

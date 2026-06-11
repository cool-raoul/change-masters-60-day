// TTS endpoint: tekst in, audio (mp3) terug via OpenAI TTS.
// Founder-only voor nu, want het is een proeftuin-feature.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

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
type Stem = (typeof TOEGESTANE_STEMMEN)[number];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 });
    }
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json(
        { fout: "Alleen founders kunnen TTS gebruiken" },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const tekst = String(body.tekst ?? "").trim();
    const gewensteStem = String(body.stem ?? "nova");
    const snelheid = Number(body.snelheid ?? 1);

    if (tekst.length < 1) {
      return NextResponse.json({ fout: "Geen tekst meegegeven" }, { status: 400 });
    }
    if (tekst.length > 4000) {
      return NextResponse.json(
        { fout: "Tekst te lang, max 4000 tekens" },
        { status: 400 },
      );
    }
    const stem: Stem = (TOEGESTANE_STEMMEN as readonly string[]).includes(
      gewensteStem,
    )
      ? (gewensteStem as Stem)
      : "nova";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { fout: "OPENAI_API_KEY niet ingesteld" },
        { status: 500 },
      );
    }
    const openai = new OpenAI({ apiKey });

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: stem,
      input: tekst,
      speed: Math.max(0.25, Math.min(4, snelheid)),
      response_format: "mp3",
    });

    const buf = Buffer.from(await response.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buf.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { fout: err?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}

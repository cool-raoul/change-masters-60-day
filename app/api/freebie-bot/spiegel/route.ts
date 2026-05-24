// File: app/api/freebie-bot/spiegel/route.ts
//
// POST /api/freebie-bot/spiegel
// Body: { token: string, antwoorden: TweedeLenteAntwoorden }
// Response: SpiegelOutput
//
// PUBLIEKE route. Token-validatie eerst. Daarna OpenAI gpt-4o-mini
// met strakke system-prompt. Output gaat door de bewaker en dan terug.
// Geen DB-schrijven hier, dat gebeurt in opt-in-route bij e-mail-submit.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bouwTweedeLenteSysteemPrompt,
  bouwTweedeLenteUserBericht,
} from "@/lib/freebie-bots/tweede-lente-system-prompt";
import { bewaakSpiegelOutput } from "@/lib/freebie-bots/templatezinnen-bewaker";
import type { TweedeLenteAntwoorden } from "@/lib/freebie-bots/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY niet ingesteld" },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const antwoorden = body.antwoorden as TweedeLenteAntwoorden | undefined;

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!antwoorden || !antwoorden.fase) {
      return NextResponse.json(
        { error: "Antwoorden onvolledig" },
        { status: 400 },
      );
    }

    // Token valideren
    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();
    if (!row) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    // Compacte antwoord-string voor de prompt
    const antwoordRegel = [
      `Fase: ${antwoorden.fase}`,
      `Valt op: ${antwoorden.watValtOp.join(", ")}`,
      `Eet-ritme: ${antwoorden.eetRitme}`,
      `Beweging: ${antwoorden.beweging}`,
      `Rust: ${antwoorden.rust}`,
      `Deelt met: ${antwoorden.deel}`,
      `Zoekt: ${antwoorden.zoek}`,
    ].join("\n");

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: bouwTweedeLenteSysteemPrompt() },
        { role: "user", content: bouwTweedeLenteUserBericht(antwoordRegel) },
      ],
      temperature: 0.5,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const spiegel = bewaakSpiegelOutput(raw);

    return NextResponse.json(spiegel);
  } catch (e) {
    console.error("freebie-bot/spiegel exception:", e);
    return NextResponse.json(
      { error: "Spiegel-generatie mislukt" },
      { status: 500 },
    );
  }
}

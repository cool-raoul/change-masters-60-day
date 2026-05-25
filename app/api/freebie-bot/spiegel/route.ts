// File: app/api/freebie-bot/spiegel/route.ts
//
// POST /api/freebie-bot/spiegel
// Body: { token: string, antwoorden: object }
// Response: SpiegelOutput
//
// PUBLIEKE route. Generic over alle freebie-bots: kiest config uit
// registry op basis van de bot_slug die bij de token hoort. Werkt
// voor Tweede Lente, Tweede Wind, en latere bots zonder code-wijziging.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBotConfig } from "@/lib/freebie-bots/registry";

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
    const antwoorden = body.antwoorden as Record<string, unknown> | undefined;

    if (!token || token.length !== 16) {
      return NextResponse.json({ error: "Ongeldige token" }, { status: 400 });
    }
    if (!antwoorden || typeof antwoorden !== "object") {
      return NextResponse.json(
        { error: "Antwoorden onvolledig" },
        { status: 400 },
      );
    }

    // Token valideren + bot-slug ophalen
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

    const config = getBotConfig(row.bot_slug as string);
    if (!config) {
      return NextResponse.json(
        { error: `Onbekende bot-slug: ${row.bot_slug}` },
        { status: 400 },
      );
    }

    // Compacte antwoord-string voor de prompt: alle velden plat dumpen
    // werkt voor zowel Tweede Lente als Tweede Wind. AI ziet de kernen.
    const antwoordRegel = Object.entries(antwoorden)
      .map(([sleutel, waarde]) => {
        const waardeStr = Array.isArray(waarde)
          ? waarde.join(", ")
          : String(waarde);
        return `${sleutel}: ${waardeStr}`;
      })
      .join("\n");

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: config.bouwSysteemPrompt() },
        { role: "user", content: config.bouwUserBericht(antwoordRegel) },
      ],
      temperature: 0.5,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const spiegel = config.bewaakSpiegelOutput(raw);

    return NextResponse.json(spiegel);
  } catch (e) {
    console.error("freebie-bot/spiegel exception:", e);
    return NextResponse.json(
      { error: "Spiegel-generatie mislukt" },
      { status: 500 },
    );
  }
}

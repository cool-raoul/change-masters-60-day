// File: app/api/freebie-bot/maak-token/route.ts
//
// POST /api/freebie-bot/maak-token
// Body: { botSlug: BotSlug }
// Response: { token, url }
//
// Maakt een tracking-token aan voor (auth-user, botSlug) als die nog
// niet bestaat, of geeft de bestaande terug. Een member ziet hier haar
// persoonlijke link voor de bot.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import type { BotSlug } from "@/lib/freebie-bots/types";

const TOEGESTANE_SLUGS: BotSlug[] = [
  "tweede-lente",
  "tweede-wind",
  "energie-en-focus",
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const botSlug = body.botSlug as BotSlug | undefined;
    if (!botSlug || !TOEGESTANE_SLUGS.includes(botSlug)) {
      return NextResponse.json(
        { error: "Ongeldige bot-slug" },
        { status: 400 },
      );
    }

    // Check of token al bestaat
    const { data: bestaand } = await supabase
      .from("freebie_bot_member_tokens")
      .select("token")
      .eq("member_id", user.id)
      .eq("bot_slug", botSlug)
      .maybeSingle();

    if (bestaand?.token) {
      return NextResponse.json({
        token: bestaand.token,
        url: `/bot/${botSlug}/${bestaand.token}`,
        nieuw: false,
      });
    }

    // Genereer nieuwe token (max 5 pogingen tegen collision)
    let token = genereerBotToken();
    for (let pogingen = 0; pogingen < 5; pogingen++) {
      const { data: collision } = await supabase
        .from("freebie_bot_member_tokens")
        .select("id")
        .eq("token", token)
        .maybeSingle();
      if (!collision) break;
      token = genereerBotToken();
    }

    const { error: insertErr } = await supabase
      .from("freebie_bot_member_tokens")
      .insert({
        member_id: user.id,
        bot_slug: botSlug,
        token,
      });

    if (insertErr) {
      console.error("maak-token insert fout:", insertErr);
      return NextResponse.json(
        { error: "Token-opslag mislukt" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token,
      url: `/bot/${botSlug}/${token}`,
      nieuw: true,
    });
  } catch (e) {
    console.error("maak-token exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}

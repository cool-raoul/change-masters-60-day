import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { bouwCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { ChatBericht } from "@/lib/supabase/types";

const anthropic = new Anthropic({
  apiKey: process.env.CM_CLAUDE_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Niet ingelogd", { status: 401 });
    }

    const body = await request.json();
    const {
      berichten,
      prospectId,
      gesprekId,
      taal,
    }: {
      berichten: ChatBericht[];
      prospectId?: string;
      gesprekId?: string;
      taal?: string;
    } = body;

    if (!berichten || berichten.length === 0) {
      return new Response("Geen berichten", { status: 400 });
    }

    // Haal profiel op
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return new Response("Profiel niet gevonden", { status: 404 });
    }

    // Haal WHY profiel op
    const { data: whyProfile } = await supabase
      .from("why_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Haal prospect op (indien meegegeven)
    let prospect = null;
    if (prospectId) {
      const { data: prospectData } = await supabase
        .from("prospects")
        .select("*")
        .eq("id", prospectId)
        .eq("user_id", user.id)
        .single();

      if (prospectData) {
        const { data: logs } = await supabase
          .from("contact_logs")
          .select("*")
          .eq("prospect_id", prospectId)
          .order("created_at", { ascending: false })
          .limit(3);

        prospect = { ...prospectData, recenteLogs: logs || [] };
      }
    }

    // Bouw system prompt
    const systeemPrompt = bouwCoachSysteemPrompt(profile, whyProfile, prospect, taal || "nl");

    // Format berichten voor Claude API
    const apiMessages = berichten.map((b) => ({
      role: b.role as "user" | "assistant",
      content: b.content,
    }));

    // Stream via async iterable — betrouwbaarder dan event-based aanpak
    const stream = await anthropic.messages.stream({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1500,
      system: systeemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    let volledigAntwoord = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const tekst = chunk.delta.text;
              volledigAntwoord += tekst;
              controller.enqueue(encoder.encode(tekst));
            }
          }
          controller.close();

          // Sla antwoord op in DB na stream
          if (gesprekId && volledigAntwoord) {
            const nieuwBericht: ChatBericht = {
              role: "assistant",
              content: volledigAntwoord,
              timestamp: new Date().toISOString(),
            };
            const alleBerichten = [...berichten, nieuwBericht];
            await supabase
              .from("ai_gesprekken")
              .update({
                berichten: alleBerichten,
                updated_at: new Date().toISOString(),
              })
              .eq("id", gesprekId)
              .eq("user_id", user.id);
          }
        } catch (streamFout) {
          console.error("Stream fout:", streamFout);
          controller.error(streamFout);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Coach API fout:", error?.message || error);
    const status = error?.status || 500;
    const bericht =
      status === 401 ? "API sleutel ongeldig" :
      status === 402 ? "API credits op — laad je account op via anthropic.com" :
      status === 429 ? "Te veel verzoeken — probeer over een minuut opnieuw" :
      "Er is iets misgegaan";
    return new Response(bericht, { status });
  }
}

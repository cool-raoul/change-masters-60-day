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
      .single();

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

    // Één stream — tegelijk naar gebruiker én opslaan in DB
    const stream = anthropic.messages.stream({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1500,
      system: systeemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    let volledigAntwoord = "";

    const readable = new ReadableStream({
      async start(controller) {
        stream.on("text", (text) => {
          volledigAntwoord += text;
          controller.enqueue(encoder.encode(text));
        });

        stream.on("finalMessage", async () => {
          controller.close();

          // Sla antwoord op in DB na afloop van de stream
          if (gesprekId) {
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
        });

        stream.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Coach API fout:", error);
    return new Response("Er is iets misgegaan", { status: 500 });
  }
}

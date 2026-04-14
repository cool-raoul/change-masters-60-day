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
        // Haal recente contact logs op
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

    // Stream response van Claude
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systeemPrompt,
      messages: apiMessages,
    });

    // Sla het gesprek op na afloop
    const volledigAntwoord = await new Promise<string>((resolve) => {
      let tekst = "";
      stream.on("text", (t) => (tekst += t));
      stream.on("finalMessage", () => resolve(tekst));
    });

    // Update gesprek in database
    const nieuwBericht: ChatBericht = {
      role: "assistant",
      content: volledigAntwoord,
      timestamp: new Date().toISOString(),
    };

    if (gesprekId) {
      const alleBerichten = [
        ...berichten,
        nieuwBericht,
      ];
      await supabase
        .from("ai_gesprekken")
        .update({
          berichten: alleBerichten,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gesprekId)
        .eq("user_id", user.id);
    }

    // Herstart stream voor response
    const streamVoorResponse = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systeemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        streamVoorResponse.on("text", (text) => {
          controller.enqueue(encoder.encode(text));
        });
        streamVoorResponse.on("finalMessage", () => {
          controller.close();
        });
        streamVoorResponse.on("error", (err) => {
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

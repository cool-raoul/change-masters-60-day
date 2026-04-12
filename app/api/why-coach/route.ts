import Anthropic from "@anthropic-ai/sdk";
import { bouwWhyCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { ChatBericht } from "@/lib/supabase/types";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.CM_CLAUDE_API_KEY;
    if (!apiKey) {
      console.error("CM_CLAUDE_API_KEY niet gevonden in environment");
      return new Response("API key niet geconfigureerd", { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const body = await request.json();
    const { berichten, naam }: { berichten: ChatBericht[]; naam: string } = body;

    const systeemPrompt = bouwWhyCoachSysteemPrompt(naam);

    const apiMessages = berichten.map((b) => ({
      role: b.role as "user" | "assistant",
      content: b.content,
    }));

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systeemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        stream.on("text", (text) => {
          controller.enqueue(encoder.encode(text));
        });
        stream.on("finalMessage", () => {
          controller.close();
        });
        stream.on("error", (err: any) => {
          console.error("Stream error message:", err?.error?.error?.message || err?.message || JSON.stringify(err));
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
    console.error("WHY Coach API fout:", error);
    return new Response("Er is iets misgegaan", { status: 500 });
  }
}

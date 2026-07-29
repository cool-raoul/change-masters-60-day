import OpenAI from "openai";
import { bouwWhyCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { ChatBericht } from "@/lib/supabase/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("OPENAI_API_KEY niet ingesteld in Vercel", { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const body = await request.json();
    const { berichten, naam, taal }: { berichten: ChatBericht[]; naam: string; taal?: string } = body;

    const systeemPrompt = bouwWhyCoachSysteemPrompt(naam, taal || "nl");

    const apiMessages = [
      { role: "system" as const, content: systeemPrompt },
      ...berichten.map((b) => ({
        role: b.role as "user" | "assistant",
        content: b.content,
      })),
    ];

    const stream = await openai.chat.completions.create({
      // Sterk model (Raoul 29 juli): het WHY-gesprek moet écht doorvragen
      // op wat iemand zegt in plaats van een vragenlijstje afwerken. Dat
      // lukt mini niet. De kosten blijven laag, want dit gesprek voert
      // een member normaal gesproken één keer.
      model: "gpt-4o",
      max_tokens: 1000,
      // Warmer dan de kennis-gestuurde routes: hier is variatie in de
      // vraagstelling juist de bedoeling.
      temperature: 0.8,
      messages: apiMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err: any) {
          console.error("WHY stream fout:", err?.message || err);
          try {
            controller.enqueue(encoder.encode(`\n\n[Coach fout: ${err?.message || "onbekend"}]`));
            controller.close();
          } catch {
            // al gesloten
          }
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
    console.error("WHY Coach API fout:", error?.message || error);
    return new Response(`Coach fout: ${error?.message || "onbekend"}`, { status: error?.status || 500 });
  }
}

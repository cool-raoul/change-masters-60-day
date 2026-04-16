import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { bouwCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { detecteerVraagType } from "@/lib/knowledge/coach-boeken";
import { ChatBericht } from "@/lib/supabase/types";

// Verleng Vercel timeout
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("OPENAI_API_KEY niet ingesteld in Vercel", { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

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

    // Detecteer vraagtype voor slimme prompt selectie
    const vraagType = detecteerVraagType(berichten);

    // Bouw system prompt (alleen relevante secties)
    const systeemPrompt = bouwCoachSysteemPrompt(
      profile, whyProfile, prospect, taal || "nl", vraagType
    );

    // History trimming: max 8 berichten meesturen
    const getrimdeBerichten = berichten.length > 8
      ? berichten.slice(-8)
      : berichten;

    const apiMessages = [
      { role: "system" as const, content: systeemPrompt },
      ...getrimdeBerichten.map((b) => ({
        role: b.role as "user" | "assistant",
        content: b.content,
      })),
    ];

    // OpenAI streaming
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: apiMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    let volledigAntwoord = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              volledigAntwoord += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();

          // Sla antwoord op in DB (fire-and-forget)
          if (gesprekId && volledigAntwoord) {
            const nieuwBericht: ChatBericht = {
              role: "assistant",
              content: volledigAntwoord,
              timestamp: new Date().toISOString(),
            };
            const alleBerichten = [...berichten, nieuwBericht];
            Promise.resolve(
              supabase
                .from("ai_gesprekken")
                .update({
                  berichten: alleBerichten,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", gesprekId)
                .eq("user_id", user.id)
            ).catch((err: any) => console.error("DB save fout:", err));
          }
        } catch (err: any) {
          const foutMsg = err?.message || JSON.stringify(err) || "onbekend";
          console.error("Stream fout:", foutMsg);
          try {
            controller.enqueue(encoder.encode(`\n\n[Coach fout: ${foutMsg}]`));
            controller.close();
          } catch {
            // Controller was al gesloten
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
    console.error("Coach API fout:", error?.message || error);
    const status = error?.status || 500;
    const bericht =
      status === 401 ? "API sleutel ongeldig" :
      status === 402 ? "API credits op" :
      status === 429 ? "Te veel verzoeken, probeer over een minuut" :
      `Coach fout: ${error?.message || "onbekend"}`;
    return new Response(bericht, { status });
  }
}

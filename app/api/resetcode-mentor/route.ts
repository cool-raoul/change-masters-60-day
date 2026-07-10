import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  bouwResetMentorPrompt,
  type ResetMentorRol,
} from "@/lib/resetcode/mentor-prompt";
import { stationVoor } from "@/lib/resetcode/programma";

// ============================================================
// POST /api/resetcode-mentor
//
// Preview-versie van de Resetcode-Mentor (klant- én member-stem).
// Alleen voor ingelogde founders/testers zolang de klantomgeving
// nog niet live is; de latere klant-versie krijgt token-auth en
// chat-opslag volgens het mini-ELEVA-patroon (aparte DB-spec).
//
// Kosten-mitigaties overgenomen uit /api/mini-eleva/chat:
// model-router (mini standaard, 4o bij lange vraag), history-trim
// (max 8 berichten), en stateless: de preview slaat niets op.
//
// Body: {
//   vraag: string,
//   programma: string,          // "darm" | "reset"
//   station: string,            // station-slug binnen dat programma
//   rol: "klant" | "member",
//   voornaam?: string,          // demo-naam in de preview
//   geschiedenis?: { rol: "gebruiker" | "mentor"; tekst: string }[]
// }
// Response: streaming text.
// ============================================================

export const maxDuration = 60;

const HISTORY_TRIM = 8;
const ZWAAR_MODEL_DREMPEL_TEKENS = 300;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("OPENAI_API_KEY niet ingesteld", { status: 500 });
    }

    // Preview-gate: alleen founders en testers.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Response("Niet ingelogd", { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_tester, full_name")
      .eq("id", user.id)
      .maybeSingle();
    const p = profile as {
      role?: string | null;
      is_tester?: boolean | null;
      full_name?: string | null;
    } | null;
    if (!(p?.role === "founder" || p?.is_tester === true)) {
      return new Response("Alleen voor founders en testers", { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const vraag = (body.vraag as string | undefined)?.trim() ?? "";
    const programmaSlug = (body.programma as string | undefined) ?? "";
    const stationSlug = (body.station as string | undefined) ?? "";
    const rol: ResetMentorRol = body.rol === "member" ? "member" : "klant";
    const voornaam =
      (body.voornaam as string | undefined)?.trim() ||
      (rol === "klant" ? "Marieke" : (p?.full_name ?? "").split(" ")[0] || "kanjer");

    if (!vraag) return new Response("vraag is vereist", { status: 400 });
    if (vraag.length > 2000) {
      return new Response("vraag te lang (max 2000 tekens)", { status: 400 });
    }
    if (!stationVoor(programmaSlug, stationSlug)) {
      return new Response("onbekend programma of station", { status: 400 });
    }

    type HistBericht = { rol: "gebruiker" | "mentor"; tekst: string };
    const geschiedenis = (
      Array.isArray(body.geschiedenis) ? (body.geschiedenis as HistBericht[]) : []
    )
      .filter((b) => b && typeof b.tekst === "string" && b.tekst.length > 0)
      .slice(-HISTORY_TRIM);

    const systeemPrompt = bouwResetMentorPrompt({
      rol,
      voornaam,
      // In de preview is de ingelogde founder de "begeleider" van de
      // demo-klant; voor de member-stem laten we de sponsor generiek.
      begeleiderNaam:
        rol === "klant" ? (p?.full_name ?? "").split(" ")[0] || "je begeleider" : null,
      programmaSlug,
      stationSlug,
    });

    const zwaarModel = vraag.length > ZWAAR_MODEL_DREMPEL_TEKENS;
    const model = zwaarModel ? "gpt-4o" : "gpt-4o-mini";
    const maxTokens = zwaarModel ? 1000 : 600;

    const apiMessages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      { role: "system", content: systeemPrompt },
      ...geschiedenis.map((b) => ({
        role: (b.rol === "gebruiker" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: b.tekst,
      })),
      { role: "user", content: vraag },
    ];

    const openai = new OpenAI({ apiKey });
    const stream = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: apiMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          const foutMsg = err instanceof Error ? err.message : "onbekende fout";
          console.error("resetcode-mentor stream-fout:", foutMsg);
          try {
            controller.enqueue(encoder.encode(`\n\n[Mentor-fout: ${foutMsg}]`));
            controller.close();
          } catch {
            // controller was al gesloten
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
  } catch (error) {
    const msg = error instanceof Error ? error.message : "onbekend";
    console.error("resetcode-mentor exception:", msg);
    return new Response(`Mentor-fout: ${msg}`, { status: 500 });
  }
}

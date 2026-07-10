import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  bouwResetMentorPrompt,
  type ResetMentorRol,
} from "@/lib/resetcode/mentor-prompt";
import { stationVoor } from "@/lib/resetcode/programma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  bewaarResetChats,
} from "@/lib/resetcode/klant-links";

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

    const body = await req.json().catch(() => ({}));

    // Twee toegangs-paden:
    //   1. TOKEN (echte klant op /k/[token]): gesprek wordt opgeslagen.
    //   2. Ingelogde founder/tester (preview): stateless.
    const token = (body.token as string | undefined) ?? "";
    let klantCtx = null as Awaited<ReturnType<typeof pakResetKlantContext>>;
    let previewNaam = "";
    let previewBegeleider = "";

    if (token) {
      klantCtx = await pakResetKlantContext(token);
      if (!klantCtx || klantCtx.status !== "actief") {
        return new Response("Ongeldige link", { status: 401 });
      }
      // Kosten-vangnet per klant-link (klantbegeleiding loopt maanden,
      // dus ruimer dan mini-ELEVA's 50).
      const admin = createAdminClient();
      const { count } = await admin
        .from("resetcode_chats")
        .select("id", { count: "exact", head: true })
        .eq("link_id", klantCtx.linkId)
        .eq("van", "mentor")
        .eq("soort", "tekst");
      if ((count ?? 0) >= 300) {
        return new Response(
          `Je hebt de Mentor al heel veel gevraagd, wat goed! Voor nu even: stel je volgende vragen aan ${klantCtx.memberVoornaam}, die helpt je persoonlijk verder.`,
          { status: 429 },
        );
      }
    } else {
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
      previewNaam = (p?.full_name ?? "").split(" ")[0] || "kanjer";
      previewBegeleider = previewNaam || "je begeleider";
    }

    const vraag = (body.vraag as string | undefined)?.trim() ?? "";
    const programmaSlug = klantCtx
      ? klantCtx.programmaSlug
      : ((body.programma as string | undefined) ?? "");
    const stationSlug = (body.station as string | undefined) ?? "";
    const rol: ResetMentorRol = klantCtx
      ? "klant"
      : body.rol === "member"
        ? "member"
        : "klant";
    const voornaam = klantCtx
      ? klantCtx.klantVoornaam
      : (body.voornaam as string | undefined)?.trim() ||
        (rol === "klant" ? "Marieke" : previewNaam);

    // Optionele foto (etiket-check): data-URL van een afbeelding.
    const foto = typeof body.foto === "string" ? (body.foto as string) : null;
    if (foto && (!foto.startsWith("data:image/") || foto.length > 6_000_000)) {
      return new Response("ongeldige of te grote foto", { status: 400 });
    }

    if (!vraag && !foto) {
      return new Response("vraag of foto is vereist", { status: 400 });
    }
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
      begeleiderNaam: klantCtx
        ? klantCtx.memberVoornaam
        : rol === "klant"
          ? previewBegeleider
          : null,
      programmaSlug,
      stationSlug,
    });

    // Klant-vraag meteen bewaren (ongeacht of de AI-call slaagt).
    if (klantCtx) {
      await bewaarResetChats(klantCtx.linkId, [
        foto
          ? { van: "klant", soort: "foto", stationSlug, tekst: vraag || "📷 (foto gestuurd)" }
          : { van: "klant", soort: "tekst", stationSlug, tekst: vraag },
      ]);
    }

    // Foto's (etiket-checks) altijd naar het zware model: daar hangt
    // een wel/niet-oordeel voor de klant vanaf.
    const zwaarModel = Boolean(foto) || vraag.length > ZWAAR_MODEL_DREMPEL_TEKENS;
    const model = zwaarModel ? "gpt-4o" : "gpt-4o-mini";
    const maxTokens = zwaarModel ? 1000 : 600;

    const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systeemPrompt },
      ...geschiedenis.map((b) => ({
        role: (b.rol === "gebruiker" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: b.tekst,
      })),
      foto
        ? {
            role: "user" as const,
            content: [
              {
                type: "text" as const,
                text:
                  vraag ||
                  "Ik sta in de supermarkt en stuur je een foto van dit product. Kijk je even mee of dit past in mijn programma en fase?",
              },
              { type: "image_url" as const, image_url: { url: foto } },
            ],
          }
        : { role: "user" as const, content: vraag },
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
    const ctxVoorOpslag = klantCtx;
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let volledig = "";
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              volledig += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
          // Mentor-antwoord bewaren voor het meereizende geheugen.
          if (ctxVoorOpslag && volledig) {
            try {
              await bewaarResetChats(ctxVoorOpslag.linkId, [
                { van: "mentor", soort: "tekst", stationSlug, tekst: volledig },
              ]);
            } catch (e) {
              console.error("resetcode chat opslaan mislukt:", e);
            }
          }
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

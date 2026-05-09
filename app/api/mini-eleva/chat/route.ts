import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { bouwProspectMentorPrompt } from "@/lib/mini-eleva/prospect-mentor-prompt";
import { notifeerVoorUitnodiging } from "@/lib/mini-eleva/notificaties";

// ============================================================
// POST /api/mini-eleva/chat
//
// Prospect stelt een vraag aan de AI-mentor. Authenticatie verloopt
// puur via het token in de body (zelfde token als in de URL). De
// prospect heeft GEEN Supabase-account, dus we gebruiken de admin-
// client server-side om RLS te omzeilen na token-validatie.
//
// Vier kosten-mitigaties zitten ingebouwd:
//
//   1. HARD QUOTUM, max 50 AI-vragen per uitnodiging. Daarna krijgt
//      prospect een nette boodschap met "haal de mens erbij".
//   2. MODEL-ROUTER, gpt-4o-mini standaard, gpt-4o alleen als bericht
//      langer dan 300 tekens is (uitgebreidere vraag verdient zwaarder
//      model). Houdt gemiddelde kosten laag.
//   3. PROMPT-CACHING, system-prompt blijft per uitnodiging stabiel
//      zodat OpenAI 'm cachet (>1024 tokens automatisch). System-prompt
//      staat vooraan, dynamische delen achteraan.
//   4. HISTORY-TRIM, max 8 berichten meesturen. Voorkomt dat lange
//      sessies exponentieel duurder worden.
//
// Body: { token: string, vraag: string }
// Response: streaming text (zelfde format als /api/coach)
// ============================================================

export const maxDuration = 60;

const HARD_QUOTUM = 50;
const HISTORY_TRIM = 8;
const ZWAAR_MODEL_DREMPEL_TEKENS = 300;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("OPENAI_API_KEY niet ingesteld", { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined) ?? "";
    const vraag = (body.vraag as string | undefined)?.trim() ?? "";

    if (!token || !vraag) {
      return new Response("token en vraag zijn vereist", { status: 400 });
    }
    if (vraag.length > 2000) {
      return new Response("vraag te lang (max 2000 tekens)", { status: 400 });
    }

    // Token-validatie + context ophalen via admin-client
    const ctx = await pakMiniElevaContext(token);
    if (!ctx) {
      return new Response("Ongeldige link", { status: 401 });
    }
    if (ctx.isVerlopen) {
      return new Response("Deze link is verlopen", { status: 410 });
    }

    const admin = createAdminClient();

    // Mitigatie 1: HARD QUOTUM check (alleen mentor-kanaal tellen)
    const { count: aiCount } = await admin
      .from("mini_eleva_chats")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", ctx.invitationId)
      .eq("kanaal", "mentor")
      .eq("rol", "ai_mentor");

    if ((aiCount ?? 0) >= HARD_QUOTUM) {
      return new Response(
        JSON.stringify({
          quotumBereikt: true,
          gebruikt: aiCount ?? 0,
          limiet: HARD_QUOTUM,
          bericht: `Je hebt al ${HARD_QUOTUM} vragen gesteld aan de mentor. Voor verdere vragen kun je beter ${ctx.memberNaam ?? "de member"}${ctx.sponsorNaam ? ` of ${ctx.sponsorNaam}` : ""} even via de chat-tegel benaderen.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    // Geschiedenis ophalen voor conversatie-context (laatste N berichten,
    // ouder → nieuwer voor OpenAI-volgorde). Alleen mentor-kanaal,
    // mens-chat-berichten zijn niet relevant voor de AI-mentor en horen
    // niet in haar context.
    const { data: geschiedenisRaw } = await admin
      .from("mini_eleva_chats")
      .select("rol, content, created_at")
      .eq("invitation_id", ctx.invitationId)
      .eq("kanaal", "mentor")
      .in("rol", ["prospect", "ai_mentor"])
      .order("created_at", { ascending: false })
      .limit(HISTORY_TRIM);

    type ChatRow = { rol: string; content: string; created_at: string };
    const geschiedenis = ((geschiedenisRaw as ChatRow[] | null) ?? [])
      .slice()
      .reverse();

    // Schrijf de vraag van de prospect direct weg, zodat 'm staat
    // ongeacht of de AI-call slaagt. Kanaal 'mentor' zodat 'ie niet
    // lekt naar de mens-chat.
    await admin.from("mini_eleva_chats").insert({
      invitation_id: ctx.invitationId,
      rol: "prospect",
      type: "tekst",
      content: vraag,
      kanaal: "mentor",
    });

    // Mitigatie 3: PROMPT-CACHING, stabiele system-prompt vooraan.
    // Per uitnodiging is deze identiek over alle vragen, dus OpenAI
    // herkent 'm en cachet 'm.
    const systeemPrompt = bouwProspectMentorPrompt({
      prospectVoornaam: ctx.prospectNaam.split(" ")[0],
      memberNaam: ctx.memberNaam,
      sponsorNaam: ctx.sponsorNaam,
    });

    // Mitigatie 2: MODEL-ROUTER. Standaard mini, alleen langer bericht
    // (= complexere vraag) krijgt zwaarder model.
    const zwaarModel = vraag.length > ZWAAR_MODEL_DREMPEL_TEKENS;
    const model = zwaarModel ? "gpt-4o" : "gpt-4o-mini";
    const maxTokens = zwaarModel ? 1000 : 600;

    // Bouw OpenAI-berichten
    const apiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systeemPrompt },
      ...geschiedenis.map((b) => ({
        role: (b.rol === "prospect" ? "user" : "assistant") as "user" | "assistant",
        content: b.content,
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

          // Sla AI-antwoord op (fire-and-forget) + log activiteit
          if (volledigAntwoord) {
            try {
              await admin.from("mini_eleva_chats").insert({
                invitation_id: ctx.invitationId,
                rol: "ai_mentor",
                type: "tekst",
                content: volledigAntwoord,
                kanaal: "mentor",
              });
              await logActiviteit(
                ctx.invitationId,
                "mentor-chat",
                `vraag (${vraag.length}t) → ${model}, antwoord ${volledigAntwoord.length}t`,
              );

              // Mijlpaal-notificatie aan member + sponsor: elke 5 vragen
              // een seintje dat de prospect actief aan het leren is.
              // Niet bij elke vraag (te spammy), niet alleen bij 1 (mist
              // momentum-signaal). 5/10/15/20 voelt gepast.
              const nieuwTotaal = (aiCount ?? 0) + 1;
              if (nieuwTotaal > 0 && nieuwTotaal % 5 === 0) {
                await notifeerVoorUitnodiging({
                  invitationId: ctx.invitationId,
                  type: "mijlpaal-vragen",
                  titel: `${ctx.prospectNaam.split(" ")[0]} is goed bezig in mini-ELEVA`,
                  detail: `Heeft ondertussen ${nieuwTotaal} vragen gesteld aan de ELEVA-mentor`,
                  url: `/namenlijst/${ctx.prospectId}#mini-eleva`,
                });
              }
            } catch (e) {
              console.error("mini-eleva chat opslaan mislukt:", e);
            }
          }
        } catch (err) {
          const foutMsg =
            err instanceof Error ? err.message : "onbekende fout";
          console.error("mini-eleva chat stream-fout:", foutMsg);
          try {
            controller.enqueue(
              encoder.encode(`\n\n[Mentor-fout: ${foutMsg}]`),
            );
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
    console.error("mini-eleva chat exception:", msg);
    return new Response(`Mentor-fout: ${msg}`, { status: 500 });
  }
}

// ============================================================
// GET /api/mini-eleva/chat?token=...
//
// Haalt de bestaande chat-geschiedenis op voor de prospect, zodat de
// chat-UI 'm bij refresh kan herstellen. Token-only auth.
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") ?? "";
    if (!token) {
      return new Response(
        JSON.stringify({ error: "token vereist" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const ctx = await pakMiniElevaContext(token);
    if (!ctx) {
      return new Response(
        JSON.stringify({ error: "Ongeldige link" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    if (ctx.isVerlopen) {
      return new Response(
        JSON.stringify({ error: "Verlopen" }),
        { status: 410, headers: { "Content-Type": "application/json" } },
      );
    }

    const admin = createAdminClient();
    // Alleen mentor-kanaal: vragen van prospect aan AI + AI-antwoorden
    const { data: berichten } = await admin
      .from("mini_eleva_chats")
      .select("id, rol, type, content, created_at")
      .eq("invitation_id", ctx.invitationId)
      .eq("kanaal", "mentor")
      .order("created_at", { ascending: true });

    const { count: aiCount } = await admin
      .from("mini_eleva_chats")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", ctx.invitationId)
      .eq("kanaal", "mentor")
      .eq("rol", "ai_mentor");

    return new Response(
      JSON.stringify({
        ok: true,
        berichten: berichten ?? [],
        quotum: {
          gebruikt: aiCount ?? 0,
          limiet: HARD_QUOTUM,
        },
        memberNaam: ctx.memberNaam,
        sponsorNaam: ctx.sponsorNaam,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("mini-eleva chat GET exception:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

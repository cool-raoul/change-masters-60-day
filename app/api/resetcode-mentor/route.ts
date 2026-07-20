import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  bouwResetMentorPrompt,
  bouwWaakhondPrompt,
  type ResetMentorRol,
} from "@/lib/resetcode/mentor-prompt";
import { stationVoor } from "@/lib/resetcode/programma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  bewaarResetChats,
} from "@/lib/resetcode/klant-links";
import { pakCheckins } from "@/lib/resetcode/checkin";
import { sendPushToUser } from "@/lib/push/sendPush";

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

    // Dagboek-overzicht voor patroon-spiegeling (alleen echte klanten;
    // compact: laatste 14 check-ins als één regel per dag).
    let checkinOverzicht: string | null = null;
    if (klantCtx) {
      try {
        const checkins = (await pakCheckins(klantCtx.linkId)).slice(-14);
        if (checkins.length > 0) {
          checkinOverzicht = checkins
            .map((c) => {
              const delen = [
                c.stemming,
                c.energie ? `energie ${c.energie}` : null,
                c.slaap ? `slaap ${c.slaap}` : null,
                c.buik ? `buik ${c.buik}` : null,
                c.gewicht != null ? `${c.gewicht} kg` : null,
                c.notitie ? `winst: "${c.notitie.slice(0, 80)}"` : null,
              ].filter(Boolean);
              return `- ${c.datum}: ${delen.join(", ")}`;
            })
            .join("\n");
        }
      } catch {
        // dagboek is nice-to-have; nooit de Mentor blokkeren
      }
    }

    // Team-kennis: beantwoorde vraag/antwoord-paren van de founders voor
    // dit programma (+ algemeen), compact het brein in.
    let teamKennis: string | null = null;
    try {
      const adminK = createAdminClient();
      const { data: kennisRijen } = await adminK
        .from("resetcode_kennis")
        .select("vraag, antwoord")
        .eq("status", "beantwoord")
        .in("programma", [programmaSlug, "algemeen"])
        .order("beantwoord_op", { ascending: false })
        .limit(60);
      const rijen = (kennisRijen ?? []) as { vraag: string; antwoord: string }[];
      if (rijen.length > 0) {
        teamKennis = rijen
          .map((r) => `V: ${r.vraag}\nA: ${r.antwoord}`)
          .join("\n---\n");
      }
    } catch {
      // kennis is nice-to-have; nooit de Mentor blokkeren
    }

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
      isBouwer: klantCtx?.isBouwer ?? false,
      // Token-modus: pakket uit de database; preview: uit de body.
      pakket:
        klantCtx?.pakket ??
        (body.pakket === "basis" || body.pakket === "plus"
          ? (body.pakket as "basis" | "plus")
          : null),
      checkinOverzicht,
      teamKennis,
    });

    // Klant-vraag meteen bewaren (ongeacht of de AI-call slaagt).
    if (klantCtx) {
      await bewaarResetChats(klantCtx.linkId, [
        foto
          ? { van: "klant", soort: "foto", stationSlug, tekst: vraag || "📷 (foto gestuurd)" }
          : { van: "klant", soort: "tekst", stationSlug, tekst: vraag },
      ]);
    }

    // ALTIJD het sterke model. Het goedkope model gleed bij korte vragen
    // af naar generiek dieet-advies dat de fase-regels schond (noten en
    // "flexibiliteit" in fase 2, bug 13 juli). Fase-discipline is de kern
    // van dit product; het kosten-vangnet zit al in het vragen-quotum.
    const model = "gpt-4o";
    const maxTokens = foto || vraag.length > ZWAAR_MODEL_DREMPEL_TEKENS ? 1000 : 700;

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
      // Laag: fase-discipline en de kennis-grens zijn belangrijker dan
      // creativiteit (0.7 gokte er te vrolijk op los, test 20 juli).
      temperature: 0.4,
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
          // BELANGRIJK: alle opslag afronden VÓÓR controller.close().
          // Op Vercel kan de functie bevriezen zodra de stream dicht is;
          // werk dat daarna komt gaat dan stil verloren (dit trof de
          // kennis-insert in de eerste live-test).
          // Weet-niet-marker: de Mentor gaf toe dat hij het niet weet en
          // legt de vraag bij het team. Marker uit de opslag strippen,
          // vraag als open kennis-item bewaren en founders een seintje
          // geven (alleen echte klanten; preview maakt geen ruis).
          const isTeamvraag = volledig.includes("[[TEAMVRAAG]]");
          const schoon = volledig.replaceAll("[[TEAMVRAAG]]", "").trimEnd();
          if (ctxVoorOpslag && schoon) {
            try {
              await bewaarResetChats(ctxVoorOpslag.linkId, [
                { van: "mentor", soort: "tekst", stationSlug, tekst: schoon },
              ]);
            } catch (e) {
              console.error("resetcode chat opslaan mislukt:", e);
            }
          }
          if (isTeamvraag && ctxVoorOpslag && vraag) {
            try {
              const adminT = createAdminClient();
              const { error: kennisFout } = await adminT
                .from("resetcode_kennis")
                .insert({
                  programma: programmaSlug,
                  vraag: vraag.slice(0, 600),
                  bron: "klant",
                  link_id: ctxVoorOpslag.linkId,
                });
              if (kennisFout) {
                console.error("resetcode kennis-insert:", kennisFout.message);
              }
              // Push naar alle founders (vraag anoniem, geen klantnaam).
              const { data: founders } = await adminT
                .from("profiles")
                .select("id")
                .eq("role", "founder");
              await Promise.allSettled(
                ((founders ?? []) as { id: string }[]).map((f) =>
                  sendPushToUser(f.id, {
                    title: "Nieuwe vraag voor het team 🧠",
                    body: `De Mentor wist dit niet: "${vraag.slice(0, 120)}". Beantwoord 'm en de Mentor leert het direct.`,
                    url: "/resetcode-kennis",
                    tag: "resetcode-kennis",
                  }),
                ),
              );
            } catch (e) {
              console.error("resetcode kennis-vraag opslaan mislukt:", e);
            }
          } else if (ctxVoorOpslag && vraag && schoon && !foto) {
            // WAAKHOND: tweede, onafhankelijke check op het antwoord.
            // Founders zien de gesprekken niet (privacy-schild), dus
            // riskante antwoorden moeten vanzelf boven water komen.
            // Foto-antwoorden slaan we over (etiket-analyse is per
            // definitie buiten het materiaal).
            try {
              const check = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                max_tokens: 150,
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                  {
                    role: "system",
                    content: bouwWaakhondPrompt(programmaSlug, teamKennis),
                  },
                  {
                    role: "user",
                    content: `VRAAG VAN DE KLANT:\n${vraag}\n\nANTWOORD VAN DE MENTOR:\n${schoon}`,
                  },
                ],
              });
              const uitslag = JSON.parse(
                check.choices[0]?.message?.content ?? "{}",
              ) as { verdacht?: boolean; reden?: string };
              if (uitslag.verdacht === true) {
                const adminW = createAdminClient();
                const { error: wFout } = await adminW
                  .from("resetcode_kennis")
                  .insert({
                    programma: programmaSlug,
                    vraag: vraag.slice(0, 600),
                    bron: "controle",
                    link_id: ctxVoorOpslag.linkId,
                    gegeven_antwoord: schoon.slice(0, 2000),
                    controle_reden: (uitslag.reden ?? "").slice(0, 300),
                  });
                if (wFout) console.error("waakhond-insert:", wFout.message);
                const { data: founders } = await adminW
                  .from("profiles")
                  .select("id")
                  .eq("role", "founder");
                await Promise.allSettled(
                  ((founders ?? []) as { id: string }[]).map((f) =>
                    sendPushToUser(f.id, {
                      title: "Even meekijken 🔍",
                      body: `De Mentor gaf een antwoord dat mogelijk buiten het materiaal gaat: "${vraag.slice(0, 100)}". Check en corrigeer 'm zo nodig.`,
                      url: "/resetcode-kennis",
                      tag: "resetcode-waakhond",
                    }),
                  ),
                );
              }
            } catch (e) {
              console.error("waakhond-check mislukt:", e);
            }
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

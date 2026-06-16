import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { bouwCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { detecteerVraagType } from "@/lib/knowledge/coach-boeken";
import { productadviesBeschikbaar } from "@/lib/features/productadvies";
import { checkCompliance, vatFlagsSamen } from "@/lib/coach/compliance-check";
import {
  pakRelevanteVoorbeelden,
  bouwVoorbeeldenPromptSectie,
} from "@/lib/coach/voorbeelden";
import { ChatBericht } from "@/lib/supabase/types";
import { leesMentorProfiel, patchMentorProfiel } from "@/lib/mentor-profiel/helpers";
import { parseProfielBlok } from "@/lib/mentor-profiel/parse";

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
    // Coach gaat altijd uit van het meest volledige advies (bestellingen, herinneringen,
    // contactlogs) en vraagt daarna zelf of er behoefte is aan een budget-alternatief.
    const niveau: "light" | "full" = "full";

    if (!berichten || berichten.length === 0) {
      return new Response("Geen berichten", { status: 400 });
    }

    // Check dagelijks limiet
    const vandaagStr = new Date().toISOString().split("T")[0];

    // Haal premium status + huidig gebruik op
    const [{ data: gebruikData }, { data: premiumData }] = await Promise.all([
      supabase
        .from("coach_gebruik")
        .select("berichten_count")
        .eq("user_id", user.id)
        .eq("datum", vandaagStr)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("premium_tot")
        .eq("id", user.id)
        .single(),
    ]);

    const isPremium = premiumData?.premium_tot
      ? new Date(premiumData.premium_tot) >= new Date()
      : false;
    const huidigGebruik = gebruikData?.berichten_count || 0;
    const GRATIS_LIMIET = 20;

    if (!isPremium && huidigGebruik >= GRATIS_LIMIET) {
      return new Response(
        JSON.stringify({ limietBereikt: true, gebruik: huidigGebruik, limiet: GRATIS_LIMIET }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verhoog teller direct (voor de stream start)
    await supabase
      .from("coach_gebruik")
      .upsert(
        {
          user_id: user.id,
          datum: vandaagStr,
          berichten_count: huidigGebruik + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,datum" }
      );

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

    // Haal Mentor-profiel op (stem, niche, verhalen, producten, etc.). Dit is
    // wat de Mentor het teamlid persoonlijk laat kennen. Faalt graceful naar
    // leeg profiel als de tabel nog niet bestaat.
    const mentorProfiel = await leesMentorProfiel(user.id);

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
        const logLimit = niveau === "full" ? 10 : 3;
        const { data: logs } = await supabase
          .from("contact_logs")
          .select("*")
          .eq("prospect_id", prospectId)
          .order("created_at", { ascending: false })
          .limit(logLimit);

        let bestellingen: any[] = [];
        let herinneringen: any[] = [];
        if (niveau === "full") {
          const [{ data: bestellingenData }, { data: herinneringenData }] = await Promise.all([
            supabase
              .from("product_bestellingen")
              .select("*")
              .eq("prospect_id", prospectId)
              .order("besteldatum", { ascending: false })
              .limit(10),
            supabase
              .from("herinneringen")
              .select("*")
              .eq("prospect_id", prospectId)
              .eq("voltooid", false)
              .order("vervaldatum", { ascending: true })
              .limit(5),
          ]);
          bestellingen = bestellingenData || [];
          herinneringen = herinneringenData || [];
        }

        prospect = {
          ...prospectData,
          recenteLogs: logs || [],
          bestellingen,
          openHerinneringen: herinneringen,
        };
      }
    }

    // Detecteer vraagtype voor slimme prompt selectie
    let vraagType = detecteerVraagType(berichten);

    // Feature-flag: als productadvies uit staat voor deze rol → downgrade naar algemeen
    if (vraagType === "productadvies" && !productadviesBeschikbaar(profile.role)) {
      vraagType = "algemeen";
    }

    // Bouw system prompt (alleen relevante secties)
    let systeemPrompt = bouwCoachSysteemPrompt(
      profile, whyProfile, prospect, taal || "nl", vraagType, niveau, mentorProfiel
    );

    // Gevalideerde product-ervarings-kennis (Dr. McKee + jarenlange
    // teamervaring, validated by founder). Faalt stil bij fout zodat
    // coach blijft werken. Voor performance: alleen ophalen wanneer
    // er gevalideerde rijen zijn.
    try {
      const { haalGevalideerdeKennis, formatKennisVoorPrompt } = await import(
        "@/lib/cms/mentor-kennis"
      );
      const kennisRijen = await haalGevalideerdeKennis();
      if (kennisRijen.length > 0) {
        systeemPrompt += formatKennisVoorPrompt(kennisRijen);
      }
    } catch (e) {
      console.warn("mentor-kennis ophalen mislukt:", e);
    }

    // Train-de-Mentor: voeg relevante founder-voorbeelden toe als
    // few-shot context. Faalt stilletjes als de tabel nog niet bestaat
    // (migratie nog niet gerund) zodat coach gewoon blijft werken.
    try {
      const laatsteUserBericht =
        [...berichten].reverse().find((b) => b.role === "user")?.content ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const voorbeelden = await pakRelevanteVoorbeelden(
        supabase as any,
        vraagType,
        laatsteUserBericht,
        5,
      );
      if (voorbeelden.length > 0) {
        systeemPrompt += bouwVoorbeeldenPromptSectie(voorbeelden);
      }
    } catch (e) {
      console.warn("coach-voorbeelden ophalen mislukt:", e);
    }

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

    // OpenAI streaming, model-router op basis van vraagtype:
    // - productadvies: gpt-4o (uitgebreid redeneren, fase-plan, basis-stack)
    // - dm + drieweg : gpt-4o (samenhangende NL-output, geen Engelse mengelmoes
    //                  die mini-versie maakt, edification-formule beter aangehouden)
    // - rest         : gpt-4o-mini (bezwaar/followup/closing/algemeen, kort + snel)
    const zwaarModel = vraagType === "productadvies"
      || vraagType === "dm"
      || vraagType === "drieweg"
      || vraagType === "reel";
    const stream = await openai.chat.completions.create({
      model: zwaarModel ? "gpt-4o" : "gpt-4o-mini",
      max_tokens: vraagType === "productadvies" ? 2000 : zwaarModel ? 1200 : 800,
      messages: apiMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    let volledigAntwoord = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let verzondenLengte = 0;
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              volledigAntwoord += text;
              // Het [PROFIEL]-blok (en alles erna) houden we ACHTER, zodat de
              // gebruiker de opslag-JSON nooit ziet. We streamen alleen het
              // zichtbare deel vóór het blok.
              const zichtbaar = volledigAntwoord.split("[PROFIEL]")[0];
              if (zichtbaar.length > verzondenLengte) {
                controller.enqueue(
                  encoder.encode(zichtbaar.slice(verzondenLengte)),
                );
                verzondenLengte = zichtbaar.length;
              }
            }
          }
          controller.close();

          // Het zichtbare antwoord = alles vóór het [PROFIEL]-blok.
          const zichtbaarAntwoord = volledigAntwoord
            .split("[PROFIEL]")[0]
            .trimEnd();

          // Mentor-profiel bijwerken als de Mentor een [PROFIEL]-blok meegaf.
          // Fire-and-forget, faalt stil zodat het gesprek nooit hapert.
          try {
            const patch = parseProfielBlok(volledigAntwoord, mentorProfiel);
            if (patch) {
              Promise.resolve(patchMentorProfiel(user.id, patch)).catch(
                (err: any) =>
                  console.error("mentor-profiel patch fout:", err),
              );
            }
          } catch (err) {
            console.warn("profiel-parse mislukt:", err);
          }

          // Compliance-scan op het zichtbare antwoord. PASSIEF, we
          // blokkeren niets, we loggen alleen.
          if (zichtbaarAntwoord && vraagType === "productadvies") {
            const compliance = checkCompliance(zichtbaarAntwoord);
            if (!compliance.ok) {
              console.warn(
                `[COACH-COMPLIANCE] user=${user.id} prospect=${prospectId || "n/a"} flags=${vatFlagsSamen(compliance.flags)}`
              );
            }
          }

          // Sla het zichtbare antwoord op in DB (fire-and-forget), zonder
          // het [PROFIEL]-blok.
          if (gesprekId && zichtbaarAntwoord) {
            const nieuwBericht: ChatBericht = {
              role: "assistant",
              content: zichtbaarAntwoord,
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

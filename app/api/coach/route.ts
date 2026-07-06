import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { bouwCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { detecteerVraagType } from "@/lib/knowledge/coach-boeken";
import { taakVoor, isPostVerzoek } from "@/lib/mentor/taak-register";
import { bouwSchrijfregelsSectie } from "@/lib/mentor/schrijfregels";
import { bouwCopywritingSectie } from "@/lib/mentor/copywriting";
import { bouwPostSchrijverPrompt } from "@/lib/mentor/post-schrijver-prompt";
import { haalMentorFreebies } from "@/lib/mentor/freebie-context";
import { productadviesBeschikbaar } from "@/lib/features/productadvies";
import { checkCompliance, vatFlagsSamen } from "@/lib/coach/compliance-check";
import {
  pakRelevanteVoorbeelden,
  bouwVoorbeeldenPromptSectie,
} from "@/lib/coach/voorbeelden";
import { ChatBericht } from "@/lib/supabase/types";
import { leesMentorProfiel, patchMentorProfiel } from "@/lib/mentor-profiel/helpers";
import {
  parseProfielBlok,
  parseProspectBlok,
  zichtbaarTotMarker,
} from "@/lib/mentor-profiel/parse";

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

    const laatsteUserBericht =
      [...berichten].reverse().find((b) => b.role === "user")?.content ?? "";

    // Taak-register bepaalt model + bewaking. Post-vangnet over ALLE user-
    // berichten van het gesprek: het schrijfverzoek valt vaak in het eerste
    // bericht, terwijl de beurten daarna interview-antwoorden zijn zonder
    // het woord "post". Zonder gesprek-brede check zou de schrijf-beurt
    // terugvallen op het snelle model zonder schrijfregels.
    const alleUserTekst = berichten
      .filter((b) => b.role === "user")
      .map((b) => b.content)
      .join("\n");
    // Een herkenbaar post-verzoek gaat ALTIJD naar de schrijver-taak,
    // ongeacht wat de vraagtype-detectie gokte (Raoul's test bewees:
    // "ik wil een post schrijven..." classificeert als "social", en dan
    // kreeg de coach-rol de copywriting-kennis en gaf die als lesje terug).
    // Alleen "reel" blijft reel: dat is al een schrijver-taak.
    const taakId =
      vraagType !== "reel" && isPostVerzoek(alleUserTekst)
        ? "post"
        : vraagType;
    const taak = taakVoor(taakId);

    // Bouw system prompt. Schrijftaken (post/reel) krijgen een EIGEN,
    // compacte schrijver-rol: de brede coach-rol ("uitleggen en begeleiden")
    // vocht met de schrijfregels en won, waardoor leden schrijf-TIPS kregen
    // in plaats van een interview + kant-en-klare post.
    const isSchrijfPrompt = taak.id === "post" || taak.id === "reel";
    // Deelbare checks (freebies) van dit lid, zodat de schrijver een post
    // aan een check kan koppelen ("reageer met CHECK") met de juiste link.
    let mentorFreebies: Awaited<ReturnType<typeof haalMentorFreebies>> = [];
    if (isSchrijfPrompt) {
      try {
        mentorFreebies = await haalMentorFreebies(supabase, user.id);
      } catch (e) {
        console.warn("freebie-context ophalen mislukt:", e);
      }
    }
    let systeemPrompt = isSchrijfPrompt
      ? bouwPostSchrijverPrompt({
          voornaam: (profile.full_name || "").split(" ")[0] || "daar",
          taal: taal || "nl",
          mentorProfiel,
          taakId: taak.id,
          freebies: mentorFreebies,
        })
      : bouwCoachSysteemPrompt(
          profile, whyProfile, prospect, taal || "nl", vraagType, niveau, mentorProfiel
        );

    // Gevalideerde product-ervarings-kennis (Dr. McKee + jarenlange
    // teamervaring, validated by founder). Faalt stil bij fout zodat
    // coach blijft werken. Voor performance: alleen ophalen wanneer
    // er gevalideerde rijen zijn.
    if (!isSchrijfPrompt) {
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
    }

    // Train-de-Mentor: voeg relevante founder-voorbeelden toe als
    // few-shot context. Faalt stilletjes als de tabel nog niet bestaat
    // (migratie nog niet gerund) zodat coach gewoon blijft werken.
    if (!isSchrijfPrompt) {
      try {
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
    }

    // Mentor-brein: bij overige schrijftaken (dm/drieweg/opener/social) gaan
    // de schrijfregels mee bovenop de coach-rol. Post/reel hebben hierboven
    // al hun eigen schrijver-prompt waar dit alles al in zit.
    if (taak.schrijfwerk && !isSchrijfPrompt) {
      systeemPrompt += "\n\n" + bouwSchrijfregelsSectie();
    }
    if (taak.id === "social" && !isSchrijfPrompt) {
      systeemPrompt += "\n\n" + bouwCopywritingSectie();
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

    // Model + ruimte komen uit het taak-register (lib/mentor/taak-register):
    // publiek schrijfwerk krijgt ALTIJD het sterke model, en modellen
    // wisselen kan voortaan op die ene plek.
    const stream = await openai.chat.completions.create({
      model: taak.model,
      max_tokens: taak.maxTokens,
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
              // De systeem-blokken ([PROFIEL] / [PROSPECT]) en alles erna
              // houden we ACHTER, zodat de gebruiker de opslag-JSON nooit ziet.
              // We streamen alleen het zichtbare deel vóór het eerste blok.
              const zichtbaar = zichtbaarTotMarker(volledigAntwoord);
              if (zichtbaar.length > verzondenLengte) {
                controller.enqueue(
                  encoder.encode(zichtbaar.slice(verzondenLengte)),
                );
                verzondenLengte = zichtbaar.length;
              }
            }
          }
          // Het zichtbare antwoord = alles vóór het eerste systeem-blok.
          const zichtbaarAntwoord = zichtbaarTotMarker(volledigAntwoord).trimEnd();

          // De opslag gebeurt VÓÓR controller.close() en wordt geawait. Op
          // serverless (Vercel) kan de functie na de close bevriezen, waardoor
          // fire-and-forget writes verloren zouden gaan. Elke write is apart
          // ge-try-catcht zodat één fout de andere writes en de close niet breekt.

          // Mentor-profiel bijwerken als de Mentor een [PROFIEL]-blok meegaf.
          try {
            const patch = parseProfielBlok(volledigAntwoord, mentorProfiel);
            if (patch) await patchMentorProfiel(user.id, patch);
          } catch (err) {
            console.warn("mentor-profiel opslaan mislukt:", err);
          }

          // FORM-context op de prospect-kaart bijwerken als de Mentor een
          // [PROSPECT]-blok meegaf én er een prospect in context was.
          if (prospectId && prospect) {
            try {
              const form = parseProspectBlok(volledigAntwoord);
              if (form) {
                const huidigeForm =
                  ((prospect as { form_context?: Record<string, string> | null })
                    .form_context as Record<string, string> | null) ?? {};
                const merged = { ...huidigeForm, ...form };
                await supabase
                  .from("prospects")
                  .update({ form_context: merged })
                  .eq("id", prospectId)
                  .eq("user_id", user.id);
              }
            } catch (err) {
              console.warn("prospect form_context opslaan mislukt:", err);
            }
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

          // Sla het zichtbare antwoord op in DB, zonder de systeem-blokken.
          if (gesprekId && zichtbaarAntwoord) {
            const nieuwBericht: ChatBericht = {
              role: "assistant",
              content: zichtbaarAntwoord,
              timestamp: new Date().toISOString(),
            };
            const alleBerichten = [...berichten, nieuwBericht];
            try {
              await supabase
                .from("ai_gesprekken")
                .update({
                  berichten: alleBerichten,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", gesprekId)
                .eq("user_id", user.id);
            } catch (err) {
              console.error("DB save fout:", err);
            }
          }

          // Alles opgeslagen, nu pas de stream sluiten.
          controller.close();
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

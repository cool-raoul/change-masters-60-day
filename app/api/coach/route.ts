import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { bouwCoachSysteemPrompt } from "@/lib/prompts/coach-systeem-prompt";
import { routeerVraag } from "@/lib/mentor/router";
import { taakVoor, isPostVerzoek } from "@/lib/mentor/taak-register";
import {
  detecteerKennismakingsRonde,
  bouwKennismakingPrompt,
} from "@/lib/mentor/kennismaking";
import { bouwSchrijfregelsSectie } from "@/lib/mentor/schrijfregels";
import { bouwCopywritingSectie } from "@/lib/mentor/copywriting";
import { bouwPostSchrijverPrompt } from "@/lib/mentor/post-schrijver-prompt";
import { haalMentorFreebies } from "@/lib/mentor/freebie-context";
import { bouwProspectExtraSectie } from "@/lib/mentor/context-motor";
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

    // Gezet zodra een gevalideerde ziekte/product-kennisrij in de prompt
    // gaat: dwingt het sterke model af + activeert de claim-waakhond
    // (veiligheids-audit 22 juli: het gevoeligste pad liep op het
    // goedkoopste model zonder controle).
    let kennisMatchActief = false;

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

    // Receptionist-router (fase 2 agent-architectuur): kleine LLM-call
    // classificeert de bedoeling; bij een storing beslist de oude regex.
    const routering = await routeerVraag(openai, berichten);
    let vraagType = routering.type;
    console.log(`mentor-router: ${vraagType} (via ${routering.via})`);

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
    // Kennismakings-ronde? Die wint van alles: het gesprek is dan een
    // profiel-opbouw-interview met een eigen prompt, geen coach-gesprek
    // en geen schrijfopdracht (ronde 2 vraagt om een geplakte post, dat
    // mag het post-vangnet niet triggeren).
    const kennismakingRonde = detecteerKennismakingsRonde(alleUserTekst);
    const isKennismaking = kennismakingRonde !== null;
    // Een herkenbaar post-verzoek gaat ALTIJD naar de schrijver-taak,
    // ongeacht wat de vraagtype-detectie gokte (Raoul's test bewees:
    // "ik wil een post schrijven..." classificeert als "social", en dan
    // kreeg de coach-rol de copywriting-kennis en gaf die als lesje terug).
    // Alleen "reel" blijft reel: dat is al een schrijver-taak.
    const taakId = isKennismaking
      ? "kennismaking"
      : vraagType !== "reel" && isPostVerzoek(alleUserTekst)
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
    // Eerder geschreven posts (leer-lus): de schrijver gebruikt ze om te
    // HERVERTELLEN en terug te verwijzen in plaats van te herhalen. Kern
    // van de vervolg-versie van de resultaten-reeks (lanceer-reis).
    let eerderePosts: { tekst: string; codewoord?: string | null }[] = [];
    if (isSchrijfPrompt) {
      try {
        mentorFreebies = await haalMentorFreebies(supabase, user.id);
      } catch (e) {
        console.warn("freebie-context ophalen mislukt:", e);
      }
      try {
        const { data: postRijen } = await supabase
          .from("mentor_posts")
          .select("tekst, codewoord")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4);
        eerderePosts = ((postRijen ?? []) as { tekst: string; codewoord: string | null }[])
          .reverse();
      } catch (e) {
        console.warn("eerdere mentor_posts ophalen mislukt:", e);
      }
    }
    let systeemPrompt = isKennismaking
      ? bouwKennismakingPrompt({
          voornaam: (profile.full_name || "").split(" ")[0] || "daar",
          taal: taal || "nl",
          rondeNummer: kennismakingRonde as number,
          mentorProfiel,
        })
      : isSchrijfPrompt
        ? bouwPostSchrijverPrompt({
            voornaam: (profile.full_name || "").split(" ")[0] || "daar",
            taal: taal || "nl",
            mentorProfiel,
            taakId: taak.id,
            freebies: mentorFreebies,
            eerderePosts,
          })
        : bouwCoachSysteemPrompt(
            profile, whyProfile, prospect, taal || "nl", vraagType, niveau, mentorProfiel
          );

    // Gevalideerde product-ervarings-kennis (Dr. McKee + jarenlange
    // teamervaring, validated by founder). Faalt stil bij fout zodat
    // coach blijft werken. Voor performance: alleen ophalen wanneer
    // er gevalideerde rijen zijn.
    if (!isSchrijfPrompt && !isKennismaking) {
      try {
        const {
          haalGevalideerdeKennis,
          formatKennisVoorPrompt,
          bevatNooitAdviesAandoening,
          bouwNooitAdviesBlok,
        } = await import("@/lib/cms/mentor-kennis");
        const gespreksTekst = berichten
          .filter((b) => b.role === "user")
          .slice(-3)
          .map((b) => String(b.content).toLowerCase())
          .join(" ");
        // Nooit-advies-aandoeningen (Crohn, colitis, diverticulitis,
        // diabetes type 1): GEEN kennis-rijen meesturen, wél het harde
        // geen-advies-blok + sterk model + waakhond (besluit Raoul 22 juli).
        if (bevatNooitAdviesAandoening(gespreksTekst)) {
          systeemPrompt += bouwNooitAdviesBlok();
          kennisMatchActief = true;
        } else {
          const kennisRijen = await haalGevalideerdeKennis();
          // (flag hieronder gezet bij een echte match)
          // Alleen de rijen meesturen die bij dit gesprek passen: sinds
          // de volledige validatie (127 rijen) maakte alles-tegelijk het
          // verzoek te groot (OpenAI 429 request-too-large, bug 21 juli)
          // en het is voor het antwoord ook niet nodig.
          const relevant = kennisRijen.filter((r) => {
            const termen = `${(r as { zoekterm?: string }).zoekterm ?? ""} ${(r as { oorspronkelijke_term?: string }).oorspronkelijke_term ?? ""}`
              .toLowerCase()
              .split(/[^a-zà-ÿ0-9]+/)
              .filter(
                (w) =>
                  w.length >= 4 &&
                  // Generieke woorden matchen elk gesprek en zouden
                  // willekeurige ziekte-rijen injecteren.
                  !["ziekte", "ziektes", "syndroom", "chronische", "chronisch", "klachten", "aandoening"].includes(w),
              );
            return termen.some((w) => gespreksTekst.includes(w));
          });
          if (relevant.length > 0) {
            systeemPrompt += formatKennisVoorPrompt(relevant.slice(0, 8));
            kennisMatchActief = true;
          }
        }
      } catch (e) {
        console.warn("mentor-kennis ophalen mislukt:", e);
      }
    }

    // Train-de-Mentor: voeg relevante founder-voorbeelden toe als
    // few-shot context. Faalt stilletjes als de tabel nog niet bestaat
    // (migratie nog niet gerund) zodat coach gewoon blijft werken.
    if (!isSchrijfPrompt && !isKennismaking) {
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

    // Context-motor: tags, freebie-check-uitslagen en film-kijkgedrag van
    // de gekozen prospect gaan mee het gesprek in (bleef eerder buiten de
    // prompt). Alleen voor coach-gesprekken; de post-schrijver werkt over
    // het lid zelf.
    if (!isSchrijfPrompt && !isKennismaking && prospect) {
      try {
        systeemPrompt += await bouwProspectExtraSectie(supabase, user.id, prospect);
      } catch (e) {
        console.warn("prospect-extra-context mislukt:", e);
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
      // Kennis-match = altijd het sterke model met ruimte voor de
      // volledige disclaimer; het claim-gevoeligste antwoord mag nooit
      // op het goedkoopste model of tegen een krap token-plafond lopen.
      model: kennisMatchActief ? "gpt-4o" : taak.model,
      max_tokens: kennisMatchActief
        ? Math.max(taak.maxTokens, 1600)
        : taak.maxTokens,
      messages: apiMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    let volledigAntwoord = "";

    // Merknaam-verbod (Raoul, 22 juli 2026): de naam mag de member nooit
    // bereiken, ook niet als het model de prompt-regel negeert. Vervang
    // deterministisch in de stream; de compliance-scan hieronder draait op
    // de ONgefilterde tekst zodat founders de poging alsnog gemeld krijgen.
    // Drie stappen zodat de zin leesbaar blijft: "het Lifeplus-advies" →
    // "het advies", "Lifeplus Daily BioBasics" → "Daily BioBasics", en
    // pas als laatste redmiddel een losse naam → "het merk".
    const zonderMerknaam = (t: string) =>
      t
        .replace(
          /\blife\s*-?\s*plus[-\s]?(advies|adviezen|assortiment|producten?|pakket(?:ten)?|supplementen?)\b/gi,
          "$1",
        )
        .replace(/\bLife\s*-?\s*[Pp]lus\s+(?=[A-Z])/g, "")
        .replace(/\blife\s*-?\s*plus\b/gi, "het merk");
    // Buffer tegen een merknaam die over een chunk-grens valt: de laatste
    // tekens gaan pas mee zodra er meer tekst is (of aan het einde).
    const MERK_BUFFER = 16;

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
              const zichtbaar = zonderMerknaam(
                zichtbaarTotMarker(volledigAntwoord),
              );
              const flushTot = Math.max(0, zichtbaar.length - MERK_BUFFER);
              if (flushTot > verzondenLengte) {
                controller.enqueue(
                  encoder.encode(zichtbaar.slice(verzondenLengte, flushTot)),
                );
                verzondenLengte = flushTot;
              }
            }
          }
          // Het zichtbare antwoord = alles vóór het eerste systeem-blok,
          // met de merknaam-vervanging erop (dit is wat de member zag).
          const zichtbaarEind = zonderMerknaam(
            zichtbaarTotMarker(volledigAntwoord),
          );
          if (zichtbaarEind.length > verzondenLengte) {
            controller.enqueue(
              encoder.encode(zichtbaarEind.slice(verzondenLengte)),
            );
            verzondenLengte = zichtbaarEind.length;
          }
          const zichtbaarAntwoord = zichtbaarEind.trimEnd();

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

          // Leer-lus (blok 4): een geleverde post/reel vastleggen zodat de
          // Mentor er later op kan terugkomen ("kreeg je post reacties?")
          // en goed scorende posts voorbeelden kunnen worden.
          if (isSchrijfPrompt && volledigAntwoord.includes("[POST]") && zichtbaarAntwoord) {
            try {
              const codewoord =
                /reageer met\s+([A-ZÀ-Ü]{2,20})/i.exec(zichtbaarAntwoord)?.[1] ??
                null;
              await supabase.from("mentor_posts").insert({
                user_id: user.id,
                gesprek_id: gesprekId || null,
                taak: taak.id,
                tekst: zichtbaarAntwoord,
                codewoord,
              });
            } catch (err) {
              console.warn("mentor_posts opslaan mislukt:", err);
            }
          }

          // Claim-bewaking (veiligheids-audit 22 juli): de regex-scan
          // draait nu op ELK zichtbaar antwoord, en bij een kennis-match
          // of productadvies kijkt ook een onafhankelijke AI-waakhond
          // mee. Verdachte antwoorden komen als controle-item op het
          // founder-kennis-scherm (zelfde meldpunt als de klant-Mentor)
          // met een push. We blokkeren niets; founders zien alles.
          if (zichtbaarAntwoord) {
            try {
              // Scan op de ONgefilterde tekst: een merknaam-poging is dan
              // zichtbaar voor de founders, ook al zag de member hem niet.
              const compliance = checkCompliance(
                zichtbaarTotMarker(volledigAntwoord).trimEnd(),
              );
              const regexFlags = compliance.ok
                ? ""
                : vatFlagsSamen(compliance.flags);
              const laatsteUserVraag = String(
                [...berichten].reverse().find((b) => b.role === "user")
                  ?.content ?? "",
              );
              let verdacht = false;
              let reden = "";
              if (kennisMatchActief || vraagType === "productadvies") {
                const check = await openai.chat.completions.create({
                  model: "gpt-4o-mini",
                  max_tokens: 150,
                  temperature: 0,
                  response_format: { type: "json_object" },
                  messages: [
                    {
                      role: "system",
                      content: `Je bent de claim-waakhond van een supplementen-Mentor (EU-regels: supplementen mogen geen medische claims). Beoordeel het antwoord. VERDACHT als het: (1) zegt of impliceert dat een product een ziekte geneest/behandelt/verhelpt/aanpakt, (2) doseringen of innameschema's geeft, (3) producten adviseert buiten het Lifeplus-assortiment of colloïdaal zilver inwendig adviseert, (4) een ziektenaam of aandoening laat staan BINNEN een [STUUR]...[/STUUR]-doorstuurblok, (5) bij een ziekte/aandoening-advies GEEN arts-disclaimer bevat, (6) de merknaam "Lifeplus" (elke schrijfwijze) in de zichtbare tekst noemt of een programma/product aan die merknaam koppelt, (7) producten, "goede ervaringen" of een programma noemt bij de ziekte van Crohn, colitis ulcerosa, diverticulitis of diabetes type 1 (daar geeft ELEVA NOOIT advies bij), (8) per product uitlegt wat het doet of waarbij het helpt (alleen namen opsommen is toegestaan). NIET verdacht: ervaring-taal ("veel mensen merken"), leefstijl-advies, aanwezige disclaimer, doorverwijzing naar arts, gespreks-coaching zonder producten. Twijfel = niet verdacht. Antwoord UITSLUITEND JSON: {"verdacht": true/false, "reden": "één zin"}`,
                    },
                    {
                      role: "user",
                      content: `VRAAG VAN DE MEMBER:\n${laatsteUserVraag.slice(0, 800)}\n\nANTWOORD VAN DE MENTOR:\n${volledigAntwoord.slice(0, 6000)}`,
                    },
                  ],
                });
                const uitslag = JSON.parse(
                  check.choices[0]?.message?.content ?? "{}",
                ) as { verdacht?: boolean; reden?: string };
                verdacht = uitslag.verdacht === true;
                reden = String(uitslag.reden ?? "");
              }
              if (verdacht || regexFlags) {
                const adminW = createAdminClient();
                await adminW.from("resetcode_kennis").insert({
                  programma: "algemeen",
                  vraag: (laatsteUserVraag || "(member-Mentor)").slice(0, 600),
                  bron: "controle",
                  gegeven_antwoord: zichtbaarAntwoord.slice(0, 2000),
                  controle_reden: (reden || `regex-scan: ${regexFlags}`).slice(
                    0,
                    300,
                  ),
                });
                const { data: founders } = await adminW
                  .from("profiles")
                  .select("id")
                  .eq("role", "founder");
                await Promise.allSettled(
                  ((founders ?? []) as { id: string }[]).map((f) =>
                    sendPushToUser(f.id, {
                      title: "Even meekijken 🔍 (member-Mentor)",
                      body: `Mogelijk claim-risico in een Mentor-antwoord op: "${laatsteUserVraag.slice(0, 90)}"`,
                      url: "/resetcode-kennis",
                      tag: "coach-waakhond",
                    }),
                  ),
                );
              }
            } catch (err) {
              console.warn("coach-waakhond mislukt:", err);
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
        // Debug/testbank: welke specialist behandelde dit, en hoe is
        // dat besloten (router of regex-vangnet). Geen persoonsdata.
        "X-Mentor-Taak": taak.id,
        "X-Mentor-Route": routering.via,
      },
    });
  } catch (error: any) {
    console.error("Coach API fout:", error?.message || error);
    // Clamp: een niet-HTTP foutcode zou de Response-constructor zelf
    // laten crashen en de echte fout maskeren.
    const ruw = Number(error?.status);
    const status =
      Number.isInteger(ruw) && ruw >= 400 && ruw <= 599 ? ruw : 500;
    const bericht =
      status === 401 ? "API sleutel ongeldig" :
      status === 402 ? "API credits op" :
      status === 429 ? "Te veel verzoeken, probeer over een minuut" :
      `Coach fout: ${error?.message || "onbekend"}`;
    return new Response(bericht, { status });
  }
}

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  pakResetKlantContext,
  bewaarResetChats,
} from "@/lib/resetcode/klant-links";

// ============================================================
// POST /api/resetcode/kcal
//
// De Mentor-calorieteller voor de laaddagen (vervangt FatSecret).
// De klant zegt of fotografeert wat hij eet; het sterke model
// beoordeelt of het bericht een eet-melding is en schat de kcal
// per onderdeel. Zo ja: loggen, dagtotaal berekenen en een warm
// bevestigings-antwoord teruggeven. Zo nee: { eten: false } en
// de client stuurt de vraag alsnog naar de gewone Mentor.
//
// Auth: klant-token, of ingelogde founder/tester (preview; dan
// wordt er niets gelogd en telt de client zelf lokaal mee).
//
// Body: { token?, vraag?, foto? }
// Response: { eten, actie, items, dagTotaal|null, antwoord }
// ============================================================

export const maxDuration = 60;

const DOEL_MIN = 3500;
const DOEL_MAX = 5000;

function vandaagNL(): string {
  // Datum in Nederlandse tijd (YYYY-MM-DD), zodat een avondmaaltijd om
  // 23:30 niet bij de volgende dag telt.
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response("OPENAI_API_KEY ontbreekt", { status: 500 });

    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined) ?? "";
    const vraag = ((body.vraag as string | undefined) ?? "").trim();
    const foto = typeof body.foto === "string" ? (body.foto as string) : null;
    // Lopend totaal van de client: nodig in de preview (geen database-log)
    // zodat de antwoord-tekst hetzelfde optelt als de teller-pill.
    const huidigTotaal = Math.max(
      0,
      Math.round(Number(body.huidigTotaal) || 0),
    );
    if (foto && (!foto.startsWith("data:image/") || foto.length > 6_000_000)) {
      return new Response("ongeldige foto", { status: 400 });
    }
    if (!vraag && !foto) return new Response("leeg bericht", { status: 400 });

    // Auth: token (echte klant) of founder/tester (preview).
    let klantCtx = null as Awaited<ReturnType<typeof pakResetKlantContext>>;
    if (token) {
      klantCtx = await pakResetKlantContext(token);
      if (!klantCtx || klantCtx.status !== "actief") {
        return new Response("Ongeldige link", { status: 401 });
      }
    } else {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return new Response("Niet ingelogd", { status: 401 });
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_tester")
        .eq("id", user.id)
        .maybeSingle();
      const p = profile as { role?: string | null; is_tester?: boolean | null } | null;
      if (!(p?.role === "founder" || p?.is_tester === true)) {
        return new Response("Geen toegang", { status: 403 });
      }
    }

    // Stap 1: gestructureerde beoordeling + schatting.
    const openai = new OpenAI({ apiKey });
    const systeem = `Je bent de calorieteller van een Nederlands voedingsprogramma tijdens de "laaddagen" (doel: ${DOEL_MIN}-${DOEL_MAX} kcal per dag, vooral gezonde vetten).
Beoordeel het bericht (en eventuele foto van eten of een verpakking):
- Is dit een melding van iets dat de persoon GEGETEN/GEDRONKEN heeft (of nu gaat eten)? Dan is het een eet-melding.
- Vragen ("mag ik...", "hoeveel kcal zit er in...?" zonder dat het gegeten is), twijfel of iets anders: GEEN eet-melding.
- Correcties op het laatst gemelde item ("dat was een grote", "haal die laatste weg") herken je ook.
Schat per gegeten onderdeel de kcal realistisch (Nederlandse porties; bij een verpakkingsfoto: lees de voedingswaarde af en reken de portie om).
Antwoord UITSLUITEND met JSON: {"eten": boolean, "actie": "toevoegen" | "verwijder_laatste", "items": [{"omschrijving": string, "kcal": number}]}
Bij geen eet-melding: {"eten": false, "actie": "toevoegen", "items": []}.`;

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: "text", text: vraag || "Zie de foto: dit heb ik gegeten." },
    ];
    if (foto) userContent.push({ type: "image_url", image_url: { url: foto } });

    const beoordeling = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 500,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systeem },
        { role: "user", content: userContent },
      ],
    });

    let uitkomst: {
      eten?: boolean;
      actie?: string;
      items?: { omschrijving?: string; kcal?: number }[];
    } = {};
    try {
      uitkomst = JSON.parse(beoordeling.choices[0]?.message?.content ?? "{}");
    } catch {
      uitkomst = {};
    }

    if (!uitkomst.eten) {
      return Response.json({ eten: false });
    }

    const items = (uitkomst.items ?? [])
      .filter((i) => i && typeof i.kcal === "number" && i.omschrijving)
      .map((i) => ({
        omschrijving: String(i.omschrijving).slice(0, 120),
        kcal: Math.max(0, Math.min(5000, Math.round(i.kcal as number))),
      }));

    const datum = vandaagNL();
    const admin = createAdminClient();
    let dagTotaal: number | null = null;

    if (klantCtx) {
      if (uitkomst.actie === "verwijder_laatste") {
        const { data: laatste } = await admin
          .from("resetcode_kcal_log")
          .select("id")
          .eq("link_id", klantCtx.linkId)
          .eq("datum", datum)
          .order("created_at", { ascending: false })
          .limit(1);
        if (laatste && laatste.length) {
          await admin
            .from("resetcode_kcal_log")
            .delete()
            .eq("id", (laatste[0] as { id: string }).id);
        }
      } else if (items.length) {
        await admin.from("resetcode_kcal_log").insert(
          items.map((i) => ({
            link_id: klantCtx!.linkId,
            datum,
            omschrijving: i.omschrijving,
            kcal: i.kcal,
          })),
        );
      }
      const { data: rijen } = await admin
        .from("resetcode_kcal_log")
        .select("kcal")
        .eq("link_id", klantCtx.linkId)
        .eq("datum", datum);
      dagTotaal = ((rijen ?? []) as { kcal: number }[]).reduce(
        (som, r) => som + r.kcal,
        0,
      );
    }

    // Stap 2: warm, deterministisch antwoord (geen tweede model-call).
    const geschat = items.reduce((s, i) => s + i.kcal, 0);
    const lijst = items
      .map((i) => `${i.omschrijving} (±${i.kcal} kcal)`)
      .join(", ");
    let antwoord: string;
    if (uitkomst.actie === "verwijder_laatste") {
      antwoord = `Gebeurd, de laatste melding is eruit gehaald.${dagTotaal !== null ? ` Je staat nu op ±${dagTotaal} kcal vandaag.` : ""}`;
    } else {
      const totaalTekst =
        dagTotaal !== null ? dagTotaal : huidigTotaal + geschat;
      const stand =
        totaalTekst >= DOEL_MIN
          ? `Je zit vandaag al op ±${totaalTekst} kcal, boven de ${DOEL_MIN}. Lekker bezig, aanvullen mag altijd! 💪`
          : `Daarmee sta je vandaag op ±${totaalTekst} kcal. Nog ${DOEL_MIN - totaalTekst} te gaan tot de ${DOEL_MIN}, blijf lekker dooreten (vooral gezonde vetten).`;
      antwoord = `Genoteerd: ${lijst}. ${stand}`;
    }

    // Gesprek bewaren (echte klant): melding + teller-antwoord.
    if (klantCtx) {
      await bewaarResetChats(klantCtx.linkId, [
        foto
          ? { van: "klant", soort: "foto", stationSlug: "laaddagen", tekst: vraag || "📷 (eten gemeld)" }
          : { van: "klant", soort: "tekst", stationSlug: "laaddagen", tekst: vraag },
        { van: "mentor", soort: "tekst", stationSlug: "laaddagen", tekst: antwoord },
      ]);
    }

    return Response.json({
      eten: true,
      actie: uitkomst.actie === "verwijder_laatste" ? "verwijder_laatste" : "toevoegen",
      items,
      dagTotaal,
      geschat,
      antwoord,
    });
  } catch (e) {
    console.error("resetcode kcal exception:", e);
    return new Response("Teller-fout", { status: 500 });
  }
}

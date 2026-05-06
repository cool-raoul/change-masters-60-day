import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

// Korte AI-call: destilleer uit vrije aantekeningen één korte
// situatie-zin van 5-10 woorden, bedoeld om in te vullen op de
// [situatie]-plek van het 3-weg-script. Bewust gpt-4o-mini, dit
// is een simpele samenvatting-taak en moet snel + goedkoop zijn.

export const maxDuration = 20;

const SYSTEEM = `Je krijgt vrije aantekeningen over een prospect. Je taak is daaruit één korte zin van 5 tot 10 woorden te destilleren die de actuele zoekvraag of behoefte van de prospect samenvat.

Deze zin wordt LETTERLIJK ingevuld op de [situatie]-plek in een 3-weg-script, in de zin: "Ze is op zoek naar [situatie]". De zin moet daar natuurlijk achter passen.

REGELS:
- 5 tot 10 woorden, niet meer
- Begin met een kleine letter
- Geen punt of leesteken aan het einde
- Geen bijzinnen, geen "want", geen "omdat"
- Geen losse feiten als leeftijd, datum of beroep, alleen de zoekvraag
- Schrijf in het Nederlands, ook al staan er Engelse woorden in de aantekeningen
- Als je geen duidelijke zoekvraag kunt vinden in de aantekeningen, antwoord dan exact: "geen duidelijke zoekvraag in aantekeningen"

VOORBEELDEN:
Aantekeningen: "45 jaar, zoekt meer energie, bekend van lagere school [24-4-2026] Zoekt financiële vrijheid, dat is zijn grootste drijfveer"
Antwoord: meer energie en financiële vrijheid

Aantekeningen: "Drukke moeder van 3, wil graag afvallen na zwangerschap, slaapt slecht"
Antwoord: afvallen en weer goed slapen

Aantekeningen: "Heeft eigen massagepraktijk, zoekt extra inkomstenstroom naast cliëntenwerk"
Antwoord: een extra inkomstenstroom naast haar praktijk

Geef ALLEEN de zin terug, niets anders. Geen aanhalingstekens, geen toelichting.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ fout: "OPENAI_API_KEY niet ingesteld" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ fout: "Niet ingelogd" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { notities }: { notities: string } = body;

    if (!notities || notities.trim().length < 3) {
      return new Response(
        JSON.stringify({ fout: "Geen aantekeningen om samen te vatten" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 60,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEEM },
        { role: "user", content: `Aantekeningen:\n${notities.trim()}` },
      ],
    });

    let situatie = (completion.choices[0]?.message?.content || "").trim();

    // Vangnet: strip aanhalingstekens, dubbele spaties, eventuele eindpunt
    situatie = situatie
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/, "")
      .trim();

    if (!situatie) {
      return new Response(
        JSON.stringify({ fout: "AI gaf geen antwoord" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ situatie }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const fout = err?.message || "onbekende fout";
    console.error("situatie-samenvatting fout:", fout);
    return new Response(JSON.stringify({ fout }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

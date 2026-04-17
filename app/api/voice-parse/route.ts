import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ fout: "OPENAI_API_KEY niet ingesteld" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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
    const { transcript, taal }: { transcript: string; taal?: string } = body;

    if (!transcript || transcript.trim().length < 3) {
      return new Response(JSON.stringify({ fout: "Geen transcript" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Haal bestaande prospects op voor naam-matching
    const { data: bestaandeProspects } = await supabase
      .from("prospects")
      .select("id, volledige_naam, pipeline_fase, notities")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false);

    const namenLijst = (bestaandeProspects || [])
      .map((p) => `- ${p.volledige_naam} (id: ${p.id}, fase: ${p.pipeline_fase})`)
      .join("\n");

    const vandaag = new Date().toISOString().split("T")[0];
    const taalNaam: Record<string, string> = {
      nl: "Nederlands", en: "Engels", fr: "Frans", es: "Spaans", de: "Duits", pt: "Portugees",
    };
    const taalLabel = taalNaam[taal || "nl"] || "Nederlands";

    const systeemPrompt = `Je bent een assistent die spraak-transcripten van een netwerkmarketing coach omzet naar gestructureerde acties in JSON.

Vandaag is: ${vandaag}
Taal van transcript: ${taalLabel}

BESTAANDE PROSPECTS / MEMBERS IN DE LIJST:
${namenLijst || "(nog geen prospects)"}

JOUW TAAK:
Lees het transcript en geef een JSON object terug met een lijst van acties. Elke actie heeft een "type" en bijbehorende velden.

MOGELIJKE ACTIES:

1. { "type": "nieuwe_prospect", "volledige_naam": "Pieter de Hoogh", "pipeline_fase": "prospect", "notities": "...", "relatie": "zus van Pieter de Hoogh" (optioneel) }
   - Gebruik als iemand nieuw is (niet in bestaande lijst)
   - pipeline_fase opties: "prospect", "uitgenodigd", "one_pager", "presentatie", "followup", "shopper", "member", "not_yet"
   - Als persoon net is ingeschreven als klant/lid: gebruik "member"
   - Als ze net een product hebben besteld maar geen lid zijn: "shopper"
   - Als nog in beginfase en open voor gesprek: "prospect"
   - Als uitgenodigd voor gesprek maar nog niet gehad: "uitgenodigd"
   - Als onbekende naam (bijv. "zus van Pieter"): gebruik beschrijvende naam zoals "Zus van Pieter de Hoogh"

2. { "type": "update_prospect", "prospect_id": "uuid-uit-lijst", "pipeline_fase": "member" (optioneel), "notities_toevoegen": "..." (optioneel) }
   - Gebruik als iemand al bestaat en alleen status/notitie verandert
   - Alleen velden meenemen die echt veranderen

3. { "type": "notitie", "prospect_naam": "Pieter de Hoogh", "notitie": "Start met basisproducten" }
   - Voor notities bij bestaande of net-aangemaakte prospects
   - Gebruik de naam zoals genoemd (de commit-stap matcht m aan een prospect)

4. { "type": "taak", "prospect_naam": "Pieter de Hoogh", "titel": "Aanbevelen bespreken", "vervaldatum": "2026-05-17" }
   - Voor todo's / herinneringen
   - vervaldatum in ISO formaat YYYY-MM-DD
   - "volgende maand" = ongeveer 30 dagen vanaf vandaag (${vandaag})
   - "volgende week" = 7 dagen vanaf vandaag
   - "morgen" = 1 dag vanaf vandaag
   - Als geen tijd genoemd: 7 dagen vanaf vandaag

BELANGRIJKE REGELS:
- Altijd lege arrays retourneren als er niks is
- ALTIJD valid JSON, geen markdown
- Als iemand al bestaat (naam match in lijst): gebruik update_prospect, niet nieuwe_prospect
- Fuzzy matching op namen: "Pieter" = "Pieter de Hoogh" als die al bestaat
- Neem notities altijd mee bij het aanmaken van een prospect als ze genoemd worden
- Taken alleen aanmaken als expliciet een vervolgactie genoemd wordt ("moet nog spreken", "volgende maand starten", etc.)
- Bij familie/relatie-info (bijv. "zijn zus"): neem dat op in notities van de nieuwe prospect en in het relatie-veld

OUTPUT FORMAT (exact zo):
{
  "samenvatting": "Korte 1-zin samenvatting van wat je begrepen hebt",
  "acties": [ ... lijst met actie-objecten ... ],
  "onduidelijk": [ "optionele lijst met vragen als iets niet helder is, bijv. 'Wat is de naam van de zus?'" ]
}`;

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systeemPrompt },
        { role: "user", content: transcript },
      ],
    });

    const antwoord = completion.choices[0]?.message?.content || "{}";

    let geparsed: any = {};
    try {
      geparsed = JSON.parse(antwoord);
    } catch {
      geparsed = { samenvatting: "Kon niet interpreteren", acties: [], onduidelijk: [] };
    }

    return new Response(
      JSON.stringify({
        transcript,
        samenvatting: geparsed.samenvatting || "",
        acties: Array.isArray(geparsed.acties) ? geparsed.acties : [],
        onduidelijk: Array.isArray(geparsed.onduidelijk) ? geparsed.onduidelijk : [],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Voice parse fout:", error?.message || error);
    return new Response(
      JSON.stringify({ fout: error?.message || "Onbekende fout" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

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

    // Haal openstaande herinneringen op
    const { data: openHerinneringen } = await supabase
      .from("herinneringen")
      .select("id, titel, vervaldatum, prospect_id")
      .eq("user_id", user.id)
      .eq("voltooid", false)
      .order("vervaldatum", { ascending: true })
      .limit(30);

    const herinneringenLijst = (openHerinneringen || [])
      .map((h) => `- id:${h.id} "${h.titel}" (${h.vervaldatum})`)
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

OPENSTAANDE HERINNERINGEN:
${herinneringenLijst || "(geen herinneringen)"}

JOUW TAAK:
Lees het transcript en beslis:

A) INTENTIE — wat wil deze persoon?
   - "data": alleen info over prospects/members vastleggen (bijv. "Pieter ingeschreven")
   - "coach": een vraag of reflectie voor de ELEVA mentor/coach (bijv. "Hoe ga ik om met bezwaar tijd?", "Ik voel me onzeker", "Help me met een DM")
   - "mixed": beide — feiten over een prospect PLUS een vraag om hulp ("Ik sprak Jan, hij zei geen tijd, hoe reageer ik?")

B) ACTIES — welke database-acties moeten gebeuren (alleen bij "data" of "mixed")

C) COACH_BERICHT — als intentie "coach" of "mixed": formuleer de vraag voor de mentor-coach in jij-vorm ("Hoe ga ik het beste om met het bezwaar 'geen tijd' van Jan?"). Als "data": null.

MOGELIJKE ACTIES:

1. { "type": "nieuwe_prospect", "volledige_naam": "Pieter de Hoogh", "pipeline_fase": "prospect", "notities": "...", "relatie": "zus van Pieter de Hoogh" (optioneel) }
   - Gebruik als iemand nieuw is (niet in bestaande lijst)
   - pipeline_fase opties: "prospect", "uitgenodigd", "one_pager", "presentatie", "followup", "shopper", "member", "not_yet"
   - Net ingeschreven als klant/lid: "member"
   - Product besteld, geen lid: "shopper"
   - Open voor gesprek: "prospect"
   - Uitgenodigd maar nog geen gesprek: "uitgenodigd"
   - Onbekende naam: beschrijvend zoals "Zus van Pieter de Hoogh"

2. { "type": "update_prospect", "prospect_id": "uuid-uit-lijst", "pipeline_fase": "member" (optioneel), "notities_toevoegen": "..." (optioneel) }
   - Iemand bestaat al en status/notitie verandert

3. { "type": "notitie", "prospect_naam": "Pieter de Hoogh", "notitie": "Start met basisproducten" }
   - Notitie bij bestaande of net-aangemaakte prospect

4. { "type": "taak", "prospect_naam": "Pieter de Hoogh", "titel": "Aanbevelen bespreken", "vervaldatum": "YYYY-MM-DD" }
   - Nieuwe herinnering/todo
   - "volgende maand" = +30 dagen, "volgende week" = +7 dagen, "morgen" = +1 dag
   - Als geen tijd genoemd: +7 dagen

5. { "type": "update_details", "prospect_id": "uuid-uit-lijst", "telefoon": "...", "email": "...", "instagram": "...", "facebook": "...", "prioriteit": "hoog|normaal|laag" }
   - Contact-gegevens bijwerken
   - Alleen velden invullen die genoemd worden

6. { "type": "contact_log", "prospect_naam": "Pieter de Hoogh", "contact_type": "dm|bel|presentatie|followup|notitie", "notities": "...", "nieuwe_fase": "..." (optioneel) }
   - Contact loggen dat plaatsvond (gesprek gehad, DM gestuurd, etc.)
   - "nieuwe_fase" als pipeline-fase verandert door contact

7. { "type": "stats_increment", "datum": "${vandaag}", "contacten_gemaakt": 1, "uitnodigingen": 0, "followups": 0, "presentaties": 0, "nieuwe_klanten": 0, "nieuwe_partners": 0 }
   - Dagelijkse telling verhogen (alleen voor gebruiker's eigen dagstats)
   - "Ik heb 3 mensen gesproken" → contacten_gemaakt: 3
   - "2 uitnodigingen gestuurd" → uitnodigingen: 2
   - Alleen niet-nul velden invullen. datum in YYYY-MM-DD (standaard vandaag)

8. { "type": "voltooi_herinnering", "herinnering_id": "uuid-uit-lijst" }
   - Bestaande herinnering als voltooid markeren
   - Matchen op naam + context uit herinneringen lijst

9. { "type": "update_herinnering", "herinnering_id": "uuid-uit-lijst", "nieuwe_vervaldatum": "YYYY-MM-DD" (optioneel), "nieuwe_titel": "..." (optioneel) }
   - Bestaande herinnering verzetten of titel wijzigen

10. { "type": "product_bestelling", "prospect_naam": "Pieter de Hoogh", "product_omschrijving": "Omega 3 + Basis pakket", "besteldatum": "YYYY-MM-DD" (optioneel, default vandaag), "notities": "..." (optioneel) }
   - Iemand heeft een product besteld
   - ALTIJD toevoegen als de gebruiker zegt dat iemand iets besteld heeft, ingeschreven heeft als klant, of producten heeft aangeschaft
   - Zet automatisch fase naar "shopper" als nog niet shopper/member
   - Systeem maakt automatisch opvolg-herinnering op +21 dagen

BELANGRIJKE REGELS:
- Altijd lege arrays retourneren als er niks is
- ALTIJD valid JSON, geen markdown
- Als iemand al bestaat (naam match in lijst): gebruik update_prospect, niet nieuwe_prospect
- Fuzzy matching op namen: "Pieter" = "Pieter de Hoogh" als die al bestaat
- Neem notities altijd mee bij het aanmaken van een prospect als ze genoemd worden
- Taken alleen aanmaken als expliciet een vervolgactie genoemd wordt ("moet nog spreken", "volgende maand starten", "opvolgen", "contacten", etc.)
- Bij familie/relatie-info (bijv. "zijn zus"): neem dat op in notities van de nieuwe prospect en in het relatie-veld

MULTI-ACTIE DENKEN — DIT IS BELANGRIJK:
Eén zin kan MEERDERE acties bevatten. Splits alles in aparte acties.

Voorbeeld 1: "Pieter heeft het basispakket besteld en zijn zus is geïnteresseerd, we moeten haar opvolgen"
→ [
    { "type": "update_prospect", "prospect_id": "<pieter-uuid>", "pipeline_fase": "shopper" } OF { "type": "nieuwe_prospect", "volledige_naam": "Pieter ...", "pipeline_fase": "shopper" },
    { "type": "product_bestelling", "prospect_naam": "Pieter ...", "product_omschrijving": "basispakket" },
    { "type": "nieuwe_prospect", "volledige_naam": "Zus van Pieter ...", "pipeline_fase": "prospect", "notities": "Interesse via Pieter", "relatie": "zus van Pieter ..." },
    { "type": "taak", "prospect_naam": "Zus van Pieter ...", "titel": "Opvolgen interesse zus Pieter", "vervaldatum": "<+7 dagen>" }
  ]

Voorbeeld 2: "Ik heb vandaag 3 mensen gesproken, Anna wil meedoen als klant, Marie twijfelt nog"
→ [
    { "type": "stats_increment", "contacten_gemaakt": 3 },
    { "type": "update_prospect"/"nieuwe_prospect" voor Anna → fase "shopper" of "member" },
    { "type": "update_prospect"/"nieuwe_prospect" voor Marie → fase "followup", notitie "twijfelt nog" }
  ]

REGELS BIJ MULTI-ACTIE:
- Noemt gebruiker bestelling/product/pakket/ingeschreven als klant? → ALTIJD product_bestelling actie
- Noemt gebruiker een familielid of onbekende persoon zonder volledige naam? → nieuwe_prospect met beschrijvende naam ("Zus van X", "Vriend van Y")
- Zegt gebruiker "opvolgen", "contacten", "bellen", "spreken", "terugkomen" + persoon? → taak actie aanmaken (ook al is de persoon net aangemaakt)
- Bij net-aangemaakte prospect: gebruik dezelfde naam als "prospect_naam" in andere acties zodat ze gematched worden
- Aantallen ("3 mensen gesproken", "2 uitgenodigd") → stats_increment actie toevoegen naast de andere acties

OUTPUT FORMAT (exact zo):
{
  "intentie": "data" | "coach" | "mixed",
  "samenvatting": "Korte 1-zin samenvatting van wat je begrepen hebt",
  "acties": [ ... lijst met actie-objecten ... ],
  "coach_bericht": "Vraag voor mentor in jij-vorm, of null bij intentie 'data'",
  "onduidelijk": [ "optionele lijst met vragen als iets niet helder is" ]
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

    const intentie = ["data", "coach", "mixed"].includes(geparsed.intentie)
      ? geparsed.intentie
      : "data";

    return new Response(
      JSON.stringify({
        transcript,
        intentie,
        samenvatting: geparsed.samenvatting || "",
        acties: Array.isArray(geparsed.acties) ? geparsed.acties : [],
        coach_bericht: geparsed.coach_bericht || null,
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

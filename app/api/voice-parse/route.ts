import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 45;

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

⚠️ KRITIEKE REGELS — HIER GAAT HET VAAK FOUT:

REGEL 1 — PIPELINE_FASE VERANDER JE (BIJNA) NOOIT
- Verander pipeline_fase ALLEEN als de gebruiker expliciet zegt dat iemand van status verandert.
- Expliciete signalen: "X is klant geworden", "Y heeft besteld/ingeschreven", "Z wil niet meer", "heeft afgezegd", "is partner geworden"
- "Opvolgen", "bellen", "spreken met", "nog contact zoeken" → GEEN fase-verandering! Dit is een taak.
- Iemand die al "member" of "shopper" is, blijft dat. Ga NOOIT terug naar "prospect", "followup" of "uitgenodigd".
- Bij twijfel: laat pipeline_fase weg uit de actie.

REGEL 2 — "OPVOLGEN" = TAAK, NIET FASE
Als gebruiker zegt "ik moet X opvolgen/bellen/spreken/contacten":
→ Maak een taak actie: { "type": "taak", "prospect_naam": "X", "titel": "Opvolgen: ...", "vervaldatum": "..." }
→ NIET: pipeline_fase = "followup". Followup is een aparte pipeline-stage voor mensen die nog niet besteld hebben.

REGEL 3 — BESTELLING VAN BESTAANDE KLANT
Als een bestaande member/shopper een nieuwe bestelling doet:
→ product_bestelling actie (altijd)
→ Laat pipeline_fase ONGEMOEID (hij blijft member/shopper)
→ Eventueel een taak voor opvolging als genoemd

REGEL 4 — NOTITIES KOPPELEN
Als gebruiker een notitie wil maken BIJ een bestaande persoon:
→ Gebruik 'notitie' actie (NIET update_prospect met notities_toevoegen tenzij het een status-update is)
→ Bij een taak kun je ook context meenemen in de titel

REGEL 5 — BESTAANDE FASES RESPECTEREN
Voor elke bestaande prospect in de lijst hierboven staat de HUIDIGE fase tussen haakjes. Ga hier NOOIT vanaf zonder expliciete reden in de tekst.

STANDAARD REGELS:
- Altijd lege arrays retourneren als er niks is
- ALTIJD valid JSON, geen markdown
- Als iemand al bestaat (naam match in lijst): gebruik de bestaande prospect_id, maak GEEN nieuwe
- Fuzzy matching op namen: "Pieter" = "Pieter de Hoogh" als die al bestaat
- Neem notities altijd mee bij het aanmaken van een prospect als ze genoemd worden
- Bij familie/relatie-info (bijv. "zijn zus"): neem dat op in notities van de nieuwe prospect en in het relatie-veld
- "volgende maand" = +30 dagen, "volgende week" = +7 dagen, "morgen" = +1 dag, "deze week" = +3 dagen, geen tijd genoemd = +7 dagen

VOORBEELDEN:

Voorbeeld A (goede case): "Petra de Voogd is al member. Ik wil een notitie maken om haar op te volgen om te spreken over haar bestelling van deze maand."
→ redenatie: "Petra is al member — NIET haar fase veranderen. Gebruiker wil (1) een notitie bij haar dossier, (2) een herinnering om haar op te volgen over haar bestelling."
→ acties: [
    { "type": "notitie", "prospect_naam": "Petra de Voogd", "notitie": "Opvolgen over bestelling van deze maand" },
    { "type": "taak", "prospect_naam": "Petra de Voogd", "titel": "Petra bellen over bestelling deze maand", "vervaldatum": "<+7 dagen>" }
  ]
→ FOUT zou zijn: pipeline_fase = "followup" toevoegen. Dat mag hier absoluut NIET.

Voorbeeld B (nieuwe klant + familie): "Pieter heeft het basispakket besteld en zijn zus is geïnteresseerd, we moeten haar opvolgen"
→ redenatie: "Pieter is nieuw of bestaand → als bestaand: product_bestelling (geen fase-wijziging als hij al shopper is). Als nieuw: nieuwe_prospect met fase shopper. Zus is nieuwe prospect. Opvolgen = taak."
→ acties: [
    { "type": "product_bestelling", "prospect_naam": "Pieter ...", "product_omschrijving": "basispakket" },
    { "type": "nieuwe_prospect", "volledige_naam": "Zus van Pieter ...", "pipeline_fase": "prospect", "notities": "Interesse via Pieter", "relatie": "zus van Pieter ..." },
    { "type": "taak", "prospect_naam": "Zus van Pieter ...", "titel": "Opvolgen interesse zus Pieter", "vervaldatum": "<+7 dagen>" }
  ]

Voorbeeld C (stats + mensen): "Ik heb vandaag 3 mensen gesproken, Anna wil meedoen als klant, Marie twijfelt nog"
→ redenatie: "3 contacten in stats, Anna wordt shopper/member (nieuw of bestaand), Marie twijfelt = notitie/taak, geen fase-verandering tenzij ze al bestaat als prospect."
→ acties: [
    { "type": "stats_increment", "contacten_gemaakt": 3 },
    { Anna: nieuwe_prospect met fase "shopper" OF product_bestelling als bestaand },
    { Marie: notitie "twijfelt nog" + eventueel taak voor opvolging }
  ]

MULTI-ACTIE REGELS:
- Noemt gebruiker bestelling/product/pakket/ingeschreven als klant? → product_bestelling actie
- Noemt gebruiker een familielid of onbekende persoon zonder volledige naam? → nieuwe_prospect met beschrijvende naam ("Zus van X", "Vriend van Y")
- Zegt gebruiker "opvolgen", "contacten", "bellen", "spreken", "terugkomen" + persoon? → taak actie aanmaken
- Bij net-aangemaakte prospect: gebruik dezelfde naam als "prospect_naam" in andere acties zodat ze gematched worden
- Aantallen ("3 mensen gesproken", "2 uitgenodigd") → stats_increment actie toevoegen

OUTPUT FORMAT (exact zo):
{
  "redenatie": "Stap-voor-stap: wat wil de gebruiker écht? Welke bestaande personen zijn genoemd en wat is hun huidige fase? Welke acties volgen hier logisch uit? Noem expliciet als je GEEN fase-verandering doet en waarom.",
  "intentie": "data" | "coach" | "mixed",
  "samenvatting": "Korte 1-zin samenvatting van wat je begrepen hebt",
  "acties": [ ... lijst met actie-objecten ... ],
  "coach_bericht": "Vraag voor mentor in jij-vorm, of null bij intentie 'data'",
  "onduidelijk": [ "optionele lijst met vragen als iets niet helder is" ]
}

BELANGRIJK: Begin altijd met de "redenatie" stap. Dit dwingt je om te denken vóór je acties genereert. Als je in je redenatie NIET expliciet een reden geeft voor een fase-verandering, dan mag je geen pipeline_fase in de actie opnemen.`;

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.1,
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

    // Server-side veiligheidscheck: voorkom ongewenste fase-regressie
    const faseRangorde: Record<string, number> = {
      prospect: 1,
      uitgenodigd: 2,
      one_pager: 3,
      presentatie: 4,
      followup: 5,
      not_yet: 6,
      shopper: 7,
      member: 8,
    };
    const prospectById = new Map(
      (bestaandeProspects || []).map((p: any) => [p.id, p])
    );

    const acties = Array.isArray(geparsed.acties) ? geparsed.acties : [];
    const waarschuwingen: string[] = [];

    for (const a of acties) {
      if (a?.type === "update_prospect" && a.pipeline_fase && a.prospect_id) {
        const bestaand: any = prospectById.get(a.prospect_id);
        if (bestaand) {
          const huidigRang = faseRangorde[bestaand.pipeline_fase] ?? 0;
          const nieuwRang = faseRangorde[a.pipeline_fase] ?? 0;
          // Blokkeer regressie van shopper/member naar lagere fase
          if (huidigRang >= 7 && nieuwRang < huidigRang) {
            waarschuwingen.push(
              `Fase-verandering geblokkeerd: ${bestaand.volledige_naam} is al ${bestaand.pipeline_fase}, AI wilde terugzetten naar ${a.pipeline_fase}.`
            );
            delete a.pipeline_fase;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        transcript,
        intentie,
        samenvatting: geparsed.samenvatting || "",
        redenatie: geparsed.redenatie || "",
        acties,
        coach_bericht: geparsed.coach_bericht || null,
        onduidelijk: Array.isArray(geparsed.onduidelijk) ? geparsed.onduidelijk : [],
        waarschuwingen,
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

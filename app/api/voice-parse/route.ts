import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_CATALOGUS_COMPACT } from "@/lib/lifeplus/producten";

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

LIFEPLUS PRODUCTCATALOGUS (officiële namen + aliassen tussen [haakjes]):
${PRODUCT_CATALOGUS_COMPACT}

Productnaam-regel: als de gebruiker een product noemt (ook via alias of verkorte naam), gebruik in "product_omschrijving" de OFFICIËLE naam uit deze lijst. Bijvoorbeeld: "basispakket" → "Daily BioBasics", "omega 3" → "OmeGold", "coq10" → "Co-Q-10 Plus". Als meerdere producten genoemd worden, combineer ze met " + " (bv. "Daily BioBasics + OmeGold"). Onbekend product → schrijf letterlijk wat de gebruiker zei.

INTELLIGENTE TRANSCRIPT-INTERPRETATIE (heel belangrijk!):
Het transcript komt uit spraakherkenning. Dat betekent:
- Namen kunnen verkeerd gehoord zijn ("Petra de voor" = "Petra de Voogd" in de lijst)
- Producten kunnen verkeerd gespeld zijn ("om ee gaot" = "OmeGold", "basis paket" = "basispakket")
- De gebruiker kan stotteren, zichzelf herhalen, of eerst iets fout zeggen en dan verbeteren

Interpreteer het transcript ALTIJD zo:

1. ZELFCORRECTIES — LAATSTE VERSIE WINT
   "Petra... eh nee, Pieter zei dat..." → de naam is Pieter, negeer Petra
   "Morgen... eh, overmorgen bellen" → overmorgen
   "100 euro... nee 150" → 150
   Signaalwoorden voor correctie: "eh nee", "ik bedoel", "sorry", "nee wacht", "eigenlijk"

2. HERHALINGEN / DENKPAUZES — CONSOLIDEER
   "Pieter... Pieter heeft vandaag..." → "Pieter heeft vandaag..."
   "ik heb ... eeh ... ik heb 3 mensen gesproken" → "ik heb 3 mensen gesproken"
   "Petra de de de Voogd" → "Petra de Voogd"
   Verwijder: "eh", "uhm", "uh", "ehm", "nou", "weet je", "zeg maar" (als puur vulwoord)

3. NAAM-MATCHING MET BESTAANDE LIJST
   Kijk FONETISCH naar de prospectlijst hierboven. Als de uitgesproken naam bijna klinkt als iemand in de lijst, gebruik die versie + het bestaande id. Voorbeelden:
   - "Petra de voor" / "Peetra" / "Pietra" → Petra de Voogd (als die in lijst staat)
   - "Arnoud" / "Arno" / "Arnold" → Arno Oerlemans (fuzzy match)
   - "de hoogte" / "de hoog" → "de Hoogh" (als achternaam bij prospect past)

4. LOGISCHE ZINSRECONSTRUCTIE
   Spraak is vaak stuk: "Jan eh... gesproken vanmiddag... bezwaar tijd weet je... followup volgende week".
   Construeer wat er logisch bedoeld werd: "Ik sprak Jan vanmiddag, hij noemde bezwaar tijd, followup volgende week." Gebruik die SCHONE versie voor de acties én zet hem in het "gecorrigeerd_transcript" veld.

5. PRODUCT-FONETIEK
   Ook producten fonetisch matchen: "life plus" / "life plus basis" / "biobasic" / "dagelijkse basics" → Daily BioBasics. "visolie" / "om ee gold" / "omega" → OmeGold.

6. ALS ONZEKER → NOEM IN "onduidelijk"
   Als de correctie raderwerk wordt (meerdere interpretaties mogelijk, geen fonetische match), schrijf in "onduidelijk" veld: "Ik hoorde 'X', bedoelde je Y of Z?"

Altijd een "gecorrigeerd_transcript" teruggeven: de schone, logische versie zoals jij hem begreep. Dit is wat de gebruiker straks ziet op het bevestigingsscherm.

JOUW TAAK:
Lees het transcript en beslis:

A) INTENTIE — wat wil deze persoon?
   - "data": alleen info over prospects/members vastleggen (bijv. "Pieter ingeschreven")
   - "coach": een vraag of reflectie voor de ELEVA mentor/coach (bijv. "Hoe ga ik om met bezwaar tijd?", "Ik voel me onzeker", "Help me met een DM")
   - "mixed": beide — feiten over een prospect PLUS een vraag om hulp ("Ik sprak Jan, hij zei geen tijd, hoe reageer ik?")

B) ACTIES — welke database-acties moeten gebeuren (alleen bij "data" of "mixed")

C) COACH_BERICHT — als intentie "coach" of "mixed": formuleer de vraag voor de mentor-coach in jij-vorm ("Hoe ga ik het beste om met het bezwaar 'geen tijd' van Jan?"). Als "data": null.

C2) COACH_PROSPECT_ID + COACH_PROSPECT_NAAM — VERPLICHT invullen als de coach-vraag duidelijk over een bestaande persoon uit de prospectlijst gaat.
   - Voorbeeld: "Wat is een goed productadvies voor Petra de Voogd?" → coach_prospect_id = het id van Petra uit de lijst hierboven, coach_prospect_naam = "Petra de Voogd", coach_bericht = "Geef een Lifeplus-productadvies voor Petra de Voogd."
   - Ook bij indirecte vorm: "Ik wil voor Arno een advies", "Maak een advies voor Marieke", "Productadvies Petra" → koppel aan die prospect.
   - Fonetisch matchen: "Petra de voor" / "Pietra" → Petra de Voogd als die in lijst staat.
   - Als er GEEN naam genoemd is of de naam matcht niemand: zet beide velden op null.
   - Als naam matcht maar 1 karakter afwijkt van bestaande prospect: gebruik bestaande id (fuzzy).
   - Bij multi-naam in coach-vraag: kies de naam waarvoor de vraag duidelijk bedoeld is (de "voor X" naam).
   - Format: { "coach_prospect_id": "uuid-uit-lijst-of-null", "coach_prospect_naam": "Volledige naam of null" }

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

REGEL 0 — BESTELLING = ALTIJD APART product_bestelling ACTIE
Als de gebruiker ook maar IETS zegt over wat iemand besteld heeft, gekocht heeft, ingeschreven heeft als lid, product aangeschaft heeft, of welke producten dan ook gekoppeld aan een persoon:
→ ALTIJD een aparte { "type": "product_bestelling", ... } actie genereren.
→ NOOIT de bestelling alleen in het "notities" veld van een prospect stoppen. De bestelling moet ALTIJD als losse actie komen.
→ Dit geldt OOK als de persoon nieuw is. Dan krijg je DRIE acties:
   1. nieuwe_prospect (met fase "member" of "shopper")
   2. product_bestelling (met het product + datum)
   3. eventueel taak voor opvolging

Waarom belangrijk: elke bestelling activeert een database-trigger die automatisch 3 opvolg-herinneringen plaatst (21, 51, 81 dagen later). Zonder product_bestelling actie gebeurt dat niet en mist de gebruiker al zijn opvolgingen.

Signaalwoorden die ALTIJD product_bestelling vereisen:
- "heeft [product] besteld"
- "heeft [product] gekocht/aangeschaft"
- "is klant/member geworden met [product]"
- "heeft ingeschreven als klant met [product]"
- "starterpakket / basispakket / welk product dan ook"
- "heeft vandaag/gisteren/op [datum] [product] genomen"

Datum: als gebruiker zegt "vandaag" → vandaag. "Gisteren" → -1 dag. "Vorige week" → -7 dagen. Geen datum genoemd → vandaag.

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

Voorbeeld 0 (nieuwe member met bestelling — HEEL BELANGRIJK):
"Ik heb Arno Oerlemans net ingeschreven als member, hij heeft gisteren het basispakket besteld"
→ redenatie: "Arno is nieuw → nieuwe_prospect met fase 'member'. Hij heeft besteld → APARTE product_bestelling actie (de trigger zorgt voor 21/51/81 dagen reminders). Bestelling NIET alleen in notities zetten."
→ acties: [
    { "type": "nieuwe_prospect", "volledige_naam": "Arno Oerlemans", "pipeline_fase": "member" },
    { "type": "product_bestelling", "prospect_naam": "Arno Oerlemans", "product_omschrijving": "basispakket", "besteldatum": "<gisteren YYYY-MM-DD>" }
  ]
→ FOUT zou zijn: alleen een nieuwe_prospect actie met "basispakket besteld op ..." in notities. Dan worden er GEEN opvolg-herinneringen gemaakt.

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
  "gecorrigeerd_transcript": "De schone, logische versie van wat de gebruiker bedoelde. Stotteringen/vulwoorden eruit, zelfcorrecties toegepast, namen en producten gematcht tegen de lijsten. Als er niks te corrigeren valt: letterlijk het origineel.",
  "intentie": "data" | "coach" | "mixed",
  "samenvatting": "Korte 1-zin samenvatting van wat je begrepen hebt",
  "acties": [ ... lijst met actie-objecten ... ],
  "coach_bericht": "Vraag voor mentor in jij-vorm, of null bij intentie 'data'",
  "coach_prospect_id": "uuid-uit-prospects-lijst als coach-vraag over bestaande prospect gaat, anders null",
  "coach_prospect_naam": "Volledige naam van die prospect of null",
  "onduidelijk": [ "optionele lijst met vragen als iets niet helder is" ]
}

BELANGRIJK: Begin altijd met de "redenatie" stap. Dit dwingt je om te denken vóór je acties genereert. Als je in je redenatie NIET expliciet een reden geeft voor een fase-verandering, dan mag je geen pipeline_fase in de actie opnemen.`;

    const openai = new OpenAI({ apiKey });

    // Model-router: simpele korte gevallen -> gpt-4o-mini (~15x goedkoper).
    // Zodra er bestel-signalen, meerdere namen, stotter/zelfcorrectie, of lange tekst in zit -> gpt-4o.
    const kritiekeSignalen = /\b(besteld|gekocht|pakket|ingeschreven|member|klant|shopper|partner|opvolgen|afgezegd|wil niet|stopt|starterpakket|basispakket|shake)\b/i;
    const stotterSignalen = /\b(eh+|uhm+|uh+|ehm+|hmm+|eigenlijk|ik bedoel|nee wacht|sorry|nou eh)\b/i;
    const dubbelWoord = /\b(\w{3,})\s+\1\b/i; // zelfde woord twee keer achter elkaar
    const lengte = transcript.trim().length;
    const aantalNamen = (bestaandeProspects || []).filter((p: any) =>
      new RegExp(`\\b${p.volledige_naam.split(" ")[0]}\\b`, "i").test(transcript)
    ).length;
    const gebruikMini =
      lengte < 140 &&
      !kritiekeSignalen.test(transcript) &&
      !stotterSignalen.test(transcript) &&
      !dubbelWoord.test(transcript) &&
      aantalNamen <= 1;
    const gekozenModel = gebruikMini ? "gpt-4o-mini" : "gpt-4o";

    const completion = await openai.chat.completions.create({
      model: gekozenModel,
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

    // Detecteer: notities met bestel-signaal zonder bijbehorende product_bestelling
    const bestelTrefwoorden = /\b(besteld|gekocht|pakket|ingeschreven als (klant|member|lid)|shakes?|producten?)\b/i;
    const bestellingNamen = new Set(
      acties
        .filter((a: any) => a?.type === "product_bestelling" && a.prospect_naam)
        .map((a: any) => a.prospect_naam.toLowerCase())
    );

    for (const a of acties) {
      if (a?.type === "nieuwe_prospect" && a.notities && bestelTrefwoorden.test(a.notities)) {
        const naam = (a.volledige_naam || "").toLowerCase();
        if (!bestellingNamen.has(naam)) {
          waarschuwingen.push(
            `${a.volledige_naam || "Nieuwe prospect"} heeft mogelijk een bestelling genoemd in notities maar er is geen product_bestelling actie. Check handmatig.`
          );
        }
      }
      if (a?.type === "notitie" && a.notitie && bestelTrefwoorden.test(a.notitie)) {
        const naam = (a.prospect_naam || "").toLowerCase();
        if (!bestellingNamen.has(naam)) {
          waarschuwingen.push(
            `Notitie bij ${a.prospect_naam} bevat bestel-woorden maar er is geen product_bestelling actie. Check handmatig.`
          );
        }
      }
    }

    // Duplicate-detectie: nieuwe prospect die fonetisch/letterlijk lijkt op bestaande
    const normaliseer = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const levenshtein = (a: string, b: string): number => {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
        new Array(b.length + 1).fill(0)
      );
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const kost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + kost
          );
        }
      }
      return matrix[a.length][b.length];
    };

    const similarity = (a: string, b: string): number => {
      const max = Math.max(a.length, b.length);
      if (max === 0) return 1;
      return 1 - levenshtein(a, b) / max;
    };

    for (const a of acties) {
      if (a?.type !== "nieuwe_prospect" || !a.volledige_naam) continue;
      const nieuwNorm = normaliseer(a.volledige_naam);
      if (!nieuwNorm || nieuwNorm.length < 3) continue;

      let besteMatch: { naam: string; score: number; fase: string } | null = null;
      for (const p of bestaandeProspects || []) {
        const bestaandNorm = normaliseer(p.volledige_naam);
        if (!bestaandNorm) continue;
        const score = similarity(nieuwNorm, bestaandNorm);
        if (score >= 0.85 && (!besteMatch || score > besteMatch.score)) {
          besteMatch = { naam: p.volledige_naam, score, fase: p.pipeline_fase };
        }
      }

      if (besteMatch) {
        const percentage = Math.round(besteMatch.score * 100);
        waarschuwingen.push(
          `Mogelijk duplicaat: "${a.volledige_naam}" lijkt ${percentage}% op bestaande "${besteMatch.naam}" (${besteMatch.fase}). Check of je dezelfde persoon bedoelt.`
        );
      }
    }

    // Fallback fuzzy-match voor coach_prospect als LLM het niet heeft ingevuld
    let coachProspectId: string | null = typeof geparsed.coach_prospect_id === "string" ? geparsed.coach_prospect_id : null;
    let coachProspectNaam: string | null = typeof geparsed.coach_prospect_naam === "string" ? geparsed.coach_prospect_naam : null;

    if ((intentie === "coach" || intentie === "mixed") && !coachProspectId) {
      const tekstOmTeScannen = `${geparsed.coach_bericht || ""} ${geparsed.gecorrigeerd_transcript || transcript}`.toLowerCase();
      let beste: { id: string; naam: string; score: number } | null = null;
      for (const p of bestaandeProspects || []) {
        const volledig = p.volledige_naam.toLowerCase();
        const voornaam = volledig.split(" ")[0] || "";
        if (voornaam.length < 3) continue;
        if (tekstOmTeScannen.includes(volledig)) {
          beste = { id: p.id, naam: p.volledige_naam, score: 1 };
          break;
        }
        if (new RegExp(`\\b${voornaam}\\b`, "i").test(tekstOmTeScannen)) {
          const score = similarity(normaliseer(voornaam), normaliseer(tekstOmTeScannen.slice(0, 80)));
          if (!beste || score > beste.score) beste = { id: p.id, naam: p.volledige_naam, score };
        }
      }
      if (beste) {
        coachProspectId = beste.id;
        coachProspectNaam = beste.naam;
      }
    }

    return new Response(
      JSON.stringify({
        transcript,
        gecorrigeerd_transcript: geparsed.gecorrigeerd_transcript || transcript,
        intentie,
        samenvatting: geparsed.samenvatting || "",
        redenatie: geparsed.redenatie || "",
        acties,
        coach_bericht: geparsed.coach_bericht || null,
        coach_prospect_id: coachProspectId,
        coach_prospect_naam: coachProspectNaam,
        onduidelijk: Array.isArray(geparsed.onduidelijk) ? geparsed.onduidelijk : [],
        waarschuwingen,
        model_gebruikt: gekozenModel,
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

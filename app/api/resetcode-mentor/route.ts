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
import { checkCompliance, vatFlagsSamen } from "@/lib/coach/compliance-check";

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

// 120s budget: de eindcheck kan twee volledige AI-rondes vergen
// (antwoord + herschrijving) en bij trage OpenAI-momenten paste dat
// niet altijd in 60s (504 bij de klant, 29 juli). Vercel staat >60s
// toe met Fluid Compute.
export const maxDuration = 120;

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
      // Profiel-antwoorden (veg/sport) reizen mee via de touchpoints op
      // de klant-link: één keer gekozen = de Mentor weet het overal.
      profielVeg: klantCtx?.touchpoints.includes("profiel-veg") ?? false,
      profielSport: klantCtx?.touchpoints.includes("profiel-sport") ?? false,
    });

    // Klant-vraag meteen bewaren (ongeacht of de AI-call slaagt).
    // "[dagtip]" en "[zware-dag]" zijn interne systeem-verzoeken (na de
    // check-in), geen klant-berichten: niet in het gesprek-log zetten.
    const isDagtip = vraag === "[dagtip]" || vraag === "[zware-dag]";
    if (klantCtx && !isDagtip) {
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
    // Ruime antwoord-limiet (feedback Raoul 25 juli): recepten en
    // weekmenu's moeten zo compleet kunnen zijn als ChatGPT zelf zou
    // geven; de oude 700 knelde en maakte de Mentor summier.
    const maxTokens = foto || vraag.length > ZWAAR_MODEL_DREMPEL_TEKENS ? 1800 : 1200;

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
    // Zelfcorrectie vóór verzending (feedback Raoul 29 juli): ALLE
    // tekst-antwoorden worden eerst in hun geheel binnengehaald en
    // gecontroleerd, en gaan pas daarna naar de klant. Zo bereikt een
    // fout antwoord (kikkererwten in fase 2, een claim, verzonnen
    // regels) de klant niet meer, en hoeft Raoul niets achteraf te
    // corrigeren. Alleen foto-antwoorden streamen nog live: de
    // etiket-analyse valt per definitie buiten het materiaal.
    const bufferVoorCheck = !foto;
    // Menu's en recepten krijgen ALTIJD de strenge eindcheck met het
    // sterke model: de live-test van 29 juli bewees dat de goedkope
    // waakhond een fout menu kan goedkeuren (zeker als de klant zelf om
    // een verboden ingrediënt vraagt), en juist menu's zaten er in de
    // praktijk het vaakst naast.
    const isMenuVraag =
      !isDagtip &&
      !foto &&
      /week ?menu|dag ?menu|\bmenu\b|recept|maaltijdplan|eetschema|weekschema|boodschappenlijst/i.test(
        vraag,
      );
    // Merknaam-verbod (Raoul, 22 juli 2026): de naam mag de klant nooit
    // bereiken, ook niet als het model de prompt-regel negeert. Vervang
    // deterministisch in de stream, met een kleine buffer tegen een
    // merknaam die over een chunk-grens valt; de waakhond hieronder kijkt
    // naar de ONgefilterde tekst zodat founders de poging gemeld krijgen.
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
    const MERK_BUFFER = 16;
    const readable = new ReadableStream({
      async start(controller) {
        // Buiten de try, zodat de catch een half ontvangen antwoord
        // alsnog kan bewaren.
        let volledig = "";
        try {
          let verzonden = 0;
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              volledig += text;
              // Tekst-antwoorden worden NIET live gestreamd: het antwoord
              // gaat eerst door de eindcheck hieronder en pas daarna in
              // één keer naar de klant.
              if (bufferVoorCheck) continue;
              const gefilterd = zonderMerknaam(volledig);
              const flushTot = Math.max(0, gefilterd.length - MERK_BUFFER);
              if (flushTot > verzonden) {
                controller.enqueue(
                  encoder.encode(gefilterd.slice(verzonden, flushTot)),
                );
                verzonden = flushTot;
              }
            }
          }
          // Eindcheck vóór verzending, in twee trappen zodat de goede
          // antwoorden (de overgrote meerderheid) snel en goedkoop
          // blijven. Trap 1: de goedkope waakhond (mini) + merknaam- en
          // regex-scan over het complete antwoord. Trap 2: alleen als
          // trap 1 iets ziet, schrijft het sterke model het antwoord
          // opnieuw binnen alle regels (fase-lijsten, profiel, claims),
          // en gaat de herschreven versie naar de klant. Teamvragen
          // slaan we over: dat is al een eerlijk "weet ik niet".
          let restProbleem = "";
          if (
            bufferVoorCheck &&
            volledig.trim() &&
            !volledig.includes("[[TEAMVRAAG]]")
          ) {
            // Deterministische alarm-scan (Raoul 29 juli: rode paprika
            // kwam nog door in een darm-recept). Bekende overtreders per
            // programma triggeren ALTIJD de strenge controle. Let op:
            // een treffer is nog geen fout - het woord mag voorkomen in
            // een uitleg wáárom iets niet mag; de strenge check
            // beoordeelt de context.
            const VERBODEN_SCAN: { test: RegExp; label: string }[] =
              programmaSlug === "darm"
                ? [
                    { test: /paprika/i, label: "paprika (nachtschade)" },
                    { test: /aubergine/i, label: "aubergine (nachtschade)" },
                    { test: /tomaten(?!puree)|\btomaat\b/i, label: "tomaat (nachtschade)" },
                    { test: /chili|spaanse peper|cayenne/i, label: "hete peper (nachtschade)" },
                    { test: /quinoa/i, label: "quinoa (vermijd-lijst)" },
                    { test: /seitan/i, label: "seitan (tarwe)" },
                    { test: /havermout|\bhaver\b/i, label: "haver (gluten-lijst)" },
                    { test: /couscous|bulgur|\bspelt\b/i, label: "glutengraan" },
                    { test: /varkens|\bspek\b|bacon/i, label: "varkensvlees" },
                  ]
                : programmaSlug === "reset" && stationSlug === "omschakeling"
                  ? [
                      { test: /kikkererwt/i, label: "kikkererwten (peulvrucht)" },
                      { test: /\blinzen\b/i, label: "linzen (peulvrucht)" },
                      { test: /quorn/i, label: "quorn (niet in de tabel)" },
                      { test: /tempeh/i, label: "tempeh (niet in de tabel)" },
                      { test: /havermout|muesli/i, label: "havermout/muesli" },
                      { test: /\bbanaan|bananen/i, label: "banaan" },
                      { test: /pindakaas|\bnoten\b|walnoot|amandel/i, label: "noten" },
                      { test: /olijfolie|kokosolie|roomboter|avocado/i, label: "vetten" },
                    ]
                  : [];
            const verbodenScan = (tekst: string) =>
              VERBODEN_SCAN.filter((v) => v.test.test(tekst))
                .map((v) => v.label)
                .join(", ");
            const beoordeel = async (tekst: string): Promise<string> => {
              if (/\blife\s*-?\s*plus\b/i.test(tekst)) {
                return "merknaam Lifeplus in antwoord (regex-scan)";
              }
              const check = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                max_tokens: 150,
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                  {
                    role: "system",
                    content: bouwWaakhondPrompt(
                      programmaSlug,
                      teamKennis,
                      ctxVoorOpslag?.memberVoornaam ?? null,
                    ),
                  },
                  {
                    role: "user",
                    content: `VRAAG VAN DE KLANT:\n${vraag}\n\nANTWOORD VAN DE MENTOR:\n${tekst}\n\nKALIBRATIE: markeer alleen als het antwoord ECHT buiten het materiaal gaat of een risico vormt (verboden ingrediënt aangeraden, medische claim, verzonnen regel of dienst, merknaam). Normale programma-uitleg - fase-regels, "met mate"-adviezen, waarom iets wel of niet op de lijst staat, warme aanmoediging - is NIET verdacht. Elke onterechte markering kost de klant lange wachttijd.`,
                  },
                ],
              });
              const uitslag = JSON.parse(
                check.choices[0]?.message?.content ?? "{}",
              ) as { verdacht?: boolean; reden?: string };
              if (uitslag.verdacht === true) {
                return uitslag.reden || "verdacht volgens waakhond";
              }
              const flags = vatFlagsSamen(
                checkCompliance(tekst).flags.filter(
                  (f) =>
                    f.categorie !== "dosering" && f.categorie !== "merknaam",
                ),
              );
              return flags ? `regex-scan: ${flags}` : "";
            };
            try {
              // Menu's en scan-treffers: sla de goedkope trap over en
              // dwing altijd de strenge herschrijf-check af; overige
              // vragen: eerst de goedkope waakhond.
              const treffers = verbodenScan(volledig);
              const reden =
                isMenuVraag || treffers
                  ? `menu-controle: loop elk ingrediënt, elke maaltijd en elk advies woord voor woord na tegen de OFFICIËLE lijst van het programma en de fase waar de klant nu in zit, plus het profiel (vegetarisch/vegan, sport). De lijst is bindend: wat er niet op staat mag er NIET in (bij reset-fase 2 bijvoorbeeld geen tempeh, quorn, kikkererwten of andere peulvruchten; in Darmen in Balans geen enkele nachtschade zoals tomaat, paprika of aubergine - kijk altijd naar de lijst van het programma van deze klant). Ook niet toestaan als de klant er zelf om vraagt: leg dan kort en warm uit dat het in dit programma niet past en geef een toegestaan alternatief.${treffers ? ` EXTRA ALARM: het antwoord noemt "${treffers}". Controleer of die woorden uitsluitend voorkomen in een uitleg wáárom ze niet mogen; staan ze in een gerecht, schema, boodschappenlijst of aanbeveling, dan MOET je herschrijven.` : ""}`
                  : await beoordeel(volledig);
              if (reden) {
                const correctieStream = await openai.chat.completions.create({
                  model,
                  max_tokens: maxTokens,
                  temperature: 0,
                  stream: true,
                  messages: [
                    { role: "system", content: systeemPrompt },
                    { role: "user", content: vraag },
                    { role: "assistant", content: volledig },
                    {
                      role: "user",
                      content: `[eindcheck] Dit is een interne controle van het systeem, geen klant-bericht. Controlepunt voor je antwoord hierboven: "${reden}". Klopt er iets niet, schrijf dan het VOLLEDIGE antwoord opnieuw, nu volledig binnen je instructies (fase-regels en toegestane ingrediënten, profiel van de klant, claims-grenzen, kennis-grens): zelfde warme toon en opbouw, zonder het probleem of deze controle te benoemen. Weet je iets echt niet zeker uit het materiaal, gebruik dan gewoon je normale weet-niet-route. Is het antwoord al helemaal in orde, antwoord dan met exact [OK] en verder niets.`,
                    },
                  ],
                });
                // De herschrijving wordt LIVE doorgestreamd (Raoul 29
                // juli: de stilte duurde anders 30-60 seconden en liep
                // soms tegen de Vercel-limiet van 60s aan → time-out).
                // Alleen de eerste paar tekens houden we vast om het
                // [OK]-protocol te herkennen: zegt het model [OK], dan
                // was het origineel goed en sturen we dát.
                let beter = "";
                let okDetectie = true;
                for await (const chunk of correctieStream) {
                  const t = chunk.choices[0]?.delta?.content || "";
                  if (!t) continue;
                  beter += t;
                  if (okDetectie) {
                    if (beter.trimStart().startsWith("[OK]")) break;
                    if (beter.trimStart().length < 4) continue;
                    okDetectie = false;
                  }
                  const gefilterd = zonderMerknaam(beter);
                  const flushTot = Math.max(0, gefilterd.length - MERK_BUFFER);
                  if (flushTot > verzonden) {
                    controller.enqueue(
                      encoder.encode(gefilterd.slice(verzonden, flushTot)),
                    );
                    verzonden = flushTot;
                  }
                }
                if (beter.trimStart().startsWith("[OK]")) {
                  // Sterke model keurde het origineel goed: laten staan
                  // (er is nog niets verzonden, de eind-flush stuurt het).
                } else if (beter) {
                  volledig = beter;
                } else {
                  restProbleem = reden;
                }
              }
            } catch (e) {
              console.error("eindcheck vóór verzending mislukt:", e);
            }
          }
          const gefilterdEind = zonderMerknaam(volledig);
          if (gefilterdEind.length > verzonden) {
            controller.enqueue(encoder.encode(gefilterdEind.slice(verzonden)));
            verzonden = gefilterdEind.length;
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
          // ruwSchoon = wat het model zei (voor waakhond/detectie);
          // schoon = wat de klant zag (merknaam al vervangen), voor opslag.
          const ruwSchoon = volledig.replaceAll("[[TEAMVRAAG]]", "").trimEnd();
          const schoon = zonderMerknaam(ruwSchoon);
          if (ctxVoorOpslag && schoon) {
            try {
              // dedupe:false — het 300-antwoorden-quotum telt bewaarde
              // mentor-rijen; wegdedupen zou de teller ondermijnen.
              await bewaarResetChats(
                ctxVoorOpslag.linkId,
                [{ van: "mentor", soort: "tekst", stationSlug, tekst: schoon }],
                { dedupe: false },
              );
            } catch (e) {
              console.error("resetcode chat opslaan mislukt:", e);
            }
          }
          if (isTeamvraag && ctxVoorOpslag && vraag) {
            try {
              const adminT = createAdminClient();
              // Dedupe (agent-jacht 29 juli): dezelfde open vraag van
              // dezelfde klant niet dubbel in de kennis-lus + geen
              // dubbele founder-push.
              const { data: alOpen } = await adminT
                .from("resetcode_kennis")
                .select("id")
                .eq("link_id", ctxVoorOpslag.linkId)
                .eq("vraag", vraag.slice(0, 600))
                .eq("status", "open")
                .limit(1);
              if (!alOpen || alOpen.length === 0) {
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
              }
            } catch (e) {
              console.error("resetcode kennis-vraag opslaan mislukt:", e);
            }
          } else if (ctxVoorOpslag && vraag && schoon && restProbleem) {
            // VANGNET: de zelfcorrectie hierboven heeft het antwoord al
            // herschreven, maar de hercheck vond nóg steeds een probleem.
            // Alleen dan komt er een controle-item + founder-push;
            // gecorrigeerde antwoorden maken geen ruis meer (feedback
            // Raoul 29 juli: niet achteraf een stapel om door te nemen).
            try {
              const adminW = createAdminClient();
              const { error: wFout } = await adminW
                .from("resetcode_kennis")
                .insert({
                  programma: programmaSlug,
                  vraag: vraag.slice(0, 600),
                  bron: "controle",
                  link_id: ctxVoorOpslag.linkId,
                  gegeven_antwoord: ruwSchoon.slice(0, 2000),
                  controle_reden: `na zelfcorrectie nog: ${restProbleem}`.slice(
                    0,
                    300,
                  ),
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
                    body: `De Mentor kon een antwoord niet zelf binnen de regels krijgen: "${vraag.slice(0, 100)}". Check en corrigeer 'm zo nodig.`,
                    url: "/resetcode-kennis",
                    tag: "resetcode-waakhond",
                  }),
                ),
              );
            } catch (e) {
              console.error("waakhond-vangnet mislukt:", e);
            }
          }
          controller.close();
        } catch (err) {
          const foutMsg = err instanceof Error ? err.message : "onbekende fout";
          console.error("resetcode-mentor stream-fout:", foutMsg);
          // Half antwoord alsnog bewaren (agent-jacht 29 juli): de klant
          // zág de gestreamde tekst al, dus die hoort ook in het log te
          // staan; anders mist het antwoord na een herlaad terwijl de
          // vraag er wél staat. En géén rauwe interne foutmelding tonen.
          try {
            const deel = zonderMerknaam(
              volledig.replaceAll("[[TEAMVRAAG]]", ""),
            ).trim();
            if (ctxVoorOpslag && deel.length > 0) {
              await bewaarResetChats(
                ctxVoorOpslag.linkId,
                [
                  {
                    van: "mentor",
                    soort: "tekst",
                    stationSlug,
                    tekst: `${deel} …(de verbinding viel hier even weg)`,
                  },
                ],
                { dedupe: false },
              );
            }
          } catch {
            // opslag is best-effort
          }
          try {
            controller.enqueue(
              encoder.encode(
                "\n\nDe verbinding viel even weg. Stel je vraag gerust opnieuw, ik sta klaar. 💚",
              ),
            );
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
    // Geen interne foutmeldingen richting de klant.
    return new Response(
      "De Mentor is heel even niet bereikbaar. Probeer het zo nog een keer.",
      { status: 500 },
    );
  }
}

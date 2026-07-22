// ============================================================
// Receptionist-router (fase 2 agent-architectuur, spec 22 juli).
//
// Eén kleine LLM-call (snel model, temperature 0, JSON) die elke
// inkomende vraag naar een taak uit het taak-register stuurt.
// Vervangt de detecteerVraagType-regex als eerste keus; de regex
// blijft het vangnet bij fout, timeout of onbruikbaar antwoord,
// zodat de Mentor NOOIT stilvalt door de router.
//
// Waarom: de regex was een woorden-loterij ("starten" = closing,
// "waarom" = motivatie), waardoor dezelfde gezondheidsvraag per
// formulering totaal verschillende antwoorden kreeg. De router
// kijkt naar de bedoeling, niet naar losse woorden.
//
// Twijfelregels (uit de spec):
// 1. Gaat het ook maar deels over producten/gezondheid → productadvies.
// 2. Bij twijfel tussen de rest → algemeen (de gespreks-coach).
// ============================================================

import OpenAI from "openai";
import { detecteerVraagType, VraagType } from "@/lib/knowledge/coach-boeken";
import { MODEL_SNEL, routerOpties } from "@/lib/mentor/taak-register";

// Ruim genoeg voor een trage OpenAI-piek (testbank 22 juli: bij 4000ms
// viel 1 op 20 calls in het regex-vangnet), krap genoeg om de member
// niet te laten wachten bovenop de echte generatie.
const ROUTER_TIMEOUT_MS = 6000;

export type RouterUitkomst = {
  type: VraagType;
  /** Hoe de keuze tot stand kwam: de router zelf, of het regex-vangnet. */
  via: "router" | "regex-vangnet";
};

function bouwRouterPrompt(): string {
  const opties = routerOpties()
    .map((o) => `- "${o.id}": ${o.beschrijving}`)
    .join("\n");
  return `Je bent de receptionist van een mentor-systeem voor netwerk-marketing (Lifeplus). Je leest het gesprek van een teamlid en bepaalt welke specialist deze vraag moet behandelen.

DE SPECIALISTEN:
${opties}

REGELS (in deze volgorde):
1. Gaat de vraag ook maar deels over producten, supplementen, voeding, gezondheid, klachten, ziektes of programma's? Kies dan ALTIJD "productadvies", ook als er daarnaast iets anders speelt. Veiligheid wint. ENIGE uitzondering: het lid vraagt duidelijk om iets te SCHRIJVEN of MAKEN (een reel, filmpje of bericht) over zo'n thema; dan wint de schrijf-specialist, want die schrijft claim-vrij.
2. Kijk naar wat het lid NU nodig heeft (het laatste bericht), met het begin van het gesprek als context. Een gesprek dat begon over een bezwaar en nog steeds over dat bezwaar gaat, blijft "bezwaar".
3. Twijfel je tussen de overige specialisten? Kies "algemeen".

Antwoord UITSLUITEND met JSON: {"taak": "<id>"}`;
}

/** Compacte gespreksweergave: eerste user-bericht + laatste 2 beurten. */
function bouwGespreksInput(
  berichten: { role: string; content: string }[],
): string {
  const users = berichten.filter((b) => b.role === "user");
  const eerste = users[0]?.content ?? "";
  const laatste = users.slice(-2).filter((b) => b.content !== eerste);
  const delen = [
    `EERSTE BERICHT VAN HET LID:\n${eerste.slice(0, 600)}`,
    ...laatste.map(
      (b, i) =>
        `${i === laatste.length - 1 ? "LAATSTE" : "RECENT"} BERICHT:\n${b.content.slice(0, 600)}`,
    ),
  ];
  return delen.join("\n\n");
}

/**
 * Classificeer het gesprek naar een taak-id. Faalt de LLM-call (fout,
 * timeout, onbekend id), dan beslist de oude regex-detectie, zodat er
 * altijd een geldig vraagtype uitkomt.
 */
export async function routeerVraag(
  openai: OpenAI,
  berichten: { role: string; content: string }[],
): Promise<RouterUitkomst> {
  const geldig = new Set(routerOpties().map((o) => o.id));
  try {
    const resp = await openai.chat.completions.create(
      {
        model: MODEL_SNEL,
        temperature: 0,
        max_tokens: 20,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: bouwRouterPrompt() },
          { role: "user", content: bouwGespreksInput(berichten) },
        ],
      },
      { timeout: ROUTER_TIMEOUT_MS, maxRetries: 0 },
    );
    const ruw = resp.choices[0]?.message?.content ?? "";
    const taak = (JSON.parse(ruw) as { taak?: unknown }).taak;
    if (typeof taak === "string" && geldig.has(taak)) {
      return { type: taak as VraagType, via: "router" };
    }
    console.warn("router: onbruikbaar antwoord, regex-vangnet:", ruw);
  } catch (e) {
    console.warn("router: LLM-call faalde, regex-vangnet:", e);
  }
  return { type: detecteerVraagType(berichten), via: "regex-vangnet" };
}

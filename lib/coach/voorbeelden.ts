import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// coach/voorbeelden.ts, helper voor train-de-Mentor.
//
// Haalt founder-voorbeelden op die relevant zijn voor de huidige
// vraag, en bouwt een prompt-sectie die als few-shot examples in de
// Mentor-system-prompt wordt geplakt.
//
// Matching-strategie (pragmatisch, niet semantisch):
//   1. Filter op categorie (vraagType) → krijgen prio
//   2. Filter op woord-overlap met de gebruikersvraag (eenvoudig)
//   3. Top 5 (genoeg context, niet teveel tokens)
// ============================================================

export type CoachVoorbeeld = {
  id: string;
  doelgroep: string;
  categorie: string;
  vraag: string;
  goed_antwoord: string;
  tags: string[];
};

/** Tokenize naar simpele woord-set voor overlap-scoring. */
function tokenize(tekst: string): Set<string> {
  return new Set(
    tekst
      .toLowerCase()
      .replace(/[^a-z0-9\sàáâäéèêëíìîïóòôöúùûüç']/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3),
  );
}

function woordOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  a.forEach((w) => {
    if (b.has(w)) n++;
  });
  return n;
}

/**
 * Pak relevante founder-voorbeelden uit de DB.
 *
 * @param supabase Server-side Supabase-client (mag ook admin zijn).
 * @param categorie VraagType-categorie van de huidige vraag.
 * @param userVraag Daadwerkelijke vraag/input van de member.
 * @param max Aantal voorbeelden om mee te nemen, default 5.
 * @param doelgroep Welke coach: 'member' (Mentor), 'prospect' (programma-coach), etc.
 */
export async function pakRelevanteVoorbeelden(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  categorie: string,
  userVraag: string,
  max: number = 5,
  doelgroep: string = "member",
): Promise<CoachVoorbeeld[]> {
  // Filter: voorbeelden die voor 'beide' zijn OF specifiek voor de
  // gevraagde doelgroep. Zo zien beide coaches de gedeelde kennis
  // (productadvies, Lifeplus, mindset) plus hun eigen specifieke set.
  const { data, error } = await supabase
    .from("coach_voorbeelden")
    .select("id, doelgroep, categorie, vraag, goed_antwoord, tags")
    .eq("actief", true)
    .in("doelgroep", ["beide", doelgroep]);
  if (error || !data) return [];

  const alle = data as CoachVoorbeeld[];
  const vraagTokens = tokenize(userVraag);

  // Score: categorie-match = +5, woord-overlap = +N
  const gescoord = alle.map((v) => {
    let score = 0;
    if (v.categorie === categorie) score += 5;
    if (categorie === "algemeen") score += 1; // brede vragen mogen alle voorbeelden zien
    score += woordOverlap(vraagTokens, tokenize(v.vraag));
    return { v, score };
  });

  return gescoord
    .filter((g) => g.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((g) => g.v);
}

/**
 * Bouwt de prompt-sectie voor de Mentor met de meegegeven voorbeelden.
 * Lege lijst → lege string (geen extra tokens).
 */
export function bouwVoorbeeldenPromptSectie(
  voorbeelden: CoachVoorbeeld[],
): string {
  if (voorbeelden.length === 0) return "";

  const blokken = voorbeelden
    .map(
      (v, i) =>
        `Voorbeeld ${i + 1} (${v.categorie}${v.tags.length > 0 ? `, ${v.tags.join(", ")}` : ""}):
Vraag: ${v.vraag}
Antwoord (zoals founder zou antwoorden):
${v.goed_antwoord}`,
    )
    .join("\n\n---\n\n");

  return `\n## ZO ANTWOORDEN DE FOUNDERS OP VERGELIJKBARE VRAGEN
Hieronder staan voorbeelden van hoe ervaren founders deze soort vragen beantwoorden. Match hun TOON en AANPAK in jouw antwoord. Niet letterlijk overnemen, wel de essentie en het ritme.

${blokken}
`;
}

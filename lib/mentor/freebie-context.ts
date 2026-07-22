// ============================================================
// Freebie-context voor het Mentor-brein: welke checks (intern:
// freebies) dit teamlid kan koppelen aan posts/reels, met de
// persoonlijke deel-link. Het woord "freebie" is member-intern
// en mag NOOIT in publieke teksten; daarom hier ook claim-vrije
// omschrijvingen die veilig in een post kunnen (titels zoals
// "Hormonen & Overgang" bevatten woorden die in posts verboden
// zijn).
// ============================================================

import { getBotConfig } from "@/lib/freebie-bots/registry";
import { SITE_URL } from "@/lib/site";

export type MentorFreebie = {
  titel: string;
  omschrijving: string;
  link: string;
};

// Claim-vrije omschrijvingen voor gebruik IN een post (geen medische
// woorden, geen beloftes).
const OMSCHRIJVINGEN: Record<string, string> = {
  "jouw-gezonde-start":
    "korte check van een minuut of 3 die laat zien waar voor jou de meeste winst te halen valt",
  "energie-en-focus":
    "korte check over hoe je ervoor staat met je energie en focus door de dag heen",
  "hormonen-en-overgang":
    "korte check voor vrouwen die zichzelf de laatste tijd niet helemaal herkennen",
  "reset-check":
    "korte check die laat zien of een reset bij je past",
};

/**
 * Haalt de deelbare checks van dit teamlid op (alleen bots waarvoor een
 * persoonlijke token-rij bestaat). Faalt stil naar een lege lijst.
 */
export async function haalMentorFreebies(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<MentorFreebie[]> {
  const { data } = await supabase
    .from("freebie_bot_member_tokens")
    .select("bot_slug, token, publieke_slug")
    .eq("member_id", userId);
  const rijen = (data || []) as Array<{
    bot_slug: string;
    token: string;
    publieke_slug: string | null;
  }>;

  const uit: MentorFreebie[] = [];
  for (const r of rijen) {
    const config = getBotConfig(r.bot_slug);
    if (!config) continue;
    // Leesbare link waar die bestaat (nu alleen jouw-gezonde-start),
    // anders de token-link.
    const link =
      r.bot_slug === "jouw-gezonde-start" && r.publieke_slug
        ? `${SITE_URL}/gezonde-start/${r.publieke_slug}`
        : `${SITE_URL}/bot/${r.bot_slug}/${r.token}`;
    uit.push({
      titel: config.titel,
      omschrijving: OMSCHRIJVINGEN[r.bot_slug] || config.ondertitel,
      link,
    });
  }
  return uit;
}

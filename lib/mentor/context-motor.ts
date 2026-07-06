// ============================================================
// Context-motor (Mentor-brein blok 2): brengt de prospect-kennis
// die tot nu toe BUITEN de Mentor bleef alsnog het gesprek in:
// tags (ingezette_tools), freebie-check-uitslagen en film-
// kijkgedrag. De basis (notitieboekje/contact_logs, bestellingen,
// herinneringen, FORM) zat al in de coach-prompt; dit is de
// aanvulling daar bovenop.
//
// Alles faalt stil (lege string) zodat de Mentor blijft werken
// als een tabel ontbreekt.
// ============================================================

import { getBotConfig } from "@/lib/freebie-bots/registry";

type ProspectBasis = {
  id: string;
  email?: string | null;
  volledige_naam?: string | null;
  ingezette_tools?: string[] | null;
};

export async function bouwProspectExtraSectie(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  memberId: string,
  prospect: ProspectBasis,
): Promise<string> {
  const voornaam = (prospect.volledige_naam || "deze prospect").split(" ")[0];
  const delen: string[] = [];

  // 1) Tags: de ingezette tools/markeringen op de kaart (🌷 freebie-tags,
  //    film-markers, warm-signalen). Compact meesturen.
  const tags = (prospect.ingezette_tools || []).filter(Boolean);
  if (tags.length > 0) {
    delen.push(`Tags op de kaart: ${tags.join(", ")}`);
  }

  // 2) Freebie-check-uitslagen: wat deze prospect invulde bij een check.
  if (prospect.email) {
    try {
      const { data: optIns } = await supabase
        .from("freebie_opt_ins")
        .select("bron_kanaal, status, bot_antwoorden, spiegel_tekst, created_at")
        .eq("member_id", memberId)
        .ilike("lead_email", String(prospect.email).replace(/([\\%_])/g, "\\$1"))
        .order("created_at", { ascending: false })
        .limit(3);
      for (const o of optIns || []) {
        const slug = String(o.bron_kanaal || "").replace(/-bot$/, "");
        const titel = getBotConfig(slug)?.titel || o.bron_kanaal || "check";
        const datum = String(o.created_at || "").slice(0, 10);
        let regel = `Check gedaan: ${titel} (${datum}${o.status ? `, status: ${o.status}` : ""})`;
        if (o.bot_antwoorden && typeof o.bot_antwoorden === "object") {
          const antwoorden = Object.entries(o.bot_antwoorden as Record<string, unknown>)
            .slice(0, 10)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join("; ");
          if (antwoorden) regel += `\n  antwoorden: ${antwoorden.slice(0, 450)}`;
        }
        if (o.spiegel_tekst) {
          regel += `\n  spiegel-notitie (achtergrond voor jou als Mentor, nooit letterlijk doorsturen): ${String(o.spiegel_tekst).slice(0, 300)}`;
        }
        delen.push(regel);
      }
    } catch {
      /* tabel ontbreekt of query faalt: stil overslaan */
    }
  }

  // 3) Film-kijkgedrag: verstuurde films + hoe ver gekeken. Sterk signaal
  //    voor de volgende stap ("film afgekeken = warm, bel vandaag").
  try {
    const { data: views } = await supabase
      .from("prospect_film_views")
      .select("film_slug, created_at, gestart_op, afgekeken_op, kijkpercentage")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false })
      .limit(5);
    for (const f of views || []) {
      const datum = String(f.created_at || "").slice(0, 10);
      const status = f.afgekeken_op
        ? "helemaal afgekeken"
        : f.gestart_op
          ? `${Math.round(Number(f.kijkpercentage) || 0)}% gekeken`
          : "verstuurd maar nog niet geopend";
      delen.push(`Film "${f.film_slug}" (${datum}): ${status}`);
    }
  } catch {
    /* tabel ontbreekt: stil overslaan */
  }

  if (delen.length === 0) return "";

  return [
    "",
    "",
    `=== EXTRA CONTEXT OVER ${voornaam.toUpperCase()} (uit ELEVA, gebruik dit actief in je advies) ===`,
    ...delen.map((d) => `- ${d}`),
    "Weeg dit mee: een afgekeken film of ingevulde check is een warm signaal; een niet-geopende film betekent eerst zachter contact, geen pitch.",
  ].join("\n");
}

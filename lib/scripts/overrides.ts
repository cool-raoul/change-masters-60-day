import { SCRIPTS_DATA } from "@/lib/scripts-data";

// ============================================================
// scripts/overrides — server-side helpers
//
// Founders kunnen via /scripts (✏️-knop per kaart) titel + inhoud
// van scripts aanpassen. Velden in DB zijn nullable → NULL betekent
// "gebruik standaard tekst uit SCRIPTS_DATA".
//
// Belangrijke noot: de coach-prompt-builder
// (lib/prompts/coach-systeem-prompt.ts) leest nu nog rechtstreeks
// SCRIPTS_DATA. Founder-aanpassingen komen NIET automatisch door
// in de mentor-output. De /scripts-pagina zelf werkt wel met
// overrides. In een tweede ronde kan de coach ook overrides lezen.
// ============================================================

export type ScriptItem = (typeof SCRIPTS_DATA)[number];

export type ScriptOverrideRij = {
  script_id: string;
  titel: string | null;
  inhoud: string | null;
};

/**
 * Maakt een stabiele, URL-veilige id van een originele scripttitel.
 * Wordt gebruikt als primary key in script_overrides. Mag de founder
 * de titel later aanpassen — de id is gebaseerd op de ORIGINELE titel
 * uit de code, dus blijft stabiel.
 */
export function maakScriptId(originelTitel: string): string {
  return originelTitel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accenten weg
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 80);
}

export type ScriptMetMeta = ScriptItem & {
  scriptId: string;
  /** True als er een override actief is voor dit script */
  isAangepast: boolean;
};

/**
 * Server-side helper: haal alle script_overrides op en merge ze met
 * SCRIPTS_DATA. Returnt een lijst met ALLE scripts (origineel volgorde),
 * met overgenomen overrides waar van toepassing.
 *
 * Faalt stilletjes als de tabel niet bestaat — dan val je terug op
 * 100% hardcoded.
 */
export async function haalScriptsMetOverrides(
  supabase: {
    from: (t: string) => {
      select: (cols: string) => Promise<{
        data: ScriptOverrideRij[] | null;
        error: unknown;
      }>;
    };
  },
): Promise<ScriptMetMeta[]> {
  // Map ophalen
  const overrides = new Map<string, ScriptOverrideRij>();
  try {
    const { data, error } = await supabase
      .from("script_overrides")
      .select("script_id, titel, inhoud");
    if (!error && data) {
      for (const r of data) overrides.set(r.script_id, r);
    }
  } catch {
    // Tabel bestaat niet → blijf bij hardcoded
  }

  return SCRIPTS_DATA.map((script) => {
    const scriptId = maakScriptId(script.titel);
    const ov = overrides.get(scriptId);
    const heeftOverride =
      !!ov && (ov.titel?.trim() || ov.inhoud?.trim());
    return {
      ...script,
      titel: ov?.titel?.trim() || script.titel,
      inhoud: ov?.inhoud?.trim() || script.inhoud,
      scriptId,
      isAangepast: !!heeftOverride,
    };
  });
}

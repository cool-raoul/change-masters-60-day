// lib/mentor-profiel/parse.ts
//
// Haalt het [PROFIEL]{...}[/PROFIEL]-blok uit de Mentor-output, valideert het,
// en bouwt een merge-patch voor patchMentorProfiel. Arrays worden samengevoegd
// met het huidige profiel (append + dedupe + cap), scalars overschreven.
// Defensief: bij twijfel returnt 'ie null en gebeurt er niets.

import type { MentorProfiel, Talent } from "./types";

const GELDIGE_TALENTEN: Talent[] = ["schrijver", "spreker", "filmer", "DM-er"];

function mergeLijst(
  huidig: string[] | undefined,
  nieuw: unknown,
  cap: number,
): string[] | undefined {
  const toe = Array.isArray(nieuw)
    ? nieuw.filter((x): x is string => typeof x === "string")
    : [];
  if (toe.length === 0) return undefined;
  const basis = Array.isArray(huidig) ? huidig : [];
  const gezien = new Set(basis.map((s) => s.trim().toLowerCase()));
  const resultaat = [...basis];
  for (const item of toe) {
    const t = item.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (gezien.has(k)) continue;
    gezien.add(k);
    resultaat.push(t.slice(0, 600));
  }
  return resultaat.slice(-cap);
}

export function parseProfielBlok(
  tekst: string,
  huidig: MentorProfiel,
): Partial<MentorProfiel> | null {
  const match = tekst.match(/\[PROFIEL\]([\s\S]*?)\[\/PROFIEL\]/i);
  if (!match) return null;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[1].trim());
  } catch (err) {
    console.warn("[PROFIEL] JSON parse mislukt:", match[1]?.slice(0, 200), err);
    return null;
  }
  if (!data || typeof data !== "object") return null;

  const patch: Partial<MentorProfiel> = {};

  if (typeof data.nicheZaadje === "string" && data.nicheZaadje.trim()) {
    patch.nicheZaadje = data.nicheZaadje.trim().slice(0, 400);
  }
  if (typeof data.idealeKlant === "string" && data.idealeKlant.trim()) {
    patch.idealeKlant = data.idealeKlant.trim().slice(0, 400);
  }
  if (typeof data.situatie === "string" && data.situatie.trim()) {
    patch.situatie = data.situatie.trim().slice(0, 600);
  }
  if (typeof data.historieNotitie === "string" && data.historieNotitie.trim()) {
    patch.historieNotitie = data.historieNotitie.trim().slice(0, 800);
  }
  if (
    typeof data.talent === "string" &&
    GELDIGE_TALENTEN.includes(data.talent as Talent)
  ) {
    patch.talent = data.talent as Talent;
  }

  const producten = mergeLijst(huidig.eigenProducten, data.eigenProducten, 20);
  if (producten) patch.eigenProducten = producten;

  const passies = mergeLijst(huidig.passies, data.passies, 12);
  if (passies) patch.passies = passies;

  const stem = mergeLijst(huidig.stemVoorbeelden, data.stemVoorbeelden, 6);
  if (stem) patch.stemVoorbeelden = stem;

  if (data.drieVerhalen && typeof data.drieVerhalen === "object") {
    const dv = data.drieVerhalen as Record<string, unknown>;
    const merged = { ...(huidig.drieVerhalen ?? {}) };
    let veranderd = false;
    for (const k of ["persoonlijk", "product", "business"] as const) {
      if (typeof dv[k] === "string" && (dv[k] as string).trim()) {
        merged[k] = (dv[k] as string).trim().slice(0, 800);
        veranderd = true;
      }
    }
    if (veranderd) patch.drieVerhalen = merged;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

// ============================================================
// FORM-context per prospect (Family, Occupation, Recreation, Money). Door de
// Mentor genoteerd wanneer er een prospect in context is. Wordt op de
// prospect-kaart getoond en weer meegegeven bij die prospect.
// ============================================================

export type ProspectFormContext = {
  family?: string;
  occupation?: string;
  recreation?: string;
  money?: string;
};

export function parseProspectBlok(tekst: string): ProspectFormContext | null {
  const match = tekst.match(/\[PROSPECT\]([\s\S]*?)\[\/PROSPECT\]/i);
  if (!match) return null;
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[1].trim());
  } catch (err) {
    console.warn("[PROSPECT] JSON parse mislukt:", match[1]?.slice(0, 200), err);
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const out: ProspectFormContext = {};
  for (const k of ["family", "occupation", "recreation", "money"] as const) {
    if (typeof data[k] === "string" && (data[k] as string).trim()) {
      out[k] = (data[k] as string).trim().slice(0, 500);
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Het zichtbare deel van een Mentor-antwoord = alles vóór het eerste
 * systeem-blok ([PROFIEL] of [PROSPECT]). Zo ziet de gebruiker de opslag-JSON
 * nooit, ongeacht welk blok de Mentor meestuurt.
 */
export function zichtbaarTotMarker(tekst: string): string {
  let eind = tekst.length;
  for (const m of ["[PROFIEL]", "[PROSPECT]"]) {
    const i = tekst.indexOf(m);
    if (i !== -1 && i < eind) eind = i;
  }
  return tekst.slice(0, eind);
}

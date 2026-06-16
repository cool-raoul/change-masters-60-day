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
  } catch {
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

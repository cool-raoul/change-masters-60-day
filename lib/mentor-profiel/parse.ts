// lib/mentor-profiel/parse.ts
//
// Haalt het [PROFIEL]{...}[/PROFIEL]-blok uit de Mentor-output, valideert het,
// en bouwt een merge-patch voor patchMentorProfiel. Arrays worden samengevoegd
// met het huidige profiel (append + dedupe + cap), scalars overschreven.
// Defensief: bij twijfel returnt 'ie null en gebeurt er niets.

import type { FormContext, MentorProfiel, Talent } from "./types";

const GELDIGE_TALENTEN: Talent[] = ["schrijver", "spreker", "filmer", "DM-er"];

function mergeLijst(
  huidig: string[] | undefined,
  nieuw: unknown,
  cap: number,
  maxLen: number = 600,
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
    resultaat.push(t.slice(0, maxLen));
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

  // Nieuwe scalars uit de kennismakings-rondes (2026-07-07).
  if (typeof data.schrijfVoorkeuren === "string" && data.schrijfVoorkeuren.trim()) {
    patch.schrijfVoorkeuren = data.schrijfVoorkeuren.trim().slice(0, 400);
  }
  if (typeof data.socialSituatie === "string" && data.socialSituatie.trim()) {
    patch.socialSituatie = data.socialSituatie.trim().slice(0, 600);
  }
  if (typeof data.ritme === "string" && data.ritme.trim()) {
    patch.ritme = data.ritme.trim().slice(0, 300);
  }
  if (typeof data.eersteFeestje === "string" && data.eersteFeestje.trim()) {
    patch.eersteFeestje = data.eersteFeestje.trim().slice(0, 300);
  }
  // Bewust NIET: vrijeContext. Dat blok is van het lid zelf; de Mentor
  // schrijft er nooit in.

  const producten = mergeLijst(huidig.eigenProducten, data.eigenProducten, 20);
  if (producten) patch.eigenProducten = producten;

  const passies = mergeLijst(huidig.passies, data.passies, 12);
  if (passies) patch.passies = passies;

  const stem = mergeLijst(huidig.stemVoorbeelden, data.stemVoorbeelden, 6);
  if (stem) patch.stemVoorbeelden = stem;

  // Zelfgeschreven tekst-fragmenten mogen langer zijn dan losse zinnen:
  // dit is de sterkste stem-bron (een halve post zegt meer dan tien zinnen).
  const eigenPosts = mergeLijst(huidig.eigenPosts, data.eigenPosts, 5, 1500);
  if (eigenPosts) patch.eigenPosts = eigenPosts;

  const praattaal = mergeLijst(huidig.praattaal, data.praattaal, 12, 200);
  if (praattaal) patch.praattaal = praattaal;

  const nooit = mergeLijst(huidig.nooitWoorden, data.nooitWoorden, 12, 200);
  if (nooit) patch.nooitWoorden = nooit;

  const grenzen = mergeLijst(huidig.grenzen, data.grenzen, 8, 300);
  if (grenzen) patch.grenzen = grenzen;

  // FORM-context over eigen top-contacten (kennismakings-ronde 3).
  // Merge op contactNaam: bestaand contact wordt aangevuld, nieuw contact
  // toegevoegd. Cap op 10 contacten.
  if (Array.isArray(data.formContexts)) {
    const bestaand = Array.isArray(huidig.formContexts)
      ? [...huidig.formContexts]
      : [];
    let veranderd = false;
    for (const ruw of data.formContexts) {
      if (!ruw || typeof ruw !== "object") continue;
      const fc = ruw as Record<string, unknown>;
      const naam =
        typeof fc.contactNaam === "string" ? fc.contactNaam.trim().slice(0, 80) : "";
      if (!naam) continue;
      const schoon: FormContext = { contactNaam: naam };
      for (const k of ["family", "occupation", "recreation", "money"] as const) {
        if (typeof fc[k] === "string" && (fc[k] as string).trim()) {
          schoon[k] = (fc[k] as string).trim().slice(0, 400);
        }
      }
      const idx = bestaand.findIndex(
        (b) => b.contactNaam.trim().toLowerCase() === naam.toLowerCase(),
      );
      if (idx >= 0) {
        bestaand[idx] = { ...bestaand[idx], ...schoon };
      } else {
        bestaand.push(schoon);
      }
      veranderd = true;
    }
    if (veranderd) patch.formContexts = bestaand.slice(-10);
  }

  // Ronde-afronding: de Mentor markeert een kennismakings-ronde als klaar
  // met { "rondeKlaar": n }. Dedupe + sorteer, zodat de profielpagina de
  // vinkjes kan tonen.
  if (
    typeof data.rondeKlaar === "number" &&
    Number.isInteger(data.rondeKlaar) &&
    data.rondeKlaar >= 1 &&
    data.rondeKlaar <= 6
  ) {
    const klaar = new Set(huidig.kennismakingKlaar ?? []);
    klaar.add(data.rondeKlaar);
    patch.kennismakingKlaar = Array.from(klaar).sort((a, b) => a - b);
  }

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
  // [POST] is de markering van de schrijf-leer-lus (mentor_posts); net als
  // de profiel-blokken onzichtbaar voor de gebruiker.
  for (const m of ["[PROFIEL]", "[PROSPECT]", "[POST]"]) {
    const i = tekst.indexOf(m);
    if (i !== -1 && i < eind) eind = i;
  }
  return tekst.slice(0, eind);
}

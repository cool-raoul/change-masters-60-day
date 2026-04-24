// ============================================================
// COMPLIANCE CHECK — ELEVA coach
// Passieve scan op verboden gezondheidsclaims in coach-antwoorden.
// NIET bedoeld om de stream te blokkeren of te herschrijven —
// alleen om observability te geven: welke antwoorden glippen er
// toch doorheen ondanks de strenge system-prompt?
// Ruwe detectie per regex, geen AI. Bewust ruim: liever één false
// positive te veel dan een echte medische claim missen.
// ============================================================

// EU Claims Regulation (1924/2006): supplementen mogen geen
// medische/ziekte-claims maken. Deze werkwoorden + zinsnedes zijn
// in productcontext nooit veilig.
const VERBODEN_WERKWOORDEN: Array<{ regex: RegExp; label: string }> = [
  { regex: /\bgenees[a-z]*\b/i, label: "genezen" },
  { regex: /\bcureert?\b/i, label: "cureren" },
  { regex: /\bbehandelt?\b/i, label: "behandelen" },
  { regex: /\bvoorkomt?\b/i, label: "voorkomen" },
  { regex: /\bverhelpt?\b/i, label: "verhelpen" },
  { regex: /\bbestrijdt?\b/i, label: "bestrijden" },
  { regex: /\brepareert?\b/i, label: "repareren" },
  { regex: /\bneutraliseert?\b/i, label: "neutraliseren" },
  { regex: /\belimineert?\b/i, label: "elimineren" },
  { regex: /\blost\s+[\w\s]{0,20}op\b/i, label: "lost op" },
  { regex: /\bhaalt\s+[\w\s]{0,20}weg\b/i, label: "haalt weg" },
  { regex: /\bwerkt\s+tegen\b/i, label: "werkt tegen" },
  { regex: /\bbeschermt\s+tegen\b/i, label: "beschermt tegen" },
  { regex: /\bvervangt\s+medicatie\b/i, label: "vervangt medicatie" },
  { regex: /\bstopt\s+(je\s+)?[a-z]+/i, label: "stopt X" },
  { regex: /\bverwijdert?\b/i, label: "verwijderen" },
];

// Risicovolle werkingsclaims die zonder EFSA-goedkeuring niet mogen
const RISICO_FRASES: Array<{ regex: RegExp; label: string }> = [
  { regex: /verlaagt?\s+(je\s+)?(cholesterol|bloeddruk|bloedsuiker|suiker)/i, label: "verlaagt cholesterol/bloeddruk/bloedsuiker" },
  { regex: /versterkt?\s+(je\s+)?immuunsysteem/i, label: "versterkt immuunsysteem" },
  { regex: /\bklinisch\s+bewezen\b/i, label: "klinisch bewezen" },
  { regex: /\bwetenschappelijk\s+bewezen\b/i, label: "wetenschappelijk bewezen" },
  { regex: /\bbeter\s+dan\s+(medicatie|medicijnen|[a-z]+pil)/i, label: "beter dan medicatie" },
  { regex: /\bgeen\s+arts\s+meer\s+nodig\b/i, label: "geen arts meer nodig" },
];

// Dosering-voorschriften (coach mag niet doseren)
const DOSERING_PATRONEN: Array<{ regex: RegExp; label: string }> = [
  { regex: /\bneem\s+\d+\s+(tablet|pil|capsule|caps|sachet)/i, label: "dosering: 'neem X tablet'" },
  { regex: /\b\d+\s*x\s*(per\s+)?dag\b/i, label: "dosering: 'Xx per dag'" },
  { regex: /\b\d+\s+(tabletten|capsules|pillen)\s+(per\s+dag|dagelijks)/i, label: "dosering: 'X tabletten per dag'" },
];

export type ComplianceFlag = {
  categorie: "verboden_werkwoord" | "risico_frase" | "dosering";
  label: string;
  matchedText: string;
};

export type ComplianceResultaat = {
  ok: boolean;
  flags: ComplianceFlag[];
};

/**
 * Scant een coach-antwoord op verboden claims.
 * Geeft een lijst flags terug. Blokkeert niets — de caller beslist
 * of er gelogd, gewaarschuwd of herschreven wordt.
 *
 * LET OP: ruwe regex. Een false positive hier is geen ramp (we
 * blokkeren niet). Een false negative mag eigenlijk niet; liever
 * iets meer patterns erbij dan eentje missen.
 */
export function checkCompliance(antwoord: string): ComplianceResultaat {
  const flags: ComplianceFlag[] = [];

  for (const { regex, label } of VERBODEN_WERKWOORDEN) {
    const match = antwoord.match(regex);
    if (match) {
      flags.push({
        categorie: "verboden_werkwoord",
        label,
        matchedText: match[0],
      });
    }
  }

  for (const { regex, label } of RISICO_FRASES) {
    const match = antwoord.match(regex);
    if (match) {
      flags.push({
        categorie: "risico_frase",
        label,
        matchedText: match[0],
      });
    }
  }

  for (const { regex, label } of DOSERING_PATRONEN) {
    const match = antwoord.match(regex);
    if (match) {
      flags.push({
        categorie: "dosering",
        label,
        matchedText: match[0],
      });
    }
  }

  return {
    ok: flags.length === 0,
    flags,
  };
}

/**
 * Korte logvriendelijke samenvatting van de flags voor in console.
 * Format: "verboden_werkwoord:genezen('geneest'), risico_frase:verlaagt...('verlaagt cholesterol')"
 */
export function vatFlagsSamen(flags: ComplianceFlag[]): string {
  return flags
    .map((f) => `${f.categorie}:${f.label}('${f.matchedText}')`)
    .join(", ");
}

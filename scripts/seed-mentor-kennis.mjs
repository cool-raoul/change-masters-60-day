#!/usr/bin/env node
// ============================================================
// scripts/seed-mentor-kennis.mjs
//
// Leest de gevoelige CSV (pad als CLI-argument) en schrijft naar
// mentor_kennis_supplementen. Doet drie transformaties:
//
// 1. Codes "1,2,3" → leesbare basis-ondersteuning-tekst
//    (Daily BioBasics, Proanthenols, OmeGold)
// 2. Aanvullende producten in een array
// 3. Leefstijl-tip uit kolom 3
//
// Standaard: alle rijen op gevalideerd=false. Founder valideert later
// in /instellingen/mentor-kennis.
//
// Gebruik:
//   node scripts/seed-mentor-kennis.mjs "supps compleet ... .csv"
// ============================================================

import { config } from "dotenv";
import dns from "dns";
import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

dns.setDefaultResultOrder("ipv4first");
config({ path: resolve(process.cwd(), ".env.local") });

const PAD = process.argv[2];
if (!PAD) {
  console.error("Geef CSV-pad als argument.");
  console.error('Bv: node scripts/seed-mentor-kennis.mjs "supps compleet ... .csv"');
  process.exit(1);
}

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("SUPABASE_DB_URL ontbreekt in .env.local");
  process.exit(1);
}

const ruwe = readFileSync(PAD, "utf8");
const regels = ruwe
  .split(/\r?\n/)
  // Header en lege regels overslaan; we beginnen pas bij regels met
  // ; en een ziekte-naam.
  .filter((r) => r.includes(";"))
  .map((r) => r.split(";"));

// Skip de eerste 5 header-regels (titel, legenda, header)
const dataRegels = regels.slice(5).filter((cols) => {
  const term = (cols[0] || "").trim();
  return term && term.length > 0 && !term.startsWith("Thuisapotheek");
});

console.log(`📄 ${dataRegels.length} aandoening-rijen gevonden`);

// ============================================================
// Transformatie-helpers
// ============================================================

const BASIS_TEKST =
  "Basis-ondersteuning: Daily BioBasics + Proanthenols + OmeGold";

/**
 * Vervang "1,2,3" of "1, 2, 3" of variaties aan het begin door
 * de leesbare basis-tekst. Returnt {basisAdvies, rest}.
 */
function splitBasisEnRest(supplementenTekst) {
  const t = supplementenTekst.trim();
  // Pattern 1: "1,2,3 ..." → basis + rest
  const m = t.match(/^(\d[\s,]*)+\s*([\.,]?\s*)?(.*)$/);
  if (!m) return { basis: null, rest: t };

  // Vind het einde van de cijfers-prefix
  const prefixMatch = t.match(/^([\d\s,]+)/);
  if (!prefixMatch) return { basis: null, rest: t };

  const prefix = prefixMatch[0];
  const heeftCodes = /\d/.test(prefix);
  if (!heeftCodes) return { basis: null, rest: t };

  // Pak alle cijfers uit de prefix
  const codes = prefix.match(/\d+/g) || [];
  const rest = t.slice(prefix.length).replace(/^[\s,.]+/, "").trim();

  // Bouw basis-tekst
  const codeMap = {
    "1": "Daily BioBasics",
    "2": "Proanthenols",
    "3": "OmeGold",
  };
  const heeft1 = codes.includes("1");
  const heeft2 = codes.includes("2");
  const heeft3 = codes.includes("3");

  let basis;
  if (heeft1 && heeft2 && heeft3) {
    basis = BASIS_TEKST;
  } else {
    const namen = codes
      .map((c) => codeMap[c])
      .filter(Boolean);
    basis = namen.length > 0 ? `Basis: ${namen.join(" + ")}` : null;
  }

  return { basis, rest };
}

/**
 * Splits 'rest'-tekst (na codes) in een array van producten.
 * Houdt parenthese-groepen samen, splitst op komma's.
 */
function parseProducten(rest) {
  if (!rest) return [];
  // Split op komma's die NIET binnen haakjes zitten
  const items = [];
  let huidig = "";
  let diepte = 0;
  for (const ch of rest) {
    if (ch === "(" || ch === "[") diepte++;
    else if (ch === ")" || ch === "]") diepte--;
    if (ch === "," && diepte === 0) {
      const t = huidig.trim();
      if (t) items.push(t);
      huidig = "";
    } else {
      huidig += ch;
    }
  }
  const last = huidig.trim();
  if (last) items.push(last);
  return items;
}

// ============================================================
// Verwerk + insert
// ============================================================

const { Client } = pg;
const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

let nieuw = 0;
let overgeslagen = 0;

for (const cols of dataRegels) {
  const oorspronkelijke_term = (cols[0] || "").trim();
  const supplementen = (cols[1] || "").trim();
  const tip = (cols[2] || "").trim() || null;

  if (!oorspronkelijke_term) {
    overgeslagen++;
    continue;
  }

  const { basis, rest } = splitBasisEnRest(supplementen);
  const aanvullend = parseProducten(rest);
  const zoekterm = oorspronkelijke_term.toLowerCase();
  const rauwe = `${oorspronkelijke_term} | ${supplementen}${tip ? ` | tip: ${tip}` : ""}`;

  // Check of deze term al bestaat (idempotent re-run)
  const { rows: bestaande } = await client.query(
    "SELECT id FROM mentor_kennis_supplementen WHERE oorspronkelijke_term = $1 LIMIT 1",
    [oorspronkelijke_term],
  );
  if (bestaande.length > 0) {
    overgeslagen++;
    continue;
  }

  await client.query(
    `INSERT INTO mentor_kennis_supplementen
       (oorspronkelijke_term, zoekterm, basis_advies, aanvullende_producten,
        leefstijl_tip, rauwe_bron_tekst, bron_jaar, gevalideerd)
     VALUES ($1, $2, $3, $4, $5, $6, 2017, false)`,
    [
      oorspronkelijke_term,
      zoekterm,
      basis,
      aanvullend,
      tip,
      rauwe,
    ],
  );
  nieuw++;
}

console.log(`✅ ${nieuw} nieuwe rijen ingevoerd`);
console.log(`⏭ ${overgeslagen} overgeslagen (al bestaand of leeg)`);

await client.end();

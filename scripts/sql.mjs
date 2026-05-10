#!/usr/bin/env node
// ============================================================
// scripts/sql.mjs — directe SQL-runner voor Supabase
//
// Gebruik:
//   npm run sql -- "SELECT * FROM profiles LIMIT 5"
//   npm run sql -- -f scripts/sql/iets.sql
//   echo "SELECT 1" | npm run sql -- -
//
// Vereisten in .env.local:
//   SUPABASE_DB_URL=postgresql://postgres:<wachtwoord>@db.<ref>.supabase.co:5432/postgres
//
// Doel: Claude (en jij) kunnen SQL draaien zonder telkens de Supabase
// SQL Editor te hoeven openen. Service-role-grade rechten — wees
// voorzichtig met destructieve queries; standaard wordt een bevestiging
// gevraagd voor DELETE/UPDATE/DROP/TRUNCATE/ALTER.
// ============================================================

import { config } from "dotenv";
import pg from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const { Client } = pg;
const VERBORGEN_VAARGEVAARLIJK = /^\s*(DELETE|UPDATE|DROP|TRUNCATE|ALTER|GRANT|REVOKE)\b/i;
const ARGS = process.argv.slice(2);

function uitleg() {
  console.error(`
sql.mjs — directe SQL-runner

Gebruik:
  node scripts/sql.mjs "SELECT * FROM profiles LIMIT 3"
  node scripts/sql.mjs -f path/to/query.sql
  echo "SELECT 1" | node scripts/sql.mjs -

Opties:
  --json        output als JSON in plaats van tabel
  --yes         skip bevestigings-prompt voor schrijfqueries (alleen scripts)
  -f <bestand>  lees query uit bestand
  -             lees query uit stdin

Vereist: SUPABASE_DB_URL in .env.local
`);
  process.exit(1);
}

if (ARGS.length === 0 || ARGS.includes("--help") || ARGS.includes("-h")) {
  uitleg();
}

// ----- query inlezen -----
let query = "";
const jsonModus = ARGS.includes("--json");
const skipBevestiging = ARGS.includes("--yes");
const overige = ARGS.filter((a) => a !== "--json" && a !== "--yes");

if (overige[0] === "-f") {
  if (!overige[1]) {
    console.error("FOUT: -f vereist een bestandspad");
    process.exit(1);
  }
  query = readFileSync(overige[1], "utf8");
} else if (overige[0] === "-") {
  query = readFileSync(0, "utf8"); // stdin
} else {
  query = overige.join(" ");
}

if (!query.trim()) {
  console.error("FOUT: lege query");
  process.exit(1);
}

// ----- env-check -----
const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(`
FOUT: SUPABASE_DB_URL ontbreekt in .env.local

Haal 'm op uit Supabase:
  Project → Settings → Database → Connection string → URI
  (kies de "Direct connection" of "Session pooler" variant; beide werken)
  Vervang [YOUR-PASSWORD] met je database-wachtwoord.

Plak in .env.local:
  SUPABASE_DB_URL=postgresql://postgres.qwwhsoewajefainleajo:WACHTWOORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
`);
  process.exit(1);
}

// ----- bevestiging bij destructieve queries -----
if (!skipBevestiging && VERBORGEN_VAARGEVAARLIJK.test(query)) {
  // Detect of stdin een TTY is (interactief) — anders skippen we want
  // dan zit een script ons aan te roepen en is prompt onmogelijk.
  if (process.stdin.isTTY) {
    process.stderr.write(
      `\n⚠️  Je staat op het punt een schrijf-query te draaien:\n\n${query.trim()}\n\nDoorgaan? (ja/nee): `,
    );
    // synchroon stdin lezen op Windows is gedoe — gebruik readline
    const readline = await import("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    const antwoord = await new Promise((res) => rl.question("", (a) => { rl.close(); res(a); }));
    if (!/^j(a)?$/i.test(antwoord.trim())) {
      console.error("Geannuleerd.");
      process.exit(1);
    }
  }
}

// ----- uitvoeren -----
const client = new Client({
  connectionString: dbUrl,
  // Supabase vereist SSL. Self-signed certs worden door Supabase geaccepteerd
  // dus rejectUnauthorized=false; safe omdat de host zelf in de URL zit.
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const start = Date.now();
  const result = await client.query(query);
  const ms = Date.now() - start;

  if (jsonModus) {
    console.log(JSON.stringify(result.rows, null, 2));
  } else if (Array.isArray(result.rows) && result.rows.length > 0) {
    console.table(result.rows);
    console.error(`\n${result.rowCount ?? result.rows.length} rij(en) · ${ms}ms`);
  } else {
    console.error(`OK · ${result.rowCount ?? 0} rij(en) geraakt · ${ms}ms`);
  }
} catch (e) {
  console.error("\nFOUT:", e.message);
  if (e.code) console.error("Code:", e.code);
  if (e.detail) console.error("Detail:", e.detail);
  if (e.hint) console.error("Hint:", e.hint);
  process.exit(1);
} finally {
  await client.end();
}

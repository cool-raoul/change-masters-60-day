// scripts/run-migration.mjs
//
// Klein helper-script om een enkele SQL-migratie tegen de live Supabase
// database te draaien. Gebruik: node scripts/run-migration.mjs <bestandsnaam>
//
// Leest SUPABASE_DB_URL uit .env.local. Voert het volledige SQL-bestand
// uit binnen een transactie zodat partial failures terugrollen.

import { readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("FAIL: SUPABASE_DB_URL niet gevonden in .env.local");
  process.exit(1);
}

const filename = process.argv[2];
if (!filename) {
  console.error("FAIL: geef een SQL-bestand mee als argument");
  process.exit(1);
}

const sqlPath = resolve("supabase/migrations", filename);
let sqlInhoud;
try {
  sqlInhoud = readFileSync(sqlPath, "utf-8");
} catch (e) {
  console.error(`FAIL: kan ${sqlPath} niet lezen: ${e.message}`);
  process.exit(1);
}

console.log(`▶ Migratie: ${basename(sqlPath)}`);
console.log(`▶ Lengte: ${sqlInhoud.length} tekens`);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("▶ Verbonden met Supabase");

  await client.query("begin");
  await client.query(sqlInhoud);
  await client.query("commit");

  console.log(`✅ KLAAR: ${basename(sqlPath)} succesvol gedraaid`);
  await client.end();
  process.exit(0);
} catch (e) {
  try {
    await client.query("rollback");
  } catch {
    // negeer rollback-fout
  }
  await client.end();
  console.error(`❌ FOUT in ${basename(sqlPath)}:`);
  console.error(e.message);
  process.exit(1);
}

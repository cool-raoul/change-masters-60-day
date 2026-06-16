// Past een SQL-bestand toe op de live database via SUPABASE_DB_URL.
// Bedoeld voor idempotente, additieve migraties (add column if not exists, etc.).
// Gebruik: node scripts/apply-sql.cjs <pad-naar.sql>

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const { Client } = require("pg");

const file = process.argv[2];
if (!file) {
  console.error("Gebruik: node scripts/apply-sql.cjs <pad.sql>");
  process.exit(1);
}
const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL ontbreekt in .env.local");
  process.exit(1);
}

const sql = fs.readFileSync(file, "utf8");

(async () => {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log(`OK: ${file} toegepast.`);
  } catch (e) {
    console.error("Migratie-fout:", e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();

// Past een SQL-bestand toe op de live database via SUPABASE_DB_URL.
// Bedoeld voor idempotente, additieve migraties (add column if not exists, etc.).
// Leest SUPABASE_DB_URL uit process.env of uit .env.local (geen dotenv nodig).
// Gebruik: node scripts/apply-sql.cjs <pad-naar.sql>

const fs = require("fs");
const { Client } = require("pg");

function leesEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const txt = fs.readFileSync(".env.local", "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && m[1] === key) {
        let v = m[2].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        return v;
      }
    }
  } catch {
    // .env.local niet leesbaar
  }
  return undefined;
}

const file = process.argv[2];
if (!file) {
  console.error("Gebruik: node scripts/apply-sql.cjs <pad.sql>");
  process.exit(1);
}
const url = leesEnv("SUPABASE_DB_URL");
if (!url) {
  console.error("SUPABASE_DB_URL niet gevonden (process.env of .env.local)");
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

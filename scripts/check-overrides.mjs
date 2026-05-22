// scripts/check-overrides.mjs
//
// Check welke overrides bestaan in tekst_overrides + playbook_overrides
// voor een gegeven namespace + sleutel-patroon. Gebruik:
//   node scripts/check-overrides.mjs <namespace> <sleutel-patroon>
// Voorbeeld:
//   node scripts/check-overrides.mjs sprint-dag "%namen-toevoegen%"

import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const namespace = process.argv[2];
const patroon = process.argv[3];
if (!namespace || !patroon) {
  console.error("FAIL: geef <namespace> en <sleutel-patroon> mee");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  console.log(`▶ Check tekst_overrides voor namespace='${namespace}' sleutel LIKE '${patroon}'\n`);
  const tekstQ = await client.query(
    `select sleutel, length(waarde) as len, substring(waarde, 1, 80) as preview, updated_at
     from public.tekst_overrides
     where namespace = $1 and sleutel like $2
     order by sleutel`,
    [namespace, patroon],
  );
  if (tekstQ.rows.length === 0) {
    console.log("(geen overrides gevonden)\n");
  } else {
    for (const r of tekstQ.rows) {
      console.log(`  ${r.sleutel}`);
      console.log(`    lengte: ${r.len}, updated: ${r.updated_at}`);
      console.log(`    preview: ${r.preview}...`);
      console.log("");
    }
  }

  await client.end();
} catch (e) {
  await client.end();
  console.error(`❌ FOUT: ${e.message}`);
  process.exit(1);
}

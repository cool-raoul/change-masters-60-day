// scripts/backfill-bot-tool-tag.mjs
//
// Voeg "Tweede Lente bot" toe aan ingezette_tools voor alle prospects
// die via Tweede Lente zijn binnengekomen (notitie begint met
// '🌷 VIA TWEEDE LENTE BOT'). Zo krijgen ze de pijplijn-badge.

import pg from "pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();

const candidates = await client.query(`
  select id, volledige_naam, ingezette_tools
  from prospects
  where notities like '🌷 VIA TWEEDE LENTE BOT%'
     or notities like '%VIA TWEEDE LENTE BOT%'
`);

console.log(`Gevonden: ${candidates.rows.length} prospects via Tweede Lente`);

for (const row of candidates.rows) {
  const tools = row.ingezette_tools ?? [];
  if (tools.includes("Tweede Lente bot")) {
    console.log(`- ${row.volledige_naam}: tool-tag al gezet, overslaan`);
    continue;
  }
  const nieuwe = [...tools, "Tweede Lente bot"];
  await client.query(
    `update prospects set ingezette_tools = $1, updated_at = now() where id = $2`,
    [nieuwe, row.id],
  );
  console.log(`✓ Tag toegevoegd aan ${row.volledige_naam}`);
}

await client.end();
console.log("Klaar.");

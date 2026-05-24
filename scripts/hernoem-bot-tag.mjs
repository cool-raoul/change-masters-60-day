// scripts/hernoem-bot-tag.mjs
// Vervang oude 'Tweede Lente bot' tag door 'Freebie: Tweede Lente'
// in ingezette_tools voor alle prospects.

import pg from "pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();

const rows = await client.query(`
  select id, volledige_naam, ingezette_tools
  from prospects
  where 'Tweede Lente bot' = ANY(ingezette_tools)
`);

console.log(`Gevonden: ${rows.rows.length} prospects met oude tag`);

for (const r of rows.rows) {
  const nieuwe = (r.ingezette_tools ?? [])
    .filter((t) => t !== "Tweede Lente bot");
  if (!nieuwe.includes("Freebie: Tweede Lente")) {
    nieuwe.push("Freebie: Tweede Lente");
  }
  await client.query(
    `update prospects set ingezette_tools = $1, updated_at = now() where id = $2`,
    [nieuwe, r.id],
  );
  console.log(`✓ ${r.volledige_naam}`);
}

await client.end();
console.log("Klaar.");

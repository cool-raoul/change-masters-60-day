// scripts/backfill-ingevuld-tag.mjs
// Geef bestaande Tweede Lente prospects de tag 'Vragenlijst ingevuld'
// als hun notitie de spiegel-tekst bevat (= bot is afgemaakt).

import pg from "pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();

const rows = await client.query(`
  select id, volledige_naam, ingezette_tools
  from prospects
  where 'Freebie: Tweede Lente' = ANY(ingezette_tools)
    and notities like '%Spiegel die ze zag:%'
    and not ('Vragenlijst ingevuld' = ANY(ingezette_tools))
`);
console.log(`Gevonden: ${rows.rows.length} prospects met afgeronde bot`);

for (const r of rows.rows) {
  const nieuwe = [...(r.ingezette_tools ?? []), "Vragenlijst ingevuld"];
  await client.query(
    `update prospects set ingezette_tools = $1, updated_at = now() where id = $2`,
    [nieuwe, r.id],
  );
  console.log(`✓ ${r.volledige_naam}`);
}
await client.end();
console.log("Klaar.");

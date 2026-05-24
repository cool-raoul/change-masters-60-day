// scripts/check-raoul-bestellinks.mjs
import pg from "pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();

// Member-ids uit eerdere diagnose
const founders = await client.query(`
  select id, full_name, role, modus
  from profiles
  where role = 'founder' or full_name ilike '%raoul%' or full_name ilike '%gaby%'
  limit 10
`);
console.log("\n=== founders / Raoul / Gaby ===");
console.table(founders.rows);

const ids = founders.rows.map((r) => r.id);
if (ids.length > 0) {
  const links = await client.query(
    `select user_id, pakket_key, label, url
     from member_bestellinks
     where user_id = ANY($1::uuid[])
       and (pakket_key like 'hormoonbalans%' or pakket_key like '%hormoon%')`,
    [ids],
  );
  console.log("\n=== hormoonbalans-bestellinks van founders ===");
  console.table(links.rows);

  const allLinks = await client.query(
    `select user_id, count(*) as aantal
     from member_bestellinks
     where user_id = ANY($1::uuid[])
     group by user_id`,
    [ids],
  );
  console.log("\n=== totaal-aantal bestellinks per founder ===");
  console.table(allLinks.rows);
}

await client.end();

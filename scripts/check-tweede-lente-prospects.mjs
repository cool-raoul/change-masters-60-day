// scripts/check-tweede-lente-prospects.mjs
//
// Diagnose-script: kijk wat er in prospects + freebie_opt_ins is
// terechtgekomen voor de Tweede Lente-bot.
//
// Gebruik: node scripts/check-tweede-lente-prospects.mjs

import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("FAIL: SUPABASE_DB_URL niet gevonden in .env.local");
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();

console.log("\n=== freebie_opt_ins met bron tweede-lente-bot ===");
const optIns = await client.query(`
  select id, member_id, lead_naam, lead_email, bron_kanaal, status, created_at, spiegel_tekst is not null as has_spiegel
  from freebie_opt_ins
  where bron_kanaal = 'tweede-lente-bot'
  order by created_at desc
  limit 10
`);
console.table(optIns.rows);

console.log("\n=== prospects met bron tweede-lente-bot ===");
const prospects = await client.query(`
  select id, user_id, volledige_naam, email, bron, pipeline_fase, prioriteit, created_at
  from prospects
  where bron = 'tweede-lente-bot'
  order by created_at desc
  limit 10
`);
console.table(prospects.rows);

console.log("\n=== prospects-kolommen ===");
const cols = await client.query(`
  select column_name, data_type, is_nullable
  from information_schema.columns
  where table_name = 'prospects' and table_schema = 'public'
  order by ordinal_position
`);
console.table(cols.rows);

console.log("\n=== check-constraints op prospects ===");
const checks = await client.query(`
  select conname, pg_get_constraintdef(oid) as definition
  from pg_constraint
  where conrelid = 'public.prospects'::regclass and contype = 'c'
`);
console.table(checks.rows);

await client.end();

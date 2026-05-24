// scripts/check-token-eigenaar.mjs
//
// Check welke member-id achter een specifieke token zit, en kijk
// daarna welke prospects + bestellinks die member heeft.

import pg from "pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();

const TOKEN = process.argv[2] || "g2xcdxmi8u16frg0";

console.log(`\n=== Token: ${TOKEN} ===`);
const tokenInfo = await client.query(
  `select t.token, t.member_id, t.created_at, p.full_name, p.role, p.modus
   from freebie_bot_member_tokens t
   left join profiles p on p.id = t.member_id
   where t.token = $1`,
  [TOKEN],
);
console.table(tokenInfo.rows);

if (tokenInfo.rows.length === 0) {
  console.log("Token niet gevonden");
  await client.end();
  process.exit();
}

const memberId = tokenInfo.rows[0].member_id;

console.log(`\n=== Recente opt-ins voor deze member ===`);
const optIns = await client.query(
  `select id, lead_naam, lead_email, status, created_at
   from freebie_opt_ins
   where member_id = $1
   order by created_at desc limit 10`,
  [memberId],
);
console.table(optIns.rows);

console.log(`\n=== Recente prospects voor deze member ===`);
const prospects = await client.query(
  `select id, volledige_naam, email, bron, pipeline_fase, ingezette_tools, created_at
   from prospects
   where user_id = $1
   order by created_at desc limit 10`,
  [memberId],
);
console.table(prospects.rows);

console.log(`\n=== Hormoonbalans-bestellinks van deze member ===`);
const links = await client.query(
  `select pakket_key, url
   from member_bestellinks
   where user_id = $1
     and pakket_key like 'hormoonbalans%'`,
  [memberId],
);
console.table(links.rows);

await client.end();

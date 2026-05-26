// scripts/maak-test-token.mjs
//
// Maakt een tracking-token aan voor een specifieke member + bot,
// zonder dat de member ingelogd hoeft te zijn. Voor test-doeleinden.
//
// Gebruik: node scripts/maak-test-token.mjs <member-id> <bot-slug>

import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const TOKEN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
function genereerToken() {
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return result;
}

const memberId = process.argv[2];
const botSlug = process.argv[3];

if (!memberId || !botSlug) {
  console.error("Gebruik: node scripts/maak-test-token.mjs <member-id> <bot-slug>");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();

// Kijk of er al een token bestaat
const bestaand = await client.query(
  `select token from freebie_bot_member_tokens where member_id = $1 and bot_slug = $2`,
  [memberId, botSlug],
);

if (bestaand.rows.length > 0) {
  console.log(`✓ Bestaande token: ${bestaand.rows[0].token}`);
  console.log(`URL: /bot/${botSlug}/${bestaand.rows[0].token}`);
} else {
  const token = genereerToken();
  await client.query(
    `insert into freebie_bot_member_tokens (member_id, bot_slug, token)
     values ($1, $2, $3)`,
    [memberId, botSlug, token],
  );
  console.log(`✓ Nieuwe token aangemaakt: ${token}`);
  console.log(`URL: /bot/${botSlug}/${token}`);
}

await client.end();

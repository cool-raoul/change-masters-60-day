// scripts/zet-flag-aan.mjs
//
// Zet core_v6_actief = true voor een user-id (op email).
// Gebruik: node scripts/zet-flag-aan.mjs <email>

import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = process.argv[2];
if (!email) {
  console.error("FAIL: geef een email mee als argument");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  // Vind de user via auth.users (waar de emails staan)
  const userQ = await client.query(
    "select id, email from auth.users where email = $1",
    [email],
  );

  if (userQ.rows.length === 0) {
    console.error(`❌ Geen user gevonden met email ${email}`);
    await client.end();
    process.exit(1);
  }

  const userId = userQ.rows[0].id;
  console.log(`▶ User gevonden: ${email} (id: ${userId})`);

  // Zet de flag aan
  const result = await client.query(
    "update public.profiles set core_v6_actief = true where id = $1 returning core_v6_actief",
    [userId],
  );

  if (result.rows.length === 0) {
    console.error(`❌ Geen profiel-rij gevonden voor user ${userId}`);
    await client.end();
    process.exit(1);
  }

  console.log(`✅ core_v6_actief staat nu op: ${result.rows[0].core_v6_actief}`);
  console.log(`✅ ${email} kan vanaf nu /core-v6 openen`);
  await client.end();
} catch (e) {
  await client.end();
  console.error(`❌ FOUT: ${e.message}`);
  process.exit(1);
}

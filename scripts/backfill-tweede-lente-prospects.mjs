// scripts/backfill-tweede-lente-prospects.mjs
//
// One-shot backfill: bestaande freebie_opt_ins met bron='tweede-lente-bot'
// die wegens de bron-check-constraint-bug GEEN prospect-rij hebben
// gekregen, alsnog handmatig invoegen in de prospects-tabel.
//
// Gebruik: node scripts/backfill-tweede-lente-prospects.mjs

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

// Pak alle opt-ins van tweede-lente waarvan we GEEN prospects-rij hebben
// (gematched op member_id + email).
const orphans = await client.query(`
  select
    o.id as opt_in_id,
    o.member_id,
    o.lead_naam,
    o.lead_email,
    o.spiegel_tekst,
    o.bot_antwoorden,
    o.created_at
  from freebie_opt_ins o
  where o.bron_kanaal = 'tweede-lente-bot'
    and not exists (
      select 1 from prospects p
      where p.user_id = o.member_id
        and lower(p.email) = lower(o.lead_email)
    )
  order by o.created_at
`);

console.log(`Gevonden orphan opt-ins (geen prospect-rij): ${orphans.rows.length}`);

for (const row of orphans.rows) {
  const a = row.bot_antwoorden ?? {};
  const datum = new Date(row.created_at).toLocaleDateString("nl-NL");
  const notities = [
    `🌷 VIA TWEEDE LENTE BOT (${datum})`,
    `Fase: ${a.fase ?? "?"}`,
    `Valt op: ${(a.watValtOp ?? []).join(", ")}`,
    `Eet-ritme: ${a.eetRitme ?? "?"}`,
    `Beweging: ${a.beweging ?? "?"}`,
    `Rust: ${a.rust ?? "?"}`,
    `Deelt met: ${a.deel ?? "?"}`,
    `Zoekt: ${a.zoek ?? "?"}`,
    "",
    "Spiegel die ze zag:",
    row.spiegel_tekst ?? "(geen)",
    "",
    "[Backfill 2026-05-24: oorspronkelijk insert faalde door bron-check-constraint]",
  ].join("\n");

  try {
    await client.query(
      `insert into prospects
        (user_id, volledige_naam, email, bron, pipeline_fase, prioriteit, notities)
       values ($1, $2, $3, 'social', 'prospect', 'normaal', $4)`,
      [row.member_id, row.lead_naam, row.lead_email, notities],
    );
    console.log(`✓ Aangemaakt: ${row.lead_naam} (${row.lead_email}) voor member ${row.member_id}`);
  } catch (e) {
    console.error(`✗ Faalt voor ${row.lead_email}:`, e.message);
  }
}

await client.end();
console.log("Klaar.");

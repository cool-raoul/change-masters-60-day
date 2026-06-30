/* eslint-disable */
// ============================================================
// Migratie: oude prospects.notities -> contact_logs (notitieboekje)
//
// Zet de verspreide, opgestapelde notities-tekst van bestaande
// prospects om naar losse, gedateerde regels in de contact_logs-
// tijdlijn (het nieuwe notitieboekje). NIET-DESTRUCTIEF: prospects.
// notities blijft staan als back-up; we KOPIEREN alleen.
//
// Splitsing per prospect:
//   - "🌷 VIA ... (dd-m-jjjj)"-blok  -> aparte regel met die datum
//   - "[dd-m-jjjj] ..."-stempel      -> aparte regel met die datum
//   - de overige vrije tekst          -> één regel op created_at
//
// Ontdubbeling:
//   - identieke segmenten binnen één kaart worden 1 regel
//   - een segment dat (qua tekst) al als bestaande contact-log op de
//     kaart staat wordt overgeslagen (geen kopie van wat er al is)
//
// Idempotent: elke aangemaakte regel krijgt script_gebruikt =
// 'migratie-notitieboekje'. Een prospect die zo'n regel al heeft
// wordt overgeslagen, dus dubbel draaien kan geen kwaad.
//
// Gebruik:
//   node scripts/migratie-notitieboekje.cjs            (DRY-RUN, alleen tonen)
//   node scripts/migratie-notitieboekje.cjs --commit   (echt wegschrijven)
//   ... --all                                          (alle users i.p.v. Gaby+Raoul)
// ============================================================

const { Client } = require("pg");
const fs = require("fs");

const COMMIT = process.argv.includes("--commit");
const ALLE = process.argv.includes("--all");
const MARKER = "migratie-notitieboekje";

const DOEL_EMAILS = ["gabyvijfs@gmail.com", "raoulzeewijk@hotmail.com"];

function isoVan(d, m, y, offsetMin = 0) {
  const dt = new Date(Number(y), Number(m) - 1, Number(d), 12, offsetMin, 0);
  return dt.toISOString();
}

// Normaliseer tekst voor ontdubbeling (kleine letters, alleen letters/cijfers).
function norm(t) {
  return String(t)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 160);
}

// Splitst één notities-tekst in gedateerde segmenten.
function splitsNotities(notities, createdAtIso) {
  const regels = String(notities).split(/\r?\n/);
  const segmenten = [];
  let huidig = { soort: "algemeen", datum: null, regels: [] };
  const flush = () => {
    if (huidig.regels.join("").trim().length > 0) segmenten.push(huidig);
  };
  const stempelRe = /^\s*\[(\d{1,2})-(\d{1,2})-(\d{4})\]/;

  for (const regel of regels) {
    const isIntake = regel.includes("🌷");
    const stempel = regel.match(stempelRe);
    if (isIntake) {
      flush();
      huidig = { soort: "intake", datum: null, regels: [regel] };
    } else if (stempel) {
      flush();
      huidig = {
        soort: "gedateerd",
        datum: isoVan(stempel[1], stempel[2], stempel[3]),
        regels: [regel],
      };
    } else {
      huidig.regels.push(regel);
    }
  }
  flush();

  segmenten.forEach((s, i) => {
    if (s.soort === "intake" && !s.datum) {
      const t = s.regels.join("\n");
      const m = t.match(/\((\d{1,2})-(\d{1,2})-(\d{4})\)/);
      if (m) s.datum = isoVan(m[1], m[2], m[3], i);
    }
    if (!s.datum) {
      const base = new Date(createdAtIso);
      base.setSeconds(base.getSeconds() + i);
      s.datum = base.toISOString();
    }
    let tekst = s.regels.join("\n").trim();
    // De "[dd-m-jjjj]"-stempel weghalen: de regel is nu zelf gedateerd.
    if (s.soort === "gedateerd") {
      tekst = tekst.replace(/^\s*\[\d{1,2}-\d{1,2}-\d{4}\]\s*/, "");
    }
    s.tekst = tekst;
  });

  return segmenten;
}

(async () => {
  const url = fs
    .readFileSync(".env.local", "utf8")
    .match(/^SUPABASE_DB_URL=(.+)$/m)[1]
    .trim();
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();

  let users;
  if (ALLE) {
    users = (await c.query("select id, email, full_name from profiles order by full_name")).rows;
  } else {
    users = (
      await c.query("select id, email, full_name from profiles where email = any($1)", [DOEL_EMAILS])
    ).rows;
  }

  console.log(
    `\n=== Migratie notitieboekje === ${COMMIT ? "ECHT WEGSCHRIJVEN" : "DRY-RUN (niets wordt opgeslagen)"}`,
  );
  console.log("Accounts:", users.map((u) => u.full_name).join(", "), "\n");

  let totProspects = 0,
    totSegmenten = 0,
    totOvergeslagen = 0,
    totDubbel = 0;
  const voorbeelden = [];

  for (const u of users) {
    const prospects = (
      await c.query(
        "select id, volledige_naam, notities, created_at from prospects where user_id=$1 and notities is not null and length(trim(notities))>0",
        [u.id],
      )
    ).rows;

    let uProspects = 0,
      uSegmenten = 0,
      uOver = 0;

    for (const p of prospects) {
      const al = await c.query(
        "select 1 from contact_logs where prospect_id=$1 and script_gebruikt=$2 limit 1",
        [p.id, MARKER],
      );
      if (al.rowCount > 0) {
        uOver++;
        continue;
      }

      // Bestaande (niet-gemigreerde) logs: hun tekst niet opnieuw kopiëren.
      const bestaand = await c.query(
        "select notities from contact_logs where prospect_id=$1 and (script_gebruikt is distinct from $2)",
        [p.id, MARKER],
      );
      const gezien = new Set();
      for (const b of bestaand.rows) if (b.notities) gezien.add(norm(b.notities));

      const ruw = splitsNotities(p.notities, p.created_at.toISOString());
      const segmenten = [];
      for (const s of ruw) {
        const key = norm(s.tekst);
        if (!key || gezien.has(key)) {
          totDubbel++;
          continue;
        }
        gezien.add(key);
        segmenten.push(s);
      }
      if (segmenten.length === 0) continue;

      uProspects++;
      uSegmenten += segmenten.length;

      if (voorbeelden.length < 8) {
        voorbeelden.push({
          naam: p.volledige_naam,
          segmenten: segmenten.map((s) => ({
            soort: s.soort,
            datum: s.datum.slice(0, 10),
            kop: s.tekst.replace(/\s+/g, " ").slice(0, 64),
          })),
        });
      }

      if (COMMIT) {
        for (const s of segmenten) {
          await c.query(
            "insert into contact_logs (prospect_id, user_id, contact_type, notities, created_at, script_gebruikt) values ($1,$2,'notitie',$3,$4,$5)",
            [p.id, u.id, s.tekst, s.datum, MARKER],
          );
        }
      }
    }

    console.log(
      `${u.full_name}: ${uProspects} kaarten -> ${uSegmenten} regels${uOver ? ` (${uOver} al gemigreerd)` : ""}`,
    );
    totProspects += uProspects;
    totSegmenten += uSegmenten;
    totOvergeslagen += uOver;
  }

  console.log(
    `\nTOTAAL: ${totProspects} kaarten -> ${totSegmenten} regels (${totDubbel} dubbele overgeslagen${totOvergeslagen ? `, ${totOvergeslagen} kaarten al gemigreerd` : ""})`,
  );

  console.log("\n--- VOORBEELDEN (hoe het splitst) ---");
  for (const v of voorbeelden) {
    console.log(`\n### ${v.naam} (${v.segmenten.length} regels)`);
    for (const s of v.segmenten) {
      console.log(`  [${s.datum}] ${s.soort.padEnd(10)} ${s.kop}`);
    }
  }

  if (!COMMIT)
    console.log("\n(DRY-RUN: er is niets weggeschreven. Draai met --commit om het echt te doen.)");

  await c.end();
})().catch((e) => {
  console.error("FOUT:", e.message);
  process.exit(1);
});

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
  // dd-m-jjjj -> ISO timestamp op 12:00 + offset (volgorde binnen dag behouden)
  const dt = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    12,
    offsetMin,
    0,
  );
  return dt.toISOString();
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

  // datums afronden + volgorde-offset binnen dezelfde dag
  segmenten.forEach((s, i) => {
    if (s.soort === "intake" && !s.datum) {
      const t = s.regels.join("\n");
      const m = t.match(/\((\d{1,2})-(\d{1,2})-(\d{4})\)/);
      if (m) s.datum = isoVan(m[1], m[2], m[3], i);
    }
    if (!s.datum) {
      // algemeen + fallback: op created_at (met kleine offset voor volgorde)
      const base = new Date(createdAtIso);
      base.setSeconds(base.getSeconds() + i);
      s.datum = base.toISOString();
    }
    s.tekst = s.regels.join("\n").trim();
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
    users = (
      await c.query(
        "select id, email, full_name from profiles order by full_name",
      )
    ).rows;
  } else {
    users = (
      await c.query(
        "select id, email, full_name from profiles where email = any($1)",
        [DOEL_EMAILS],
      )
    ).rows;
  }

  console.log(
    `\n=== Migratie notitieboekje === ${COMMIT ? "ECHT WEGSCHRIJVEN" : "DRY-RUN (niets wordt opgeslagen)"}`,
  );
  console.log("Accounts:", users.map((u) => u.full_name).join(", "), "\n");

  let totProspects = 0,
    totSegmenten = 0,
    totOvergeslagen = 0;
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
      // idempotent: al gemigreerd?
      const al = await c.query(
        "select 1 from contact_logs where prospect_id=$1 and script_gebruikt=$2 limit 1",
        [p.id, MARKER],
      );
      if (al.rowCount > 0) {
        uOver++;
        continue;
      }

      const segmenten = splitsNotities(p.notities, p.created_at.toISOString());
      if (segmenten.length === 0) continue;

      uProspects++;
      uSegmenten += segmenten.length;

      if (voorbeelden.length < 6) {
        voorbeelden.push({
          naam: p.volledige_naam,
          segmenten: segmenten.map((s) => ({
            soort: s.soort,
            datum: s.datum.slice(0, 10),
            kop: s.tekst.replace(/\s+/g, " ").slice(0, 70),
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
      `${u.full_name}: ${uProspects} kaarten -> ${uSegmenten} regels${uOver ? ` (${uOver} al gemigreerd, overgeslagen)` : ""}`,
    );
    totProspects += uProspects;
    totSegmenten += uSegmenten;
    totOvergeslagen += uOver;
  }

  console.log(
    `\nTOTAAL: ${totProspects} kaarten -> ${totSegmenten} regels${totOvergeslagen ? `, ${totOvergeslagen} overgeslagen` : ""}`,
  );

  console.log("\n--- VOORBEELDEN (hoe het splitst) ---");
  for (const v of voorbeelden) {
    console.log(`\n### ${v.naam} (${v.segmenten.length} regels)`);
    for (const s of v.segmenten) {
      console.log(`  [${s.datum}] ${s.soort.padEnd(10)} ${s.kop}`);
    }
  }

  if (!COMMIT)
    console.log(
      "\n(DRY-RUN: er is niets weggeschreven. Draai met --commit om het echt te doen.)",
    );

  await c.end();
})().catch((e) => {
  console.error("FOUT:", e.message);
  process.exit(1);
});

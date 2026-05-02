import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// ============================================================
// rename-fase-naar-projectweek.mjs
//
// Vervangt 'Fase 1/2/3' / 'fase 1/2/3' → 'Projectweek 1/2/3' /
// 'projectweek 1/2/3' overal in code en content. Selectief: NIET
// `pipeline_fase` (DB-kolom), NIET `fase: 1` (TypeScript veld op
// Dag-type), NIET 'FASE' in project-management comments.
//
// Vervangingen zijn case-aware: hoofdletter blijft hoofdletter.
// ============================================================

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".turbo",
  ".vercel",
  "scripts",
]);
const SKIP_FILE_PATTERNS = [/^recovered-thread/i];
const TOEGESTANE_EXT = new Set([".ts", ".tsx", ".md", ".mdx", ".sql"]);

async function lijstBestanden(dir, accumulator = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const volledig = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await lijstBestanden(volledig, accumulator);
    } else if (entry.isFile()) {
      if (SKIP_FILE_PATTERNS.some((p) => p.test(entry.name))) continue;
      const ext = entry.name.match(/\.[^.]+$/)?.[0];
      if (!ext || !TOEGESTANE_EXT.has(ext)) continue;
      accumulator.push(volledig);
    }
  }
  return accumulator;
}

function vervangFase(tekst) {
  let nieuw = tekst;

  // Pattern 1: 'Fase 1' / 'Fase 2' / 'Fase 3' (kapitaal F + cijfer 1-3)
  // → 'Projectweek 1/2/3'. Niet matchen op andere getallen.
  nieuw = nieuw.replace(/\bFase ([123])\b/g, "Projectweek $1");
  // Pattern 2: 'fase 1' / 'fase 2' / 'fase 3' (kleine f)
  nieuw = nieuw.replace(/\bfase ([123])\b/g, "projectweek $1");
  // Pattern 3: 'FASE 1' / 'FASE 2' / 'FASE 3' (alle hoofdletters in
  // teaching-content). NIET in roadmap-comments waar 'FASE 2' / 'FASE 3'
  // verwijst naar project-management-fases — die zitten in TODO-lijsten
  // en CLAUDE.md, niet in playbook content.
  nieuw = nieuw.replace(/\bFASE ([123])\b/g, "PROJECTWEEK $1");

  return nieuw;
}

const bestanden = await lijstBestanden(ROOT);
let totaalVervangen = 0;
let bestandenAangepast = 0;
const aangepasteBestanden = [];

for (const pad of bestanden) {
  let inhoud;
  try {
    inhoud = readFileSync(pad, "utf-8");
  } catch {
    continue;
  }

  const matches = inhoud.match(/\b[Ff]ase [123]\b|\bFASE [123]\b/g);
  if (!matches) continue;

  const nieuw = vervangFase(inhoud);
  if (nieuw === inhoud) continue;

  writeFileSync(pad, nieuw, "utf-8");
  totaalVervangen += matches.length;
  bestandenAangepast++;
  aangepasteBestanden.push(pad.replace(ROOT + "\\", "").replace(ROOT + "/", ""));
}

console.log(`✓ ${bestandenAangepast} bestanden aangepast`);
console.log(`✓ ${totaalVervangen} 'fase X' vervangen door 'projectweek X'`);
if (aangepasteBestanden.length <= 30) {
  console.log("Bestanden:");
  for (const b of aangepasteBestanden) console.log(`  ${b}`);
}

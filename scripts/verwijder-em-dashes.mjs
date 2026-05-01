import { readFileSync, writeFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// ============================================================
// verwijder-em-dashes.mjs
//
// Em-dashes (—) voelen AI-gegenereerd en hebben in nuchter Nederlands
// taalgebruik geen plek. Dit script loopt door alle code/content-files
// en vervangt em-dashes met natuurlijke alternatieven:
//
//   " — "  (em-dash midden in zin als pauze)  → ", "
//   "—"    (em-dash zonder spaties)           → " "
//   " —"   (em-dash aan eind, voor een nieuwe zin) → ", "
//   "—"    (em-dash aan begin)                → ""
//
// Niet-aangeraakte plekken: .next, node_modules, .git, recovered-thread*,
// dist, build. Alleen .ts/.tsx/.md/.mdx bestanden.
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
  "scripts", // Zelf niet vervangen
]);
const SKIP_FILE_PATTERNS = [/^recovered-thread/i];
const TOEGESTANE_EXT = new Set([".ts", ".tsx", ".md", ".mdx"]);

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

function vervangEmDashes(tekst) {
  let nieuw = tekst;

  // Volgorde-afhankelijk: eerst meest specifieke patronen.
  // 1. " — " (spatie em-dash spatie) → ", "
  nieuw = nieuw.replace(/ +— +/g, ", ");
  // 2. " —" aan eind van regel/string → "."
  nieuw = nieuw.replace(/ +—(?=\s*$)/gm, ".");
  // 3. "— " aan begin van regel → ""
  nieuw = nieuw.replace(/^ *— +/gm, "");
  // 4. " —" gevolgd door letter (zelden, ' —A') → ", "
  nieuw = nieuw.replace(/ +—(?=\S)/g, ", ");
  // 5. "— " (zonder voorafgaande spatie) → ""
  nieuw = nieuw.replace(/(?<=\S)— +/g, ", ");
  // 6. Resterende "—" zonder spaties (zelden) → "-"
  nieuw = nieuw.replace(/—/g, "-");

  return nieuw;
}

const bestanden = await lijstBestanden(ROOT);
let totaalVervangen = 0;
let bestandenAangepast = 0;

for (const pad of bestanden) {
  let inhoud;
  try {
    inhoud = readFileSync(pad, "utf-8");
  } catch {
    continue;
  }
  if (!inhoud.includes("—")) continue;

  // Tel hoeveel er waren
  const aantal = (inhoud.match(/—/g) || []).length;
  const nieuw = vervangEmDashes(inhoud);
  if (nieuw === inhoud) continue;

  writeFileSync(pad, nieuw, "utf-8");
  totaalVervangen += aantal;
  bestandenAangepast++;
}

console.log(`✓ ${bestandenAangepast} bestanden aangepast`);
console.log(`✓ ${totaalVervangen} em-dashes vervangen`);

import { readFileSync, writeFileSync } from "node:fs";

// Sponsor-taken die de SponsorMeldingKnop-embed krijgen.
// Voor elk: zet inlineEmbed: "sponsor-melding" en verwijder evt. de
// nu-redundante actieRoute (want embed handelt het zelf af).
const SPONSOR_TAKEN = [
  "dag2-kennismaak",
  "dag3-sponsor-checkin",
  "dag6-sponsor-tip",
  "dag7-sponsor-call",
  "dag14-sponsor-call",
  "dag21-sponsor-call",
];

const path = "lib/playbook/dagen.ts";
let content = readFileSync(path, "utf-8");

let toegevoegd = 0;
let alAanwezig = 0;

for (const taakId of SPONSOR_TAKEN) {
  const escapedId = taakId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blokRegex = new RegExp(
    `(\\{[^{}]*?id:\\s*"${escapedId}"[^{}]*?\\})`,
    "s",
  );
  const match = content.match(blokRegex);
  if (!match) {
    console.log(`  ❌ Niet gevonden: ${taakId}`);
    continue;
  }

  let blok = match[1];
  if (blok.includes("inlineEmbed:")) {
    alAanwezig++;
    continue;
  }

  // Stap 1: verwijder eventueel de actieRoute regel (want embed regelt
  // de actie zelf — wegnavigeren naar /team is niet meer nodig).
  blok = blok.replace(/\n\s*actieRoute:\s*"[^"]*",/g, "");

  // Stap 2: voeg inlineEmbed-veld toe vóór de afsluitende `}`.
  const insertieRegex = /\n(\s*)\}$/;
  const insertieMatch = blok.match(insertieRegex);
  if (!insertieMatch) {
    console.log(`  ⚠️  Geen sluit-} match: ${taakId}`);
    continue;
  }
  const indent = insertieMatch[1];
  const innerIndent = indent + "  ";
  const nieuwBlok = blok.replace(
    insertieRegex,
    `\n${innerIndent}inlineEmbed: "sponsor-melding",\n${indent}}`,
  );

  content = content.replace(match[1], nieuwBlok);
  toegevoegd++;
}

writeFileSync(path, content, "utf-8");

console.log(`✓ Toegevoegd: ${toegevoegd}`);
console.log(`⊘ Hadden al inlineEmbed: ${alAanwezig}`);

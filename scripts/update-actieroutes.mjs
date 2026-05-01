import { readFileSync, writeFileSync } from "node:fs";

// Mapping van taak-id naar actieRoute. Taken die al een actieRoute,
// inlineEmbed of inlineActie hebben → automatisch overgeslagen.
const ROUTES = {
  // Dag 2
  "dag2-20-namen": "/namenlijst",
  "dag2-onboarding-module": "/onboarding",
  "dag2-kennismaak": "/team",
  "dag2-3-invites": "/namenlijst",
  "dag2-3weg-uitleg": "/onboarding",
  // Dag 3
  "dag3-social-3": "/namenlijst",
  "dag3-invites-5": "/namenlijst",
  "dag3-dagelijks-5": "/namenlijst",
  "dag3-eerste-gesprek": "/namenlijst",
  "dag3-sponsor-checkin": "/team",
  // Dag 4
  "dag4-uitnodiging-1-5": "/namenlijst",
  "dag4-3weg-optioneel": "/namenlijst",
  "dag4-social-3": "/namenlijst",
  "dag4-follow-1": "/namenlijst",
  // Dag 5
  "dag5-invites-5": "/namenlijst",
  "dag5-followups-3": "/namenlijst",
  "dag5-social-3": "/namenlijst",
  "dag5-onboarding-bezwaar": "/onboarding",
  "dag5-roleplay": "/coach",
  "dag5-eric-worre-start":
    "https://open.spotify.com/search/eric%20worre%20network%20marketing%20pro",
  // Dag 6
  "dag6-invites-5": "/namenlijst",
  "dag6-followups-3": "/namenlijst",
  "dag6-social-3": "/namenlijst",
  "dag6-sponsor-tip": "/team",
  // Dag 7
  "dag7-review": "/statistieken",
  "dag7-rust-5": "/namenlijst",
  "dag7-followups-3": "/namenlijst",
  "dag7-sponsor-call": "/team",
  // Dag 8
  "dag8-invites-10": "/namenlijst",
  "dag8-followups-5": "/namenlijst",
  "dag8-social-3": "/namenlijst",
  // Dag 9
  "dag9-invites-10": "/namenlijst",
  "dag9-followups-5": "/namenlijst",
  "dag9-social-3": "/namenlijst",
  "dag9-3weg-verdieping": "/onboarding",
  // Dag 10
  "dag10-3weg-1": "/namenlijst",
  "dag10-invites-10": "/namenlijst",
  "dag10-followups-5": "/namenlijst",
  "dag10-social-3": "/namenlijst",
  // Dag 11
  "dag11-invites-10": "/namenlijst",
  "dag11-followups-5": "/namenlijst",
  "dag11-social-3": "/namenlijst",
  "dag11-lees-flow": "/onboarding",
  // Dag 12
  "dag12-invites-10": "/namenlijst",
  "dag12-followups-5": "/namenlijst",
  "dag12-social-3": "/namenlijst",
  "dag12-pivot-1": "/namenlijst",
  // Dag 13
  "dag13-invites-10": "/namenlijst",
  "dag13-followups-5": "/namenlijst",
  "dag13-social-3": "/namenlijst",
  "dag13-form-1": "/namenlijst",
  "dag13-koud-warm": "/namenlijst",
  // Dag 14
  "dag14-review": "/statistieken",
  "dag14-invites-10": "/namenlijst",
  "dag14-followups-5": "/namenlijst",
  "dag14-pipeline-check": "/namenlijst",
  "dag14-sponsor-call": "/team",
  // Dag 15
  "dag15-followups-10": "/namenlijst",
  "dag15-invites-10": "/namenlijst",
  "dag15-social-3": "/namenlijst",
  // Dag 16
  "dag16-invites-10": "/namenlijst",
  "dag16-followups-10": "/namenlijst",
  "dag16-social-3": "/namenlijst",
  "dag16-categoriseer": "/namenlijst",
  // Dag 17
  "dag17-invites-10": "/namenlijst",
  "dag17-followups-10": "/namenlijst",
  "dag17-social-3": "/namenlijst",
  "dag17-closing": "/namenlijst",
  // Dag 18
  "dag18-invites-10": "/namenlijst",
  "dag18-followups-10": "/namenlijst",
  "dag18-social-3": "/namenlijst",
  "dag18-edification-toepassen": "/namenlijst",
  // Dag 19
  "dag19-invites-10": "/namenlijst",
  "dag19-followups-10": "/namenlijst",
  "dag19-social-3": "/namenlijst",
  "dag19-pipeline": "/namenlijst",
  // Dag 20
  "dag20-invites-10": "/namenlijst",
  "dag20-followups-10": "/namenlijst",
  "dag20-social-3": "/namenlijst",
  "dag20-vraag-1": "/namenlijst",
  // Dag 21
  "dag21-review-3": "/statistieken",
  "dag21-review-21": "/statistieken",
  "dag21-doel-40": "/mijn-why",
  "dag21-sponsor-call": "/team",
};

const path = "lib/playbook/dagen.ts";
let content = readFileSync(path, "utf-8");

let toegevoegd = 0;
let overgeslagen = 0;
const nietGevonden = [];

for (const [taakId, route] of Object.entries(ROUTES)) {
  // Vind taak-blok: vanaf `id: "taakId",` tot eerste sluit-`}` in dat object.
  // Patroon zoekt naar `id: "<id>",` plus alles tot een matching `}` op
  // hetzelfde indent-niveau (lazy match tot eerstvolgende `\n      }` of `\n    }`).
  const escapedId = taakId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blokRegex = new RegExp(
    `(\\{[^{}]*?id:\\s*"${escapedId}"[^{}]*?\\})`,
    "s",
  );
  const match = content.match(blokRegex);
  if (!match) {
    nietGevonden.push(taakId);
    continue;
  }

  const blok = match[1];
  if (
    blok.includes("actieRoute:") ||
    blok.includes("inlineEmbed:") ||
    blok.includes("inlineActie:")
  ) {
    overgeslagen++;
    continue;
  }

  // Voeg actieRoute toe vóór de afsluitende `}` van dit blok.
  // We pakken de indent van de laatste regel binnen het blok.
  const insertieRegex = /\n(\s*)\}$/;
  const insertieMatch = blok.match(insertieRegex);
  if (!insertieMatch) {
    nietGevonden.push(taakId + " (geen sluit-}-match)");
    continue;
  }
  const indent = insertieMatch[1];
  const innerIndent = indent + "  "; // 2 extra spaces voor veld-indent
  const nieuwBlok = blok.replace(
    insertieRegex,
    `\n${innerIndent}actieRoute: "${route}",\n${indent}}`,
  );

  content = content.replace(blok, nieuwBlok);
  toegevoegd++;
}

writeFileSync(path, content, "utf-8");

console.log(`✓ Toegevoegd: ${toegevoegd}`);
console.log(`⊘ Overgeslagen (had al route/embed/actie): ${overgeslagen}`);
if (nietGevonden.length > 0) {
  console.log(`❌ Niet gevonden: ${nietGevonden.join(", ")}`);
}

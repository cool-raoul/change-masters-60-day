import { readFileSync, writeFileSync } from "node:fs";

// Vult lege uitleg-velden in dagen.ts voor de meest voorkomende
// taak-types in dag 2-21. Sjablonen zijn kort en consistent — geen
// robotachtige reuzenpassages, wel meer context dan alleen het label.
//
// ELEVA-geheugen-tip wordt toegevoegd aan namen-toevoeg-taken zodat
// members op meerdere plekken aan hun voorraadkast worden herinnerd.

const SJABLONEN = {
  // Pattern → uitleg-template
  "invites-5":
    "5 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → kies 'Uitnodigen' of laat de Mentor er één voor je schrijven. Mix warm (mensen die je goed kent) met lauw (telefoon-contacten waar je weinig mee praat).",
  "invites-10":
    "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
  "followups-3":
    "3 mensen die eerder een invite/info hebben gehad — vandaag een korte check-in. Open Namenlijst → kies prospect → 'Follow-up' of vraag de Mentor: 'Help me met een follow-up voor [naam]'. Niet 'heb je al beslist?' maar 'hoe gaat 't?'.",
  "followups-5":
    "5 mensen die eerder gehoord hebben — vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
  "followups-10":
    "10 follow-ups vandaag — het is follow-up-week, hier zit de oogst. Loop je pipeline door (Namenlijst → Pipeline) en stuur per persoon een passend bericht. Mentor helpt: 'Schrijf een follow-up voor [naam] die [status]'.",
  "social-3":
    "3 nieuwe namen uit Instagram, LinkedIn of Facebook. Wie reageert op je posts? Wie stuurt je af en toe een DM? Wie post zelf over energie/doelen/ondernemen? 1 woord context per naam ('fitness', 'oud-collega'). Voeg ze toe via Namenlijst → '+ Nieuwe prospect' of 'Mijn ELEVA-geheugen' als ze er al in staan.",
  "rust-5":
    "5 uitnodigingen vandaag — iets rustiger want het is review-dag. Mix warm + lauw zoals je gewend bent. Open Namenlijst → klik op prospect → 'Uitnodigen'.",
  "review":
    "5 minuten reflectie: wat ging goed, wat schuurde, waar focus ik volgende week op? Open /statistieken voor de review-vragenlijst. Je sponsor krijgt automatisch een korte samenvatting.",
  "pipeline":
    "Open Namenlijst → schakel naar de Pipeline-weergave. Loop de fases door (Prospect → Uitgenodigd → One-Pager → Presentatie → Follow-up → Member/Shopper). Waar zit je bottleneck? Daar gaat morgen je focus naartoe.",
};

// Mapping van taak-id-patroon → sjabloon-key (eerste match wint)
function pakSjabloonKey(taakId) {
  // Specifieke matches eerst
  if (/-invites-10$/.test(taakId)) return "invites-10";
  if (/-invites-5$/.test(taakId)) return "invites-5";
  if (/-followups-10$/.test(taakId)) return "followups-10";
  if (/-followups-5$/.test(taakId)) return "followups-5";
  if (/-followups-3$/.test(taakId)) return "followups-3";
  if (/-social-3$/.test(taakId)) return "social-3";
  if (/-rust-5$/.test(taakId)) return "rust-5";
  if (/-review$/.test(taakId)) return "review";
  if (/-pipeline(-check)?$/.test(taakId)) return "pipeline";
  return null;
}

const path = "lib/playbook/dagen.ts";
let content = readFileSync(path, "utf-8");

// Vind alle taak-blokken met `id: "dagX-..."` en check uitleg-aanwezigheid.
const taakRegex = /\{\s*\n\s*id:\s*"(dag\d+-[^"]+)"\s*,([^{}]*?)\n(\s*)\}/gs;

let toegevoegd = 0;
let alAanwezig = 0;
let geenSjabloon = 0;
const niets = [];

content = content.replace(taakRegex, (match, taakId, body, sluitIndent) => {
  if (/uitleg\s*:/.test(body)) {
    alAanwezig++;
    return match;
  }
  const key = pakSjabloonKey(taakId);
  if (!key) {
    geenSjabloon++;
    niets.push(taakId);
    return match;
  }
  const sjabloon = SJABLONEN[key];
  // Insert uitleg na de label-regel voor leesbaarheid.
  // body bevat de inhoud tussen `id: "..."` en de afsluitende `\n  }`.
  // Sluit-indent is de witregel voor de afsluitende `}` (bv. "      ").
  const innerIndent = sluitIndent + "  "; // 2 spaties extra
  // We voegen uitleg toe als laatste veld vóór de sluit-}.
  const nieuwBody = `${body}\n${innerIndent}uitleg:\n${innerIndent}  ${JSON.stringify(sjabloon)},`;
  toegevoegd++;
  return `{\n${sluitIndent}  id: "${taakId}",${nieuwBody}\n${sluitIndent}}`;
});

writeFileSync(path, content, "utf-8");

console.log(`✓ Uitleg toegevoegd: ${toegevoegd}`);
console.log(`⊘ Hadden al uitleg: ${alAanwezig}`);
console.log(`⏭ Geen passend sjabloon: ${geenSjabloon}`);
if (niets.length > 0 && niets.length < 20) {
  console.log(`   Genegeerde id's: ${niets.join(", ")}`);
}

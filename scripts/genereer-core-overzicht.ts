// File: scripts/genereer-core-overzicht.ts
//
// Genereert een HTML-overzicht van Core V9 (alle 21 dagen + sideflows)
// met openklapbare details per dag. Output gaat naar de OneDrive-folder
// van Raoul zodat hij 'm direct kan openen vanaf het bureaublad.
//
// Uitvoeren:
//   npx tsx scripts/genereer-core-overzicht.ts
//
// Bij wijzigingen in lib/playbook/core-dagen-v9.ts: opnieuw runnen voor
// een verse snapshot.

import * as fs from "fs";
import { CORE_V9_STAPPEN } from "../lib/playbook/core-dagen-v9";
import { CORE_V9_SIDEFLOWS } from "../lib/playbook/core-sideflows-v9";
import { genereerDMOStappen } from "../lib/dtt/dmo-stappen";
import type { Dag, ControllableTaak } from "../lib/playbook/types";
import type { Sideflow } from "../lib/playbook/core-sideflows-v9";

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2html(s: string | undefined): string {
  if (!s) return "";
  return esc(s)
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

type Tier = "kern" | "aangeraden" | "voorwaardelijk";

// Voorlopige classificatie. Raoul + Gaby + Jaimie stellen 'm bij in de
// review, daarna leg ik 'm vast in de app. Drie soorten:
//   KERN           = niet overslaanbaar, de ruggengraat van het systeem
//   AANGERADEN     = mag je overslaan, verrijking
//   VOORWAARDELIJK = verschijnt pas als de voorwaarde geldt (team/klanten/leads)
function tierVan(t: ControllableTaak): { tier: Tier; conditie: string | null } {
  if (t.inlineEmbed === "partner-check")
    return { tier: "voorwaardelijk", conditie: "je een team hebt" };
  if (t.inlineEmbed === "momentum-radar")
    return { tier: "voorwaardelijk", conditie: "er momentum-acties zijn" };
  if (t.id.endsWith("-stille-klanten"))
    return { tier: "voorwaardelijk", conditie: "je klanten hebt" };
  if (t.id.endsWith("-freebie-instroom"))
    return { tier: "voorwaardelijk", conditie: "er freebie-leads binnen zijn" };
  if (t.id.endsWith("-team-identificeren"))
    return { tier: "voorwaardelijk", conditie: "je een team hebt" };
  if (t.id.endsWith("-kennisdeling"))
    return { tier: "voorwaardelijk", conditie: "je een team hebt" };
  // Upgrade: cruciaal, maar staat nu nog als optioneel in de data.
  if (t.id.endsWith("-rest-verzenden")) return { tier: "kern", conditie: null };
  if (t.verplicht) return { tier: "kern", conditie: null };
  return { tier: "aangeraden", conditie: null };
}

function tierPill(t: ControllableTaak): string {
  const { tier, conditie } = tierVan(t);
  const tekst =
    tier === "kern"
      ? "Kern · niet overslaan"
      : tier === "aangeraden"
        ? "Aangeraden · mag overslaan"
        : `Verschijnt als ${conditie}`;
  return `<span class="taak-status-pill pill-${tier}">${esc(tekst)}</span>`;
}

function telTier(taken: ControllableTaak[], tier: Tier): number {
  return taken.filter((t) => tierVan(t).tier === tier).length;
}

// Mensentaal-vertaling van plekken in de app, zodat Gaby en Jaimie geen
// technische paden hoeven te lezen.
function plekNaam(route: string): string {
  const basis = route.split("?")[0].split("#")[0];
  const map: Record<string, string> = {
    "/coach": "de ELEVA Mentor (de AI-mentor)",
    "/dashboard": "het dashboard (startscherm)",
    "/namenlijst": "de namenlijst",
    "/scripts": "de scripts-bibliotheek",
    "/statistieken": "het statistieken-scherm",
    "/team": "het team-overzicht",
    "/klant": "de klantomgeving",
    "/instellingen/freebies": "de freebie-toolkit",
    "/instellingen/mijn-tracking-links": "de eigen deel-links",
    "/mijn-zinnen": "de eigen bewaarde zinnen",
    "/academy/social-media": "de Academy, social-media-training",
  };
  return map[basis] ?? basis;
}

// Mensentaal-uitleg van de inline-widgets die in een stap kunnen verschijnen.
function widgetUitleg(embed: string): string {
  const map: Record<string, string> = {
    "sponsor-melding":
      "Hier verschijnt een knop waarmee je met één tik een berichtje naar je sponsor stuurt.",
    "momentum-radar":
      "Hier verschijnt je momentum-radar: een lijstje van de mensen waar nu de meeste beweging in zit.",
    "partner-check":
      "Hier verschijnt een overzichtje van je eigen teamleden, om even te checken hoe het met ze gaat.",
    "funnel-analyse":
      "Hier verschijnt de Mentor-analyse van je pijplijn: waar blijven mensen hangen, en wat is je volgende actie.",
    "vcard-upload":
      "Hier verschijnt een knop om je telefoonboek te importeren als extra namen-bron.",
    "prepost-keuze":
      "Hier kies je tussen een pre-post of een 21-dagen-post, en opent de bijbehorende aparte mini-flow.",
  };
  return map[embed] ?? `Hier verschijnt een speciaal onderdeel in de stap (${embed}).`;
}

function renderTaak(t: ControllableTaak, idx: number): string {
  const tier = tierVan(t).tier;

  const extras: string[] = [];
  if (t.actieRoute) {
    extras.push(
      `<span class="extra-route">👉 Deze stap brengt je naar <strong>${esc(plekNaam(t.actieRoute))}</strong>${
        t.actieRouteLabel ? `, via de knop "${esc(t.actieRouteLabel)}"` : ""
      }.</span>`,
    );
  }
  if (t.inlineEmbed) {
    extras.push(`<span class="extra-embed">🔧 ${esc(widgetUitleg(t.inlineEmbed))}</span>`);
  }
  if (t.inlineActie) {
    extras.push(
      `<span class="extra-actie">✏️ Hier schrijf en bewaar je iets in eigen woorden: "${esc(t.inlineActie.label)}".</span>`,
    );
  }
  if (t.uitnodigHelpKnoppen) {
    extras.push(
      `<span class="extra-help">🆘 Hier staan hulp-knoppen klaar met voorbeeld-uitnodigingen om uit te kiezen.</span>`,
    );
  }
  if (t.vereistMobiel) {
    extras.push(`<span class="extra-mobiel">📱 Deze stap doe je op je telefoon.</span>`);
  }
  if (t.filmSlug) {
    extras.push(`<span class="extra-film">🎬 Hier komt een filmpje te staan.</span>`);
  }

  return `
    <li class="taak li-${tier}">
      <div class="taak-kop">
        <span class="taak-nr">${idx + 1}.</span>
        ${tierPill(t)}
        <span class="taak-label">${esc(t.label)}</span>
      </div>
      ${t.uitleg ? `<div class="taak-uitleg">${nl2html(t.uitleg)}</div>` : ""}
      ${extras.length ? `<div class="taak-extras">${extras.join("")}</div>` : ""}
    </li>
  `;
}

function renderDag(d: Dag): string {
  const kern = telTier(d.vandaagDoen, "kern");
  const aangeraden = telTier(d.vandaagDoen, "aangeraden");
  const voorw = telTier(d.vandaagDoen, "voorwaardelijk");

  return `
    <details class="dag fase-${d.fase}">
      <summary>
        <span class="dag-nr">Dag ${d.nummer}</span>
        <span class="dag-titel">${esc(d.titel)}</span>
        <span class="dag-meta">
          <span class="badge fase-badge">Fase ${d.fase}</span>
          <span class="badge badge-kern">${kern} kern</span>
          ${aangeraden > 0 ? `<span class="badge badge-aangeraden">${aangeraden} aangeraden</span>` : ""}
          ${voorw > 0 ? `<span class="badge badge-voorwaardelijk">${voorw} voorwaardelijk</span>` : ""}
        </span>
      </summary>
      <div class="dag-body">
        <div class="fase-doel">
          <strong>Fase-doel:</strong> ${esc(d.faseDoel)}
        </div>

        <h3>📖 Wat je leert (teaching)</h3>
        <div class="wat-je-leert">${nl2html(d.watJeLeert)}</div>

        <h3>✅ Wat je deze dag leert en doet, ${d.vandaagDoen.length} stappen</h3>
        <ol class="taken-lijst">
          ${d.vandaagDoen.map((t, i) => renderTaak(t, i)).join("")}
        </ol>

        ${(() => {
          const dmo = genereerDMOStappen(d.nummer, "gestaag", {
            bestellinksGekoppeld: d.nummer >= 4,
            eersteKlantenStapVoorbij: d.nummer >= 12,
          });
          if (dmo.length === 0) return "";
          return `
        <h3>🔁 Dagelijks ritme (DMO), komt hier elke dag bovenop</h3>
        <div class="instructie" style="margin:0 0 8px">
          <p style="margin:0">Dit zijn de dagelijkse-actie-stappen (opener-berichten sturen, opvolgen, op social reageren, je pijplijn bijwerken). Ze verschijnen <strong>elke dag</strong> in de echte flow, tussen de leerstappen. Let op: ze staan nu nog NIET in de dag-content zelf, ze worden los toegevoegd, en daarom zag je ze niet in dit overzicht. De aantallen hangen af van het gekozen tempo (hier getoond voor tempo 'Gestaag', 3 contacten + 2 opvolgingen per dag). Op dit moment zijn ze allemaal 'Aangeraden' (overslaanbaar), en opvolgen begint pas vanaf dag 12.</p>
        </div>
        <ol class="taken-lijst">
          ${dmo.map((t, i) => renderTaak(t, i)).join("")}
        </ol>`;
        })()}

        <h3>📍 Waar in ELEVA je dit doet</h3>
        <ul class="eleva-paden">
          ${d.waarInEleva
            .map(
              (p) =>
                `<li><strong>${esc(p.actie)}</strong>${p.route ? ` → ${esc(plekNaam(p.route))}` : ""}${p.menupad ? ` <em>(${esc(p.menupad)})</em>` : ""}</li>`,
            )
            .join("")}
        </ul>

        <h3>💡 Waarom dit werkt</h3>
        <p class="waarom">
          ${esc(d.waaromWerktDit.tekst)}
          ${d.waaromWerktDit.bron ? `<br><em>Bron: ${esc(d.waaromWerktDit.bron)}</em>` : ""}
        </p>
      </div>
    </details>
  `;
}

function renderSideflow(sf: Sideflow): string {
  const kern = telTier(sf.substeps, "kern");
  const aangeraden = telTier(sf.substeps, "aangeraden");
  const voorw = telTier(sf.substeps, "voorwaardelijk");
  return `
    <details class="sideflow">
      <summary>
        <span class="sideflow-nr">Mini-flow</span>
        <span class="dag-titel">${esc(sf.titel)}</span>
        <span class="dag-meta">
          <span class="badge sideflow-badge">${esc(sf.slug)}</span>
          <span class="badge badge-kern">${kern} kern</span>
          ${aangeraden > 0 ? `<span class="badge badge-aangeraden">${aangeraden} aangeraden</span>` : ""}
          ${voorw > 0 ? `<span class="badge badge-voorwaardelijk">${voorw} voorwaardelijk</span>` : ""}
        </span>
      </summary>
      <div class="dag-body">
        <div class="fase-doel">
          <strong>Ondertitel:</strong> ${esc(sf.ondertitel)}
        </div>

        <h3>📖 Intro</h3>
        <div class="wat-je-leert">${nl2html(sf.intro)}</div>

        <h3>✅ Stappen in deze mini-flow, ${sf.substeps.length} stuks</h3>
        <ol class="taken-lijst">
          ${sf.substeps.map((t, i) => renderTaak(t, i)).join("")}
        </ol>

        <h3>🏁 Slot-tekst</h3>
        <div class="wat-je-leert">${nl2html(sf.slotTekst)}</div>
      </div>
    </details>
  `;
}

const datum = new Date().toLocaleDateString("nl-NL", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const totaalSubsteps = CORE_V9_STAPPEN.reduce(
  (acc, d) => acc + d.vandaagDoen.length,
  0,
);
const totaalKern = CORE_V9_STAPPEN.reduce(
  (acc, d) => acc + telTier(d.vandaagDoen, "kern"),
  0,
);
const totaalAangeraden = CORE_V9_STAPPEN.reduce(
  (acc, d) => acc + telTier(d.vandaagDoen, "aangeraden"),
  0,
);
const totaalVoorwaardelijk = CORE_V9_STAPPEN.reduce(
  (acc, d) => acc + telTier(d.vandaagDoen, "voorwaardelijk"),
  0,
);

const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Core V9, overzicht alle 21 dagen + sideflows</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    background: #f7f1e4;
    color: #1a1a1a;
    line-height: 1.5;
    padding: 24px 16px 80px;
  }
  .wrapper { max-width: 980px; margin: 0 auto; }

  header.top {
    background: #0d0d0d;
    color: #fff;
    padding: 20px 24px;
    border-radius: 10px;
    margin-bottom: 16px;
  }
  header.top h1 {
    margin: 0 0 6px;
    font-size: 22px;
    color: #c9a961;
  }
  header.top p {
    margin: 0;
    font-size: 13px;
    opacity: 0.85;
  }
  header.top .stats {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  header.top .stats span {
    background: #1c1c1c;
    border: 1px solid #c9a961;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    color: #f0e8d2;
  }
  header.top .stats strong { color: #c9a961; }

  .instructie {
    background: #fff;
    border: 1px solid #c9a961;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 13px;
    color: #444;
  }
  .instructie strong { color: #1a1a1a; }

  h2.sectie-kop {
    color: #1a1a1a;
    font-size: 18px;
    margin: 28px 0 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #c9a961;
  }

  details.dag, details.sideflow {
    background: #fff;
    border: 1px solid #d6c89a;
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
  }
  details.dag.fase-1 { border-left: 4px solid #4a9edb; }
  details.dag.fase-2 { border-left: 4px solid #c9a961; }
  details.dag.fase-3 { border-left: 4px solid #7a6adb; }
  details.sideflow { border-left: 4px solid #2d8f4f; }

  details summary {
    cursor: pointer;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    list-style: none;
    transition: background 0.15s;
  }
  details summary::-webkit-details-marker { display: none; }
  details summary::before {
    content: "▶";
    color: #c9a961;
    font-size: 10px;
    transition: transform 0.15s;
  }
  details[open] summary::before {
    transform: rotate(90deg);
  }
  details summary:hover {
    background: #faf5e6;
  }
  .dag-nr, .sideflow-nr {
    font-weight: 700;
    color: #1a1a1a;
    font-size: 14px;
    min-width: 64px;
  }
  .dag-titel {
    flex: 1;
    font-size: 15px;
    color: #1a1a1a;
    font-weight: 600;
    min-width: 200px;
  }
  .dag-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
  }
  .fase-badge { background: #f0e8d2; color: #1a1a1a; }
  .sideflow-badge { background: #c9e5d2; color: #155724; }
  .badge-kern, .pill-kern { background: #f3dca0; color: #6b4f0a; }
  .badge-aangeraden, .pill-aangeraden { background: #e8e8e8; color: #555; }
  .badge-voorwaardelijk, .pill-voorwaardelijk { background: #d9ecfb; color: #1a5a85; }

  .dag-body {
    padding: 4px 20px 20px;
    border-top: 1px solid #f0e8d2;
  }
  .dag-body h3 {
    margin: 18px 0 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #c9a961;
    font-weight: 700;
  }
  .fase-doel {
    background: #faf5e6;
    border-left: 3px solid #c9a961;
    padding: 8px 12px;
    margin: 12px 0 0;
    font-size: 13px;
    border-radius: 0 6px 6px 0;
  }
  .wat-je-leert {
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 13px;
    color: #333;
  }
  .wat-je-leert p { margin: 0 0 8px; }
  .wat-je-leert p:last-child { margin: 0; }

  ol.taken-lijst {
    list-style: none;
    margin: 0;
    padding: 0;
    counter-reset: taak;
  }
  li.taak {
    border: 1px solid #e6e6e6;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 6px;
    background: #fff;
  }
  li.taak.li-kern {
    border-left: 3px solid #c9a961;
  }
  li.taak.li-aangeraden {
    border-left: 3px solid #aaa;
    opacity: 0.92;
  }
  li.taak.li-voorwaardelijk {
    border-left: 3px solid #4a9edb;
    background: #f7fbff;
  }
  .taak-kop {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }
  .taak-nr {
    color: #888;
    font-size: 12px;
    min-width: 22px;
  }
  .taak-status-pill {
    font-size: 10px;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 8px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  /* pill-kleuren staan bij de badges hierboven (.pill-kern etc.) */
  .taak-label {
    flex: 1;
    font-weight: 600;
    color: #1a1a1a;
    font-size: 13px;
  }
  .taak-uitleg {
    margin: 6px 0 0 30px;
    font-size: 12.5px;
    color: #444;
  }
  .taak-uitleg p { margin: 0 0 5px; }
  .taak-uitleg p:last-child { margin: 0; }
  .taak-extras {
    margin: 6px 0 0 30px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 11px;
    color: #666;
  }
  .taak-extras code {
    background: #f0e8d2;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }

  ul.eleva-paden {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
  }
  ul.eleva-paden li { margin-bottom: 4px; }
  ul.eleva-paden code {
    background: #f0e8d2;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 12px;
  }

  .waarom {
    background: #f7f1e4;
    border-left: 3px solid #c9a961;
    padding: 10px 14px;
    margin: 0;
    font-size: 13px;
    color: #333;
    border-radius: 0 6px 6px 0;
    font-style: italic;
  }
  .waarom em {
    font-style: normal;
    font-size: 11px;
    color: #888;
  }

  .alle-uit-knop, .alle-aan-knop {
    background: #fff;
    border: 1px solid #c9a961;
    color: #1a1a1a;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    margin-right: 6px;
  }
  .alle-uit-knop:hover, .alle-aan-knop:hover {
    background: #c9a961;
    color: #fff;
  }
</style>
</head>
<body>
<div class="wrapper">

  <header class="top">
    <h1>Core V9, overzicht alle 21 dagen + sideflows</h1>
    <p>Gegenereerd op ${datum} uit <code>lib/playbook/core-dagen-v9.ts</code>.</p>
    <div class="stats">
      <span>21 dagen</span>
      <span><strong>${totaalSubsteps}</strong> stappen totaal</span>
      <span><strong>${totaalKern}</strong> kern</span>
      <span>${totaalAangeraden} aangeraden</span>
      <span>${totaalVoorwaardelijk} voorwaardelijk</span>
      <span>${Object.keys(CORE_V9_SIDEFLOWS).length} sideflows</span>
    </div>
  </header>

  <div class="instructie">
    <p style="margin:0"><strong>Klik op een dag</strong> om de volledige inhoud te zien: het doel van de fase, de uitleg-tekst, alle stappen (met tag + uitleg), waar in ELEVA je het doet, en waarom het werkt.</p>
    <p style="margin:12px 0 4px"><strong>Wat de tags betekenen:</strong></p>
    <p style="margin:4px 0 0; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
      <span class="taak-status-pill pill-kern">Kern · niet overslaan</span>
      <span style="font-size:12px;color:#555">de ruggengraat, hier kun je niet omheen</span>
    </p>
    <p style="margin:4px 0 0; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
      <span class="taak-status-pill pill-aangeraden">Aangeraden · mag overslaan</span>
      <span style="font-size:12px;color:#555">fijn als je tijd hebt, niet dragend</span>
    </p>
    <p style="margin:4px 0 0; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
      <span class="taak-status-pill pill-voorwaardelijk">Verschijnt als ...</span>
      <span style="font-size:12px;color:#555">duikt pas op als de voorwaarde geldt (team, klanten, leads). Een member ziet 'm dus niet elke dag, ook al staat 'ie hier wel in het overzicht.</span>
    </p>
    <p style="margin:12px 0 0; font-size:12px; color:#555;"><em>Dit is een voorstel-classificatie. Pas 'm gerust aan in jullie review (welke moeten echt Kern zijn?), dan leg ik 'm daarna vast in de app.</em></p>
    <p style="margin:10px 0 0">
      <button class="alle-aan-knop" onclick="document.querySelectorAll('details').forEach(d=>d.open=true)">▼ Alles openen</button>
      <button class="alle-uit-knop" onclick="document.querySelectorAll('details').forEach(d=>d.open=false)">▶ Alles sluiten</button>
    </p>
  </div>

  <h2 class="sectie-kop">21 ankerstappen</h2>
  ${CORE_V9_STAPPEN.map(renderDag).join("")}

  <h2 class="sectie-kop">Mini-flows (starten op na een keuze, los van de 21 dagen)</h2>
  <div class="instructie" style="margin-bottom:12px">
    <p style="margin:0">Een mini-flow is een apart stappenpad dat opent zodra de member een keuze maakt. In dit geval: kiest iemand op dag 1 voor een pre-post of een 21-dagen-resultaat-post, dan opent de bijbehorende mini-flow met de stappen om die post te maken, te plaatsen en op te volgen. Het zit dus niet in de dagelijkse dag-flow, maar verschijnt alleen als de member ervoor kiest.</p>
  </div>
  ${Object.values(CORE_V9_SIDEFLOWS).map(renderSideflow).join("")}

</div>
</body>
</html>`;

const outputPad =
  "C:/Users/raoul/OneDrive/Bureaublad/CLAUDE/60 day run/CORE-V9-OVERZICHT.html";

fs.writeFileSync(outputPad, html, "utf8");

console.log("Klaar.");
console.log("Output: " + outputPad);
console.log(
  `Stats: 21 dagen, ${totaalSubsteps} substeps (${totaalKern} kern, ${totaalAangeraden} aangeraden, ${totaalVoorwaardelijk} voorwaardelijk), ${Object.keys(CORE_V9_SIDEFLOWS).length} sideflows.`,
);

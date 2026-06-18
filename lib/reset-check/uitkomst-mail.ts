// File: lib/reset-check/uitkomst-mail.ts
//
// De transactionele "hier is jouw persoonlijke uitkomst"-mail die de
// PROSPECT direct na het invullen van de Reset-check ontvangt.
//
// BELANGRIJK: deze mail is een mail-veilige spiegeling van wat de
// prospect op haar scherm zag (StapUitkomst in
// app/bot/reset-check/[token]/flow.tsx). Hij bevat NOOIT de member-intel
// (heat-score, profiel-dump, ruwe thema-scores, medische punten). Die
// "spiegel-tekst" is alleen voor het teamlid, in de prospect-kaart.
//
// De inhoud komt 1-op-1 uit dezelfde bronnen als het scherm:
//   - berekenThemaScores / combinatieInzicht (lib/reset-check/score.ts)
//   - THEMA_BLOKKEN / TIPS_PER_THEMA / NU_PER_THEMA / HEEN_PER_THEMA /
//     AFVAL_WENS_TEKST / BRUG_TEKST (lib/reset-check/content.ts)
//   - THEMA_LABELS (lib/reset-check/vragen.ts)
// Layout wijkt af (mail-veilige inline-styles, één kolom), de teksten
// niet. Pas je het scherm aan, loop dan ook deze mail even na.
//
// Stem: Raoul. Claim-vrij, geen tijds- of gezondheidsbeloftes.

import type { Antwoorden } from "./types";
import {
  berekenThemaScores,
  bepaalUitkomstCategorie,
  combinatieInzicht,
} from "./score";
import { THEMA_LABELS } from "./vragen";
import {
  THEMA_BLOKKEN,
  TIPS_PER_THEMA,
  NU_PER_THEMA,
  HEEN_PER_THEMA,
  AFVAL_WENS_TEKST,
  BRUG_TEKST,
} from "./content";

// ============================================================
// Mail-veilige kleuren (matchen de on-brand uitkomst op het scherm)
// ============================================================
const GOUD = "#b8923a";
const GOUD_ZACHT = "#c9a961";
const GROEN = "#2d8f4f";
const CORAL = "#d97757";
const DONKER = "#1d1d1f";
const GRIJS = "#6b6b6e";
const CREME_KADER = "#faf5e6";
const CREME_RAND = "#ead8a0";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ============================================================
// Bouwstenen
// ============================================================
function p(tekst: string, extra = ""): string {
  return `<p style="margin:0 0 16px;${extra}">${tekst}</p>`;
}

function pijl(): string {
  return `<div style="text-align:center;font-size:22px;color:${GOUD_ZACHT};line-height:1;margin:4px 0;">&#8595;</div>`;
}

function label(tekst: string, kleur: string): string {
  return `<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:${kleur};font-family:Arial,sans-serif;margin:0 0 4px;">${esc(tekst)}</div>`;
}

function witKaart(rand: string, binnen: string): string {
  return `<div style="background:#ffffff;border:2px solid ${rand};border-radius:12px;padding:16px 18px;margin:0 0 12px;">${binnen}</div>`;
}

function donkerKaart(binnen: string): string {
  return `<div style="background:${DONKER};border:2px solid ${GOUD_ZACHT};border-radius:12px;padding:16px 18px;margin:0 0 12px;color:#f0e8d2;">${binnen}</div>`;
}

function omhulsel(binnenkant: string): string {
  return `<!doctype html>
<html lang="nl">
<body style="margin:0;padding:0;background:#f5f3ee;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:Georgia,'Times New Roman',serif;color:${DONKER};font-size:16px;line-height:1.65;">
    <p style="margin:0 0 24px;letter-spacing:3px;text-transform:uppercase;font-size:11px;color:${GOUD};font-family:Arial,sans-serif;font-weight:bold;">ELEVA &middot; Reset-check</p>
    ${binnenkant}
    <hr style="border:none;border-top:1px solid #e3ddd0;margin:32px 0 16px;" />
    <p style="font-size:12px;color:${GRIJS};font-family:Arial,sans-serif;line-height:1.5;margin:0;">
      Je ontvangt deze mail omdat je zojuist de Reset-check invulde. De komende dagen
      krijg je nog een paar korte mails met praktische tips, ook als je verder niks doet.
    </p>
  </div>
</body>
</html>`;
}

// ============================================================
// De hoofd-functie
// ============================================================
export function bouwResetUitkomstMail(params: {
  leadVoornaam: string;
  antwoorden: unknown;
}): { onderwerp: string; html: string } | null {
  const a = params.antwoorden as Antwoorden | null | undefined;
  // Veilige validatie: zonder bruikbare antwoorden geen mail (de opt-in
  // is al opgeslagen, de lead zag de uitkomst sowieso op het scherm).
  if (
    !a ||
    typeof a !== "object" ||
    !a.scores ||
    typeof a.scores !== "object" ||
    !a.profiel ||
    !Array.isArray(a.medisch)
  ) {
    return null;
  }

  const voornaam = (params.leadVoornaam || "").trim() || "jij";

  // ---- Afgeleiden, exact zoals StapUitkomst (flow.tsx) ----
  const themaScores = berekenThemaScores(a);
  if (themaScores.length === 0) return null;

  const categorie = bepaalUitkomstCategorie(a);
  const heeftMedisch = a.medisch.some((s) => s !== "zwanger" && s !== "geen");
  const combi = combinatieInzicht(themaScores);
  const top2 = [...themaScores]
    .sort((x, y) => y.pct - x.pct)
    .slice(0, 2)
    .map((t) => t.thema);

  // Banner
  let bannerEmoji = "🌱";
  let bannerTitel = "De Reset kan goed bij jou passen";
  let bannerTekst =
    "Op basis van wat je hebt gedeeld, stemmen we in ons gesprek de Reset persoonlijk op jou af. Je hoort gelijk wat de investering voor jou zou worden, zonder dat je hoeft te beslissen of je iets gaat doen. Helemaal vrijblijvend dus, jij beslist rustig zelf 🥰";
  let bannerBg = "#e8f5ec";
  let bannerRand = GROEN;

  if (categorie === "warm") {
    bannerEmoji = "🌷";
    bannerTitel = "Wat een mooie fase";
    bannerTekst =
      "Zwanger of borstvoeding gevend, wat een mooie fase 🥰 We kijken samen wat past bij jou en je kindje, en wat een goed moment zou zijn om straks de Reset op te pakken. In ons gesprek stemmen we het persoonlijk op je af en hoor je gelijk wat de investering voor jou zou worden. Helemaal vrijblijvend natuurlijk, jij beslist.";
    bannerBg = "#fce8e8";
    bannerRand = CORAL;
  } else if (heeftMedisch) {
    bannerTekst =
      "Wat fijn dat je die gezondheidspunten met ons hebt gedeeld, daar hebben we wat aan 🥰 Veel mensen met zo'n punt doen de Reset uiteindelijk wel, mits we het samen goed afstemmen en, waar nodig, met je arts mee laten kijken. In ons gesprek stemmen we het persoonlijk op jou af en hoor je gelijk wat de investering zou zijn. Helemaal vrijblijvend uiteraard.";
  }

  // Kennis-gap
  const nuPunten = top2
    .filter((t) => (themaScores.find((s) => s.thema === t)?.pct ?? 0) >= 33)
    .map((t) => NU_PER_THEMA[t]);
  const heenPunten = top2
    .filter((t) => (themaScores.find((s) => s.thema === t)?.pct ?? 0) >= 33)
    .map((t) => HEEN_PER_THEMA[t]);
  const afvalTekst = a.profiel.afvalwens
    ? AFVAL_WENS_TEKST[a.profiel.afvalwens]
    : null;
  const intentieStaart =
    (a.scores.intentie ?? 0) >= 2
      ? "Plus dat gevoel van: ja, dit is wat ik wil 🥰"
      : "Een rustig gevoel ook, van hier zou het naartoe mogen.";
  const heenZinnen = [...heenPunten];
  if (afvalTekst) heenZinnen.push(afvalTekst);

  // ---- HTML opbouwen ----
  const intro =
    p(`Hoi ${esc(voornaam)},`) +
    p(
      "Hier is jouw persoonlijke uitkomst, precies zoals je 'm net op je scherm zag. Bewaar 'm rustig en lees 'm nog eens terug wanneer het je uitkomt 🥰",
    );

  // Banner-blok
  const bannerBlok =
    `<div style="text-align:center;margin:0 0 18px;">
       <div style="font-size:42px;line-height:1;margin:0 0 6px;">${bannerEmoji}</div>
       <h1 style="font-size:22px;line-height:1.3;margin:0 0 6px;font-weight:bold;">${esc(bannerTitel)}</h1>
       <p style="margin:0;font-size:13px;color:${GRIJS};font-family:Arial,sans-serif;">Hieronder lees je jouw uitkomst per thema, plus inzichten en concrete tips uit onze praktijk.</p>
     </div>` +
    `<div style="background:${bannerBg};border:2px solid ${bannerRand};border-radius:12px;padding:14px 18px;margin:0 0 24px;">
       <div style="font-weight:bold;margin:0 0 6px;">Voor jouw situatie specifiek</div>
       <p style="margin:0;font-size:14px;">${esc(bannerTekst)}</p>
     </div>`;

  // Kennis-gap-blok
  const nuTekst =
    nuPunten.length > 0
      ? `Je gaf aan dat je vooral last hebt van ${esc(nuPunten.join(", en "))}. Dat is iets wat je elke dag voelt, in je werk, je gezin, je rust… het kost je vaak meer energie dan je zelf in de gaten hebt 🥰`
      : "Je antwoorden laten zien dat je nu best stabiel staat. Hier en daar nog wat kleine signalen die om aandacht vragen, niks ernstigs hoor, wel iets om bewust van te zijn.";

  const heenTekst =
    heenZinnen.length > 0
      ? `Stel je een dag voor, eentje met ${esc(heenZinnen.join(", en "))}. ${esc(intentieStaart)}`
      : `Een dag waarin je lichaam meewerkt, in plaats van tegen je in. ${esc(intentieStaart)}`;

  const heenLijst = `<ul style="margin:0 0 10px;padding:0 0 0 2px;list-style:none;font-size:14px;line-height:1.6;">
      <li style="margin:0 0 6px;">🌅 <strong>Wakker worden met zin in de dag</strong>, niet eerst een uur opwarmen op de koffie</li>
      <li style="margin:0 0 6px;">👕 <strong>Kleren die over je heen glijden</strong> in plaats van eraan vast te zitten</li>
      <li style="margin:0 0 6px;">⚡ <strong>Halverwege de middag nog energie</strong> over, ook zonder dat tweede bakkie</li>
      <li style="margin:0 0 6px;">🏃 <strong>Plotseling zin in bewegen of sporten</strong>, niet meer omdat het moet, gewoon omdat je dat wilt</li>
      <li style="margin:0 0 6px;">🌙 <strong>'s Avonds nog tijd en zin</strong> om iets leuks te doen, niet alleen overleven op de bank</li>
      <li style="margin:0;">🧠 <strong>Een rustig hoofd</strong>, helderder denken, en het gevoel: ja, dit klopt 🥰</li>
    </ul>`;

  const kennisGap =
    `<div style="background:${CREME_KADER};border:1px solid ${CREME_RAND};border-radius:16px;padding:18px;margin:0 0 24px;">
       <h2 style="text-align:center;font-size:18px;font-weight:bold;margin:0 0 2px;">Het verschil dat we voor je zien</h2>
       <p style="text-align:center;font-size:12px;font-style:italic;color:#6b5524;margin:0 0 14px;">Tussen waar je nu staat, en waar je heen wilt 🥰</p>` +
    witKaart(
      CORAL,
      label("Waar je nu staat", "#b34a1f") +
        `<div style="font-weight:bold;margin:0 0 4px;">Wat je elke dag voelt</div>` +
        `<p style="margin:0;font-size:14px;">${nuTekst}</p>`,
    ) +
    pijl() +
    witKaart(
      GROEN,
      label("Waar je heen wilt", "#1f6b35") +
        `<div style="font-weight:bold;margin:0 0 8px;">Hoe het ook kan voelen</div>` +
        `<p style="margin:0 0 10px;font-size:14px;">${heenTekst}</p>` +
        `<p style="margin:0 0 8px;font-size:14px;">Heel veel mensen die het traject doen, vertellen ons over een soort lichtere versie van zichzelf die ze niet hadden zien aankomen. Een paar van de dingen die ze beschrijven:</p>` +
        heenLijst +
        `<p style="margin:10px 0 0;font-size:12px;font-style:italic;color:${GRIJS};">Niet morgen, niet over een week. Wel gaandeweg, tijdens en na het traject. Voor sommigen krachtiger in de eerste weken, voor anderen pas later. Voor iedereen anders.</p>`,
    ) +
    pijl() +
    donkerKaart(
      label("En wat ertussen zit", GOUD_ZACHT) +
        `<div style="font-weight:bold;color:#ffffff;margin:0 0 6px;">Daar hebben wij wat voor</div>` +
        `<p style="margin:0;font-size:14px;">${BRUG_TEKST.replace(/\n\n/g, "<br/><br/>")}</p>`,
    ) +
    `</div>`;

  // Thema-scores
  const themaKaarten = themaScores
    .map((ts) => {
      const blok = THEMA_BLOKKEN[ts.thema][ts.niveau];
      const balkKleur =
        ts.niveau === "laag" ? GROEN : ts.niveau === "midden" ? GOUD_ZACHT : CORAL;
      const breedte = Math.max(0, Math.min(100, Math.round(ts.pct)));
      return `<div style="background:#ffffff;border:1px solid #e0d8bc;border-radius:12px;padding:14px 16px;margin:0 0 12px;">
        <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 8px;"><tr>
          <td style="font-weight:bold;font-size:15px;">${esc(THEMA_LABELS[ts.thema] ?? ts.thema)}</td>
          <td style="text-align:right;font-size:12px;font-weight:bold;color:${GOUD};font-family:Arial,sans-serif;">${ts.totaal} / ${ts.max}</td>
        </tr></table>
        <div style="height:8px;background:#e0d8bc;border-radius:6px;overflow:hidden;margin:0 0 10px;">
          <div style="height:8px;width:${breedte}%;background:${balkKleur};border-radius:6px;font-size:1px;line-height:8px;">&nbsp;</div>
        </div>
        <p style="margin:0 0 10px;font-size:14px;"><strong>${esc(blok.titel)}.</strong> ${esc(blok.tekst)}</p>
        <div style="background:#f7f1e4;border-left:4px solid ${GOUD_ZACHT};border-radius:6px;padding:8px 12px;font-size:13px;">
          <strong>Uit onze praktijk:</strong> ${esc(blok.praktijk)}
        </div>
      </div>`;
    })
    .join("");

  const themaSectie =
    `<h2 style="font-size:18px;font-weight:bold;margin:26px 0 12px;">Jouw uitkomst per thema</h2>` +
    themaKaarten;

  // Combi-inzicht (combi.tekst bevat bewust <em>-opmaak, dus niet escapen)
  const combiSectie = combi
    ? donkerKaart(
        label("Wat valt op aan jouw antwoorden", GOUD_ZACHT) +
          `<div style="color:#ffffff;font-size:17px;font-weight:bold;margin:0 0 8px;">${esc(combi.titel)}</div>` +
          `<p style="margin:0;font-size:14px;line-height:1.6;">${combi.tekst}</p>`,
      )
    : "";

  // Tips
  const tipItems = top2
    .flatMap((t) => TIPS_PER_THEMA[t] ?? [])
    .map(
      (tip) =>
        `<li style="margin:0 0 8px;"><strong>${esc(tip.titel)}.</strong> ${esc(tip.uitleg)}</li>`,
    )
    .join("");

  const tipsSectie =
    `<h2 style="font-size:18px;font-weight:bold;margin:26px 0 8px;">4 dingen die jij vandaag kunt starten</h2>` +
    p(
      "Gericht op jouw top-2 thema's. Geen generieke tips, dingen die we in de praktijk zien werken.",
      "font-size:14px;",
    ) +
    `<div style="background:${CREME_KADER};border:1px solid ${CREME_RAND};border-radius:12px;padding:14px 18px;margin:0 0 24px;">
       <ol style="margin:0;padding:0 0 0 20px;font-size:14px;line-height:1.6;">${tipItems}</ol>
     </div>`;

  // Afsluiting + disclaimer
  const afsluiting =
    `<hr style="border:none;border-top:1px solid #e0d8bc;margin:26px 0;" />` +
    p(
      "Wil je hier eens rustig over praten? Reageer gewoon op deze mail, dan kijken we samen of de Reset bij je past. Geen pitch, geen druk 🥰",
    ) +
    p(
      `<span style="font-size:13px;color:${GRIJS};font-style:italic;">Deze check is geen medisch advies en geen diagnose. Resultaten van de Reset verschillen per persoon en hangen af van levensstijl en uitgangssituatie. Bij twijfel altijd in overleg met je arts.</span>`,
    );

  const html = omhulsel(
    intro +
      bannerBlok +
      kennisGap +
      themaSectie +
      combiSectie +
      tipsSectie +
      afsluiting,
  );

  return {
    onderwerp: `${voornaam}, hier is jouw persoonlijke Reset-uitkomst`,
    html,
  };
}

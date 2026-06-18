// File: lib/reset-check/uitkomst-mail.ts
//
// De transactionele "hier is jouw persoonlijke uitkomst"-mail die de
// PROSPECT direct na het invullen van de Reset-check ontvangt.
//
// Deze mail rendert PUUR uit het gedeelde uitkomst-model
// (lib/reset-check/uitkomst-model.ts). Datzelfde model voedt het scherm
// (StapUitkomst in flow.tsx). Alle TEKST en LOGICA zit in het model;
// hier zit alleen de mail-veilige WEERGAVE (inline-styles, één kolom).
// Pas je een tekst aan in het model of in content.ts, dan verandert deze
// mail automatisch mee. Geen tweede plek waar teksten kunnen afwijken.
//
// Bevat NOOIT member-intel (heat-score, profiel, medische punten): het
// model levert die simpelweg niet.

import type { Antwoorden, ThemaNiveau } from "./types";
import { bouwUitkomstModel, type BannerKleur } from "./uitkomst-model";

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

function bannerKleuren(kleur: BannerKleur): { bg: string; rand: string } {
  return kleur === "warm"
    ? { bg: "#fce8e8", rand: CORAL }
    : { bg: "#e8f5ec", rand: GROEN };
}

function balkKleur(niveau: ThemaNiveau): string {
  return niveau === "laag" ? GROEN : niveau === "midden" ? GOUD_ZACHT : CORAL;
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

  // Eén bron van waarheid: hetzelfde model als het scherm.
  const m = bouwUitkomstModel(a);
  if (m.themas.length === 0) return null;

  const bk = bannerKleuren(m.banner.kleur);

  // ---- HTML opbouwen ----
  const intro =
    p(`Hoi ${esc(voornaam)},`) +
    p(
      "Hier is jouw persoonlijke uitkomst, precies zoals je 'm net op je scherm zag. Bewaar 'm rustig en lees 'm nog eens terug wanneer het je uitkomt 🥰",
    );

  // Banner-blok
  const bannerBlok =
    `<div style="text-align:center;margin:0 0 18px;">
       <div style="font-size:42px;line-height:1;margin:0 0 6px;">${m.banner.emoji}</div>
       <h1 style="font-size:22px;line-height:1.3;margin:0 0 6px;font-weight:bold;">${esc(m.banner.titel)}</h1>
       <p style="margin:0;font-size:13px;color:${GRIJS};font-family:Arial,sans-serif;">${esc(m.introSub)}</p>
     </div>` +
    `<div style="background:${bk.bg};border:2px solid ${bk.rand};border-radius:12px;padding:14px 18px;margin:0 0 24px;">
       <div style="font-weight:bold;margin:0 0 6px;">${esc(m.situatieKop)}</div>
       <p style="margin:0;font-size:14px;">${esc(m.banner.tekst)}</p>
     </div>`;

  // Kennis-gap-blok
  const heenLijst = `<ul style="margin:0 0 10px;padding:0 0 0 2px;list-style:none;font-size:14px;line-height:1.6;">
      ${m.kennisGap.heenBelevingen
        .map(
          (b, i, arr) =>
            `<li style="margin:0 0 ${i === arr.length - 1 ? "0" : "6px"};">${b.emoji} <strong>${esc(b.sterk)}</strong>${esc(b.rest)}</li>`,
        )
        .join("")}
    </ul>`;

  const kennisGap =
    `<div style="background:${CREME_KADER};border:1px solid ${CREME_RAND};border-radius:16px;padding:18px;margin:0 0 24px;">
       <h2 style="text-align:center;font-size:18px;font-weight:bold;margin:0 0 2px;">${esc(m.kennisGap.kop)}</h2>
       <p style="text-align:center;font-size:12px;font-style:italic;color:#6b5524;margin:0 0 14px;">${esc(m.kennisGap.sub)}</p>` +
    witKaart(
      CORAL,
      label(m.kennisGap.nuLabel, "#b34a1f") +
        `<div style="font-weight:bold;margin:0 0 4px;">${esc(m.kennisGap.nuKop)}</div>` +
        `<p style="margin:0;font-size:14px;">${esc(m.kennisGap.nuTekst)}</p>`,
    ) +
    pijl() +
    witKaart(
      GROEN,
      label(m.kennisGap.heenLabel, "#1f6b35") +
        `<div style="font-weight:bold;margin:0 0 8px;">${esc(m.kennisGap.heenKop)}</div>` +
        `<p style="margin:0 0 10px;font-size:14px;">${esc(m.kennisGap.heenTekst)}</p>` +
        `<p style="margin:0 0 8px;font-size:14px;">${esc(m.kennisGap.heenIntro)}</p>` +
        heenLijst +
        `<p style="margin:10px 0 0;font-size:12px;font-style:italic;color:${GRIJS};">${esc(m.kennisGap.heenDisclaimer)}</p>`,
    ) +
    pijl() +
    donkerKaart(
      label(m.kennisGap.brugLabel, GOUD_ZACHT) +
        `<div style="font-weight:bold;color:#ffffff;margin:0 0 6px;">${esc(m.kennisGap.brugKop)}</div>` +
        `<p style="margin:0;font-size:14px;">${m.kennisGap.brugTekst.replace(/\n\n/g, "<br/><br/>")}</p>`,
    ) +
    `</div>`;

  // Thema-scores
  const themaKaarten = m.themas
    .map((ts) => {
      const breedte = Math.max(0, Math.min(100, Math.round(ts.pct)));
      return `<div style="background:#ffffff;border:1px solid #e0d8bc;border-radius:12px;padding:14px 16px;margin:0 0 12px;">
        <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 8px;"><tr>
          <td style="font-weight:bold;font-size:15px;">${esc(ts.label)}</td>
          <td style="text-align:right;font-size:12px;font-weight:bold;color:${GOUD};font-family:Arial,sans-serif;">${ts.totaal} / ${ts.max}</td>
        </tr></table>
        <div style="height:8px;background:#e0d8bc;border-radius:6px;overflow:hidden;margin:0 0 10px;">
          <div style="height:8px;width:${breedte}%;background:${balkKleur(ts.niveau)};border-radius:6px;font-size:1px;line-height:8px;">&nbsp;</div>
        </div>
        <p style="margin:0 0 10px;font-size:14px;"><strong>${esc(ts.titel)}.</strong> ${esc(ts.tekst)}</p>
        <div style="background:#f7f1e4;border-left:4px solid ${GOUD_ZACHT};border-radius:6px;padding:8px 12px;font-size:13px;">
          <strong>${esc(m.praktijkLabel)}</strong> ${esc(ts.praktijk)}
        </div>
      </div>`;
    })
    .join("");

  const themaSectie =
    `<h2 style="font-size:18px;font-weight:bold;margin:26px 0 12px;">${esc(m.themaSectieKop)}</h2>` +
    themaKaarten;

  // Combi-inzicht (combi.tekst bevat bewust <em>-opmaak, dus niet escapen)
  const combiSectie = m.combi
    ? donkerKaart(
        label(m.combiLabel, GOUD_ZACHT) +
          `<div style="color:#ffffff;font-size:17px;font-weight:bold;margin:0 0 8px;">${esc(m.combi.titel)}</div>` +
          `<p style="margin:0;font-size:14px;line-height:1.6;">${m.combi.tekst}</p>`,
      )
    : "";

  // Tips
  const tipItems = m.tips
    .map(
      (tip) =>
        `<li style="margin:0 0 8px;"><strong>${esc(tip.titel)}.</strong> ${esc(tip.uitleg)}</li>`,
    )
    .join("");

  const tipsSectie =
    `<h2 style="font-size:18px;font-weight:bold;margin:26px 0 8px;">${esc(m.tipsSectieKop)}</h2>` +
    p(esc(m.tipsSectieIntro), "font-size:14px;") +
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
      `<span style="font-size:13px;color:${GRIJS};font-style:italic;">${esc(m.disclaimer)}</span>`,
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

// File: lib/freebie-bots/tweede-wind/mail-templates.ts
//
// Vijf mail-templates voor de Tweede Wind vervolg-sequence.
//
// TODO-GABY: alle templates zijn PLACEHOLDERS. Gaby herschrijft elke
// template in haar definitieve stem voordat we de feature-flag aanzetten.
// 200-300 woorden per mail. Claim-vrij (EFSA + ACM-compliant).

import type { TweedeWindAntwoorden } from "../types";

export type MailTemplate = {
  dag: 1 | 2 | 3 | 4 | 5;
  onderwerp: string;
  bouwHtml: (input: MailInput) => string;
};

export type MailInput = {
  leadVoornaam: string;
  memberVoornaam: string;
  spiegelTekst: string | null;
  antwoorden: TweedeWindAntwoorden | null;
  unsubscribeUrl: string;
};

function wrap(body: string, input: MailInput): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Tweede Wind</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333; line-height: 1.6; }
  .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #cfe0f0; }
  .icoon { font-size: 40px; }
  h1 { font-size: 22px; color: #0369a1; margin: 16px 0 8px; }
  h2 { font-size: 18px; color: #0369a1; margin-top: 24px; }
  p { margin: 12px 0; }
  .anker { background: #ecf6fc; border-left: 3px solid #0ea5e9; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #cfe0f0; font-size: 12px; color: #999; text-align: center; }
  .footer a { color: #0369a1; }
</style>
</head>
<body>
<div class="header">
  <div class="icoon">⚡</div>
  <h1>Tweede Wind</h1>
</div>
${body}
<div class="footer">
  <p>Deze mail komt via ${input.memberVoornaam} en het team uit ELEVA.<br>
  <a href="${input.unsubscribeUrl}">Geen vervolg-mails meer ontvangen</a></p>
  <p>Geen medisch advies, geen behandeling.</p>
</div>
</body>
</html>`;
}

const dag1: MailTemplate = {
  dag: 1,
  onderwerp: "Eerste avond, hoe je dag begint bepaalt de rest",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>Fijn dat je gisteren tijd nam voor Tweede Wind. Vanaf vanavond
krijg je vijf korte mails. Vijf thema's die we vaker zien terugkeren
bij mensen die hun energie en focus willen terugkrijgen. Geen belofte,
wel context plus eenvoudig toe te passen handvatten.</p>

<h2>Vanavond: de ochtend</h2>
<p>TODO-GABY: 80-120 woorden over waarom de eerste tien minuten van de
dag bepalend zijn voor energie en focus. Cortisol-ritme, screen-time,
glas water. Geen wetenschap-toon, wel concreet en herkenbaar.</p>

<div class="anker">
  <strong>Morgen proberen:</strong> de eerste tien minuten geen telefoon,
  alleen een glas water en een rustig moment.
</div>

<p>Morgen kijken we naar focus-blokken. Slaap zacht.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

const dag2: MailTemplate = {
  dag: 2,
  onderwerp: "Tweede avond, drie blokken die je werkdag veranderen",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: opening voor dag 2.</p>

<h2>Vanavond: focus-blokken</h2>
<p>TODO-GABY: 80-120 woorden over de 20-minuten-regel (elke onderbreking
kost je tot 20 min focus-herstel), notificaties uit, drie blokken van
45-60 minuten ipv hele dag fragmenteren. Eventueel verwijzing naar
B-complex en omega-3 als ondersteuning voor cognitieve functies.</p>

<div class="anker">
  <strong>Morgen proberen:</strong> één blok van 45 minuten zonder
  telefoon binnen handbereik. Kijk wat je ervan merkt.
</div>

<p>Morgen: voeding en de middag-dip.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

const dag3: MailTemplate = {
  dag: 3,
  onderwerp: "Derde avond, waarom je middag-dip met je ontbijt begint",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: opening dag 3.</p>

<h2>Vanavond: voeding en energie</h2>
<p>TODO-GABY: 80-120 woorden over hoe ontbijt + bloedsuiker je hele dag
voeden. Eiwit ipv koolhydraat-piek. Wandeling na lunch om bloedsuiker
te helpen. Brug naar Lifeplus-supplementen (magnesium, B-complex,
ijzer voor energie) zonder claims. EFSA-erkende zinnen mogen letterlijk.</p>

<div class="anker">
  <strong>Morgen proberen:</strong> bouw je ontbijt rond eiwit (ei,
  kwark, vis, peulvruchten) ipv koolhydraat.
</div>

<p>Morgen: slaap.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

const dag4: MailTemplate = {
  dag: 4,
  onderwerp: "Vierde avond, slaap als grootste energie-investering",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: opening dag 4.</p>

<h2>Vanavond: slaap</h2>
<p>TODO-GABY: 80-120 woorden over diep slapen, blauw licht, schermen
voor bedtijd, hoe slaap-hygiëne een direct effect heeft op cognitie de
volgende dag. Magnesium voor zenuwstelsel, vitamine D voor algeheel
ritme. EFSA-claims mogen.</p>

<div class="anker">
  <strong>Morgen proberen:</strong> een half uur voor het slapen geen
  scherm. Drie diepe ademhalingen voor je gaat liggen.
</div>

<p>Morgen: hoe verder.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

const dag5: MailTemplate = {
  dag: 5,
  onderwerp: "Laatste avond, hoe verder vanaf hier",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: laatste mail. Terugblik op vier dagen ervoor, en hoe de
spiegel + handvatten uit de bot een goede basis vormen.</p>

<h2>Wat veel mensen kiezen na deze week</h2>
<p>TODO-GABY: 80-120 woorden over de drie Lifeplus-niveaus die passen
bij energie/focus-thema (zoals Energie-Focus essential, plus, complete).
Geen claims, wel richting. Verwijs naar de persoonlijke link uit de
bot of nodig uit voor een persoonlijk gesprek met ${i.memberVoornaam}.</p>

<div class="anker">
  <strong>Twee opties die veel mensen kiezen:</strong>
  <ul>
    <li>Een gesprek van vijftien minuten met ${i.memberVoornaam}, vrijblijvend</li>
    <li>Zelf een instap-pakket bestellen via de link uit de bot</li>
  </ul>
</div>

<p>Dit was de laatste mail in deze reeks. Reageer wanneer je wilt,
geen druk.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

export const TWEEDE_WIND_MAILS: MailTemplate[] = [dag1, dag2, dag3, dag4, dag5];

export function templateVoorDag(dag: number): MailTemplate | null {
  return TWEEDE_WIND_MAILS.find((t) => t.dag === dag) ?? null;
}

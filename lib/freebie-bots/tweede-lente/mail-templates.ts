// File: lib/freebie-bots/tweede-lente/mail-templates.ts
//
// Vijf mail-templates voor de Tweede Lente vervolg-sequence.
// Worden door cron-route gerendered en verstuurd via Resend.
//
// TODO-GABY: alle templates onder zijn PLACEHOLDERS in Eleva-stem.
// Gaby herschrijft elke template in haar definitieve stem voordat we
// de feature-flag aanzetten. Lengte: 200-300 woorden per mail.
// Claim-vrij blijven: EFSA + ACM-compliant (geen 'helpt', 'verlicht',
// 'verbetert', 'ondersteunt klacht'). EFSA-goedgekeurde voedingsclaims
// mogen wel letterlijk.

import type { TweedeLenteAntwoorden } from "../types";

export type MailTemplate = {
  dag: 1 | 2 | 3 | 4 | 5;
  onderwerp: string;
  /** Bouw HTML-body voor één lead. Member-naam + lead-naam kunnen
      gepersonaliseerd worden. */
  bouwHtml: (input: MailInput) => string;
};

export type MailInput = {
  leadVoornaam: string;
  memberVoornaam: string;
  spiegelTekst: string | null;
  antwoorden: TweedeLenteAntwoorden | null;
  unsubscribeUrl: string;
};

// Gedeelde wrapper voor consistente styling
function wrap(body: string, input: MailInput): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Tweede Lente</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333; line-height: 1.6; }
  .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #f3d9e0; }
  .tulp { font-size: 40px; }
  h1 { font-size: 22px; color: #be185d; margin: 16px 0 8px; }
  h2 { font-size: 18px; color: #be185d; margin-top: 24px; }
  p { margin: 12px 0; }
  .anker { background: #fef2f4; border-left: 3px solid #f43f5e; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3d9e0; font-size: 12px; color: #999; text-align: center; }
  .footer a { color: #be185d; }
</style>
</head>
<body>
<div class="header">
  <div class="tulp">🌷</div>
  <h1>Tweede Lente</h1>
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

// ============================================================
// TEMPLATE 1, DAG 1 — Ritme
// ============================================================
// TODO-GABY: definitieve openingstoon. Onder staat een placeholder
// die claim-vrij is en in ELEVA-stem klinkt.
const dag1: MailTemplate = {
  dag: 1,
  onderwerp:
    "Eerste avond, ritme als onzichtbare bondgenoot",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>Fijn dat je gisteren de tijd nam voor Tweede Lente. Vanaf vanavond
krijg je vijf korte mails. Vijf avonden, vijf thema's die veel vrouwen
in deze tijd rust geven. Niet om iets te beloven, wel om je opties te
laten zien.</p>

<h2>Vanavond: ritme</h2>
<p>TODO-GABY: schrijf hier een paragraaf van 80-120 woorden over waarom
een vast dag-ritme in deze tijd extra rust geeft. Cortisol, slaap-waak,
spijsvertering. Hou het concreet en herkenbaar, geen wetenschap-toon.</p>

<div class="anker">
  <strong>Vanavond proberen:</strong> kies één moment, vast in de dag,
  waarop je drie diepe ademhalingen neemt. Bijvoorbeeld vlak na het
  avondeten.
</div>

<p>Morgen kijken we naar voeding. Slaap zacht.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

// ============================================================
// TEMPLATE 2, DAG 2 — Voeding
// ============================================================
// TODO-GABY: definitieve teksten.
const dag2: MailTemplate = {
  dag: 2,
  onderwerp: "Tweede avond, voeding die met je meeschuift",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: opening voor dag 2.</p>

<h2>Vanavond: voeding</h2>
<p>TODO-GABY: 80-120 woorden over eiwit per maaltijd, 12-uurs eet-venster,
en de tekorten die in onze moderne voeding zitten (verminderde
nutriëntdichtheid in groente/fruit, lange transport-routes,
intensieve landbouw). Brug naar Lifeplus-supplementen mag, maar
NIET claimsterk: gewoon "veel vrouwen kiezen voor gerichte aanvulling
van ...".</p>

<div class="anker">
  <strong>Vanavond proberen:</strong> bij je avondeten een bron van
  bladgroente of peulvruchten toevoegen. Klein, maar telt.
</div>

<p>Morgen: rust.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

// ============================================================
// TEMPLATE 3, DAG 3 — Rust en ontspanning
// ============================================================
const dag3: MailTemplate = {
  dag: 3,
  onderwerp: "Derde avond, vijf minuten stilte als instap",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: opening dag 3.</p>

<h2>Vanavond: rust</h2>
<p>TODO-GABY: 80-120 woorden over hoe stress in deze tijd anders landt
(oestrogeen-niveaus reguleren mede de stress-respons). EFSA-claims die
mogen: magnesium draagt bij aan normale werking van het zenuwstelsel +
psychologische functie. Vitamine B6 draagt bij aan psychologische
functie + vermoeidheid.</p>

<div class="anker">
  <strong>Vanavond proberen:</strong> vijf minuten stilte, geen scherm,
  geen taak. Drie diepe ademhalingen: vier seconden in, zes seconden uit.
</div>

<p>Morgen: lichaamswijsheid.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

// ============================================================
// TEMPLATE 4, DAG 4 — Lichaamswijsheid
// ============================================================
const dag4: MailTemplate = {
  dag: 4,
  onderwerp: "Vierde avond, naar je lichaam luisteren zonder alarm",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: opening dag 4.</p>

<h2>Vanavond: lichaamswijsheid</h2>
<p>TODO-GABY: 80-120 woorden over hoe je in deze tijd signalen kunt
herkennen zonder ze meteen als alarm te interpreteren. Spiermassa-
behoud (kracht), botten (vitamine D + K), hersenen (omega-3).
EFSA-claims mogen letterlijk.</p>

<div class="anker">
  <strong>Vanavond proberen:</strong> sta vijf minuten stil bij hoe je
  lichaam vandaag voelde. Niet beoordelen, alleen opmerken.
</div>

<p>Morgen: het persoonlijke aanbod.</p>
<p>${i.memberVoornaam} en het team</p>`,
      i,
    ),
};

// ============================================================
// TEMPLATE 5, DAG 5 — Contact-aanbod
// ============================================================
const dag5: MailTemplate = {
  dag: 5,
  onderwerp: "Laatste avond, een uitnodiging zonder druk",
  bouwHtml: (i) =>
    wrap(
      `<h2>Hoi ${i.leadVoornaam}</h2>
<p>TODO-GABY: laatste mail. Opening waarin je terugkijkt op de vier
mails ervoor en herinnert aan de spiegel + handvatten uit de bot.</p>

<h2>Wat veel vrouwen kiezen na deze week</h2>
<p>TODO-GABY: 80-120 woorden over de drie hormoonbalans-niveaus
(Essential, Plus, Complete) en wat veel vrouwen in deze tijd doen.
Geen claims, wel richting. Verwijs naar de persoonlijke link die ze
in de bot zagen, of nodig uit voor een persoonlijk gesprek met
${i.memberVoornaam}.</p>

<div class="anker">
  <strong>Twee opties die veel vrouwen kiezen:</strong>
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

export const TWEEDE_LENTE_MAILS: MailTemplate[] = [dag1, dag2, dag3, dag4, dag5];

/**
 * Hulpfunctie: vind template voor specifieke dag.
 */
export function templateVoorDag(dag: number): MailTemplate | null {
  return TWEEDE_LENTE_MAILS.find((t) => t.dag === dag) ?? null;
}

import { SITE_URL } from "@/lib/site";
import { slotTekst } from "./slots";
import { googleAgendaUrl, outlookAgendaUrl } from "./agenda";

// ============================================================
// De vier mails rond de masterclass. Toon: warm, kort, en eerlijk
// over wat het is. Nergens "live", nergens "nog 3 plekken".
// ============================================================

export type MailSoort = "bevestiging" | "herinnering" | "kijklink" | "terugkijk";

type MailContext = {
  naam: string;
  token: string;
  slotStart: string;
  memberVoornaam: string;
  titel: string;
  duurMinuten: number;
};

function knop(url: string, tekst: string): string {
  return `<p style="margin:24px 0"><a href="${url}" style="background:#D4AF37;color:#1a1a1a;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${tekst}</a></p>`;
}

function omhulsel(inhoud: string, afzender: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.6;color:#222">
${inhoud}
<p style="margin-top:28px">Warme groet,<br>${afzender}</p>
<p style="color:#888;font-size:12px;margin-top:24px">Je krijgt deze mail omdat je je hebt aangemeld voor de masterclass. Wil je geen herinneringen meer? Antwoord dan even op deze mail.</p>
</div>`;
}

/**
 * Platte-tekst-versie van de HTML. Geen nette parser nodig: onze mails
 * hebben een vaste, eenvoudige opbouw. Belangrijk voor bezorging, want
 * HTML-only mail wordt eerder als spam gezien.
 */
function naarTekst(html: string): string {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, "$2: $1")
    .replace(/<\/(p|div|h\d)>/g, "\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function bouwMail(
  soort: MailSoort,
  ctx: MailContext,
): { onderwerp: string; html: string; tekst: string } {
  const kijkUrl = `${SITE_URL}/webinar/kijk/${ctx.token}`;
  const voornaam = ctx.naam.split(" ")[0] || "daar";
  const moment = slotTekst(ctx.slotStart);

  let onderwerp: string;
  let binnenkant: string;

  if (soort === "bevestiging") {
    onderwerp = `Je moment staat genoteerd: ${moment}`;
    binnenkant = `<p>Hoi ${voornaam},</p>
<p>Fijn dat je erbij wilt zijn. Je hebt gekozen voor <strong>${moment}</strong>.</p>
<p>Even eerlijk over wat het is: dit is een opgenomen webinar van ongeveer ${ctx.duurMinuten} minuten. Geen live-uitzending, dus je hoeft niet bang te zijn dat je iets mist of dat er iemand op je zit te wachten. Je kijkt gewoon op het moment dat jij hebt gekozen, in je eigen tempo.</p>
${knop(kijkUrl, "Bewaar je kijklink")}
<p style="margin:18px 0 6px"><strong>Zet 'm even in je agenda</strong>, dat helpt echt. Kies wat jij gebruikt:</p>
<p style="margin:0 0 18px">
  <a href="${SITE_URL}/api/webinar/agenda/${ctx.token}.ics" style="color:#8a6d1f">Apple Agenda of ander programma</a>
  &nbsp;·&nbsp;
  <a href="${googleAgendaUrl({ titel: ctx.titel, startIso: ctx.slotStart, duurMinuten: ctx.duurMinuten, kijkUrl })}" style="color:#8a6d1f">Google Agenda</a>
  &nbsp;·&nbsp;
  <a href="${outlookAgendaUrl({ titel: ctx.titel, startIso: ctx.slotStart, duurMinuten: ctx.duurMinuten, kijkUrl })}" style="color:#8a6d1f">Outlook</a>
</p>
<p>Ik stuur je vlak van tevoren ook nog een herinnering met de kijklink.</p>
<p>Kan het toch niet doorgaan op dat moment? Geen probleem, dezelfde link blijft gewoon werken.</p>`;
  } else if (soort === "herinnering") {
    onderwerp = `Over een half uur: ${ctx.titel}`;
    binnenkant = `<p>Hoi ${voornaam},</p>
<p>Straks is het zover, je gekozen moment is <strong>${moment}</strong>. Pak een kop koffie, zoek een rustig plekje, en dan zie je 'm hier:</p>
${knop(kijkUrl, "Naar het webinar")}
<p>Reken op ongeveer ${ctx.duurMinuten} minuten. Kijk 'm liefst in één keer, dat werkt het beste.</p>`;
  } else if (soort === "kijklink") {
    onderwerp = `Hij staat voor je klaar, ${voornaam}`;
    binnenkant = `<p>Hoi ${voornaam},</p>
<p>Je gekozen moment is nu. Het webinar staat klaar:</p>
${knop(kijkUrl, "Start het webinar")}
<p>Lukt het nu toch niet? De link blijft werken, dus je kunt 'm later gewoon oppakken.</p>`;
  } else {
    onderwerp = `Je hebt 'm nog niet gezien, ${voornaam}`;
    binnenkant = `<p>Hoi ${voornaam},</p>
<p>Je had je aangemeld voor het webinar op ${moment}, en ik zag dat het er nog niet van is gekomen. Dat kan gebeuren, het leven loopt zoals het loopt.</p>
<p>Het mooie van een opname: je kunt 'm alsnog kijken wanneer het jou uitkomt. Hij staat er gewoon nog.</p>
${knop(kijkUrl, "Alsnog kijken")}
<p>En is het niets voor jou? Ook helemaal prima, laat het gerust weten, dan stop ik met herinneren.</p>`;
  }

  const html = omhulsel(binnenkant, ctx.memberVoornaam);
  return { onderwerp, html, tekst: naarTekst(html) };
}

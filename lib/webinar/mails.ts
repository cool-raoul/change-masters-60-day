import { SITE_URL } from "@/lib/site";
import { slotTekst } from "./slots";

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

export function bouwMail(
  soort: MailSoort,
  ctx: MailContext,
): { onderwerp: string; html: string } {
  const kijkUrl = `${SITE_URL}/webinar/kijk/${ctx.token}`;
  const voornaam = ctx.naam.split(" ")[0] || "daar";
  const moment = slotTekst(ctx.slotStart);

  if (soort === "bevestiging") {
    return {
      onderwerp: `Je moment staat genoteerd: ${moment}`,
      html: omhulsel(
        `<p>Hoi ${voornaam},</p>
<p>Fijn dat je erbij wilt zijn. Je hebt gekozen voor <strong>${moment}</strong>.</p>
<p>Even eerlijk over wat het is: dit is een opgenomen masterclass van ongeveer ${ctx.duurMinuten} minuten. Geen live-uitzending, dus je hoeft niet bang te zijn dat je iets mist of dat er iemand op je zit te wachten. Je kijkt gewoon op het moment dat jij hebt gekozen, in je eigen tempo.</p>
<p>Zet het even in je agenda, dat helpt echt. Ik stuur je vlak van tevoren nog een herinnering met de kijklink.</p>
${knop(kijkUrl, "Bewaar je kijklink")}
<p>Kan het toch niet doorgaan op dat moment? Geen probleem, dezelfde link blijft gewoon werken.</p>`,
        ctx.memberVoornaam,
      ),
    };
  }

  if (soort === "herinnering") {
    return {
      onderwerp: `Over een half uur: ${ctx.titel}`,
      html: omhulsel(
        `<p>Hoi ${voornaam},</p>
<p>Straks is het zover, je gekozen moment is <strong>${moment}</strong>. Pak een kop koffie, zoek een rustig plekje, en dan zie je 'm hier:</p>
${knop(kijkUrl, "Naar de masterclass")}
<p>Reken op ongeveer ${ctx.duurMinuten} minuten. Kijk 'm liefst in één keer, dat werkt het beste.</p>`,
        ctx.memberVoornaam,
      ),
    };
  }

  if (soort === "kijklink") {
    return {
      onderwerp: `Hij staat voor je klaar, ${voornaam}`,
      html: omhulsel(
        `<p>Hoi ${voornaam},</p>
<p>Je gekozen moment is nu. De masterclass staat klaar:</p>
${knop(kijkUrl, "Start de masterclass")}
<p>Lukt het nu toch niet? De link blijft werken, dus je kunt 'm later gewoon oppakken.</p>`,
        ctx.memberVoornaam,
      ),
    };
  }

  return {
    onderwerp: `Je hebt 'm nog niet gezien, ${voornaam}`,
    html: omhulsel(
      `<p>Hoi ${voornaam},</p>
<p>Je had je aangemeld voor de masterclass op ${moment}, en ik zag dat het er nog niet van is gekomen. Dat kan gebeuren, het leven loopt zoals het loopt.</p>
<p>Het mooie van een opgenomen masterclass: je kunt 'm alsnog kijken wanneer het jou uitkomt. Hij staat er gewoon nog.</p>
${knop(kijkUrl, "Alsnog kijken")}
<p>En is het niets voor jou? Ook helemaal prima, laat het gerust weten, dan stop ik met herinneren.</p>`,
      ctx.memberVoornaam,
    ),
  };
}

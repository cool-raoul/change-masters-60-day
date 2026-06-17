// Generieke "hier is je uitkomst"-mail, direct na het invullen van een
// freebie-bot. Wikkelt de spiegel-tekst (wat de lead op het scherm zag) in een
// on-brand HTML-mail. Werkt voor elke freebie, niet alleen de Reset-check.

const GOUD = "#C9A84C";
const DONKER = "#1a1a1a";
const GRIJS = "#888888";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function bouwUitkomstMail(params: {
  leadVoornaam: string;
  spiegelTekst: string;
}): { onderwerp: string; html: string } {
  const voornaam = params.leadVoornaam.trim() || "jij";

  const alineas = params.spiegelTekst
    .split(/\n\s*\n/)
    .map((blok) => blok.trim())
    .filter(Boolean)
    .map(
      (blok) =>
        `<p style="margin:0 0 16px;">${escapeHtml(blok).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="nl">
<body style="margin:0;background:#f4f2ec;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Georgia,'Times New Roman',serif;color:${DONKER};font-size:16px;line-height:1.65;">
    <p style="margin:0 0 24px;letter-spacing:3px;text-transform:uppercase;font-size:11px;color:${GOUD};font-family:Arial,sans-serif;font-weight:bold;">ELEVA</p>
    <p style="margin:0 0 16px;">Hoi ${escapeHtml(voornaam)},</p>
    <p style="margin:0 0 16px;">Hier is jouw persoonlijke uitkomst, precies zoals je 'm net op je scherm zag. Bewaar 'm rustig en lees 'm nog eens terug wanneer het je uitkomt.</p>
    ${alineas}
    <p style="margin:24px 0 0;">De komende dagen krijg je nog een paar korte mails met praktische tips, ook als je verder niks doet. Op elk moment afmelden.</p>
    <p style="font-size:12px;color:${GRIJS};font-family:Arial,sans-serif;line-height:1.5;margin-top:28px;">Je ontvangt deze mail omdat je zojuist de test hebt ingevuld.</p>
  </div>
</body>
</html>`;

  return {
    onderwerp: `${voornaam}, hier is jouw persoonlijke uitkomst`,
    html,
  };
}

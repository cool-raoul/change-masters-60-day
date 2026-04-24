"use client";

// Herbruikbare quick-action iconen per prospect. Een klik = direct die app
// openen (tel:, mailto:, wa.me, instagram, facebook). Wordt gebruikt in:
//  - de namenlijst-rij (onder de naam)
//  - de /acties outbox-pagina
//  - de ContactgegevensForm (naast invulveld én naast waarde in view-mode)
// Zo hoef je niet eerst de prospect-kaart te openen om te appen of te bellen.
//
// De iconen gebruiken echte brand-SVG's (niet emoji) zodat iedereen direct ziet
// waar hij op klikt. Kleuren zijn subtiel-getint met brand-kleur zodat de lijn
// rustig blijft maar WA groen, FB blauw, IG roze herkenbaar zijn.

interface Kanalen {
  telefoon?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

interface Props {
  prospect: Kanalen;
  // "compact" = kleinere knoppen voor in rij-weergaven
  // "normaal" = iets groter voor in detailkaart of acties-pagina
  grootte?: "compact" | "normaal";
}

// ---------- URL-opbouw helpers ----------

// Maak van een telefoonnummer een tel:-link (laat + en digits over).
function naarTelLink(tel: string): string {
  const schoon = tel.replace(/[^\d+]/g, "");
  return `tel:${schoon}`;
}

// Normaliseer een NL-nummer naar internationaal formaat voor WhatsApp.
// wa.me wil E.164 zonder + of 00. Voorbeelden:
//   "06 508 585 75"    → "316508585 75" → "31650858575"
//   "+31 6 50858575"   → "31650858575"
//   "0031 650858575"   → "31650858575"
//   "31650858575"      → "31650858575"
function normaliseerWaNummer(tel: string): string {
  // Stap 1: alleen digits overhouden (ook + en spaties weg)
  let digits = tel.replace(/\D/g, "");
  if (!digits) return "";
  // Stap 2: 00-prefix is een oude internationale notatie — halen we weg
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    // Stap 3: enkele leidende 0 = NL landcode ontbreekt → 31 ervoor
    digits = "31" + digits.slice(1);
  }
  return digits;
}

function naarWaLink(tel: string): string {
  const digits = normaliseerWaNummer(tel);
  return `https://wa.me/${digits}`;
}

// Haal @ weg als gebruiker dat per ongeluk heeft ingevoerd, en accepteer
// ook volledige URL's.
function naarInstagramLink(handle: string): string {
  const trimmed = handle.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const schoon = trimmed.replace(/^@/, "");
  return `https://instagram.com/${schoon}`;
}

// Facebook kan een volledige URL zijn, een profielnaam met punten
// ("raoul.zeewijk"), of een numeriek ID. Gebruik altijd `www.` — de bare
// `facebook.com/...` variant wordt door de FB-app op iOS soms gekaapt en
// toont dan "Niet beschikbaar" in plaats van het profiel.
function naarFacebookLink(waarde: string): string {
  const trimmed = waarde.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    // Bestaande URL: forceer www. als die ontbreekt zodat app-hijack faalt
    return trimmed.replace(/^https?:\/\/(m\.|web\.)?facebook\.com/i, "https://www.facebook.com");
  }
  const schoon = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  return `https://www.facebook.com/${schoon}`;
}

// ---------- Brand SVG iconen ----------
// Vereenvoudigde brand-marks, monochroom met brand-tint via currentColor.

function WaIcoon({ klasse }: { klasse: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={klasse}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function BelIcoon({ klasse }: { klasse: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={klasse}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.21 2.2z" />
    </svg>
  );
}

function MailIcoon({ klasse }: { klasse: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={klasse}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.236-8 4.8-8-4.8V6l8 4.8L20 6v2.236z" />
    </svg>
  );
}

function InstagramIcoon({ klasse }: { klasse: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={klasse}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookIcoon({ klasse }: { klasse: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={klasse}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ---------- De knop zelf ----------

export function KanaalIconen({ prospect, grootte = "compact" }: Props) {
  const { telefoon, email, instagram, facebook } = prospect;

  // Niets om te tonen? Render ook niets.
  if (!telefoon && !email && !instagram && !facebook) return null;

  const maatKlasse =
    grootte === "compact" ? "w-7 h-7" : "w-9 h-9";
  const svgKlasse =
    grootte === "compact" ? "w-3.5 h-3.5" : "w-4 h-4";

  // Brand-getinte achtergronden (zeer subtiel, zodat ze rustig zijn in de lijst
  // maar je toch onderscheid ziet). De icoon-tekst krijgt de echte brand-kleur.
  const knopBasis = `${maatKlasse} inline-flex items-center justify-center rounded-full transition-colors`;
  const klasseWa = `${knopBasis} bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/30`;
  const klasseBel = `${knopBasis} bg-cm-surface-2 text-cm-white hover:bg-cm-gold/20 hover:text-cm-gold`;
  const klasseMail = `${knopBasis} bg-cm-surface-2 text-cm-white hover:bg-cm-gold/20 hover:text-cm-gold`;
  const klasseIg = `${knopBasis} bg-[#E1306C]/15 text-[#E1306C] hover:bg-[#E1306C]/30`;
  const klasseFb = `${knopBasis} bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/30`;

  return (
    <div className="flex items-center gap-1">
      {telefoon && (
        <>
          <a
            href={naarWaLink(telefoon)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={klasseWa}
            title="WhatsApp"
            aria-label="WhatsApp"
          >
            <WaIcoon klasse={svgKlasse} />
          </a>
          <a
            href={naarTelLink(telefoon)}
            onClick={(e) => e.stopPropagation()}
            className={klasseBel}
            title="Bellen"
            aria-label="Bellen"
          >
            <BelIcoon klasse={svgKlasse} />
          </a>
        </>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          onClick={(e) => e.stopPropagation()}
          className={klasseMail}
          title="E-mail"
          aria-label="E-mail"
        >
          <MailIcoon klasse={svgKlasse} />
        </a>
      )}
      {instagram && (
        <a
          href={naarInstagramLink(instagram)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={klasseIg}
          title="Instagram"
          aria-label="Instagram"
        >
          <InstagramIcoon klasse={svgKlasse} />
        </a>
      )}
      {facebook && (
        <a
          href={naarFacebookLink(facebook)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={klasseFb}
          title="Facebook"
          aria-label="Facebook"
        >
          <FacebookIcoon klasse={svgKlasse} />
        </a>
      )}
    </div>
  );
}

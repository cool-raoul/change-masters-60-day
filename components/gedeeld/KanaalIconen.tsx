"use client";

// Herbruikbare quick-action iconen per prospect. Een klik = direct die app
// openen (tel:, mailto:, wa.me, instagram, facebook). Wordt gebruikt in:
//  - de namenlijst-rij (compact)
//  - de /acties outbox-pagina
// Zo hoef je niet eerst de prospect-kaart te openen om te appen of te bellen.

interface Kanalen {
  telefoon?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

interface Props {
  prospect: Kanalen;
  // "compact" = alleen de iconen, kleiner; "normaal" = iets groter met meer padding
  grootte?: "compact" | "normaal";
}

// Maak van een telefoonnummer een tel:-link (laat + en digits over).
function naarTelLink(tel: string): string {
  const schoon = tel.replace(/[^\d+]/g, "");
  return `tel:${schoon}`;
}

// Maak van een telefoonnummer een WhatsApp wa.me-link (alleen digits, geen +).
function naarWaLink(tel: string): string {
  const schoon = tel.replace(/\D/g, "");
  return `https://wa.me/${schoon}`;
}

// Haal @ weg als gebruiker dat per ongeluk heeft ingevoerd.
function naarInstagramLink(handle: string): string {
  const schoon = handle.replace(/^@/, "").trim();
  return `https://instagram.com/${schoon}`;
}

// Facebook kan een volledige URL zijn of alleen een gebruikersnaam.
function naarFacebookLink(waarde: string): string {
  const trimmed = waarde.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://facebook.com/${trimmed.replace(/^@/, "")}`;
}

export function KanaalIconen({ prospect, grootte = "compact" }: Props) {
  const { telefoon, email, instagram, facebook } = prospect;

  // Niets om te tonen? Render ook niets.
  if (!telefoon && !email && !instagram && !facebook) return null;

  const iconKlasse =
    grootte === "compact"
      ? "w-7 h-7 text-sm"
      : "w-9 h-9 text-base";

  // Gedeelde styling — cirkel, hover-highlight, stopPropagation zodat de klik
  // NIET naar de omliggende <Link> lekt.
  const basisKlasse = `${iconKlasse} inline-flex items-center justify-center rounded-full bg-cm-surface-2 hover:bg-cm-gold/20 text-cm-white hover:text-cm-gold transition-colors`;

  return (
    <div className="flex items-center gap-1">
      {telefoon && (
        <>
          <a
            href={naarWaLink(telefoon)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={basisKlasse}
            title="WhatsApp"
            aria-label="WhatsApp"
          >
            💬
          </a>
          <a
            href={naarTelLink(telefoon)}
            onClick={(e) => e.stopPropagation()}
            className={basisKlasse}
            title="Bellen"
            aria-label="Bellen"
          >
            📞
          </a>
        </>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          onClick={(e) => e.stopPropagation()}
          className={basisKlasse}
          title="E-mail"
          aria-label="E-mail"
        >
          ✉️
        </a>
      )}
      {instagram && (
        <a
          href={naarInstagramLink(instagram)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={basisKlasse}
          title="Instagram"
          aria-label="Instagram"
        >
          📷
        </a>
      )}
      {facebook && (
        <a
          href={naarFacebookLink(facebook)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={basisKlasse}
          title="Facebook"
          aria-label="Facebook"
        >
          👥
        </a>
      )}
    </div>
  );
}

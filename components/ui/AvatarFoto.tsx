// ============================================================
// AvatarFoto, herbruikbare avatar voor heel ELEVA.
//
// Toont een ronde avatar, met:
//   - de profielfoto als die er is (profiles.foto_url)
//   - anders een gouden cirkel met de initialen van de naam
//
// Maat en stijl-variant via props. Lazy-load via standaard <img loading="lazy">.
// Geen <Image>-component omdat de URL extern (Supabase Storage) is en wisselt
// per user — een gewone <img> is hier eerlijker dan Next/Image-magie.
// ============================================================

type Maat = "xs" | "sm" | "md" | "lg";

const MAAT_KLASSEN: Record<Maat, string> = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
};

function initialenVoor(naam: string | null | undefined): string {
  if (!naam) return "?";
  return (
    naam
      .split(/\s|\//)
      .filter(Boolean)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

type Props = {
  naam: string | null | undefined;
  fotoUrl: string | null | undefined;
  maat?: Maat;
  className?: string;
};

export function AvatarFoto({ naam, fotoUrl, maat = "sm", className = "" }: Props) {
  const formaatKlasse = MAAT_KLASSEN[maat];

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={naam ?? ""}
        className={`${formaatKlasse} rounded-full border-2 border-cm-gold-dim object-cover bg-cm-surface-2 flex-shrink-0 ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${formaatKlasse} rounded-full border-2 border-cm-gold-dim bg-cm-surface-2 flex items-center justify-center text-cm-gold font-semibold flex-shrink-0 ${className}`}
      aria-label={naam ?? ""}
    >
      {initialenVoor(naam)}
    </div>
  );
}

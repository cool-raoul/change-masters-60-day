// Gedeelde WhatsApp-nummer-helpers, zodat overal in het systeem hetzelfde
// formaat gebruikt wordt en een knop direct naar het juiste nummer opent
// (geen contact-zoeker meer als het nummer bekend is).

// Normaliseer een NL-nummer naar internationaal E.164-formaat voor wa.me
// (zonder + of 00). Voorbeelden:
//   "06 508 585 75"  → "31650858575"
//   "+31 6 50858575" → "31650858575"
//   "0031 650858575" → "31650858575"
//   "31650858575"    → "31650858575"
export function normaliseerWaNummer(tel: string): string {
  let digits = tel.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    // Enkele leidende 0 = NL landcode ontbreekt → 31 ervoor.
    digits = "31" + digits.slice(1);
  }
  return digits;
}

/**
 * Bouw een wa.me-link. Met een geldig nummer opent WhatsApp DIRECT bij
 * die persoon (geen contact-zoeker). Zonder nummer valt 'ie terug op de
 * contact-kiezer met alleen de tekst.
 */
export function waLinkNaar(
  tel: string | null | undefined,
  tekst: string,
): string {
  const digits = tel ? normaliseerWaNummer(tel) : "";
  const t = encodeURIComponent(tekst);
  return digits ? `https://wa.me/${digits}?text=${t}` : `https://wa.me/?text=${t}`;
}

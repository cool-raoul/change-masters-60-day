// File: lib/freebie-bots/herkomst.ts
//
// Helper voor herkomst-parameters in bot-URL's. Wanneer een lead via
// ManyChat / Instagram / Facebook / mailing binnenkomt, kunnen die
// platformen extra context meegeven als URL-parameters. Wij vangen
// die op en slaan ze op de prospect-kaart, zodat de member ook
// zonder telefoonnummer contact kan opnemen.
//
// Ondersteunde parameters (in URL-query van /bot/<slug>/<token>):
//   ?ig=naam        -> Instagram-handle (zonder @, of met, wij strippen)
//   ?fb=naam        -> Facebook-naam of profielnaam
//   ?via=instagram  -> Bron-platform (instagram, facebook, mailing, etc.)
//
// Voorbeeld ManyChat-DM-template:
//   https://my-eleva.com/bot/energie-en-focus/<token>?ig={{user_username}}&via=instagram

export type HerkomstContext = {
  instagram: string | null;
  facebook: string | null;
  bron: string | null;
};

export function leesHerkomstUitSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): HerkomstContext {
  const lees = (sleutel: string): string | null => {
    if (params instanceof URLSearchParams) {
      const v = params.get(sleutel);
      return v ? v.trim() : null;
    }
    const v = params[sleutel];
    if (Array.isArray(v)) return v[0]?.trim() ?? null;
    return typeof v === "string" ? v.trim() : null;
  };

  const igRaw = lees("ig");
  const fbRaw = lees("fb");
  const viaRaw = lees("via");

  return {
    instagram: igRaw ? normaliseerHandle(igRaw) : null,
    facebook: fbRaw ? normaliseerHandle(fbRaw) : null,
    bron: viaRaw ? viaRaw.toLowerCase() : null,
  };
}

/**
 * Normaliseer een handle: strip @-prefix, trim whitespace, geen URLs.
 */
function normaliseerHandle(raw: string): string {
  let h = raw.trim();
  if (h.startsWith("@")) h = h.slice(1);
  // Strip eventuele URL-prefix zoals 'instagram.com/'
  h = h.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  h = h.replace(/^https?:\/\/(www\.)?facebook\.com\//i, "");
  // Strip trailing slash
  h = h.replace(/\/$/, "");
  return h;
}

/**
 * Bouw een leesbare bron-label voor weergave op de prospect-kaart.
 */
export function herkomstLabel(c: HerkomstContext): string | null {
  const stukjes: string[] = [];
  if (c.instagram) stukjes.push(`Instagram: @${c.instagram}`);
  if (c.facebook) stukjes.push(`Facebook: ${c.facebook}`);
  if (c.bron && !c.instagram && !c.facebook) stukjes.push(`Via: ${c.bron}`);
  return stukjes.length > 0 ? stukjes.join(" · ") : null;
}

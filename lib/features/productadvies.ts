// Feature-flag voor Productadvies-knop + coach-vraagtype "productadvies".
// Waarden (env var FEATURE_PRODUCTADVIES):
//   "all"     → iedereen ziet de feature (default, testfase)
//   "leiders" → alleen role="leider" ziet de feature
//   "off"     → volledig uit voor iedereen
// Togglen via Vercel → Settings → Environment Variables → FEATURE_PRODUCTADVIES.
// Na wijziging is een redeploy van de environment nodig (ca. 30 sec).

export type ProductadviesModus = "all" | "leiders" | "off";

export function productadviesModus(): ProductadviesModus {
  const raw = (process.env.FEATURE_PRODUCTADVIES ?? "all").toLowerCase();
  if (raw === "off" || raw === "leiders" || raw === "all") return raw;
  return "all";
}

export function productadviesBeschikbaar(role?: string | null): boolean {
  const modus = productadviesModus();
  if (modus === "off") return false;
  if (modus === "leiders") return role === "leider";
  return true;
}

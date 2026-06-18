// File: lib/site.ts
//
// DE ENE BRON voor de canonieke publieke URL van de app. Komt uit
// NEXT_PUBLIC_APP_URL (gezet in Vercel), met my-eleva.com als fallback.
//
// Gebruik dit overal waar je een ABSOLUTE app-URL nodig hebt buiten een
// request om (metadata/OG, mail-links met een vaste fallback, deelknoppen
// die geen window.location.origin kunnen gebruiken). Binnen een request is
// de origin uit de request (window.location.origin client-side, of
// req.nextUrl.origin / de host-header server-side) beter, want die volgt
// automatisch het domein waarop de app draait.
//
// Een toekomstige domein-wissel gebeurt hier, niet verspreid door de code.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://my-eleva.com"
).replace(/\/$/, "");

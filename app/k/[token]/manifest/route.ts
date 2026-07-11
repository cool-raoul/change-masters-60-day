import { pakResetKlantContext } from "@/lib/resetcode/klant-links";

// ============================================================
// GET /k/[token]/manifest
//
// Web-app-manifest per klant-link, zodat "zet op beginscherm"
// een echt app-icoon oplevert dat op de EIGEN omgeving opent
// (het globale manifest start op /dashboard, dat is voor
// members). Naam bewust neutraal en claim-vrij.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const ctx = await pakResetKlantContext(token);
  if (!ctx) return new Response("Niet gevonden", { status: 404 });

  return Response.json(
    {
      name: "Mijn Mentor",
      short_name: "Mentor",
      description: "Alles voor jouw programma op één plek.",
      start_url: `/k/${token}`,
      scope: `/k/${token}`,
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#0F1B17",
      theme_color: "#0F1B17",
      icons: [
        {
          src: "/eleva-icon.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/eleva-icon.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "private, max-age=3600",
      },
    },
  );
}

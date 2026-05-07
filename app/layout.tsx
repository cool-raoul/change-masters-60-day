import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { TaalProvider } from "@/lib/i18n/TaalContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "ELEVA",
  description: "Jouw persoonlijke aanbevelingsmarketing systeem voor Project Meer Tijd en Vrijheid",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ELEVA",
  },
  icons: {
    icon: "/eleva-icon.svg",
    // apple-touch-icon vereist nog steeds een PNG voor de iOS PWA-thuisscreen.
    // Tot Raoul de SVG converteert naar 512x512 PNG en op /eleva-icon.png
    // plaatst, blijft het oude icoon op iOS-thuisscreens. Browser-favicon
    // en de in-app weergave (sidebar/login) gebruiken al de nieuwe SVG.
    apple: "/eleva-icon.png",
  },
};

// Viewport-configuratie. Bewust GEEN viewportFit: 'cover' want dat
// liet content onder de iPhone-notch tekenen zonder safe-area-padding,
// wat Raoul gemeld heeft als 'bovenaan valt alles buiten beeld'. Default
// (contain) laat de browser de notch/home-indicator zelf afhandelen,
// content blijft binnen de safe area.
//
// iOS auto-zoom op inputs is los gefixt via een CSS-regel in
// globals.css die form-velden op mobiel forceert op 16px font-size.
// Pinch-to-zoom blokkeren we NIET, iOS negeert dat sowieso en het
// kan accessibility-zoom kapot maken.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D4AF37",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        {/* theme-color zit nu in de viewport-export. Mobile-web-app + apple-
            web-app + iconen blijven hier, want die horen niet bij viewport. */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ELEVA" />
        <link rel="apple-touch-icon" href="/eleva-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/eleva-icon.svg" />
      </head>
      <body>
        <TaalProvider>
          {children}
          <ServiceWorkerRegister />
        </TaalProvider>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              color: "#F5F5F0",
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { TaalProvider } from "@/lib/i18n/TaalContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import {
  ThemeProvider,
  themeInlineScript,
} from "@/components/theme/ThemeContext";
import { ModusBodyClass } from "@/components/theme/ModusBodyClass";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ELEVA",
  description: "Jouw persoonlijke aanbevelingsmarketing systeem voor Project Meer Tijd en Vrijheid",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ELEVA",
  },
  icons: {
    icon: "/eleva-icon.png",
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
  // Theme-color voor PWA chrome (status-bar, browser-UI). Past bij beide
  // thema's omdat goud een gedeeld accent is. Dark = dominant zwart,
  // light = dominant cream, maar het goud is het brand-anker.
  themeColor: "#c4a04a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        {/* Anti-flash theme-script: zet .light op <html> vóór React-
            hydratie als de user 'm zo had ingesteld. Voorkomt flash-of-
            wrong-theme bij eerste paint. */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInlineScript }}
        />
        {/* theme-color zit nu in de viewport-export. Mobile-web-app + apple-
            web-app + iconen blijven hier, want die horen niet bij viewport. */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ELEVA" />
        <link rel="apple-touch-icon" href="/eleva-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/eleva-icon.png" />
      </head>
      <body>
        <ThemeProvider>
          <ModusBodyClass>
            <TaalProvider>
              {children}
              <ServiceWorkerRegister />
            </TaalProvider>
          </ModusBodyClass>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "rgb(var(--cm-surface))",
                border: "1px solid rgb(var(--cm-border))",
                color: "rgb(var(--cm-white))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

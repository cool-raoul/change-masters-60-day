import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { TaalProvider } from "@/lib/i18n/TaalContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Change Masters — 60 Dagen Run",
  description: "Jouw persoonlijke aanbevelingsmarketing systeem voor de 60-dagenrun",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Change Masters",
  },
  icons: {
    icon: "/logo-192.png",
    apple: "/logo-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <meta name="theme-color" content="#D4AF37" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Change Masters" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
        <link rel="icon" type="image/png" href="/logo-192.png" sizes="192x192" />
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

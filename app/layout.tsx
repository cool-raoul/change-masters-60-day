import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { TaalProvider } from "@/lib/i18n/TaalContext";

export const metadata: Metadata = {
  title: "ELEVA — 60 Dagen Run",
  description: "Jouw persoonlijke aanbevelingsmarketing systeem voor de 60-dagenrun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <TaalProvider>
          {children}
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

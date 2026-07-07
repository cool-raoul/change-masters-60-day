"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================
// Navigatie van de NIEUWE anti-overwhelm-layout: vijf domeinen,
// identiek op desktop (linker-rail) en mobiel (onderbalk).
// Wordt door AppShell gerenderd wanneer profiles.nieuwe_layout
// aan staat (founder/tester). Elke bestaande route hoort bij
// één domein, zodat het actieve domein altijd klopt, waar je
// ook doorklikt.
// ============================================================

const DOMEINEN = [
  {
    emoji: "🏠",
    label: "Vandaag",
    href: "/nieuw",
    routes: [
      "/nieuw",
      "/vandaag",
      "/dashboard",
      "/herinneringen",
      "/mijn-why",
      "/zoeken",
      "/playbook",
      "/welkom",
    ],
  },
  {
    emoji: "👥",
    label: "Mensen",
    href: "/nieuw/mensen",
    routes: ["/nieuw/mensen", "/namenlijst", "/mijn-chats", "/uitnodigingen", "/team", "/sponsor"],
  },
  {
    emoji: "🤖",
    label: "Mentor",
    href: "/coach",
    routes: ["/coach", "/scripts", "/mijn-zinnen"],
  },
  {
    emoji: "📚",
    label: "Leren",
    href: "/nieuw/leren",
    routes: ["/nieuw/leren", "/lessen", "/academy", "/core-v10", "/wat-nu"],
  },
  {
    emoji: "⚙️",
    label: "Meer",
    href: "/nieuw/meer",
    routes: [
      "/nieuw/meer",
      "/instellingen",
      "/statistieken",
      "/premium",
      "/over-eleva",
      "/setup",
      "/diagnose",
      "/founder",
    ],
  },
];

function actiefDomein(pathname: string): string {
  // Exacte /nieuw eerst (anders matcht /nieuw ook /nieuw/mensen).
  for (const d of DOMEINEN) {
    for (const r of d.routes) {
      if (r === "/nieuw" ? pathname === "/nieuw" : pathname.startsWith(r)) {
        return d.href;
      }
    }
  }
  return "";
}

export function NieuweRail({ sponsorNaam }: { sponsorNaam: string | null }) {
  const pathname = usePathname() || "";
  const actief = actiefDomein(pathname);
  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-cm-border bg-cm-black/60 px-3 py-5">
      <Link href="/nieuw" className="flex items-center gap-2.5 px-2 pb-6">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cm-gold to-cm-gold-light" />
        <span className="font-bold tracking-[0.14em] text-sm text-cm-white">ELEVA</span>
      </Link>
      <nav className="space-y-1">
        {DOMEINEN.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold border-l-[3px] transition-colors ${
              actief === d.href
                ? "text-cm-gold bg-cm-gold/10 border-cm-gold"
                : "text-cm-white/60 border-transparent hover:text-cm-white hover:bg-cm-surface-2/50"
            }`}
          >
            <span className="w-5 text-center text-base">{d.emoji}</span>
            {d.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-2 pt-4 border-t border-cm-border/60 text-xs text-cm-white/40">
        {sponsorNaam ? <>Je sponsor: {sponsorNaam} 🥰</> : "✨ Nieuwe layout"}
      </div>
    </aside>
  );
}

export function NieuweBottomNav() {
  const pathname = usePathname() || "";
  const actief = actiefDomein(pathname);
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-cm-border bg-cm-black/95 backdrop-blur flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {DOMEINEN.map((d) => (
        <Link
          key={d.href}
          href={d.href}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
            actief === d.href ? "text-cm-gold" : "text-cm-white/50"
          }`}
        >
          <span className="text-lg leading-none">{d.emoji}</span>
          {d.label}
        </Link>
      ))}
    </nav>
  );
}

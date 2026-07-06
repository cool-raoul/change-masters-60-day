"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigatie van de NIEUWE layout-preview (/nieuw): vijf domeinen,
// op desktop een linker-rail, op mobiel een onderbalk. Zelfde vijf
// items op beide, dat is het hele punt (nu wijken desktop en mobiel
// van elkaar af). Mentor linkt naar de bestaande /coach.

const DOMEINEN = [
  { emoji: "🏠", label: "Vandaag", href: "/nieuw" },
  { emoji: "👥", label: "Mensen", href: "/nieuw/mensen" },
  { emoji: "🤖", label: "Mentor", href: "/coach" },
  { emoji: "📚", label: "Leren", href: "/nieuw/leren" },
  { emoji: "⚙️", label: "Meer", href: "/nieuw/meer" },
];

function isActief(pathname: string, href: string): boolean {
  if (href === "/nieuw") return pathname === "/nieuw";
  return pathname.startsWith(href);
}

export function NieuwRail({ sponsorNaam }: { sponsorNaam: string | null }) {
  const pathname = usePathname() || "";
  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-cm-border bg-cm-black/60 px-3 py-5">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cm-gold to-cm-gold-light" />
        <span className="font-bold tracking-[0.14em] text-sm text-cm-white">ELEVA</span>
      </div>
      <nav className="space-y-1">
        {DOMEINEN.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold border-l-[3px] transition-colors ${
              isActief(pathname, d.href)
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
        {sponsorNaam ? <>Je sponsor: {sponsorNaam} 🥰</> : "Nieuwe layout-preview"}
      </div>
    </aside>
  );
}

export function NieuwBottomNav() {
  const pathname = usePathname() || "";
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-cm-border bg-cm-black/95 backdrop-blur flex">
      {DOMEINEN.map((d) => (
        <Link
          key={d.href}
          href={d.href}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
            isActief(pathname, d.href) ? "text-cm-gold" : "text-cm-white/50"
          }`}
        >
          <span className="text-lg leading-none">{d.emoji}</span>
          {d.label}
        </Link>
      ))}
    </nav>
  );
}

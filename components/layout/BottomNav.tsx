"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// BottomNav, mobile-first navigatie onderaan het scherm.
//
// Mockup-4 element (akkoord 7 mei 2026): vier hoofd-items + 'Meer'.
// Klein, altijd in beeld, met meldings-badge op Vandaag voor open
// herinneringen.
//
// "Meer" opent de bestaande Sidebar-drawer via een custom event
// ("eleva-menu:open"), zodat we niet twee implementaties hoeven.
//
// Verbergt zich op desktop (lg+), daar staat de Sidebar al continu
// links zichtbaar.
// ============================================================

type NavItem = {
  href: string;
  label: string;
  ico: string;
  isActive: (pathname: string) => boolean;
  isMore?: boolean;
  toonHerinneringenBadge?: boolean;
};

export function BottomNav() {
  const pathname = usePathname();
  const [aantalHerinneringen, setAantalHerinneringen] = useState(0);
  const supabase = createClient();

  // Real-time aantal openstaande herinneringen voor de badge op
  // 'Vandaag'. Zelfde patroon als de bel-icoon in de Topbar.
  useEffect(() => {
    let mounted = true;
    async function laad() {
      const vandaag = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("herinneringen")
        .select("*", { count: "exact", head: true })
        .lte("vervaldatum", vandaag)
        .eq("voltooid", false);
      if (mounted) setAantalHerinneringen(count || 0);
    }
    laad();
    const channel = supabase
      .channel("bottom-nav-herinneringen")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "herinneringen" },
        () => laad(),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items: NavItem[] = [
    {
      href: "/dashboard",
      label: "Vandaag",
      ico: "🏠",
      // Vandaag is de modus-onafhankelijke landing: dashboard redirect
      // automatisch naar welkom-core/welkom-pro als de modus dat is.
      // Actief op alle drie de varianten + de guided-flow op /vandaag.
      isActive: (p) =>
        p.startsWith("/dashboard") ||
        p.startsWith("/welkom-core") ||
        p.startsWith("/welkom-pro") ||
        p.startsWith("/vandaag"),
      toonHerinneringenBadge: true,
    },
    {
      href: "/namenlijst",
      label: "Namen",
      ico: "👥",
      isActive: (p) => p.startsWith("/namenlijst"),
    },
    {
      href: "/coach",
      label: "Mentor",
      ico: "🤖",
      isActive: (p) => p.startsWith("/coach"),
    },
    {
      href: "/scripts",
      label: "Scripts",
      ico: "📋",
      isActive: (p) => p.startsWith("/scripts"),
    },
    {
      href: "#meer",
      label: "Meer",
      ico: "⋯",
      isActive: () => false,
      isMore: true,
    },
  ];

  function openMenu(e: React.MouseEvent) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("eleva-menu:open"));
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-cm-surface/95 border-t border-cm-border flex items-center justify-around px-1 z-30 backdrop-blur-md"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Hoofdnavigatie"
    >
      {items.map((item) => {
        const actief = item.isActive(pathname);
        const showBadge = item.toonHerinneringenBadge && aantalHerinneringen > 0;

        const inhoud = (
          <div className="flex flex-col items-center gap-0.5 relative pt-1">
            {/* Achtergrond-gloed onder het actieve icoon, geeft een
                'oplichtend' gevoel zoals in mockup-4. */}
            {actief && (
              <span
                aria-hidden
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-cm-gold/25 blur-md pointer-events-none animate-pulse-gold"
              />
            )}
            <span
              className={`text-xl leading-none relative ${
                actief
                  ? "drop-shadow-[0_0_10px_rgba(184,154,82,0.85)]"
                  : ""
              }`}
            >
              {item.ico}
            </span>
            <span
              className={`text-[10px] font-semibold tracking-wide leading-none relative ${
                actief ? "text-cm-gold drop-shadow-[0_0_4px_rgba(184,154,82,0.6)]" : "text-cm-white/55"
              }`}
            >
              {item.label}
            </span>
            {showBadge && (
              <span className="absolute -top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500/85 text-white text-[9px] font-bold flex items-center justify-center px-1 border-2 border-cm-surface">
                {aantalHerinneringen > 9 ? "9+" : aantalHerinneringen}
              </span>
            )}
          </div>
        );

        if (item.isMore) {
          return (
            <button
              key={item.href}
              onClick={openMenu}
              className="flex-1 flex justify-center items-center py-1.5 active:scale-95 transition-transform"
              aria-label="Meer menu-opties openen"
            >
              {inhoud}
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex justify-center items-center py-1.5 active:scale-95 transition-transform"
          >
            {inhoud}
          </Link>
        );
      })}
    </nav>
  );
}

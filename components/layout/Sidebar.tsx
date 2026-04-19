"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTaal } from "@/lib/i18n/TaalContext";

export function Sidebar({ isLeider = false }: { isLeider?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobielmenuOpen, setMobielmenuOpen] = useState(false);
  const { v } = useTaal();

  const navigatie = [
    { href: "/dashboard", labelKey: "nav.dashboard", icoon: "⚡" },
    { href: "/namenlijst", labelKey: "nav.namenlijst", icoon: "👥" },
    { href: "/zoeken", labelKey: "nav.zoeken", icoon: "🔍" },
    { href: "/coach", labelKey: "nav.coach", icoon: "🤖" },
    { href: "/scripts", labelKey: "nav.scripts", icoon: "📋" },
    { href: "/statistieken", labelKey: "nav.statistieken", icoon: "📊" },
    { href: "/herinneringen", labelKey: "nav.herinneringen", icoon: "🔔" },
    { href: "/team", labelKey: "nav.team", icoon: "🏆" },
  ];

  // Sluit menu bij navigatie
  useEffect(() => {
    setMobielmenuOpen(false);
  }, [pathname]);

  // Drawer is fixed inset-0 z-50 — covert viewport al volledig. Geen body-lock nodig.
  // Body-lock (document.body.style.overflow = "hidden") veroorzaakt op iOS Safari
  // rendering-glitches waarbij de hamburger verdwijnt na een ander modal.

  async function uitloggen() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const menuInhoud = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-cm-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <img src="/eleva-icon.png" alt="ELEVA" className="h-8 w-8" />
            <div>
              <h1 className="text-xl eleva-brand">ELEVA</h1>
              <p className="text-cm-white text-[10px] opacity-60 -mt-0.5">{v("nav.60dagen")}</p>
            </div>
          </div>
        </div>
        {/* Sluit knop alleen op mobiel */}
        <button
          onClick={() => setMobielmenuOpen(false)}
          className="lg:hidden text-cm-white opacity-60 hover:opacity-100 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Navigatie — scrollbaar zodat alles bereikbaar is op kleine schermen */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigatie.map((item) => {
          const actief = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                actief
                  ? "bg-gold-subtle border border-gold-subtle text-cm-gold"
                  : "text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2"
              }`}
            >
              <span className="text-base">{item.icoon}</span>
              {v(item.labelKey)}
            </Link>
          );
        })}

        {isLeider && (
          <div className="px-3 py-1.5 mt-1">
            <span className="text-xs text-cm-gold/70 font-medium flex items-center gap-1">
              <span>👑</span> Leider
            </span>
          </div>
        )}

        {/* Onderkant items direct in de scroll-zone zodat ze altijd bereikbaar zijn */}
        <div className="pt-3 mt-3 border-t border-cm-border space-y-1">
          <button
            onClick={() => {
              setMobielmenuOpen(false);
              window.dispatchEvent(new CustomEvent("rondleiding:open"));
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cm-white opacity-90 hover:opacity-100 hover:bg-cm-surface-2 transition-colors w-full text-left"
          >
            <span>🎓</span> Rondleiding
          </button>
          <Link
            href="/premium"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname.startsWith("/premium")
                ? "bg-gold-subtle border border-gold-subtle text-cm-gold"
                : "text-cm-gold opacity-90 hover:opacity-100 hover:bg-cm-surface-2"
            }`}
          >
            <span>🌟</span> {v("nav.premium")}
          </Link>
          <Link
            href="/instellingen"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
          >
            <span>⚙️</span> {v("nav.instellingen")}
          </Link>
          <Link
            href="/mijn-why"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
          >
            <span>🎯</span> {v("nav.mijn_why")}
          </Link>
          <button
            onClick={uitloggen}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:text-red-400 hover:bg-cm-surface-2 transition-colors w-full text-left"
          >
            <span>🚪</span> {v("nav.uitloggen")}
          </button>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Hamburger knop — alleen op mobiel. z-[60] staat altijd boven modals (z-50)
          zodat de knop niet verdwijnt na sluiten van een modal (iOS repaint-issue). */}
      <button
        onClick={() => setMobielmenuOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[60] bg-cm-surface border border-cm-border rounded-lg p-2 text-cm-gold"
        aria-label="Menu openen"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Tweede hamburger als FAB linksonder — duim-bereikbaar op telefoon en
          werkt als fallback wanneer de top-knop onzichtbaar blijkt na modal-sluit. */}
      <button
        onClick={() => setMobielmenuOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full bg-cm-surface border border-cm-border shadow-lg flex items-center justify-center text-cm-gold active:scale-95 transition-transform duration-200"
        aria-label="Menu openen"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-cm-surface border-r border-cm-border flex-col h-screen sticky top-0">
        {menuInhoud}
      </aside>

      {/* Mobiel overlay */}
      {mobielmenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Donkere achtergrond */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobielmenuOpen(false)}
          />
          {/* Menu drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-cm-surface border-r border-cm-border flex flex-col h-full animate-slide-in">
            {menuInhoud}
          </aside>
        </div>
      )}
    </>
  );
}

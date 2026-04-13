"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navigatie = [
  { href: "/dashboard", label: "Dashboard", icoon: "⚡" },
  { href: "/namenlijst", label: "Namenlijst", icoon: "👥" },
  { href: "/zoeken", label: "Zoeken", icoon: "🔍" },
  { href: "/coach", label: "AI Coach", icoon: "🤖" },
  { href: "/scripts", label: "Scripts", icoon: "📋" },
  { href: "/herinneringen", label: "Herinneringen", icoon: "🔔" },
  { href: "/team", label: "Mijn Team", icoon: "🏆" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobielmenuOpen, setMobielmenuOpen] = useState(false);

  // Sluit menu bij navigatie
  useEffect(() => {
    setMobielmenuOpen(false);
  }, [pathname]);

  // Voorkom scrollen als menu open is
  useEffect(() => {
    if (mobielmenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobielmenuOpen]);

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
              <h1 className="text-xl font-display font-bold text-gold-gradient">ELEVA</h1>
              <p className="text-cm-white text-[10px] opacity-60 -mt-0.5">60 Dagen Run</p>
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

      {/* Navigatie */}
      <nav className="flex-1 p-4 space-y-1">
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Onderkant */}
      <div className="p-4 border-t border-cm-border space-y-2">
        <Link
          href="/instellingen"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
        >
          <span>⚙️</span> Instellingen
        </Link>
        <Link
          href="/mijn-why"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
        >
          <span>🎯</span> Mijn WHY
        </Link>
        <button
          onClick={uitloggen}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:text-red-400 hover:bg-cm-surface-2 transition-colors w-full text-left"
        >
          <span>🚪</span> Uitloggen
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger knop — alleen op mobiel */}
      <button
        onClick={() => setMobielmenuOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 bg-cm-surface border border-cm-border rounded-lg p-2 text-cm-gold"
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

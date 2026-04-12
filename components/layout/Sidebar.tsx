"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navigatie = [
  { href: "/dashboard", label: "Dashboard", icoon: "⚡" },
  { href: "/namenlijst", label: "Namenlijst", icoon: "👥" },
  { href: "/coach", label: "AI Coach", icoon: "🤖" },
  { href: "/scripts", label: "Scripts", icoon: "📋" },
  { href: "/herinneringen", label: "Herinneringen", icoon: "🔔" },
  { href: "/team", label: "Team", icoon: "🏆" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function uitloggen() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-cm-surface border-r border-cm-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-cm-border">
        <h1 className="text-xl font-display font-bold text-gold-gradient">
          Change Masters
        </h1>
        <p className="text-cm-muted text-xs mt-0.5">60 Dagen Run</p>
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
                  : "text-cm-muted hover:text-cm-white hover:bg-cm-surface-2"
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-muted hover:text-cm-white hover:bg-cm-surface-2 transition-colors"
        >
          <span>⚙️</span> Instellingen
        </Link>
        <Link
          href="/mijn-why"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-muted hover:text-cm-white hover:bg-cm-surface-2 transition-colors"
        >
          <span>🎯</span> Mijn WHY
        </Link>
        <button
          onClick={uitloggen}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-muted hover:text-red-400 hover:bg-cm-surface-2 transition-colors w-full text-left"
        >
          <span>🚪</span> Uitloggen
        </button>
      </div>
    </aside>
  );
}

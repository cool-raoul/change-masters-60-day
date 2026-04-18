"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { differenceInDays } from "date-fns";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";

const RUN_START = new Date("2026-04-12");

export function Topbar({ gebruikersnaam }: { gebruikersnaam: string }) {
  const [aantalHerinneringen, setAantalHerinneringen] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const dag = Math.max(1, Math.min(60, differenceInDays(new Date(), RUN_START) + 1));
  const fase = dag <= 20 ? 1 : dag <= 40 ? 2 : 3;
  const { v } = useTaal();

  const supabase = createClient();

  useEffect(() => {
    async function laadHerinneringen() {
      const vandaag = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("herinneringen")
        .select("*", { count: "exact", head: true })
        .lte("vervaldatum", vandaag)
        .eq("voltooid", false);
      setAantalHerinneringen(count || 0);
    }

    async function laadPremium() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("premium_tot")
        .eq("id", user.id)
        .single();
      const tot = (data as any)?.premium_tot as string | null;
      setIsPremium(!!tot && new Date(tot) >= new Date());
    }

    laadHerinneringen();
    laadPremium();

    // Realtime updates
    const channel = supabase
      .channel("herinneringen-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "herinneringen" },
        () => laadHerinneringen()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => laadPremium()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <header className="h-16 border-b border-cm-border bg-cm-surface flex items-center justify-between px-4 lg:px-6">
      {/* Dag teller */}
      <div className="flex items-center gap-4 ml-10 lg:ml-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cm-gold flex items-center justify-center">
            <span className="text-cm-black text-xs font-bold">{dag}</span>
          </div>
          <div>
            <p className="text-cm-white text-sm font-semibold">{v("dashboard.dag")} {dag} {v("dashboard.van_60")}</p>
            <p className="text-cm-white text-xs">{v("topbar.fase")} {fase}</p>
          </div>
        </div>

        {/* Voortgangsbalk */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-32 h-1.5 bg-cm-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-500"
              style={{ width: `${(dag / 60) * 100}%` }}
            />
          </div>
          <span className="text-cm-white text-xs">{Math.round((dag / 60) * 100)}%</span>
        </div>
      </div>

      {/* Rechts: herinneringen + gebruiker */}
      <div className="flex items-center gap-3">
        {isPremium && (
          <Link
            href="/premium"
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-gold text-cm-black text-xs font-bold hover:opacity-90 transition-opacity"
            title="Je hebt ELEVA Premium"
          >
            <span>⭐</span>
            <span className="hidden sm:inline">Premium</span>
          </Link>
        )}

        <Link
          href="/herinneringen"
          className="relative p-2 text-cm-white hover:text-cm-white transition-colors"
        >
          <span className="text-lg">🔔</span>
          {aantalHerinneringen > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cm-gold text-cm-black text-xs font-bold rounded-full flex items-center justify-center">
              {aantalHerinneringen > 9 ? "9+" : aantalHerinneringen}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <div className={`relative w-8 h-8 rounded-full bg-cm-surface-2 border flex items-center justify-center ${
            isPremium ? "border-cm-gold ring-2 ring-cm-gold/30" : "border-cm-border"
          }`}>
            <span className="text-cm-gold text-sm font-semibold">
              {gebruikersnaam.charAt(0).toUpperCase()}
            </span>
            {isPremium && (
              <span className="absolute -top-1 -right-1 text-[10px]" title="Premium">⭐</span>
            )}
          </div>
          <span className="text-cm-white text-sm hidden md:block">{gebruikersnaam}</span>
        </div>
      </div>
    </header>
  );
}

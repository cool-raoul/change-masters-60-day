"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { differenceInDays } from "date-fns";
import Link from "next/link";

const RUN_START = new Date("2026-04-12");

export function Topbar({ gebruikersnaam }: { gebruikersnaam: string }) {
  const [aantalHerinneringen, setAantalHerinneringen] = useState(0);
  const dag = Math.max(1, Math.min(60, differenceInDays(new Date(), RUN_START) + 1));
  const fase = dag <= 20 ? 1 : dag <= 40 ? 2 : 3;

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

    laadHerinneringen();

    // Realtime updates
    const channel = supabase
      .channel("herinneringen-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "herinneringen" },
        () => laadHerinneringen()
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
            <p className="text-cm-white text-sm font-semibold">Dag {dag} van 60</p>
            <p className="text-cm-white text-xs">Fase {fase} actief</p>
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
      <div className="flex items-center gap-4">
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
          <div className="w-8 h-8 rounded-full bg-cm-surface-2 border border-cm-border flex items-center justify-center">
            <span className="text-cm-gold text-sm font-semibold">
              {gebruikersnaam.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-cm-white text-sm hidden md:block">{gebruikersnaam}</span>
        </div>
      </div>
    </header>
  );
}

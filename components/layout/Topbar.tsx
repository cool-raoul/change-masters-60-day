"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTaal } from "@/lib/i18n/TaalContext";

export function Topbar({
  gebruikersnaam,
  huidigeDag,
}: {
  gebruikersnaam: string;
  /** Server-side berekende huidige dag (zelfde logica als dashboard).
   *  Topbar overschrijft deze alleen wanneer de URL een ?dag=N
   *  parameter heeft op /playbook (founder-preview-modus). */
  huidigeDag: number;
}) {
  const [aantalHerinneringen, setAantalHerinneringen] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [profielMenuOpen, setProfielMenuOpen] = useState(false);
  const profielMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Founder-preview: als de pathname /playbook is en er staat ?dag=N
  // in de URL, volg die. Zo blijft de Topbar-cirkel altijd congruent
  // met de dag die de founder op dit moment in het playbook bekijkt.
  const dagFromUrl =
    pathname === "/playbook" ? Number(searchParams.get("dag")) : NaN;
  const dag =
    Number.isFinite(dagFromUrl) && dagFromUrl >= 1 && dagFromUrl <= 60
      ? dagFromUrl
      : huidigeDag;
  const fase = dag <= 20 ? 1 : dag <= 40 ? 2 : 3;
  const { v } = useTaal();
  const router = useRouter();

  const supabase = createClient();

  // Klik buiten profiel-menu = sluiten
  useEffect(() => {
    if (!profielMenuOpen) return;
    function buitenKlik(e: MouseEvent) {
      if (
        profielMenuRef.current &&
        !profielMenuRef.current.contains(e.target as Node)
      ) {
        setProfielMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", buitenKlik);
    return () => document.removeEventListener("mousedown", buitenKlik);
  }, [profielMenuOpen]);

  async function logUit() {
    // Eerst presence-status oud maken zodat de groene stip direct
    // verdwijnt bij teamleden. Anders blijft 'last_seen_at' staan op
    // 'enkele seconden geleden' en zien anderen je nog 2 min als actief.
    try {
      await fetch("/api/presence/uitloggen", { method: "POST", keepalive: true });
    } catch {
      // negeer, logout moet sowieso door
    }
    await supabase.auth.signOut();
    router.push("/login");
  }

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
    <header className="h-16 border-b border-cm-border bg-gradient-to-b from-cm-surface to-cm-surface/60 flex items-center justify-between px-4 lg:px-6 backdrop-blur-sm">
      {/* Dag teller, op mobiel alleen het ronde cijfer (de tekst-info
          staat al op het dashboard zelf, dubbel op de topbar voelt druk).
          Op desktop tonen we de volledige tekst voor context. */}
      <div className="flex items-center gap-4 ml-10 lg:ml-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cm-gold/15 border border-cm-gold/50 flex items-center justify-center">
            <span className="text-cm-gold text-xs font-bold">{dag}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-cm-white text-sm font-medium">{v("dashboard.dag")} {dag} <span className="text-cm-white/50">{v("dashboard.van_60")}</span></p>
          </div>
        </div>

        {/* Voortgangsbalk, dunner voor subtieler gevoel */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-32 h-1 bg-cm-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-500"
              style={{ width: `${(dag / 60) * 100}%` }}
            />
          </div>
          <span className="text-cm-white/60 text-xs">{Math.round((dag / 60) * 100)}%</span>
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

        {/* Welkomstfilm: opent de modal die in AppShell zit. */}
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-welkomstfilm"))
          }
          className="p-2 text-cm-white hover:text-cm-gold transition-colors"
          title="Bekijk welkomstfilm"
          aria-label="Bekijk welkomstfilm"
        >
          <span className="text-lg">🎬</span>
        </button>

        {/* '💡 Over ELEVA'-knop is hier weggehaald: 'Over ELEVA' staat
            al in de sidebar EN in het profiel-dropdown rechtsboven.
            Drie keer dezelfde link maakte de Topbar te druk. */}

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

        {/* Profiel-dropdown: voorletter + naam, klik = open menu met
            Instellingen / Over ELEVA / Uitloggen. */}
        <div ref={profielMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setProfielMenuOpen((o) => !o)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            aria-haspopup="menu"
            aria-expanded={profielMenuOpen}
          >
            <div
              className={`relative w-8 h-8 rounded-full bg-cm-surface-2 border flex items-center justify-center ${
                isPremium
                  ? "border-cm-gold ring-2 ring-cm-gold/30"
                  : "border-cm-border"
              }`}
            >
              <span className="text-cm-gold text-sm font-semibold">
                {gebruikersnaam.charAt(0).toUpperCase()}
              </span>
              {isPremium && (
                <span
                  className="absolute -top-1 -right-1 text-[10px]"
                  title="Premium"
                >
                  ⭐
                </span>
              )}
            </div>
            <span className="text-cm-white text-sm hidden md:block">
              {gebruikersnaam}
            </span>
          </button>

          {profielMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-cm-border shadow-2xl py-1 z-[60]"
              style={{
                // Hardcoded solid bg, voorkomt doorschemeren van de
                // backdrop-blur-header eronder. Op iOS kan een Tailwind
                // bg-* class door blur-context per ongeluk transparant
                // gerenderd worden. Inline style omzeilt dat.
                backgroundColor: "#1a1d22",
              }}
            >
              <div className="px-4 py-2 border-b border-cm-border">
                <p className="text-cm-white text-sm font-medium truncate">
                  {gebruikersnaam}
                </p>
              </div>
              <Link
                href="/instellingen"
                role="menuitem"
                onClick={() => setProfielMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-cm-white hover:bg-cm-surface-2 transition-colors"
              >
                <span>⚙️</span> Instellingen
              </Link>
              <Link
                href="/over-eleva"
                role="menuitem"
                onClick={() => setProfielMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-cm-white hover:bg-cm-surface-2 transition-colors"
              >
                <span>💡</span> Over ELEVA
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfielMenuOpen(false);
                  logUit();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-cm-surface-2 hover:text-red-300 transition-colors text-left border-t border-cm-border mt-1"
              >
                <span>🚪</span> Uitloggen
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

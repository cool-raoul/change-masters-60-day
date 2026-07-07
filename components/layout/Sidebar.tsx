"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTaal } from "@/lib/i18n/TaalContext";

export function Sidebar({
  isLeider = false,
  isFounder = false,
  isTester = false,
  sponsorNaam = "",
}: {
  isLeider?: boolean;
  /** Founders zien een paar extra menu-items (zoals Diagnose-link). */
  isFounder?: boolean;
  /** Testers zien de nieuwe-layout-ingang (preview-groep). */
  isTester?: boolean;
  sponsorNaam?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobielmenuOpen, setMobielmenuOpen] = useState(false);
  const [aantalChatsOngelezen, setAantalChatsOngelezen] = useState(0);
  const { v } = useTaal();

  // Poll mini-ELEVA-chats teller elke 30 sec zodat de sidebar-badge
  // bijgewerkt blijft. Faalt stilletjes als endpoint nog niet bestaat
  // (bijv. lokaal zonder migratie).
  useEffect(() => {
    let levend = true;
    async function haalTeller() {
      try {
        const res = await fetch("/api/mini-eleva/mijn-chats");
        if (!res.ok) return;
        const data = await res.json();
        if (!levend) return;
        setAantalChatsOngelezen(data.totaalOngelezen ?? 0);
      } catch {
        // negeer
      }
    }
    haalTeller();
    const t = setInterval(haalTeller, 30_000);
    return () => {
      levend = false;
      clearInterval(t);
    };
  }, [pathname]);

  const navigatie = [
    { href: "/dashboard", labelKey: "nav.dashboard", icoon: "⚡" },
    // ELEVA Mentor direct onder Dashboard: dagelijks startpunt voor
    // sparren, scripts laten genereren, etc.
    { href: "/coach", labelKey: "nav.coach", icoon: "🤖" },
    // Mijn chats: eigen prospect-chats én 3-weg-groepschats waar je
    // sponsor bent. Geïntegreerd in één lijst zodat je niet hoeft te
    // schakelen tussen aparte secties.
    { href: "/mijn-chats", labelKey: "nav.mijn_chats", icoon: "💬" },
    // /acties is gepensioneerd, vervangen door de Volgende-beste-actie-radar
    // op het dashboard zelf en /herinneringen voor het volledige overzicht.
    { href: "/namenlijst", labelKey: "nav.namenlijst", icoon: "👥" },
    // Herinneringen direct na namenlijst zodat alles rondom je mensen
    // bij elkaar staat. Zoekfunctie zit op de namenlijst-pagina zelf,
    // niet meer als aparte menu-link.
    { href: "/herinneringen", labelKey: "nav.herinneringen", icoon: "🔔" },
    { href: "/scripts", labelKey: "nav.scripts", icoon: "📋" },
    { href: "/mijn-zinnen", labelKey: "nav.zinnen", icoon: "📝" },
    // Lessen: terug naar eerdere lessen uit je playbook. Achteruit-only
    // (dag 1 t/m je huidige dag); vooruit blijft dicht om het ritme te
    // bewaren. Just-in-time vooruit-vragen lopen via "Wat nu?".
    { href: "/lessen", labelKey: "nav.lessen", icoon: "📖" },
    // ELEVA Academy: overkoepelende leeromgeving voor verdiepende
    // trainingen. Eerste training is 'Social Media Strategie'
    // (Frazer Brookes-principes). Wordt later uitgebreid met meer
    // trainingen (leiderschap, mindset, productkennis).
    { href: "/academy", labelKey: "nav.academy", icoon: "📚" },
    // Mini-ELEVA uitnodigingen in hoofdnav: dagelijkse actie. Statistieken
    // is verschoven naar onderkant (analyse-moment, niet dagelijks).
    { href: "/uitnodigingen", labelKey: "nav.uitnodigingen", icoon: "✨" },
    // Mijn freebies: de eigen deel-links per freebie (lead-gen). Verplaatst
    // uit Instellingen naar het hoofdmenu voor betere vindbaarheid.
    { href: "/instellingen/mijn-tracking-links", labelKey: "nav.freebies", icoon: "🎁" },
    { href: "/team", labelKey: "nav.team", icoon: "🏆" },
  ];

  // Sluit menu bij navigatie
  useEffect(() => {
    setMobielmenuOpen(false);
  }, [pathname]);

  // Luister naar het 'open'-event vanuit de BottomNav 'Meer'-knop.
  // Custom event-pattern is bewust gekozen: zo hoeven we geen Context
  // op te zetten voor één-richtings-trigger over twee componenten.
  useEffect(() => {
    function openVanuitBottomNav() {
      setMobielmenuOpen(true);
    }
    window.addEventListener("eleva-menu:open", openVanuitBottomNav);
    return () =>
      window.removeEventListener("eleva-menu:open", openVanuitBottomNav);
  }, []);

  // Drawer is fixed inset-0 z-50, covert viewport al volledig. Geen body-lock nodig.
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

      {/* Sponsor-strip onder het logo (mens-eerst, mockup-4 element).
          Toont een kleine cirkel met sponsor-initialen en korte tekst,
          zodat de gebruiker op elke pagina een 'Je staat niet alleen'-
          gevoel heeft. Verbergt zich als geen sponsor bekend. */}
      {sponsorNaam && (
        <div className="px-4 py-3 border-b border-cm-border bg-cm-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-cm-gold-dim bg-cm-surface flex items-center justify-center text-cm-gold text-[11px] font-semibold flex-shrink-0">
              {sponsorNaam
                .split(/\s|\//)
                .filter(Boolean)
                .map((s) => s[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-cm-white/50 uppercase tracking-wider">
                Je sponsor
              </p>
              <p className="text-cm-white text-xs truncate">{sponsorNaam}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigatie, scrollbaar zodat alles bereikbaar is op kleine schermen */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigatie.map((item) => {
          const actief = pathname.startsWith(item.href);
          const badge =
            item.href === "/mijn-chats" && aantalChatsOngelezen > 0
              ? aantalChatsOngelezen
              : null;
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
              <span className="flex-1">{v(item.labelKey)}</span>
              {badge !== null && (
                <span className="bg-cm-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
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
          {/* Nieuwe layout-preview: founders én testers (de preview-groep).
              Eén klik in /nieuw/meer zet de nieuwe schil aan voor het
              hele account; terugwisselen kan daar ook. */}
          {(isFounder || isTester) && (
            <Link
              href="/nieuw"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-gold opacity-90 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
            >
              <span>✨</span> Nieuwe layout
            </Link>
          )}
          {/* Diagnose-link: alleen voor founders zichtbaar. Members
              zien 'm niet meer (push + voice werken). Founders kunnen
              'm gebruiken om iemand op afstand te debuggen of zelf te
              testen. Direct invoeren via URL /diagnose werkt nog steeds
              voor iedereen die 'm nodig heeft (geen rol-check op de
              pagina zelf, maar geen menu-rommel meer voor members). */}
          {isFounder && (
            <Link
              href="/diagnose"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
            >
              <span>🩺</span> Diagnose
            </Link>
          )}
          {isFounder && (
            <Link
              href="/instellingen/mini-eleva-preview"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
            >
              <span>🪴</span> Mini-ELEVA beheren
            </Link>
          )}
          {isFounder && (
            <Link
              href="/founder/spraak-mentor"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
            >
              <span>🤖</span> Spraak naar Mentor
            </Link>
          )}
          {isFounder && (
            <Link
              href="/founder/mail-preview"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
            >
              <span>📧</span> Mail-preview
            </Link>
          )}
          {/* Statistieken hier in plaats van in hoofdnav: analyse-moment,
              niet dagelijkse actie. Plek-wissel met Mini-ELEVA uitnodigingen. */}
          <Link
            href="/statistieken"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname.startsWith("/statistieken")
                ? "bg-gold-subtle border border-gold-subtle text-cm-gold"
                : "text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2"
            }`}
          >
            <span>📊</span> {v("nav.statistieken")}
          </Link>
          <Link
            href="/over-eleva"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cm-white opacity-70 hover:opacity-100 hover:bg-cm-surface-2 transition-colors"
          >
            <span>💡</span> Over ELEVA
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
      {/* Hamburger knop, alleen op mobiel. z-[60] staat altijd boven modals (z-50)
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

      {/* FAB-hamburger linksonder is verwijderd: BottomNav 'Meer' opent
          nu de drawer (via custom event), top-hamburger linksboven
          blijft als directe shortcut. Zo geen dubbele knoppen op mobile. */}

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

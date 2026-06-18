"use client";

import { useEffect, useState } from "react";

// ============================================================
// PWAInstallPrompt voor de prospect, getoond op /m/[token].
//
// Twee varianten:
//   1. ANDROID/CHROME: gebruikt het beforeinstallprompt-event om
//      een native "Voeg toe aan beginscherm"-popup te triggeren bij
//      knop-klik. Doet automatisch +/- het juiste in de browser.
//   2. iOS SAFARI: heeft geen install-event, dus we tonen instructie
//      "Klik op het deel-icoon → 'Voeg toe aan beginscherm'".
//
// Toont ALLEEN als de app NIET al als PWA draait. Anders verberg.
// Stuurt onthoud-keuze in localStorage zodat we 'n weigeraar niet
// elke pagina blijven lastigvallen.
// ============================================================

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const ONTHOUD_KEY = "mini-eleva-pwa-prompt-laatst";
const HERHAAL_NA_DAGEN = 3;

export function PWAInstallPrompt({ memberNaam }: { memberNaam: string | null }) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [isiOS, setIsiOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detecteer of app al als PWA draait
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari standalone
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true);
    setIsStandalone(standalone);

    if (standalone) return; // Niets te doen, ie staat al op homescreen

    // Detecteer iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsiOS(ios);

    // Check of we 'm onlangs hebben getoond + geweigerd
    const laatst = localStorage.getItem(ONTHOUD_KEY);
    if (laatst) {
      const dagenGeleden =
        (Date.now() - Number(laatst)) / (1000 * 60 * 60 * 24);
      if (dagenGeleden < HERHAAL_NA_DAGEN) return;
    }

    // Voor iOS: direct tonen want geen install-event
    if (ios) {
      setZichtbaar(true);
      return;
    }

    // Voor Android/Chrome: wacht op beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
      setZichtbaar(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function nuNiet() {
    localStorage.setItem(ONTHOUD_KEY, String(Date.now()));
    setZichtbaar(false);
  }

  async function installeerNu() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") {
        // Browser zal de app installeren, popup verdwijnt vanzelf
        setZichtbaar(false);
      } else {
        nuNiet();
      }
    } catch {
      nuNiet();
    }
  }

  if (isStandalone || !zichtbaar) return null;

  const memberDeel = memberNaam ? memberNaam.split(" ")[0] : "je member";

  return (
    <div className="card border-l-4 border-cm-gold/60 mb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <span className="text-3xl">📱</span>
        <div className="flex-1 space-y-2">
          <h3 className="text-cm-gold font-semibold text-sm">
            Zet ELEVA op je beginscherm
          </h3>
          <p className="text-cm-white/80 text-xs leading-relaxed">
            Dan kun je makkelijk terugkomen om rustig rond te kijken, net als
            een gewone app. Zo mis je niets en heb je 't sneller open.
            {memberDeel && ` ${memberDeel} krijgt ook een seintje als je actief bent, zodat ze je kan helpen.`}
          </p>

          {isiOS ? (
            <div className="bg-cm-surface-2 rounded-lg p-3 text-xs text-cm-white/70 leading-relaxed mt-2 space-y-1.5">
              <p className="text-cm-white font-semibold">Op iPhone (Safari):</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Tik op het deel-icoon{" "}
                  <span className="inline-block bg-cm-surface px-1.5 rounded text-cm-gold">
                    ⬆️
                  </span>{" "}
                  onderaan je scherm
                </li>
                <li>Scroll en kies "Zet op beginscherm"</li>
                <li>Tik op "Voeg toe" rechtsboven</li>
              </ol>
            </div>
          ) : null}

          <div className="flex gap-2 pt-1">
            {!isiOS && installEvent && (
              <button
                type="button"
                onClick={installeerNu}
                className="btn-gold text-xs"
              >
                Voeg ELEVA toe
              </button>
            )}
            <button
              type="button"
              onClick={nuNiet}
              className="btn-secondary text-xs"
            >
              {isiOS ? "Begrepen" : "Niet nu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

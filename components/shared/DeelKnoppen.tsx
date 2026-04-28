"use client";

import { useEffect, useState } from "react";

// ============================================================
// DeelKnoppen — herbruikbare deel-component voor overal in ELEVA
//
// Strategie:
//   1. Op mobiel (Web Share API beschikbaar): "Delen via..." knop die
//      alle native apps toont (WhatsApp, Messenger, Insta DM, Telegram,
//      Signal, Mail, etc.) afhankelijk van wat de gebruiker geinstalleerd
//      heeft.
//   2. Op desktop / als fallback: rij van expliciete knoppen voor de
//      grootste platforms (WhatsApp, Telegram, Email, SMS).
//   3. Voor Instagram/Messenger zonder web-share-link: copy-link knop met
//      uitleg "plak in je DM".
//
// Gebruik:
//   <DeelKnoppen url="https://..." tekst="..." onderwerp="..." />
// ============================================================

export function DeelKnoppen({
  url,
  tekst,
  onderwerp,
  variant = "donker",
}: {
  /** URL die gedeeld wordt. Wordt achter de tekst geplakt indien niet aanwezig. */
  url: string;
  /** Het bericht dat de prospect ontvangt. */
  tekst: string;
  /** Onderwerp voor mailto. */
  onderwerp?: string;
  /** "donker" voor dark-theme (in app), "licht" voor lichte achtergrond (op resultaatpagina). */
  variant?: "donker" | "licht";
}) {
  const [shareSupported, setShareSupported] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);

  useEffect(() => {
    setShareSupported(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  // Volledige tekst inclusief URL (voor platforms die maar 1 veld accepteren)
  const volledigeTekst = tekst.includes(url) ? tekst : `${tekst}\n\n${url}`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(volledigeTekst)}`;
  const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(tekst)}`;
  const emailLink = `mailto:?subject=${encodeURIComponent(onderwerp ?? "")}&body=${encodeURIComponent(volledigeTekst)}`;
  const smsLink = `sms:?&body=${encodeURIComponent(volledigeTekst)}`;
  const fbMessengerLink = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=&redirect_uri=${encodeURIComponent(url)}`;

  async function nativeShare() {
    try {
      await navigator.share({
        title: onderwerp ?? "Deel",
        text: tekst,
        url,
      });
    } catch (e) {
      // gebruiker annuleerde — stil
    }
  }

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(url);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  const isDark = variant === "donker";
  const klasse = {
    inputBg: isDark ? "bg-white" : "bg-white",
    inputText: "text-gray-900",
    inputBorder: isDark ? "border-gray-300" : "border-gray-300",
    kopieerKnop: isDark
      ? "bg-cm-bg border border-cm-border text-cm-white hover:bg-gray-800"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
    label: isDark ? "text-cm-white opacity-80" : "text-gray-700",
    sublabel: isDark ? "text-cm-white opacity-60" : "text-gray-600",
  };

  return (
    <div className="space-y-3">
      {/* URL veld + kopieer knop */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className={`flex-1 px-3 py-2 rounded-lg ${klasse.inputBg} ${klasse.inputBorder} ${klasse.inputText} text-xs font-mono border`}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={kopieer}
          className={`px-4 py-2 rounded-lg ${klasse.kopieerKnop} text-sm whitespace-nowrap`}
        >
          {gekopieerd ? "✓" : "Kopieer"}
        </button>
      </div>

      {/* Native share knop (mobiel) — toont alle geïnstalleerde apps */}
      {shareSupported && (
        <button
          onClick={nativeShare}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          📤 Delen via... (kies app)
        </button>
      )}

      {/* Rij van platform-specifieke knoppen */}
      <div className={`text-xs ${klasse.sublabel} mt-2`}>
        Of kies direct een platform:
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 text-sm"
        >
          💬 WhatsApp
        </a>
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 text-sm"
        >
          ✈️ Telegram
        </a>
        <a
          href={fbMessengerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 text-sm"
        >
          💬 Messenger
        </a>
        <a
          href={emailLink}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-700 text-white font-medium hover:bg-blue-800 text-sm"
        >
          ✉️ Email
        </a>
        <a
          href={smsLink}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 text-sm"
        >
          📱 SMS
        </a>
        <button
          onClick={kopieer}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm ${klasse.kopieerKnop}`}
        >
          {gekopieerd ? "✓ Gekopieerd" : "📋 Kopieer"}
        </button>
      </div>

      {/* Voor Instagram DM / verborgen apps: gebruik kopieer + plak */}
      <p className={`text-xs ${klasse.sublabel} italic`}>
        Voor Instagram DM, Signal of andere apps: gebruik <strong>Kopieer</strong> en
        plak de link in je gesprek.
      </p>
    </div>
  );
}

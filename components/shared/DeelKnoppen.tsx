"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

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
  inclusiefUrl = true,
}: {
  /** URL die gedeeld wordt. Wordt achter de tekst geplakt indien niet aanwezig. */
  url: string;
  /** Het bericht dat de prospect ontvangt. */
  tekst: string;
  /** Onderwerp voor mailto. */
  onderwerp?: string;
  /** "donker" voor dark-theme (in app), "licht" voor lichte achtergrond (op resultaatpagina). */
  variant?: "donker" | "licht";
  /**
   * Voeg de URL toe aan het bericht? Standaard ja (member-naar-prospect: de
   * link is dé reden van het bericht). Op false voor prospect-naar-member:
   * de member kan de prospect toch wel terugvinden in zijn eigen app via
   * de naam, dus een lange URL toevoegen oogt rommelig.
   */
  inclusiefUrl?: boolean;
}) {
  const [shareSupported, setShareSupported] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    setShareSupported(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  // Volledige tekst — met URL bij member→prospect-flow (link is de reden van
  // het bericht), zonder URL bij prospect→member-flow (member kent de
  // prospect toch al via zijn app).
  const volledigeTekst = !inclusiefUrl
    ? tekst
    : tekst.includes(url)
      ? tekst
      : `${tekst}\n\n${url}`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(volledigeTekst)}`;
  // Telegram-share heeft een verplichte URL-parameter — bij geen-url-modus
  // sturen we een lege string mee zodat alleen tekst getoond wordt.
  const telegramLink = inclusiefUrl
    ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(tekst)}`
    : `https://t.me/share/url?url=&text=${encodeURIComponent(volledigeTekst)}`;
  const emailLink = `mailto:?subject=${encodeURIComponent(onderwerp ?? "")}&body=${encodeURIComponent(volledigeTekst)}`;
  const smsLink = `sms:?&body=${encodeURIComponent(volledigeTekst)}`;

  async function nativeShare() {
    try {
      // Stuur ALLEEN volledigeTekst (met URL erin), GEEN aparte url parameter.
      // Anders plakken sommige apps (iOS Mail, WhatsApp) de URL nog een keer
      // achter de tekst → dubbele link.
      await navigator.share({
        title: onderwerp ?? "Deel",
        text: volledigeTekst,
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
      {/* URL veld + kopieer knop — alleen tonen als de URL daadwerkelijk in
          het bericht zit. Bij prospect→member is de URL niet relevant. */}
      {inclusiefUrl && (
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
      )}

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
        {inclusiefUrl && (
          <button
            onClick={kopieer}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm ${klasse.kopieerKnop}`}
          >
            {gekopieerd ? "✓ Gekopieerd" : "📋 Kopieer link"}
          </button>
        )}
        {inclusiefUrl && (
          <button
            onClick={() => setQrOpen(true)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm ${klasse.kopieerKnop}`}
          >
            📷 QR-code
          </button>
        )}
      </div>

      {/* Uitleg: Messenger / Instagram DM / Signal werken niet via web-share-links.
          Gebruik daar de native share-sheet (mobiel) of kopieer + plak. */}
      <p className={`text-xs ${klasse.sublabel} italic mt-2`}>
        💡 <strong>Voor Messenger, Instagram DM, Signal</strong> en andere
        chat-apps: gebruik op mobiel de groene <strong>"Delen via..."</strong>{" "}
        knop hierboven (of <strong>Kopieer link</strong> en plak in je gesprek).
        Een directe Messenger-knop bestaat niet via het web — dat moet via de
        share-sheet van je telefoon.
      </p>

      {/* QR-modal: voor face-to-face momenten (event, koffie, ouderavond,
          beurs). Member toont z'n scherm, prospect scant met de camera-app
          en zit direct in de testlink/intake. */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-gray-900 font-display font-bold text-lg">
                📷 Scan met je camera
              </h3>
              <button
                onClick={() => setQrOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg leading-none"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Laat dit scherm zien — de ander opent z'n camera, scant deze
              code en komt direct op de juiste pagina.
            </p>
            <div className="bg-white rounded-xl p-4 flex items-center justify-center border border-gray-200">
              <QRCodeSVG
                value={url}
                size={256}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-gray-500 text-xs font-mono break-all text-center">
              {url}
            </p>
            <button
              onClick={() => setQrOpen(false)}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

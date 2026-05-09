"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================
// MiniElevaPushReminder, getoond op /namenlijst voor members die
// mini-ELEVA gebruiken maar nog geen push-meldingen aan hebben
// staan.
//
// Logica:
//   - Werkt alleen als browser push ondersteunt
//   - Toont alleen als de member ooit een mini-ELEVA-uitnodiging
//     heeft aangemaakt (anders nog niet relevant)
//   - Verbergt zichzelf als push al granted EN gesubscribed is
//   - Eenmalig dismissable per 7 dagen via localStorage
//
// Bij klik op "Aanzetten": vraagt browser-permission, abonneert via
// /api/push/subscribe, gebruikt dezelfde VAPID-key als de rest van
// ELEVA. Daarna één globale opt-in die ook voor mini-ELEVA werkt.
// ============================================================

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const ONTHOUD_KEY = "mini-eleva-push-reminder-laatst";
const HERHAAL_NA_DAGEN = 7;

type Props = {
  /** Heeft deze member ooit een mini-ELEVA-uitnodiging aangemaakt? */
  heeftUitnodigingen: boolean;
};

export function MiniElevaPushReminder({ heeftUitnodigingen }: Props) {
  const [zichtbaar, setZichtbaar] = useState(false);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!heeftUitnodigingen) return;

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!supported) return;

    // Niet tonen als al granted én ergens een subscription staat
    (async () => {
      if (Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) return; // Alles in orde, niet tonen
        } catch {
          // negeer
        }
      }
      // Niet binnen herhaal-venster opnieuw tonen
      const laatst = localStorage.getItem(ONTHOUD_KEY);
      if (laatst) {
        const dagen = (Date.now() - Number(laatst)) / (1000 * 60 * 60 * 24);
        if (dagen < HERHAAL_NA_DAGEN) return;
      }
      setZichtbaar(true);
    })();
  }, [heeftUitnodigingen]);

  function nuNiet() {
    localStorage.setItem(ONTHOUD_KEY, String(Date.now()));
    setZichtbaar(false);
  }

  async function aanzetten() {
    if (bezig) return;
    setBezig(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          permission === "denied"
            ? "Je hebt het geblokkeerd. Open je browser-instellingen om 't alsnog aan te zetten."
            : "Toestemming geweigerd",
        );
        nuNiet();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error("Push-key niet ingesteld op de server");
        return;
      }

      // Hergebruik bestaande subscription of maak nieuwe
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const tijdzone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), tijdzone }),
      });
      if (!res.ok) throw new Error("Subscribe mislukt");

      toast.success(
        "Push-meldingen aan ✓ — je ziet voortaan ook mini-ELEVA-acties op je telefoon",
      );
      setZichtbaar(false);
    } catch {
      toast.error("Kon push niet aanzetten, probeer 't later");
    } finally {
      setBezig(false);
    }
  }

  if (!zichtbaar) return null;

  return (
    <div className="card border-l-4 border-cm-gold/60 mb-4 flex items-start gap-3">
      <span className="text-2xl">🔔</span>
      <div className="flex-1 space-y-2">
        <h3 className="text-cm-gold text-sm font-semibold">
          Krijg push-meldingen voor mini-ELEVA-activiteit
        </h3>
        <p className="text-cm-white/70 text-xs leading-relaxed">
          Dan zie je direct op je telefoon wanneer een prospect actief wordt of
          om hulp vraagt, ook als ELEVA niet open staat. Werkt voor heel ELEVA
          tegelijk: ook herinneringen, productadvies-tests en andere acties.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={aanzetten}
            disabled={bezig}
            className="btn-gold text-xs disabled:opacity-50"
          >
            {bezig ? "Bezig..." : "Aanzetten"}
          </button>
          <button
            type="button"
            onClick={nuNiet}
            className="btn-secondary text-xs"
          >
            Niet nu
          </button>
        </div>
      </div>
    </div>
  );
}
